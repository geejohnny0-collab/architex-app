import sharp from 'sharp';
import path from 'path';

async function removeBackground() {
  const inputPath = path.resolve('public/architex-logo.png');
  const outputPath = path.resolve('public/architex-logo-clean.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Process raw RGBA pixels to remove light checkerboard background
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is part of light checkerboard background (white / light grey)
    const isLightGreyOrWhite = (r > 170 && g > 170 && b > 170) || 
                               (r > 150 && g > 150 && b > 150 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20);

    if (isLightGreyOrWhite) {
      // Calculate smooth alpha fading for anti-aliasing around logo edges
      const brightness = (r + g + b) / 3;
      if (brightness > 240) {
        data[i + 3] = 0; // Pure transparent
      } else if (brightness > 180) {
        // Smooth edge threshold
        const alpha = Math.max(0, Math.min(255, Math.floor((240 - brightness) * 4)));
        data[i + 3] = alpha;
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .trim() // Crop empty transparent borders around logo
    .png()
    .toFile(outputPath);

  console.log('Successfully created clean transparent logo at:', outputPath);
}

removeBackground().catch(err => console.error(err));
