import fs from 'fs/promises';
import sharp from 'sharp';
import looksSame from 'looks-same';
import pLimit from 'p-limit';

async function getImage(image) {
  try {
    return sharp(image);
  } catch (error) {
    console.log(error);
  }
}

async function makeTiles(originalImage) {
  const limit = pLimit(20);
  const tileWidth = 32;
  const tileHeight = 32;
  const image = await sharp(originalImage);
  const metadata = await image.metadata();
  const maxWidth = metadata.width;
  const maxHeight = metadata.height;
  let currentX = 0;
  let currentY = 0;
  let tile = 0;
  const imagesToCreate = [];
  while (currentY <= maxHeight) {
    while (currentX <= maxWidth) {
      imagesToCreate.push({
        tile,
        directory: originalImage.split('.')[0],
        left: currentX,
        top: currentY,
        width: tileWidth,
        height: tileHeight
      });
      currentX = currentX + tileWidth;
      tile++;
    }
    currentY = currentY + tileHeight;
    currentX = 0;
    tile--;
  }

  const promises = imagesToCreate.map((d) =>
    limit(() => cropImage({ ...d, image: image.clone() }))
  );

  (async () => {
    // Only three promises are run at once (as defined above)
    const result = await Promise.all(promises);
    console.log(result);
  })();
}

async function cropImage({ tile, image, directory, left, top, width, height }) {
  if (left < 0 || top < 0) {
    return;
  }
  if (tile < 34500) return;
  const changed = [];
  try {
    await image
      .extract({
        width,
        height,
        left,
        top
      })
      .toFormat('webp', { lossless: false, quality: 100 })
      .toBuffer()
      .then(async (buffer) => {
        const originaImage = 'created/' + directory + '/' + tile + '.webp';
        const exists = await fs
          .access(originaImage)
          .then(() => true)
          .catch(() => false);
        let equal = false;
        if (exists) {
          equal = await looksSame(buffer, originaImage);
        }

        if (!exists || !equal) {
          console.log('CREATED', tile);
          changed.push({
            tile,
            name: 'created/' + directory + '/' + tile + '.webp'
          });
          fs.writeFile('created/' + directory + '/' + tile + '.webp', buffer);
        } else {
          console.log('EQUAL', tile);
        }
        return false;
      });

    //      .webp({ lossless: false, quality: 100 })
    //     .toFile('created/' + directory + '/' + tile + '.webp');
  } catch (error) {
    console.log('ERROR', left, top, width, height);

    console.log('ERROR', error);
  }
  console.log(changed);
}

//make('city');
//make('PubSolitaryOwl');
//makeTiles('Interiors_32x32.png');
//makeTiles('1_Terrains_and_Fences_32x32.png');
//makeTiles('2_City_Terrains_32x32.png');
makeTiles('city.webp');
