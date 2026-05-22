const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="34" r="28" fill="rgba(0,0,0,0.15)"/>
  <circle cx="32" cy="32" r="28" fill="#FBC400"/>
  <ellipse cx="24" cy="20" rx="9" ry="6" fill="rgba(255,255,255,0.45)" transform="rotate(-20,24,20)"/>
  <circle cx="32" cy="32" r="16" fill="white" opacity="0.92"/>
  <text x="32" y="41" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" text-anchor="middle" fill="#222">7</text>
</svg>`;

function makeHtml(size, bgColor) {
  return `<!DOCTYPE html><html><head><style>
    * { margin: 0; padding: 0; }
    body { width: ${size}px; height: ${size}px; background: ${bgColor}; }
    svg { width: ${size}px; height: ${size}px; }
  </style></head><body>${SVG}</body></html>`;
}

function buildIco(pngBuffer) {
  const ICONDIR = Buffer.alloc(6);
  ICONDIR.writeUInt16LE(0, 0);
  ICONDIR.writeUInt16LE(1, 2);
  ICONDIR.writeUInt16LE(1, 4);

  const ICONDIRENTRY = Buffer.alloc(16);
  ICONDIRENTRY.writeUInt8(0, 0);   // 0 = 256px, but works for any size
  ICONDIRENTRY.writeUInt8(0, 1);
  ICONDIRENTRY.writeUInt8(0, 2);
  ICONDIRENTRY.writeUInt8(0, 3);
  ICONDIRENTRY.writeUInt16LE(1, 4);
  ICONDIRENTRY.writeUInt16LE(32, 6);
  ICONDIRENTRY.writeUInt32LE(pngBuffer.length, 8);
  ICONDIRENTRY.writeUInt32LE(22, 12);

  return Buffer.concat([ICONDIR, ICONDIRENTRY, pngBuffer]);
}

(async () => {
  const browser = await chromium.launch();

  async function capture(size, bgColor, omitBg) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(makeHtml(size, bgColor));
    const buf = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: size, height: size },
      omitBackground: omitBg,
    });
    await page.close();
    return buf;
  }

  // favicon.png — 64x64 transparent
  const png64 = await capture(64, 'transparent', true);
  fs.writeFileSync(path.join(__dirname, 'favicon.png'), png64);
  console.log('favicon.png:', png64.length, 'bytes');

  // favicon.ico — 64x64 PNG-in-ICO
  fs.writeFileSync(path.join(__dirname, 'favicon.ico'), buildIco(png64));
  console.log('favicon.ico created');

  // apple-touch-icon.png — 180x180, solid white background (iOS requires no transparency)
  const png180 = await capture(180, '#ffffff', false);
  fs.writeFileSync(path.join(__dirname, 'apple-touch-icon.png'), png180);
  console.log('apple-touch-icon.png:', png180.length, 'bytes');

  // icon-192.png — Android/PWA
  const png192 = await capture(192, 'transparent', true);
  fs.writeFileSync(path.join(__dirname, 'icon-192.png'), png192);
  console.log('icon-192.png:', png192.length, 'bytes');

  // icon-512.png — PWA splash
  const png512 = await capture(512, 'transparent', true);
  fs.writeFileSync(path.join(__dirname, 'icon-512.png'), png512);
  console.log('icon-512.png:', png512.length, 'bytes');

  await browser.close();
  console.log('All favicon files generated.');
})();
