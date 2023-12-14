import BaseScene from './baseScene';

export default class City extends BaseScene {
  constructor() {
    super('city');
  }

  preload() {
    this.load.spritesheet('LudoSprite', 'assets//sprites/LudoSprite.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    // load the PNG file
    this.load.image('map_tiles', 'assets/map/MapaLudo_OLD.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap', 'assets/map/MapaLudo.json');
  }

  create() {
    super.create('f8614', true);
    this.cameras.main.startFollow(this.spriteLudo);
  }
}
