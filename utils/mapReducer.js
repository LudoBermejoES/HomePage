import fs from 'fs/promises';
import sharp from 'sharp';
import looksSame from 'looks-same';
import pLimit from 'p-limit';
import AdmZip from 'adm-zip';

async function getImage(image) {
  try {
    return sharp(image);
  } catch (error) {
    console.log(error);
  }
}

async function zipDirectory(sourceDir, outputFilePath) {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  await zip.writeZipPromise(outputFilePath);
  console.log(`Zip file created: ${outputFilePath}`);
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
  if (tile < 35000) return;
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

async function compositeImages(
  allTiles,
  tilesets,
  map,
  imageTo,
  widthTile,
  heightTile
) {
  let lastPosition = { x: 1, y: 0, index: 2 };
  const tilesMap = [];

  allTiles.forEach((tile, mm) => {
    let found = false;
    if (tile > 0) {
      while (!found) {
        tilesets.forEach((tileset) => {
          if (
            tileset.firstgid <= tile &&
            tileset.firstgid + tileset.tilecount > tile
          ) {
            found = tileset;
          }
        });
      }
      const image =
        'created/' +
        found.name +
        '/' +
        (Number(tile - found.firstgid + 1) - 1) +
        '.webp';

      const resultTile = {
        ...lastPosition,
        image,
        origin: tile
      };

      tilesMap.push(resultTile);
    }

    if (lastPosition.x * widthTile >= 2016) {
      lastPosition.y++;
      lastPosition.x = 0;
      lastPosition.index++;
    } else {
      lastPosition.x++;

      lastPosition.index++;
    }
  });

  const compositeArray = tilesMap.map((tile) => {
    return {
      input: tile.image,
      top: tile.y * heightTile,
      left: tile.x * widthTile
    };
  });

  try {
    imageTo
      .composite(compositeArray)
      .webp({ lossless: false, quality: 100 })
      .toFile('created/' + map + '.webp');
    console.log('Completo ' + map);
  } catch (error) {
    console.log(error);
  }
  return tilesMap;
}

async function make(map) {
  const file = await fs.readFile(map + '.json');
  const json = JSON.parse(file.toString());

  const tilesets = json.tilesets[0];
  const layers = json.layers;

  let allTilesArray = [];
  layers.forEach((layer) => {
    if (layer.data) allTilesArray = [...allTilesArray, ...layer.data];
  });
  let allTiles = Array.from(new Set(allTilesArray));

  let newImage = await sharp({
    create: {
      width: 2048,
      height: 2048,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  });

  const tilesMap = await compositeImages(
    allTiles,
    json.tilesets,
    map,
    newImage,
    32,
    32
  );
  layers.forEach((layer) => {
    if (layer.data)
      layer.data.forEach((tile, index) => {
        if (tile !== 0) {
          const tileMap = tilesMap.find((t) => t.origin === tile);
          if (tileMap) {
            layer.data[index] = tileMap.index;
          }
        }
      });
  });

  const newTiles = [];

  json.tilesets.forEach((tileset, a) => {
    if (tileset.tiles)
      tileset.tiles.forEach((tile, index) => {
        const newTile = { ...tile };
        const tileMap = tilesMap.find(
          (t) => t.origin - 1 === tile.id + tileset.firstgid - 1
        );
        if (tileMap) {
          newTile.id = tileMap.index - 1;
          newTiles.push(newTile);
        }
      });
  });

  while (json.tilesets.length > 1) {
    json.tilesets.pop();
  }
  const tileset = json.tilesets[0];

  tileset.tiles = newTiles;

  tileset.columns = 2048 / 32;
  tileset.imagewidth = 2048;
  tileset.imageheight = 2048;
  tileset.tilecount = tilesMap.length;
  tileset.image = map + '.webp';
  tileset.name = map;

  return fs.writeFile('created/' + map + '.json', JSON.stringify(json), 'utf8');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const filesJSON = await fs.readdir('.');
const names = filesJSON
  .filter((file) => file.includes('.json') && !file.includes('package'))
  .map((file) => file.split('.json')[0]);
const promises = names.map((name) => make(name));
await Promise.all(promises);
console.log('End of creation');

const filesWebP = await fs.readdir('created/');
const copyFiles = filesWebP.filter(
  (file) => file.includes('.webp') || file.includes('.json')
);

const promisesFiles = [];
copyFiles.forEach((file) => {
  const limit = pLimit(1);
  console.log('Adding ', file);
  promisesFiles.push(
    limit(() => fs.cp('created/' + file, '../src/assets/map/' + file))
  );
  promisesFiles.push(
    limit(() => fs.cp('created/' + file, '../dist/assets/map/' + file))
  );
});

await Promise.all(promisesFiles);
await zipDirectory('../dist', '../dist.zip');
