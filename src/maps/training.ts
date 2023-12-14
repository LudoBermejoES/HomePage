import BaseScene from './baseScene';

export default class City extends BaseScene {
  constructor() {
    super('training');
  }

  preload() {
    this.load.spritesheet('LudoSprite', 'assets//sprites/LudoSprite.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    // load the PNG file
    this.load.image('map_tiles', 'assets/map/Interior.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap', 'assets/map/training.json');
  }

  create() {
    super.create('Interior', false);
    this.spriteLudo.setSize(16, 16);
    this.cameras.main.setZoom(2);
  }
}
