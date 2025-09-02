#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function downloadImage(imageUrl, destPath) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    const page = await context.newPage();

    const response = await page.goto(imageUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    if (!response) {
      throw new Error('Failed to load the page');
    }

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    const buffer = await response.body();

    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(destPath, buffer);
    console.log(`Image saved successfully: ${destPath}`);

  } catch (error) {
    console.error('Error downloading image:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();

    if (!filename || !filename.includes('.')) {
      return 'downloaded_image.jpg';
    }

    return filename;
  } catch (error) {
    return 'downloaded_image.jpg';
  }
}

function showUsage() {
  console.log('Usage: node dl_image.js <url> [dst-file-path]');
  console.log('');
  console.log('Arguments:');
  console.log('  url            - Image URL to download');
  console.log('  dst-file-path  - Destination file path (optional)');
  console.log('                   If not specified, filename is extracted from URL');
  console.log('');
  console.log('Examples:');
  console.log('  node dl_image.js https://example.com/image.jpg');
  console.log('  node dl_image.js https://example.com/image.jpg ./images/image.jpg');
  console.log('  node dl_image.js https://example.com/image.png /tmp/downloaded.png');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args.length > 2) {
    console.error('Error: Invalid number of arguments');
    showUsage();
    process.exit(1);
  }

  const imageUrl = args[0];
  const destPath = args[1] || extractFilenameFromUrl(imageUrl);

  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    console.error('Error: URL must start with http:// or https://');
    process.exit(1);
  }

  console.log(`Downloading: ${imageUrl}`);
  console.log(`Saving to: ${destPath}`);

  await downloadImage(imageUrl, destPath);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
