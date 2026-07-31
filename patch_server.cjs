const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// 1. Add Stripe import
if (!serverCode.includes("import Stripe from 'stripe'")) {
  serverCode = serverCode.replace(
    "import { OAuth2Client } from 'google-auth-library';",
    "import { OAuth2Client } from 'google-auth-library';\nimport Stripe from 'stripe';\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');"
  );
}

// 2. Add Stripe API Routes
const stripeRoutes = `
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
    } else {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    // In a real app, you would create a Stripe Checkout Session here:
    // const session = await stripe.checkout.sessions.create({ ... })
    // For local development without real keys, we will simulate a successful session
    const sessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15);

    // Create pending transaction
    await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amountCent: amount,
        stripeSessionId: sessionId,
        status: 'pending',
        description: description
      }
    });

    res.json({ url: \`/payment-success?session_id=\${sessionId}\` }); // Mock redirect
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.post('/api/stripe/webhook', express.json(), async (req, res) => {
  // This endpoint would normally receive signed webhooks from Stripe.
  // We'll simulate fulfilling the order.
  const { sessionId } = req.body;

  try {
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
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Webhook error' });
  }
});

app.post('/api/credits/spend', requireAuth, async (req, res) => {
  try {
    const { action, postId, adData } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

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

// ─── Feed Injection Logic ─────────────────────────────────────────────────────
// We need to inject Ads and Boosted Jobs into the GET /api/posts feed.
// However, I will patch the GET /api/posts route separately.
`;

if (!serverCode.includes('/api/stripe/checkout')) {
  serverCode = serverCode.replace(
    'async function startServer() {',
    stripeRoutes + '\nasync function startServer() {'
  );
}

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('patched server.js');
