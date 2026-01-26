const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const screenshotsDir = path.join(publicDir, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper to draw rounded rect
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Generate cover image (1200x630)
function generateCover() {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#0a0a0f');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Decorative circles
  ctx.fillStyle = 'rgba(0, 82, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(100, 100, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1100, 530, 250, 0, Math.PI * 2);
  ctx.fill();

  // Icon box
  const iconGradient = ctx.createLinearGradient(80, 265, 160, 345);
  iconGradient.addColorStop(0, '#0052FF');
  iconGradient.addColorStop(1, '#3b82f6');
  ctx.fillStyle = iconGradient;
  roundRect(ctx, 80, 265, 80, 80, 16);
  ctx.fill();

  // Dollar sign
  ctx.fillStyle = 'white';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('$', 120, 320);

  // Title
  ctx.textAlign = 'left';
  ctx.font = 'bold 48px Arial';
  ctx.fillText('BaseSubscribe', 180, 320);

  // Subtitle
  ctx.fillStyle = '#9ca3af';
  ctx.font = '24px Arial';
  ctx.fillText('Decentralized Subscriptions on Base', 80, 370);

  // Button
  ctx.fillStyle = iconGradient;
  roundRect(ctx, 80, 420, 200, 50, 25);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Get Started', 180, 452);

  // Card
  ctx.fillStyle = '#1f2937';
  roundRect(ctx, 700, 150, 420, 330, 20);
  ctx.fill();
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Card items
  const items = [
    { name: 'Premium Plan', price: '$10/mo', y: 170 },
    { name: 'Creator Pro', price: '$25/mo', y: 250 },
    { name: 'Enterprise', price: '$99/mo', y: 330 },
  ];

  items.forEach(item => {
    ctx.fillStyle = '#111827';
    roundRect(ctx, 720, item.y, 380, 60, 10);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 740, item.y + 38);
    ctx.fillStyle = '#0052FF';
    ctx.textAlign = 'right';
    ctx.fillText(item.price, 1080, item.y + 38);
  });

  // Subscribe button
  ctx.fillStyle = '#0052FF';
  roundRect(ctx, 720, 410, 380, 50, 25);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Subscribe with USDC', 910, 442);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'cover-1200x630.png'), buffer);
  console.log('Generated cover-1200x630.png');
}

// Generate icon (1024x1024)
function generateIcon() {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
  gradient.addColorStop(0, '#0052FF');
  gradient.addColorStop(1, '#3b82f6');
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, 1024, 1024, 224);
  ctx.fill();

  // Dollar circle
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 40;
  ctx.beginPath();
  ctx.arc(512, 400, 180, 0, Math.PI * 2);
  ctx.stroke();

  // Plus sign (dollar)
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(512, 280);
  ctx.lineTo(512, 520);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(432, 400);
  ctx.lineTo(592, 400);
  ctx.stroke();

  // Lines below (subscription indicator)
  ctx.beginPath();
  ctx.moveTo(380, 650);
  ctx.lineTo(644, 650);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(430, 720);
  ctx.lineTo(594, 720);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(480, 790);
  ctx.lineTo(544, 790);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'icon-1024.png'), buffer);
  console.log('Generated icon-1024.png');
}

// Generate splash (200x200)
function generateSplash() {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, 200, 200);

  // Dollar circle
  const gradient = ctx.createLinearGradient(65, 45, 135, 115);
  gradient.addColorStop(0, '#0052FF');
  gradient.addColorStop(1, '#3b82f6');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(100, 80, 35, 0, Math.PI * 2);
  ctx.stroke();

  // Plus sign
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 55);
  ctx.lineTo(100, 105);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(80, 80);
  ctx.lineTo(120, 80);
  ctx.stroke();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('BaseSubscribe', 100, 150);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Arial';
  ctx.fillText('Crypto Subscriptions', 100, 172);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'splash.png'), buffer);
  console.log('Generated splash.png');
}

// Generate screenshot (1284x2778)
function generateScreenshot(num, title, content) {
  const canvas = createCanvas(1284, 2778);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, 1284, 2778);

  // Header
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 1284, 200);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('BaseSubscribe', 642, 125);

  // Title
  ctx.textAlign = 'left';
  ctx.font = 'bold 80px Arial';
  ctx.fillText(title, 60, 350);

  // Subtitle
  ctx.fillStyle = '#9ca3af';
  ctx.font = '40px Arial';
  ctx.fillText(content.subtitle, 60, 420);

  // Cards
  content.cards.forEach((card, i) => {
    const y = 500 + i * 520;
    ctx.fillStyle = '#1f2937';
    roundRect(ctx, 60, y, 1164, 480, 40);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(card.title, 100, y + 100);

    // Badge
    ctx.fillStyle = card.badgeColor + '33';
    roundRect(ctx, 900, y + 50, 220, 80, 40);
    ctx.fill();
    ctx.fillStyle = card.badgeColor;
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(card.badge, 1010, y + 105);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(card.description, 100, y + 180);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(card.price, 100, y + 320);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '40px Arial';
    ctx.fillText(card.period, 100 + ctx.measureText(card.price).width + 20, y + 320);

    ctx.textAlign = 'right';
    ctx.fillText(card.subscribers, 1124, y + 420);
  });

  // Bottom nav
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 2578, 1284, 200);
  const tabs = ['Browse', 'Creator', 'My Subs'];
  tabs.forEach((tab, i) => {
    ctx.fillStyle = content.activeTab === i ? 'white' : '#6b7280';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tab, 214 + i * 428, 2700);
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(screenshotsDir, `screenshot-${num}.png`), buffer);
  console.log(`Generated screenshot-${num}.png`);
}

// Run generation
generateCover();
generateIcon();
generateSplash();

generateScreenshot(1, 'Browse Plans', {
  subtitle: 'Support your favorite creators',
  activeTab: 0,
  cards: [
    { title: 'Premium Access', badge: 'Monthly', badgeColor: '#0052FF', description: 'Exclusive content and early access', price: '$10', period: '/month', subscribers: '24 subscribers' },
    { title: 'Creator Pro', badge: 'Monthly', badgeColor: '#0052FF', description: 'Full access to all tools', price: '$25', period: '/month', subscribers: '12 subscribers' },
    { title: 'Weekly Pass', badge: 'Weekly', badgeColor: '#0052FF', description: 'Try before you commit', price: '$3', period: '/week', subscribers: '8 subscribers' },
  ]
});

generateScreenshot(2, 'Creator Dashboard', {
  subtitle: 'Manage your subscriptions',
  activeTab: 1,
  cards: [
    { title: 'Total Earnings', badge: 'Withdraw', badgeColor: '#22c55e', description: 'Available balance', price: '$1,234', period: 'USDC', subscribers: 'Tap to withdraw' },
    { title: 'Premium Access', badge: 'Active', badgeColor: '#22c55e', description: '$10/month subscription', price: '24', period: 'subscribers', subscribers: '$240/month revenue' },
    { title: 'Create New Plan', badge: 'New', badgeColor: '#3b82f6', description: 'Add a subscription tier', price: '+', period: '', subscribers: 'Tap to create' },
  ]
});

generateScreenshot(3, 'My Subscriptions', {
  subtitle: 'Active subscriptions',
  activeTab: 2,
  cards: [
    { title: 'Premium Access', badge: 'Active', badgeColor: '#22c55e', description: 'by 0x8F05...DDE', price: '$10', period: '/month', subscribers: 'Next: Feb 15, 2026' },
    { title: 'Weekly Pass', badge: 'Due', badgeColor: '#eab308', description: 'by 0xABC...123', price: '$3', period: '/week', subscribers: 'Payment pending' },
    { title: 'Old Subscription', badge: 'Cancelled', badgeColor: '#ef4444', description: 'by 0xDEF...456', price: '$15', period: '/month', subscribers: 'Ended Jan 10' },
  ]
});

console.log('All images generated!');
