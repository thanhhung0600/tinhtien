const sharp = require('sharp');
const fs = require('fs');

(async () => {
  try {
    await sharp('public/icon.svg')
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 240, g: 247, b: 255 }
      })
      .png()
      .toFile('public/icon-192.png');
    
    console.log('✅ Icon created: public/icon-192.png');
  } catch (err) {
    console.error('Error:', err);
  }
})();
