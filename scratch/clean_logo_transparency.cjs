const sharp = require('sharp');
const path = require('path');

async function removeCheckerboardBackground() {
  const inputPath = path.resolve('public/architex-logo.png');
  const outputPath = path.resolve('public/architex-logo-clean.png');

  console.log('Processing logo background transparency...');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Process RGBA pixels
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Detect white/light-grey checkerboard pixels (high RGB values with low saturation)
    const isLightGreyOrWhite = (r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15);
    const isMediumGreyChecker = (r > 170 && r < 240 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10);

    if (isLightGreyOrWhite || isMediumGreyChecker) {
      data[i + 3] = 0; // Set Alpha to completely transparent
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Successfully removed checkerboard background from public/architex-logo-clean.png!');
}

removeCheckerboardBackground().catch(err => {
  console.error('Error removing background:', err);
});
