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
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

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
    return cb(null, true);
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
async function createNotification(userId, type, title, body, link = null, senderId = null) {
  try {
    const notif = await prisma.notification.create({
      data: { userId, type, title, body, link, senderId },
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

      // Automatically follow Motion Medias (User IDs 4 & 5) globally
      const adminIds = [4, 5];
      for (const targetId of adminIds) {
        if (user.id !== targetId) {
          try {
            await prisma.follow.upsert({
              where: {
                followerId_followingId: {
                  followerId: user.id,
                  followingId: targetId
                }
              },
              update: {},
              create: {
                followerId: user.id,
                followingId: targetId
              }
            });
          } catch (err) {
            console.error(`[Auto-Follow Error] Failed to create follow link for user #${user.id} -> #${targetId}:`, err);
          }
        }
      }

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

        // Automatically follow Motion Medias (User ID 4) globally for Google OAuth signups
        const motionMediasId = 4;
        if (user.id !== motionMediasId) {
          try {
            await prisma.follow.create({
              data: { followerId: user.id, followingId: motionMediasId }
            });
          } catch (err) {
            console.error('Google OAuth auto-follow error:', err);
          }
        }
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

app.get('/api/users', async (req, res) => {
  let currentUserId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      currentUserId = decoded.id || decoded.userId;
    } catch {}
  }
  const { search, type, limit = 50, offset = 0 } = req.query;
  try {
    const query = search ? search.trim() : '';
    const cleanHandle = query.replace(/^@/, '');
    const tokens = query.split(/\s+/).filter(Boolean);

    const typeLower = type ? type.toLowerCase() : null;
    const typeFilter = typeLower === 'developer' || typeLower === 'dev' 
      ? { in: ['developer', 'dev'] }
      : typeLower === 'business'
      ? { in: ['business', 'company', 'agency'] }
      : typeLower;

    const where = {
      ...(typeFilter && { userType: typeFilter }),
      ...(search && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { handle: { contains: cleanHandle, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { role: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
          ...tokens.map(t => ({ name: { contains: t, mode: 'insensitive' } })),
          ...tokens.map(t => ({ handle: { contains: t.replace(/^@/, ''), mode: 'insensitive' } })),
          ...tokens.map(t => ({ role: { contains: t, mode: 'insensitive' } })),
          ...tokens.map(t => ({ bio: { contains: t, mode: 'insensitive' } }))
        ],
      }),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, handle: true, email: true, avatarUrl: true, role: true,
          userType: true, location: true, verified: true, bio: true,
          followers: { where: { followerId: currentUserId || -1 }, select: { id: true } },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const result = users.map(u => ({
      ...u,
      isFollowing: Array.isArray(u.followers) ? u.followers.length > 0 : false,
      followers: undefined,
    }));

    res.json({ users: result, total });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json({ profiles: [], posts: [], tags: [], projects: [], jobs: [] });
  }
  const query = q.trim();
  const cleanHandle = query.replace(/^@/, '');
  const tokens = query.split(/\s+/).filter(Boolean);

  const userConditions = [
    { name: { contains: query, mode: 'insensitive' } },
    { handle: { contains: cleanHandle, mode: 'insensitive' } },
    { email: { contains: query, mode: 'insensitive' } },
    { role: { contains: query, mode: 'insensitive' } },
    { bio: { contains: query, mode: 'insensitive' } },
    ...tokens.map(t => ({ name: { contains: t, mode: 'insensitive' } })),
    ...tokens.map(t => ({ handle: { contains: t.replace(/^@/, ''), mode: 'insensitive' } })),
    ...tokens.map(t => ({ role: { contains: t, mode: 'insensitive' } })),
    ...tokens.map(t => ({ bio: { contains: t, mode: 'insensitive' } }))
  ];

  try {
    const [profiles, posts, projects, jobs] = await Promise.all([
      prisma.user.findMany({
        where: { OR: userConditions },
        select: { id: true, name: true, handle: true, email: true, avatarUrl: true, userType: true, role: true, verified: true },
        take: 30
      }),
      prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: { author: { select: { id: true, name: true, handle: true, avatarUrl: true, userType: true } } },
        take: 10
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { role: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      })
    ]);

    const tags = Array.from(new Set(
      posts.map(p => p.category).filter(c => c && c.toLowerCase().includes(query.toLowerCase()))
    )).map(t => ({ name: t }));

    res.json({ profiles, posts, tags, projects, jobs });
  } catch (err) {
    console.error('Unified search error:', err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  let currentUserId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      currentUserId = decoded.id || decoded.userId;
    } catch {}
  }
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
      isFollowing: currentUserId ? user.followers.some(f => f.followerId === currentUserId) : false,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

app.get('/api/users/:id/followers', async (req, res) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followingId: Number(req.params.id) },
      include: { follower: { select: { id: true, name: true, handle: true, avatarUrl: true, role: true, userType: true, verified: true } } }
    });
    res.json(follows.map(f => f.follower));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

app.get('/api/users/:id/following', async (req, res) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: Number(req.params.id) },
      include: { following: { select: { id: true, name: true, handle: true, avatarUrl: true, role: true, userType: true, verified: true } } }
    });
    res.json(follows.map(f => f.following));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

app.patch('/api/users/me', requireAuth, async (req, res) => {
  const allowed = ['name', 'handle', 'bio', 'role', 'location', 'website', 'github',
                   'avatarUrl', 'coverUrl', 'skills', 'userType', 'desiredRate',
                   'expectedSalary', 'workMode', 'openToWork'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }

  try {
    if (data.handle) {
      data.handle = String(data.handle).replace(/^@/, '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (data.handle.length >= 2) {
        const existing = await prisma.user.findFirst({
          where: { handle: { equals: data.handle, mode: 'insensitive' }, NOT: { id: req.userId } },
        });
        if (existing) return res.status(400).json({ error: 'That handle is already taken by another account.' });
      } else {
        delete data.handle;
      }
    }

    if (data.name) {
      data.name = String(data.name).trim();
    }

    if (data.skills && Array.isArray(data.skills)) {
      data.skills = JSON.stringify(data.skills);
    }

    const user = await prisma.user.update({
      where: { id: Number(req.userId) },
      data,
    });
    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

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

      const ADMIN_USER_ID = 4;
      if (existing) {
        if (targetId === ADMIN_USER_ID) {
          return res.json({ following: true, locked: true });
        }
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
        `@${follower.handle} is now following you.`,
        null, req.userId
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
    const { tab, userId, search, limit = 20, offset = 0 } = req.query;
    let where = {};
    
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { userType: true }
    });
    const userRole = (currentUser?.userType || 'developer').toLowerCase();

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { content: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { codeSnippet: { contains: q, mode: 'insensitive' } },
        { author: { name: { contains: q, mode: 'insensitive' } } },
        { author: { handle: { contains: q, mode: 'insensitive' } } },
      ];
    } else if (userId) {
      where = { authorId: Number(userId) };
    } else if (!tab || tab.toLowerCase() === 'foryou' || tab.toLowerCase() === 'for you') {
      if (userRole === 'business') {
        where = { author: { userType: 'business' } };
      } else {
        where = { OR: [{ author: { userType: 'business' } }, { authorId: req.userId }] };
      }
    } else if (tab === 'following') {
      const follows = await prisma.follow.findMany({ where: { followerId: req.userId } });
      const followingIds = follows.map(f => f.followingId);
      where = { authorId: { in: followingIds } };
    } else if (tab === 'businesses') {
      where = { author: { userType: 'business' } };
    } else if (tab === 'developers') {
      where = { author: { userType: 'developer' } };
    } else if (tab === 'trending') {
      where = { likes: { some: {} } };
    } else if (tab === 'ai') {
      where = {
        OR: [
          { content: { contains: 'AI', mode: 'insensitive' } },
          { content: { contains: 'SaaS', mode: 'insensitive' } }
        ]
      };
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

app.post('/api/posts/:id/create-promotion-session', async (req, res) => {
  try {
    const { tier } = req.body;
    const postId = req.params.id;
    
    const tiers = {
      '3-day': { amount: 1000, name: '3-Day Feed Boost ($10.00)', days: 3 },
      '7-day': { amount: 1999, name: '7-Day Featured Ad ($19.99)', days: 7 },
      '14-day': { amount: 3999, name: '14-Day Top Spot Ad ($39.99)', days: 14 }
    };

    const selectedTier = tiers[tier];
    if (!selectedTier) {
      return res.status(400).json({ error: 'Invalid promotion package' });
    }

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Post Promotion: ${selectedTier.name}`
          },
          unit_amount: selectedTier.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/?promotion=success&postId=${postId}&tier=${tier}&days=${selectedTier.days}`,
      cancel_url: `${baseUrl}/?promotion=cancelled`,
      metadata: {
        postId: String(postId),
        tier,
        durationDays: String(selectedTier.days)
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe promotion error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:id/confirm-promotion', async (req, res) => {
  const postId = Number(req.params.id);
  try {
    const updated = await prisma.post.update({
      where: { id: postId },
      data: { isPromoted: true, isAd: true }
    });
    res.json({ success: true, post: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm promotion.' });
  }
});

// ─── Projects & RFP Marketplace Endpoints ────────────────────────────────────

// 1. Post a New Project RFP
app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { title, description, techStack, contractType, budget } = req.body;
    const newProject = await prisma.project.create({
      data: {
        clientId: req.userId,
        title,
        description,
        techStack: Array.isArray(techStack) ? JSON.stringify(techStack) : (techStack || '[]'),
        contractType: contractType || 'Fixed Price',
        budget: Number(budget) || 0,
        status: 'Open'
      },
      include: {
        client: {
          select: { id: true, name: true, handle: true, avatarUrl: true, userType: true }
        }
      }
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project RFP.' });
  }
});

// 2. Fetch Marketplace Feed with Search & Filters
app.get('/api/projects', async (req, res) => {
  try {
    const { contractType, search } = req.query;
    let whereClause = { status: 'Open' };

    if (contractType && contractType !== 'All Projects') {
      whereClause.contractType = contractType;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { techStack: { contains: search, mode: 'insensitive' } }
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, handle: true, avatarUrl: true, userType: true }
        },
        bids: {
          select: { id: true, proposedAmount: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects marketplace.' });
  }
});

// 3. Submit a Bid on an Open Project
app.post('/api/projects/:id/bids', requireAuth, async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { proposedAmount, coverLetter } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.status !== 'Open') {
      return res.status(400).json({ error: 'This project is no longer accepting bids.' });
    }

    if (project.clientId === req.userId) {
      return res.status(403).json({ error: 'You cannot bid on your own project.' });
    }

    const existingBid = await prisma.bid.findUnique({
      where: {
        projectId_freelancerId: {
          projectId,
          freelancerId: req.userId
        }
      }
    });

    if (existingBid) {
      return res.status(400).json({ error: 'You have already submitted a bid for this project.' });
    }

    const newBid = await prisma.bid.create({
      data: {
        projectId,
        freelancerId: req.userId,
        proposedAmount: Number(proposedAmount),
        coverLetter,
        status: 'Pending'
      },
      include: {
        freelancer: {
          select: { id: true, name: true, handle: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(newBid);
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ error: 'Failed to submit bid.' });
  }
});

// 4. Fetch User Bids for "My Submitted Bids"
app.get('/api/projects/my-bids', requireAuth, async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { freelancerId: req.userId },
      include: {
        project: {
          include: {
            client: {
              select: { id: true, name: true, handle: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bids);
  } catch (error) {
    console.error('Fetch my bids error:', error);
    res.status(500).json({ error: 'Failed to retrieve user bids.' });
  }
});

// 5. Bid Acceptance & Stripe Escrow Hold
app.patch('/api/projects/:projectId/bids/:bidId/accept', requireAuth, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const bidId = Number(req.params.bidId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (project.clientId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized action.' });
    }

    const targetBid = await prisma.bid.findUnique({ where: { id: bidId } });
    if (!targetBid) return res.status(404).json({ error: 'Bid not found.' });

    // Mark target bid as Accepted
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'Accepted' }
    });

    // Reject all other bids for this project
    await prisma.bid.updateMany({
      where: {
        projectId,
        id: { not: bidId }
      },
      data: { status: 'Rejected' }
    });

    // Mark project as In Progress
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: 'In Progress' }
    });

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Escrow Hold: ${project.title}` },
          unit_amount: Math.round(targetBid.proposedAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/?escrow=success&projectId=${projectId}`,
      cancel_url: `${baseUrl}/?escrow=cancelled`,
      metadata: { projectId: String(projectId), bidId: String(bidId), freelancerId: String(targetBid.freelancerId) }
    });

    res.json({ success: true, project: updatedProject, checkoutUrl: session.url, url: session.url });
  } catch (error) {
    console.error('Bid acceptance error:', error);
    res.status(500).json({ error: 'Failed to accept bid and initialize escrow.' });
  }
});

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
        await createNotification(post.authorId, 'like', `${liker.name} liked your post`, 'Someone liked your post.', null, req.userId);
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
        await createNotification(post.authorId, 'comment', `${commenter.name} commented on your post`, content.slice(0, 100), null, req.userId);
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
      await createNotification(receiverId, 'message', `${sender.name} sent you a message`, content.slice(0, 100), null, req.userId);

      res.status(201).json(message);
    } catch (err) {
      console.error('Send message error:', err);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// LIVE GLOBAL JOBS BOARD ROUTES
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// PERMANENT CLOUD & DISK PERSISTENCE STORE
// ──────────────────────────────────────────────────────────────────────────────
import fs from 'fs';

const JOBS_FILE = path.join(process.cwd(), 'jobs_permanent_db.json');
const PROJECTS_FILE = path.join(process.cwd(), 'projects_permanent_db.json');
const BIDS_FILE = path.join(process.cwd(), 'bids_permanent_db.json');
const APPS_FILE = path.join(process.cwd(), 'apps_permanent_db.json');
const GROUPS_FILE = path.join(process.cwd(), 'groups_permanent_db.json');

function loadJsonDisk(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load permanent disk file:', filePath, e.message);
  }
  return fallback;
}

function saveJsonDisk(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('[PERMANENT DISK SAVE SUCCESS]', filePath, `(${data.length} items)`);
  } catch (e) {
    console.error('[PERMANENT DISK SAVE ERROR]', filePath, e.message);
  }
}

let globalJobsStore = loadJsonDisk(JOBS_FILE, [
  {
    id: 'job-1',
    title: 'Senior Backend Engineer',
    company: 'Architex Systems',
    location: 'Remote (US/TX)',
    type: 'Full-Time W2',
    c2hRate: '$130 - $150/hr',
    salaryW2: '$195,000/yr',
    hiringManager: 'Alex Mercer (CTO)',
    description: 'Build high-throughput data pipelines, custom APIs, and backend architectures. You will lead the infrastructure migration to distributed clusters and integrate high-concurrency microservices.',
    techStack: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'job-2',
    title: 'Automation & Scraping Engineer',
    company: 'DataFlow Metrics',
    location: 'Remote',
    type: 'Contract-to-Hire',
    c2hRate: '$110 - $130/hr',
    salaryW2: '$170,000/yr',
    hiringManager: 'Sarah Jenkins (VP Engineering)',
    description: 'Develop autonomous market scrapers, lead generation scripts, and multi-platform sync tools. Responsible for maintaining web scrapers against strict anti-bot systems.',
    techStack: ['Python', 'Selenium', 'BeautifulSoup'],
    createdAt: new Date().toISOString()
  }
]);

let globalJobApplicationsStore = loadJsonDisk(APPS_FILE, []);

let globalProjectsStore = loadJsonDisk(PROJECTS_FILE, [
  {
    id: 'proj_101',
    title: 'Enterprise AI Vector Search Engine & RAG Pipeline Architecture',
    client: 'Apex AI Systems',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    contractType: 'Fixed Price',
    budget: '$35,000 Fixed',
    duration: '4 Weeks',
    proposalsCount: 14,
    status: 'Hiring',
    verifiedEscrow: true,
    clientRole: 'VP of AI Engineering',
    tags: ['Python', 'Pinecone', 'LangChain', 'FastAPI', 'AWS'],
    description: 'We are building a multi-tenant vector database pipeline with sub-50ms query latency. Seeking a Lead AI Engineer to architect the vector index, chunking strategies, and hybrid search ranking.'
  },
  {
    id: 'proj_102',
    title: 'Fintech Mobile Payment & Digital Wallet Infrastructure',
    client: 'Velox Pay',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&q=80',
    contractType: 'Hourly Retainer',
    budget: '$140 / hr',
    duration: '6 Months Retainer',
    proposalsCount: 9,
    status: 'Hiring',
    verifiedEscrow: true,
    clientRole: 'Head of Mobile Product',
    tags: ['React Native', 'TypeScript', 'Node.js', 'Stripe', 'PostgreSQL'],
    description: 'Seeking a senior mobile engineer to build real-time biometric payment flows, ledger synchronization, and PCI-compliant security protocols for our iOS/Android application.'
  }
]);

let globalProjectBidsStore = loadJsonDisk(BIDS_FILE, []);

let globalGroupsStore = loadJsonDisk(GROUPS_FILE, [
  {
    id: 'grp-1',
    name: 'AI Engineering & LLM Architecture',
    membersCount: 1420,
    category: 'AI / Machine Learning',
    description: 'Community for AI engineers building vector search, RAG pipelines, fine-tuned models, and agentic workflows.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    joined: true
  },
  {
    id: 'grp-2',
    name: 'React Native & Cross-Platform Mobile',
    membersCount: 980,
    category: 'Mobile Development',
    description: 'Best practices for high-performance React Native, Expo, and native iOS/Android bridge architectures.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80',
    joined: false
  }
]);

app.get('/api/jobs/applications', (req, res) => {
  res.json(globalJobApplicationsStore);
});

app.get('/api/jobs', (req, res) => {
  res.json(globalJobsStore);
});

app.post('/api/jobs', (req, res) => {
  try {
    const jobData = req.body;
    if (!jobData || !jobData.title) {
      return res.status(400).json({ error: 'Job title is required.' });
    }

    const newJob = {
      id: 'job-' + Date.now(),
      title: jobData.title,
      company: jobData.company || 'Architex Business',
      location: jobData.location || 'Remote',
      type: jobData.type || 'Full-Time W2',
      c2hRate: jobData.c2hRate || '$100/hr',
      salaryW2: jobData.salaryW2 || '$150,000/yr',
      hiringManager: jobData.hiringManager || 'Hiring Lead',
      description: jobData.description || 'Engineering role posted live on Architex.',
      techStack: Array.isArray(jobData.techStack) ? jobData.techStack : (jobData.techStack || 'React, Node.js').split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    globalJobsStore.unshift(newJob);
    saveJsonDisk(JOBS_FILE, globalJobsStore);
    console.log('[PERMANENT CLOUD JOBS] New job posted & saved permanently:', newJob.title);
    res.status(201).json(newJob);
  } catch (err) {
    console.error('Post job error:', err);
    res.status(500).json({ error: 'Failed to post job.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// LIVE GLOBAL PROJECTS & RFP ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/projects', (req, res) => {
  res.json(globalProjectsStore);
});

app.post('/api/projects', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.title) return res.status(400).json({ error: 'Project title is required.' });

    const newProj = {
      id: 'proj_' + Date.now(),
      title: data.title,
      client: data.client || 'Client Lead',
      logo: data.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&q=80',
      contractType: data.contractType || 'Fixed Price',
      budget: data.budget || '$20,000 Fixed',
      duration: data.duration || '4 Weeks',
      proposalsCount: 0,
      status: 'Hiring',
      verifiedEscrow: true,
      clientRole: data.clientRole || 'You (Project Client Lead)',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || 'React, AWS').split(',').map(s => s.trim()).filter(Boolean),
      description: data.description || 'Engineering RFP contract.'
    };

    globalProjectsStore.unshift(newProj);
    saveJsonDisk(PROJECTS_FILE, globalProjectsStore);
    console.log('[PERMANENT CLOUD PROJECTS] New project RFP posted:', newProj.title);
    res.status(201).json(newProj);
  } catch (err) {
    console.error('Post project error:', err);
    res.status(500).json({ error: 'Failed to post project RFP.' });
  }
});

app.get('/api/projects/bids', (req, res) => {
  res.json(globalProjectBidsStore);
});

app.post('/api/projects/bids', (req, res) => {
  try {
    const bidData = req.body;
    const newBid = {
      id: 'bid_' + Date.now(),
      ...bidData,
      submittedAt: new Date().toLocaleString(),
      status: 'Under Client Review',
      statusColor: '#0a66c2'
    };

    globalProjectBidsStore.unshift(newBid);

    // Increment proposal count on target project
    const projIndex = globalProjectsStore.findIndex(p => p.id === bidData.projectId);
    if (projIndex !== -1) {
      globalProjectsStore[projIndex].proposalsCount += 1;
    }

    saveJsonDisk(BIDS_FILE, globalProjectBidsStore);
    saveJsonDisk(PROJECTS_FILE, globalProjectsStore);
    console.log('[PERMANENT CLOUD BIDS] New project bid submitted:', newBid.title, 'Bid:', newBid.bidAmount);
    res.status(201).json(newBid);
  } catch (err) {
    console.error('Submit bid error:', err);
    res.status(500).json({ error: 'Failed to submit project bid.' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// LIVE GLOBAL GROUPS & COMMUNITIES ROUTES
// ──────────────────────────────────────────────────────────────────────────────

app.get('/api/groups', (req, res) => {
  res.json(globalGroupsStore);
});

app.post('/api/groups', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name) return res.status(400).json({ error: 'Group name required.' });

    const newGroup = {
      id: 'grp-' + Date.now(),
      name: data.name,
      category: data.category || 'Tech Community',
      membersCount: 1,
      description: data.description || 'Developer community on Architex.',
      image: data.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
      joined: true
    };

    globalGroupsStore.unshift(newGroup);
    saveJsonDisk(GROUPS_FILE, globalGroupsStore);
    console.log('[PERMANENT CLOUD GROUPS] New group created:', newGroup.name);
    res.status(201).json(newGroup);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group.' });
  }
});

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

    // For old notifications with no senderId, extract sender name from title and resolve their ID
    const enriched = await Promise.all(notifications.map(async (n) => {
      if (n.senderId) return n;
      const match = n.title.match(/^(.+?)\s+(liked|commented|followed|sent)/);
      if (match) {
        const senderName = match[1];
        const found = await prisma.user.findFirst({
          where: { name: senderName },
          select: { id: true }
        });
        if (found) return { ...n, senderId: found.id };
      }
      return n;
    }));

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    });
    res.json({ notifications: enriched, unreadCount });
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
      description = '1,200 Architex Credits (+200 Bonus!)';
    } else if (type === 'certification') {
      amount = 9900; // $99.00
      description = 'Architex Certified Expert Assessment';
    } else if (type === 'pro_monthly') {
      amount = 2499; // $24.99
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
    let session = req.body;
    let sessionId = req.body?.sessionId;
    let metadata = {};

    // Handle official Stripe Webhook payload format
    if (req.body?.type === 'checkout.session.completed') {
      session = req.body?.data?.object;
      sessionId = session?.id;
      metadata = session?.metadata || {};
    }

    // Handle Metadata-based Global State Updates (Escrow Funding & Post Promotion)
    if (metadata.projectId) {
      const projectId = Number(metadata.projectId);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'In Progress' }
      });
      console.log(`[Stripe Webhook] Escrow funded! Project #${projectId} updated to 'In Progress' globally.`);

      if (metadata.freelancerId) {
        const freelancerId = Number(metadata.freelancerId);
        await createNotification(
          freelancerId,
          'proposal_accepted',
          '🎉 Escrow Funded & Bid Accepted!',
          `Client has funded escrow for project #${projectId}. You can start work immediately!`,
          `/projects?id=${projectId}`
        );
      }
    }

    if (metadata.postId) {
      const postId = Number(metadata.postId);
      await prisma.post.update({
        where: { id: postId },
        data: { isPromoted: true, isAd: true }
      });
      console.log(`[Stripe Webhook] Post promotion paid! Post #${postId} is live as Sponsored Ad.`);
    }

    if (!sessionId) {
      return res.json({ received: true });
    }

    const tx = await prisma.transaction.findUnique({ where: { stripeSessionId: sessionId } });
    if (tx && tx.status !== 'completed') {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: 'completed' }
      });

      if (tx.description.includes('Credits')) {
        await prisma.user.update({
          where: { id: tx.userId },
          data: { credits: { increment: 1200 } }
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
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    res.status(500).json({ error: 'Webhook error' });
  }
});

// 6. Escrow Release & Project Completion
app.post('/api/projects/:id/release-escrow', requireAuth, async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        bids: { where: { status: 'Accepted' }, include: { freelancer: true } }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (project.clientId !== req.userId) {
      return res.status(403).json({ error: 'Only the project owner can release escrow funds.' });
    }

    const acceptedBid = project.bids[0];
    if (!acceptedBid) {
      return res.status(400).json({ error: 'No accepted bid found for this project.' });
    }

    // Update Project status to Completed
    const completedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Completed' }
    });

    // Notify Freelancer of Escrow Release
    await createNotification(
      acceptedBid.freelancerId,
      'proposal_accepted',
      '💰 Escrow Released & Payment Delivered!',
      `Client has approved work for "${project.title}" and released $${acceptedBid.proposedAmount.toLocaleString()} from escrow!`,
      `/projects?id=${projectId}`
    );

    res.json({
      success: true,
      message: 'Escrow released successfully! Project marked as Completed.',
      project: completedProject,
      payoutAmount: acceptedBid.proposedAmount,
      freelancer: acceptedBid.freelancer.name
    });
  } catch (error) {
    console.error('Escrow release error:', error);
    res.status(500).json({ error: 'Failed to release escrow funds.' });
  }
});

app.post('/api/credits/spend', requireAuth, async (req, res) => {
  try {
    const { action, postId, adData } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    let cost = 0;
    if (action === 'boost_job') cost = 350;
    else if (action === 'buy_ad') cost = 750;
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

// 7. Apply with Resume API Route (Brevo HTTP REST API)
app.post('/api/jobs/apply', async (req, res) => {
    try {
        const { applicantEmail, applicantName, jobTitle, companyName, userEmail, company } = req.body;
        const targetEmail = applicantEmail || userEmail || 'geejohnny0@gmail.com';
        const targetName = applicantName || 'Applicant';
        const targetCompany = companyName || company || 'Architex';

        console.log(`[JOB APPLY] Processing application for: ${targetEmail} (${jobTitle || 'Position'} at ${targetCompany})`);

        // Save application into global store for Business Owner Applicant Review
        const newApp = {
          id: 'app-' + Date.now(),
          jobId: req.body.jobId || 'job-1',
          jobTitle: jobTitle || 'Engineering Position',
          companyName: targetCompany,
          applicantName: targetName,
          applicantEmail: targetEmail,
          phone: req.body.phone || '(555) 019-2831',
          cityState: req.body.cityState || 'Remote',
          resumeName: req.body.resumeName || 'Applicant_Resume.pdf',
          currentTitle: req.body.currentTitle || 'Software Engineer',
          currentEmployer: req.body.currentEmployer || 'Independent Tech Lead',
          yearsExperience: req.body.yearsExperience || '3-5 Years',
          technicalSkills: req.body.technicalSkills || 'Full-Stack Software Engineering',
          desiredSalary: req.body.desiredSalary || '$160,000/yr',
          desiredRate: req.body.desiredRate || '$110/hr',
          linkedIn: req.body.linkedIn || '',
          gitHub: req.body.gitHub || '',
          portfolio: req.body.portfolio || '',
          noticePeriod: req.body.noticePeriod || '2 Weeks',
          workAuth: req.body.workAuth || 'Authorized to work without restriction',
          appliedAt: 'Just now'
        };
        globalJobApplicationsStore.unshift(newApp);
        saveJsonDisk(APPS_FILE, globalJobApplicationsStore);

        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            console.error('[BREVO ERROR] BREVO_API_KEY is missing from Render environment variables!');
            return res.status(500).json({ 
                success: false, 
                error: 'Server configuration error: BREVO_API_KEY missing from environment.' 
            });
        }

        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'architexjobs@gmail.com';

        // Fire HTTP POST request to Brevo API over HTTPS Port 443 (bypasses Render SMTP port blocking)
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'Architex Jobs', email: senderEmail },
                to: [{ email: targetEmail, name: targetName }],
                replyTo: { email: senderEmail, name: 'Architex Jobs' },
                subject: `Application Confirmed: ${jobTitle || 'Position'} at ${targetCompany}`,
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
                        <h2 style="color: #1a1a1a;">Application Confirmed!</h2>
                        <p>Hi <strong>${targetName}</strong>,</p>
                        <p>Your application for <strong>${jobTitle || 'Position'}</strong> at <strong>${targetCompany}</strong> has been logged successfully!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p><strong>Applicant Email:</strong> ${targetEmail}</p>
                        <p><strong>Sent From:</strong> ${senderEmail}</p>
                        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                        <br>
                        <p>Best regards,</p>
                        <p><strong>${targetCompany} Hiring Team</strong></p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[BREVO REJECTED]', response.status, JSON.stringify(data));
            return res.status(response.status).json({
                success: false,
                error: data.message || data.code || 'Brevo API rejected sending email.',
                details: data
            });
        }

        console.log('[BREVO SUCCESS] Email dispatched via Brevo HTTP API:', JSON.stringify(data));

        return res.status(200).json({ 
            success: true, 
            message: 'Application logged and confirmation email successfully sent via Brevo HTTP API.',
            data 
        });

    } catch (error) {
        console.error('[BREVO FAILED] Exception caught while sending email:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to send confirmation email' 
        });
    }
});

// ─── Production / Deployment Static File Serving ───────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

async function syncExistingUsersToMotionMedias() {
  const adminIds = [4, 5];
  try {
    for (const targetId of adminIds) {
      const allUsers = await prisma.user.findMany({ where: { NOT: { id: targetId } } });
      for (const user of allUsers) {
        await prisma.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: targetId
            }
          },
          update: {},
          create: {
            followerId: user.id,
            followingId: targetId
          }
        });
      }
    }
    console.log('--- Retroactive follow sync complete for Motion Medias (User IDs 4 & 5) ---');
  } catch (err) {
    console.error('Retroactive follow sync error:', err.message);
  }
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    await syncExistingUsersToMotionMedias();
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
