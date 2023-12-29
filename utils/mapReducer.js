import fs from 'fs/promises';
import sharp from 'sharp';

async function getImage(image) {
  try {
    return sharp(image);
  } catch (error) {
    console.log(error);
  }
}

async function makeTiles() {
  const tileWidth = 32;
  const tileHeight = 32;
  const image = await sharp('city.webp');
  const buffer = await image.toBuffer();
  const metadata = await image.metadata();
  const maxWidth = metadata.width;
  const maxHeight = metadata.height;
  let currentX = 0;
  let currentY = 0;
  let tile = 0;
  while (currentY <= maxHeight) {
    while (currentX <= maxWidth) {
      cropImage(tile, image.clone(), currentX, currentY, tileWidth, tileHeight);
      currentX = currentX + tileWidth;
      tile++;
    }
    currentY = currentY + tileHeight;
    currentX = 0;
    tile--;
  }
}

async function cropImage(tile, image, left, top, width, height) {
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
      .toFile('created/' + tile + '.webp');
  } catch (error) {
    console.log('ERROR', left, top, width, height);

    console.log('ERROR', error);
  }
}

async function compositeImages(allTiles, imageTo, widthTile, heightTile) {
  let lastPosition = { x: 1, y: 0, index: 2 };
  const tilesMap = [];
  allTiles.forEach((tile, mm) => {
    if (tile > 0) {
      const image = 'created/' + (Number(tile) - 1) + '.webp';

      const resultTile = {
        ...lastPosition,
        image,
        origin: tile
      };

      if (tile === 9928) console.log('Inserto tile', resultTile);
      tilesMap.push(resultTile);
    }

    if (lastPosition.x * widthTile >= 2016) {
      lastPosition.y++;
      lastPosition.x = 0;
      lastPosition.index++;
      console.log(tilesMap[tilesMap.length - 1]);
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
      .toFile('created/city.webp');
  } catch (error) {
    console.log(error);
  }
  return tilesMap;
}

const file = await fs.readFile('city.json');
const json = JSON.parse(file.toString());
const tileWidth = json.tilewidth;
const tileHeight = json.tileheight;

const tileCount = json.tileCount;
const tileset = json.tilesets[0];
const tilesetTiles = tileset.tiles;
const layers = json.layers;
const image = tileset.image;

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

const tilesMap = await compositeImages(allTiles, newImage, 32, 32);
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

tileset.tiles.forEach((tile, index) => {
  const newTile = { ...tile };
  const tileMap = tilesMap.find((t) => t.origin - 1 === tile.id);
  if (tile.id === 21032) console.log('EL tile es ', tileMap, tile, newTile);
  if (tileMap) {
    if (tileMap.origin === 21032) console.log('PEPE', tileMap);

    newTile.id = tileMap.index - 1;
    newTiles.push(newTile);
  }
});

tileset.tiles = newTiles;

tileset.columns = 2048 / 32;
tileset.imagewidth = 2048;
tileset.imageheight = 2048;
tileset.tilecount = tilesMap.length;
tileset.image = 'city.webp';

fs.writeFile('created/city.json', JSON.stringify(json), 'utf8');

//makeTiles();
