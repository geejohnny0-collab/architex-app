const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const feedPatch = `
app.get('/api/posts', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // We filter out regular posts from developers so they don't show on FYP
    const posts = await prisma.post.findMany({
      where: {
        author: {
          userType: 'business'
        }
      },
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true, verified: true, isCertified: true } },
        _count: { select: { comments: true, likes: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Check if user has liked these posts
    const userLikes = await prisma.like.findMany({
      where: {
        userId: req.user.id,
        postId: { in: posts.map(p => p.id) }
      }
    });
    const likedPostIds = new Set(userLikes.map(l => l.postId));

    const enrichedPosts = posts.map(post => ({
      ...post,
      hasLiked: likedPostIds.has(post.id)
    }));

    // Monetization: Inject an Advertisement or a Boosted Job occasionally (e.g. at position 2)
    // Only inject on page 1 for simplicity
    if (page === 1) {
      const activeAd = await prisma.advertisement.findFirst({
        where: { isActive: true, expiresAt: { gt: new Date() } }
      });
      if (activeAd) {
        // Track impression
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
          codeSnippet: activeAd.targetUrl, // repurpose for URL
          createdAt: activeAd.createdAt,
          author: {
            name: activeAd.companyName,
            handle: activeAd.headline,
            avatarUrl: null,
            verified: true,
            isCertified: false
          },
          _count: { comments: 0, likes: 0 },
          hasLiked: false
        };
        enrichedPosts.splice(1, 0, adPost);
      } else {
        // Look for a boosted job if no ad
        const boosted = await prisma.boostedJob.findFirst({
          where: { isActive: true, expiresAt: { gt: new Date() } },
          include: {
            post: {
              include: {
                author: { select: { id: true, name: true, handle: true, avatarUrl: true, verified: true } },
                _count: { select: { comments: true, likes: true } }
              }
            }
          }
        });
        if (boosted && boosted.post) {
           const boostedPost = {
             ...boosted.post,
             isBoosted: true,
             hasLiked: likedPostIds.has(boosted.post.id)
           };
           // Replace if it exists further down, or just insert at top
           enrichedPosts.unshift(boostedPost);
        }
      }
    }

    res.json(enrichedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});
`;

// Replace the existing app.get('/api/posts' ... ) block
const regex = /app\.get\('\/api\/posts', requireAuth, async \(req, res\) => \{[\s\S]*?\}\);/;
serverCode = serverCode.replace(regex, feedPatch.trim());

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('patched feed');
