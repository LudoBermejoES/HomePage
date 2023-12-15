import BaseScene from './baseScene';

export default class City extends BaseScene {
  constructor() {
    super('Training');
  }

  preload() {
    this.load.spritesheet('LudoSprite', 'assets/sprites/LudoSprite.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    // load the PNG file
    this.load.image('map_tiles_Interior', 'assets/map/Interior.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap_Interior', 'assets/map/training.json');
  }

  create() {
    super.create('Interior', false);
    this.spriteLudo.setSize(16, 16);
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.spriteLudo);
  }
}
