import BaseScene from './baseScene';

export default class City extends BaseScene {
  constructor() {
    super('city');
  }

  preload() {
    this.load.spritesheet('LudoSprite', 'assets/sprites/LudoSprite.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.spritesheet('PortalSprite', 'assets/sprites/PortalSprite.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    // load the PNG file
    this.load.image('map_tiles_f8614', 'assets/map/MapaLudo_OLD.png');

    // load the JSON file
    this.load.tilemapTiledJSON('tilemap_f8614', 'assets/map/MapaLudo.json');
  }

  create() {
    super.create('f8614', true);
    this.cameras.main.startFollow(this.spriteLudo);
  }
}
