async function testCreditDelivery() {
  try {
    // 1. Log in
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Get initial credits
    const beforeUser = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    console.log('Credits Before Purchase:', beforeUser.user.credits);

    // 2. Initiate Credit Checkout (1,000 Credits)
    const checkoutRes = await fetch('http://localhost:5000/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ type: 'credits_1000' })
    });
    const checkoutData = await checkoutRes.json();
    console.log('Credit Checkout Session Created:', checkoutData.url);

    // Get pending transaction ID
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const tx = await prisma.transaction.findFirst({
      where: { userId: beforeUser.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Trigger Webhook fulfillment
    const webhookRes = await fetch('http://localhost:5000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: tx.stripeSessionId })
    });
    const webhookData = await webhookRes.json();
    console.log('Webhook Response:', webhookData);

    // 4. Verify updated credits
    const afterUser = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    console.log('Credits After Delivery:', afterUser.user.credits);
    console.log('CREDITS DELIVERED SUCCESSFULLY:', afterUser.user.credits === beforeUser.user.credits + 1000);

    await prisma.$disconnect();
  } catch (e) {
    console.error('Credit delivery test error:', e);
  }
}

testCreditDelivery();
