const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'apps', 'mobile', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid 1x1 green PNG file
const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(minimalPngBase64, 'base64');

['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach((file) => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Created asset: ${filePath}`);
});
