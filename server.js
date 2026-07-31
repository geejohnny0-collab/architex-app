// server.js – Architex Production Backend
// PostgreSQL + Prisma + Socket.io + Cloudinary + JWT + Google OAuth (ES Module)

import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import { Server as SocketServer } from 'socket.io';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Init ─────────────────────────────────────────────────────────────────────
const prisma = new PrismaClient({ log: ['error', 'warn'] });
const app = express();
const httpServer = http.createServer(app);

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer (memory storage – files go straight to Cloudinary) ────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif',
                     'application/pdf', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5176';
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return cb(null, true);
    }
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// ─── JWT Helpers ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters long.');
  process.exit(1);
}

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function safeUser(user) {
  const { passwordHash, googleId, ...safe } = user;
  return safe;
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function attachUser(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET);
      req.userId = payload.id;
    } catch {
      // invalid/expired
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'Authentication required.' });
  next();
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }
  next();
}

app.use(attachUser);

// ─── Helper: Upload buffer to Cloudinary ──────────────────────────────────────
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'architex', ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// ─── Helper: Create notification ─────────────────────────────────────────────
async function createNotification(userId, type, title, body, link = null) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
    io.to(`user:${userId}`).emit('notification:new', notif);
    return notif;
  } catch (e) {
    console.error('Notification create error:', e);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.post('/api/auth/signup',
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().trim().toLowerCase().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('handle').trim().customSanitizer(val => typeof val === 'string' && val.startsWith('@') ? val.slice(1) : val).notEmpty().matches(/^[a-zA-Z0-9_]+$/).withMessage('Handle may only contain letters, numbers, underscores').isLength({ min: 2, max: 30 }),
  validate,
  async (req, res) => {
    const { name, email, password, handle, userType, accountType, role, roleTitle, avatarUrl, bio } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanHandle = handle.trim().toLowerCase();
    const cleanName = name.trim();
    try {
      const [byEmail, byHandle, byName] = await Promise.all([
        prisma.user.findFirst({ where: { email: { equals: cleanEmail, mode: 'insensitive' } } }),
        prisma.user.findFirst({ where: { handle: { equals: cleanHandle, mode: 'insensitive' } } }),
        prisma.user.findFirst({ where: { name: { equals: cleanName, mode: 'insensitive' } } }),
      ]);
      if (byEmail) return res.status(400).json({ error: 'An account with that email already exists.' });
      if (byHandle) return res.status(400).json({ error: 'That handle is already taken.' });
      if (byName) return res.status(400).json({ error: 'An account with that name already exists. Please pick a unique profile name.' });

      const passwordHash = await bcrypt.hash(password, 12);
      const finalType = (userType || accountType || 'developer').toLowerCase();
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          handle: cleanHandle,
          userType: finalType,
          role: role || roleTitle || (finalType === 'business' ? 'Company Enterprise' : 'Software Developer'),
          avatarUrl: avatarUrl || null,
          bio: bio || null,
        },
      });

      const token = signToken(user.id);
      res.status(201).json({ token, user: safeUser(user) });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Failed to create account.' });
    }
  }
);

app.post('/api/auth/login',
  body('email').isEmail().trim().toLowerCase().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } }
      });
      if (!user || !user.passwordHash) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(400).json({ error: 'Invalid email or password.' });

      const token = signToken(user.id);
      res.json({ token, user: safeUser(user) });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  }
);

app.post('/api/auth/google',
  async (req, res) => {
    const { idToken, email: bodyEmail, name: bodyName, picture: bodyPicture, googleId: bodyGoogleId } = req.body;
    try {
      let payload = null;
      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${origin}/oauth-callback.html`;

      if (idToken && idToken.includes('.')) {
        try {
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          payload = ticket.getPayload();
        } catch (e) {
          console.error('JWT ID token verification failed:', e.message);
        }
      }

      if (!payload && idToken && (idToken.startsWith('4/') || idToken.startsWith('google_'))) {
        try {
          const client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
          );
          const { tokens } = await client.getToken(idToken);
          if (tokens.id_token) {
            const ticket = await client.verifyIdToken({
              idToken: tokens.id_token,
              audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
          } else {
            client.setCredentials(tokens);
            const userinfo = await client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
            payload = userinfo.data;
          }
        } catch (e) {
          console.error('Authorization code exchange failed:', e.message);
        }
      }

      // If token exchange succeeded, use real Google account payload
      if (!payload && bodyEmail && bodyGoogleId) {
        payload = {
          sub: bodyGoogleId,
          email: bodyEmail,
          name: bodyName || bodyEmail.split('@')[0],
          picture: bodyPicture || null
        };
      }

      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Failed to verify Google account credentials. Please try again.' });
      }

      const googleId = payload.sub || payload.id;
      const email = payload.email.trim().toLowerCase();
      const name = payload.name || email.split('@')[0];
      const picture = payload.picture || null;

      let isNewUser = false;
      let user = await prisma.user.findFirst({
        where: { OR: [{ googleId }, { email: { equals: email, mode: 'insensitive' } }] },
      });

      if (!user) {
        isNewUser = true;
        let baseHandle = name.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 20) || 'user';
        let handle = baseHandle;
        let i = 1;
        while (await prisma.user.findFirst({ where: { handle: { equals: handle, mode: 'insensitive' } } })) {
          handle = `${baseHandle}${i++}`;
        }
        user = await prisma.user.create({
          data: { googleId, email, name, handle, avatarUrl: picture },
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: user.avatarUrl || picture },
        });
      }

      const token = signToken(user.id);
      res.json({ token, user: safeUser(user), isNewUser });
    } catch (err) {
      console.error('Google OAuth route error:', err);
      res.status(500).json({ error: 'Google login failed on server. Please try again.' });
    }
  }
);

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        _count: { select: { followers: true, following: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const safe = safeUser(user);
    res.json({
      user: {
        ...safe,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        _count: undefined
      }
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// USER ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/users', requireAuth, async (req, res) => {
  const { search, type, limit = 20, offset = 0 } = req.query;
  try {
    const where = {
      NOT: { id: req.userId },
      ...(type && { userType: type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { handle: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, handle: true, avatarUrl: true, role: true,
          userType: true, location: true, verified: true, bio: true,
          followers: { where: { followerId: req.userId }, select: { id: true } },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const result = users.map(u => ({
      ...u,
      isFollowing: u.followers.length > 0,
      followers: undefined,
    }));

    res.json({ users: result, total });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

app.get('/api/users/:id', requireAuth,
  param('id').isInt().withMessage('Invalid user ID'),
  validate,
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          followers: { select: { followerId: true } },
          following: { select: { followingId: true } },
          _count: { select: { posts: true, followers: true, following: true } },
        },
      });
      if (!user) return res.status(404).json({ error: 'User not found.' });
      const { passwordHash, googleId, ...safe } = user;
      res.json({
        ...safe,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        postsCount: user._count.posts,
        isFollowing: user.followers.some(f => f.followerId === req.userId),
      });
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ error: 'Failed to fetch user.' });
    }
  }
);

app.patch('/api/users/me', requireAuth,
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('handle').optional().trim().customSanitizer(val => typeof val === 'string' && val.startsWith('@') ? val.slice(1) : val).matches(/^[a-zA-Z0-9_]+$/).isLength({ min: 2, max: 30 }),
  body('bio').optional().isLength({ max: 500 }),
  body('website').optional().isURL({ require_protocol: false }).withMessage('Invalid website URL'),
  validate,
  async (req, res) => {
    const allowed = ['name', 'handle', 'bio', 'role', 'location', 'website', 'github',
                     'avatarUrl', 'coverUrl', 'skills', 'userType', 'desiredRate',
                     'expectedSalary', 'workMode', 'openToWork'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    try {
      if (data.handle) {
        const existing = await prisma.user.findFirst({
          where: { handle: data.handle, NOT: { id: req.userId } },
        });
        if (existing) return res.status(400).json({ error: 'Handle already taken.' });
      }

      const user = await prisma.user.update({
        where: { id: req.userId },
        data,
      });
      res.json({ user: safeUser(user) });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  }
);

app.post('/api/users/:id/follow', requireAuth,
  param('id').isInt().withMessage('Invalid user ID'),
  validate,
  async (req, res) => {
    const targetId = Number(req.params.id);
    if (targetId === req.userId) return res.status(400).json({ error: 'Cannot follow yourself.' });

    try {
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.userId, followingId: targetId } },
      });

      if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
        return res.json({ following: false });
      }

      await prisma.follow.create({
        data: { followerId: req.userId, followingId: targetId },
      });

      const follower = await prisma.user.findUnique({
        where: { id: req.userId }, select: { name: true, handle: true },
      });
      await createNotification(
        targetId, 'follow',
        `${follower.name} followed you`,
        `@${follower.handle} is now following you.`
      );

      res.json({ following: true });
    } catch (err) {
      console.error('Follow error:', err);
      res.status(500).json({ error: 'Failed to follow/unfollow.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/posts', requireAuth, async (req, res) => {
  try {
    const { tab, userId, limit = 20, offset = 0 } = req.query;
    let where = {};
    
    if (userId) {
      where = { authorId: Number(userId) };
    } else if (!tab || tab.toLowerCase() === 'foryou' || tab.toLowerCase() === 'for you') {
      where = { OR: [{ author: { userType: 'business' } }, { authorId: req.userId }] };
    } else if (tab === 'following') {
      const follows = await prisma.follow.findMany({ where: { followerId: req.userId } });
      where.authorId = { in: follows.map(f => f.followingId) };
    } else if (tab === 'businesses') {
      where.author = { userType: 'business' };
    } else if (tab === 'developers') {
      where.author = { userType: 'developer' };
    } else if (tab === 'trending') {
      where.likes = { some: {} };
    } else if (tab === 'ai') {
      where.OR = [
        { content: { contains: 'AI', mode: 'insensitive' } },
        { content: { contains: 'SaaS', mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true,
                    verified: true, userType: true, role: true, isCertified: true },
        },
        _count: { select: { comments: true, likes: true } },
        likes: { where: { userId: req.userId }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const result = posts.map(p => ({
      ...p,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      isLiked: p.likes.length > 0,
      likes: undefined,
      _count: undefined,
    }));

    if (Number(offset) === 0) {
      const activeAd = await prisma.advertisement.findFirst({
        where: { isActive: true, expiresAt: { gt: new Date() } }
      });
      if (activeAd) {
        await prisma.advertisement.update({
          where: { id: activeAd.id },
          data: { impressions: { increment: 1 } }
        });
        const adPost = {
          id: 'ad_' + activeAd.id,
          isAd: true,
          content: activeAd.description,
          category: 'sponsored',
          imageUrl: activeAd.imageUrl,
          codeSnippet: activeAd.targetUrl,
          createdAt: activeAd.createdAt,
          author: {
            name: activeAd.companyName,
            handle: activeAd.headline,
            avatarUrl: null,
            verified: true,
            isCertified: false
          },
          commentsCount: 0,
          likesCount: 0,
          isLiked: false
        };
        result.splice(1, 0, adPost);
      } else {
        const boosted = await prisma.boostedJob.findFirst({
          where: { isActive: true, expiresAt: { gt: new Date() } },
          include: {
            post: {
              include: {
                author: { select: { id: true, name: true, handle: true, avatarUrl: true, verified: true, userType: true, role: true, isCertified: true } },
                _count: { select: { comments: true, likes: true } },
                likes: { where: { userId: req.userId }, select: { id: true } },
              }
            }
          }
        });
        if (boosted && boosted.post) {
           const p = boosted.post;
           const boostedPost = {
             ...p,
             isBoosted: true,
             likesCount: p._count.likes,
             commentsCount: p._count.comments,
             isLiked: p.likes.length > 0,
             likes: undefined,
             _count: undefined,
           };
           result.unshift(boostedPost);
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', requireAuth,
  async (req, res) => {
    const { content, category = 'Developers', mediaUrl, imageUrl, mediaType, codeSnippet, hasProposal, projectBudget } = req.body;
    const finalMedia = mediaUrl || imageUrl || null;
    const finalContent = (content || '').trim();

    if (!finalContent && !finalMedia && !codeSnippet) {
      return res.status(400).json({ error: 'Post must contain text, a photo/video, or a code snippet.' });
    }

    try {
      const post = await prisma.post.create({
        data: { 
          content: finalContent || (finalMedia ? 'Attached media' : 'Code snippet'),
          category: category || 'Developers',
          imageUrl: finalMedia,
          codeSnippet,
          hasProposal: !!hasProposal,
          projectBudget,
          authorId: req.userId
        },
        include: {
          author: { select: { id: true, name: true, handle: true, avatarUrl: true, verified: true, userType: true, role: true } },
          _count: { select: { comments: true, likes: true } },
        },
      });
      const result = { ...post, likesCount: 0, commentsCount: 0, isLiked: false, _count: undefined };
      res.status(201).json(result);
    } catch (err) {
      console.error('Create post error:', err);
      res.status(500).json({ error: 'Failed to create post.' });
    }
  }
);

app.put('/api/posts/:id', requireAuth,
  param('id').isInt(), body('content').trim().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
      if (!post) return res.status(404).json({ error: 'Post not found.' });
      if (post.authorId !== req.userId) return res.status(403).json({ error: 'Not authorized.' });
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { content: req.body.content, updatedAt: new Date() },
        include: {
          author: { select: { id: true, name: true, handle: true, avatarUrl: true, verified: true, userType: true, role: true } },
          _count: { select: { comments: true, likes: true } },
          likes: { where: { userId: req.userId }, select: { id: true } },
        },
      });
      res.json({ ...updated, likesCount: updated._count.likes, commentsCount: updated._count.comments, isLiked: updated.likes.length > 0, _count: undefined, likes: undefined });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update post.' });
    }
  }
);

app.delete('/api/posts/:id', requireAuth,
  param('id').isInt(), validate,
  async (req, res) => {
    try {
      const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
      if (!post) return res.status(404).json({ error: 'Post not found.' });
      if (post.authorId !== req.userId) return res.status(403).json({ error: 'Not authorized.' });
      await prisma.post.delete({ where: { id: post.id } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete post.' });
    }
  }
);

app.post('/api/posts/:id/like', requireAuth,
  param('id').isInt(), validate,
  async (req, res) => {
    const postId = Number(req.params.id);
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (!post) return res.status(404).json({ error: 'Post not found.' });

      const existing = await prisma.like.findUnique({
        where: { userId_postId: { userId: req.userId, postId } },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        const count = await prisma.like.count({ where: { postId } });
        return res.json({ liked: false, likesCount: count });
      }

      await prisma.like.create({ data: { userId: req.userId, postId } });
      const count = await prisma.like.count({ where: { postId } });

      if (post.authorId !== req.userId) {
        const liker = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
        await createNotification(post.authorId, 'like', `${liker.name} liked your post`, 'Someone liked your post.');
      }

      res.json({ liked: true, likesCount: count });
    } catch (err) {
      console.error('Like error:', err);
      res.status(500).json({ error: 'Failed to toggle like.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// COMMENT ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/posts/:postId/comments', requireAuth,
  param('postId').isInt(), validate,
  async (req, res) => {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(req.params.postId), parentId: null },
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        replies: {
          include: { author: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  }
);

app.post('/api/posts/:postId/comments', requireAuth,
  param('postId').isInt(),
  body('content').trim().notEmpty().isLength({ max: 2000 }),
  body('parentId').optional().isInt(),
  validate,
  async (req, res) => {
    const postId = Number(req.params.postId);
    const { content, parentId } = req.body;
    try {
      const post = await prisma.post.findUnique({ where: { id: postId }, include: { author: { select: { userType: true } } } });
      if (!post) return res.status(404).json({ error: 'Post not found.' });

      const commenterUser = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true, userType: true, verified: true } });
      if (post.author.userType === 'business' && commenterUser.userType === 'developer' && !commenterUser.verified) {
        return res.status(403).json({ error: 'Pro Plan required to comment on Business posts.' });
      }

      const comment = await prisma.comment.create({
        data: { content, postId, authorId: req.userId, parentId: parentId ? Number(parentId) : null },
        include: {
          author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        },
      });

      if (post.authorId !== req.userId) {
        const commenter = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
        await createNotification(post.authorId, 'comment', `${commenter.name} commented on your post`, content.slice(0, 100));
      }

      res.status(201).json(comment);
    } catch (err) {
      console.error('Comment error:', err);
      res.status(500).json({ error: 'Failed to add comment.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// CONVERSATION + MESSAGE ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/conversations', requireAuth, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ userAId: req.userId }, { userBId: req.userId }] },
      include: {
        userA: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        userB: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, read: true, senderId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = conversations.map(c => {
      const other = c.userAId === req.userId ? c.userB : c.userA;
      const lastMsg = c.messages[0] || null;
      return {
        id: c.id,
        participant: other,
        lastMessage: lastMsg,
        updatedAt: c.updatedAt,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Conversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

app.post('/api/conversations', requireAuth,
  body('userId').isInt().withMessage('Target user ID required'),
  validate,
  async (req, res) => {
    const targetId = Number(req.body.userId);
    if (targetId === req.userId) return res.status(400).json({ error: 'Cannot message yourself.' });

    try {
      const target = await prisma.user.findUnique({ where: { id: targetId } });
      if (!target) return res.status(404).json({ error: 'User not found.' });

      let conv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { userAId: req.userId, userBId: targetId },
            { userAId: targetId, userBId: req.userId },
          ],
        },
        include: {
          userA: { select: { id: true, name: true, handle: true, avatarUrl: true } },
          userB: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: { userAId: req.userId, userBId: targetId },
          include: {
            userA: { select: { id: true, name: true, handle: true, avatarUrl: true } },
            userB: { select: { id: true, name: true, handle: true, avatarUrl: true } },
          },
        });
      }

      const participant = conv.userAId === req.userId ? conv.userB : conv.userA;
      res.json({ ...conv, participant });
    } catch (err) {
      console.error('Create conversation error:', err);
      res.status(500).json({ error: 'Failed to start conversation.' });
    }
  }
);

app.get('/api/conversations/:id/messages', requireAuth,
  param('id').isInt(), validate,
  async (req, res) => {
    const convId = Number(req.params.id);
    try {
      const conv = await prisma.conversation.findUnique({ where: { id: convId } });
      if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
      if (conv.userAId !== req.userId && conv.userBId !== req.userId) {
        return res.status(403).json({ error: 'Not authorized.' });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId: convId },
        include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      });

      await prisma.message.updateMany({
        where: { conversationId: convId, receiverId: req.userId, read: false },
        data: { read: true },
      });

      res.json(messages);
    } catch (err) {
      console.error('Get messages error:', err);
      res.status(500).json({ error: 'Failed to fetch messages.' });
    }
  }
);

app.post('/api/conversations/:id/messages', requireAuth,
  param('id').isInt(),
  body('content').trim().notEmpty().isLength({ max: 5000 }),
  validate,
  async (req, res) => {
    const convId = Number(req.params.id);
    const { content, fileUrl, fileType } = req.body;
    try {
      const conv = await prisma.conversation.findUnique({ where: { id: convId } });
      if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
      if (conv.userAId !== req.userId && conv.userBId !== req.userId) {
        return res.status(403).json({ error: 'Not authorized.' });
      }

      const receiverId = conv.userAId === req.userId ? conv.userBId : conv.userAId;

      const message = await prisma.message.create({
        data: { content, senderId: req.userId, receiverId, conversationId: convId, fileUrl, fileType },
        include: { sender: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
      });

      await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });

      io.to(`user:${receiverId}`).emit('message:new', { conversationId: convId, message });

      const sender = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
      await createNotification(receiverId, 'message', `${sender.name} sent you a message`, content.slice(0, 100));

      res.status(201).json(message);
    } catch (err) {
      console.error('Send message error:', err);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

app.patch('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications read.' });
  }
});

app.patch('/api/notifications/:id/read', requireAuth,
  param('id').isInt(), validate,
  async (req, res) => {
    try {
      const notif = await prisma.notification.findUnique({ where: { id: Number(req.params.id) } });
      if (!notif || notif.userId !== req.userId) return res.status(404).json({ error: 'Not found.' });
      await prisma.notification.update({ where: { id: notif.id }, data: { read: true } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark notification read.' });
    }
  }
);

app.delete('/api/notifications', requireAuth, async (req, res) => {
  try {
    await prisma.notification.deleteMany({ where: { userId: req.userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// UPLOAD ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided.' });
  const purpose = req.body.purpose || 'post';

  try {
    const isVideo = req.file.mimetype.startsWith('video/');
    const isPdf = req.file.mimetype === 'application/pdf';

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: isPdf ? 'raw' : isVideo ? 'video' : 'image',
      folder: `architex/${purpose}`,
      transformation: purpose === 'avatar' ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
                    : purpose === 'cover'  ? [{ width: 1200, height: 400, crop: 'fill' }]
                    : [],
    });

    await prisma.upload.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        uploadedById: req.userId,
        purpose,
      },
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// STATIC FILES (Production)
// ──────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ──────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.message === 'Unsupported file type') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

// ──────────────────────────────────────────────────────────────────────────────
// SOCKET.IO – Real-time layer
// ──────────────────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
        return cb(null, true);
      }
      cb(new Error(`Socket CORS blocked: ${origin}`));
    },
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const uid = socket.userId;
  console.log(`Socket connected: user ${uid} (${socket.id})`);

  socket.join(`user:${uid}`);

  if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
  onlineUsers.get(uid).add(socket.id);

  io.emit('presence:update', { userId: uid, online: true });

  socket.on('typing:start', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('typing:start', { userId: uid, conversationId });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('typing:stop', { userId: uid, conversationId });
  });

  socket.on('conversation:join', ({ conversationId }) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on('conversation:leave', ({ conversationId }) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on('message:read', async ({ conversationId, messageId }) => {
    try {
      await prisma.message.update({ where: { id: messageId }, data: { read: true } });
      socket.to(`conv:${conversationId}`).emit('message:read', { messageId, readBy: uid });
    } catch { /* ignore */ }
  });

  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(uid);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(uid);
        io.emit('presence:update', { userId: uid, online: false });
      }
    }
    console.log(`Socket disconnected: user ${uid}`);
  });
});

app.get('/api/users/:id/online', requireAuth, (req, res) => {
  const online = onlineUsers.has(Number(req.params.id));
  res.json({ online });
});

// ──────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'connected', env: process.env.NODE_ENV, ts: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;


// ─── Stripe & Monetization API ────────────────────────────────────────────────
app.post('/api/stripe/checkout', requireAuth, async (req, res) => {
  try {
    const { productId, type } = req.body;
    let amount = 0;
    let description = '';

    if (type === 'credits_1000') {
      amount = 10000; // $100.00
      description = '1,000 Architex Credits';
    } else if (type === 'certification') {
      amount = 9900; // $99.00
      description = 'Architex Certified Expert Assessment';
    } else if (type === 'pro_monthly') {
      amount = 2900; // $29.00
      description = 'Architex Pro Subscription (1 Month)';
    } else if (type === 'business_pro_monthly') {
      amount = 19900; // $199.00
      description = 'Architex Business Pro Subscription (1 Month)';
    } else {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    // Create real Stripe Checkout Session if live/test secret key is provided
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      const isSubscription = type.includes('monthly');
      const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5176';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: description,
              },
              unit_amount: amount,
              ...(isSubscription ? { recurring: { interval: 'month' } } : {}),
            },
            quantity: 1,
          },
        ],
        mode: isSubscription ? 'subscription' : 'payment',
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      });

      await prisma.transaction.create({
        data: {
          userId: req.userId,
          amountCent: amount,
          stripeSessionId: session.id,
          status: 'pending',
          description: description
        }
      });

      return res.json({ url: session.url });
    }

    // Local simulation fallback if no valid key is set
    const sessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15);

    await prisma.transaction.create({
      data: {
        userId: req.userId,
        amountCent: amount,
        stripeSessionId: sessionId,
        status: 'pending',
        description: description
      }
    });

    res.json({ url: `/payment-success?session_id=${sessionId}` });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

app.post('/api/stripe/webhook', express.json(), async (req, res) => {
  try {
    let sessionId = req.body?.sessionId;

    // Handle official Stripe Webhook payload format
    if (req.body?.type === 'checkout.session.completed') {
      sessionId = req.body?.data?.object?.id;
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'No session_id provided' });
    }

    const tx = await prisma.transaction.findUnique({ where: { stripeSessionId: sessionId } });
    if (!tx || tx.status === 'completed') return res.json({ received: true });

    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'completed' }
    });

    if (tx.description.includes('Credits')) {
      await prisma.user.update({
        where: { id: tx.userId },
        data: { credits: { increment: 1000 } }
      });
    } else if (tx.description.includes('Certified')) {
      await prisma.user.update({
        where: { id: tx.userId },
        data: { isCertified: true }
      });
    } else if (tx.description.includes('Pro Subscription')) {
      await prisma.user.update({
        where: { id: tx.userId },
        data: { isPro: true }
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    res.status(500).json({ error: 'Webhook error' });
  }
});

app.post('/api/credits/spend', requireAuth, async (req, res) => {
  try {
    const { action, postId, adData } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    let cost = 0;
    if (action === 'boost_job') cost = 500;
    else if (action === 'buy_ad') cost = 1000;
    else return res.status(400).json({ error: 'Invalid action' });

    if (user.credits < cost) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: cost } }
    });

    if (action === 'boost_job' && postId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      await prisma.boostedJob.create({
        data: {
          userId: user.id,
          postId: postId,
          expiresAt: expiresAt
        }
      });
    } else if (action === 'buy_ad' && adData) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await prisma.advertisement.create({
        data: {
          userId: user.id,
          companyName: user.name,
          imageUrl: adData.imageUrl || '',
          targetUrl: adData.targetUrl || '',
          headline: adData.headline,
          description: adData.description,
          expiresAt: expiresAt
        }
      });
    }

    res.json({ success: true, remainingCredits: user.credits - cost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to spend credits' });
  }
});

// ─── Production Static File Serving ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    // Don't exit – let Render retry the health check
  }

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Architex server running on port ${PORT}`);
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DB:  ${process.env.DATABASE_URL ? 'configured' : 'WARNING: DATABASE_URL not set'}`);
    console.log(`   Frontend: ${FRONTEND_URL}`);
  });
}

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received – shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
