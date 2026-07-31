const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const newRoute = `app.get('/api/posts', requireAuth, async (req, res) => {
  try {
    const { tab, limit = 20, offset = 0 } = req.query;
    let where = {};
    
    if (!tab || tab === 'foryou') {
      where = { author: { userType: 'business' } };
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
});`;

// Now find the block between line 442 and 540 and replace it.
// Wait, my previous replacement screwed it up to line 540, and the old catch was at line 580!
// So I should replace from 'app.get('/api/posts'' up to the END of that route!

const startIndex = serverCode.indexOf("app.get('/api/posts', requireAuth");
// To find the end index, we look for the next route:
const endIndex = serverCode.indexOf("app.post('/api/posts'", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  serverCode = serverCode.substring(0, startIndex) + newRoute + '\n\n' + serverCode.substring(endIndex);
  fs.writeFileSync('server.js', serverCode, 'utf8');
  console.log('patched feed correctly');
} else {
  console.log('could not find indices');
}
