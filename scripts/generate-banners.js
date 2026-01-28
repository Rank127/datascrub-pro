const puppeteer = require('puppeteer');
const path = require('path');

const banners = [
  // Social Media Headers (already created)
  { html: 'youtube-banner.html', png: 'youtube-banner.png', width: 2560, height: 1440 },
  { html: 'twitter-banner.html', png: 'twitter-banner.png', width: 1500, height: 500 },
  { html: 'linkedin-banner.html', png: 'linkedin-banner.png', width: 1128, height: 191 },
  { html: 'facebook-banner.html', png: 'facebook-banner.png', width: 820, height: 312 },

  // Instagram
  { html: 'instagram-post.html', png: 'instagram-post.png', width: 1080, height: 1080 },

  // Profile Pictures
  { html: 'profile-square.html', png: 'profile-400.png', width: 400, height: 400 },  // G2, Capterra, Trustpilot, Quora, Indie Hackers, Crunchbase
  { html: 'profile-small.html', png: 'profile-256.png', width: 256, height: 256 },   // Reddit, AlternativeTo

  // Product Hunt
  { html: 'producthunt-icon.html', png: 'producthunt-icon.png', width: 240, height: 240 },
  { html: 'producthunt-gallery.html', png: 'producthunt-gallery.png', width: 1270, height: 760 },

  // Medium
  { html: 'medium-header.html', png: 'medium-header.png', width: 600, height: 600 },
];

async function generateBanners() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const banner of banners) {
    const page = await browser.newPage();
    await page.setViewport({ width: banner.width, height: banner.height });

    const htmlPath = path.join(__dirname, '..', 'public', 'banners', banner.html);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    const outputPath = path.join(__dirname, '..', 'public', 'banners', banner.png);
    await page.screenshot({ path: outputPath, type: 'png' });

    console.log(`Created: ${banner.png} (${banner.width}x${banner.height})`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll banners generated in public/banners/');
}

generateBanners().catch(console.error);
