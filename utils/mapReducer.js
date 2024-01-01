import fs from 'fs/promises';
import sharp from 'sharp';

async function getImage(image) {
  try {
    return sharp(image);
  } catch (error) {
    console.log(error);
  }
}

async function makeTiles(originalImage) {
  const tileWidth = 32;
  const tileHeight = 32;
  const image = await sharp(originalImage);
  const buffer = await image.toBuffer();
  const metadata = await image.metadata();
  const maxWidth = metadata.width;
  const maxHeight = metadata.height;
  let currentX = 0;
  let currentY = 0;
  let tile = 0;
  while (currentY <= maxHeight) {
    while (currentX <= maxWidth) {
      cropImage(
        tile,
        image.clone(),
        originalImage.split('.')[0],
        currentX,
        currentY,
        tileWidth,
        tileHeight
      );
      currentX = currentX + tileWidth;
      tile++;
    }
    currentY = currentY + tileHeight;
    currentX = 0;
    tile--;
  }
}

async function cropImage(tile, image, directory, left, top, width, height) {
  if (left < 0 || top < 0) {
    console.log('ERROR', left, top);
    return;
  }
  try {
    return image
      .extract({
        width,
        height,
        left,
        top
      })
      .webp({ lossless: false, quality: 100 })
      .toFile('created/' + directory + '/' + tile + '.webp');
  } catch (error) {
    console.log('ERROR', left, top, width, height);

    console.log('ERROR', error);
  }
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

  fs.writeFile('created/' + map + '.json', JSON.stringify(json), 'utf8');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await sleep(2000);
const filesJSON = await fs.readdir('.');
const names = filesJSON
  .filter((file) => file.includes('.json') && !file.includes('package'))
  .map((file) => file.split('.json')[0]);
names.forEach((name) => make(name));
//make('city');
//make('PubSolitaryOwl');
//makeTiles('Interiors_32x32.png');
//makeTiles('1_Terrains_and_Fences_32x32.png');
//makeTiles('2_City_Terrains_32x32.png');
