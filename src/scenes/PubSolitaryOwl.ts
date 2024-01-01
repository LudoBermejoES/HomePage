import BaseScene from './baseScene';

export default class PubSolitaryOwl extends BaseScene {
  constructor() {
    super('PubSolitaryOwl');
  }

  preload() {
    this.load.aseprite(
      'EmptySprite',
      'assets/sprites/empty.png',
      'assets/sprites/empty.json'
    );
    this.load.aseprite(
      'LudoSprite',
      'assets/sprites/Ludo.png',
      'assets/sprites/Ludo.json'
    );

    this.load.image(
      'map_tiles_PubSolitaryOwl',
      'assets/map/PubSolitaryOwl.webp'
    );
    this.load.tilemapTiledJSON(
      'tilemap_PubSolitaryOwl',
      'assets/map/PubSolitaryOwl.json'
    );
    this.load.aseprite(
      'bathroomDoor',
      'assets/sprites/BathroomDoor.png',
      'assets/sprites/BathroomDoor.json'
    );
    this.load.aseprite(
      'BigDoor4',
      'assets/sprites/BigDoor4.png',
      'assets/sprites/BigDoor4.json'
    );
  }

  showPlayer() {
    this.spriteLudo.visible = true;
  }

  create() {
    super.create('PubSolitaryOwl', true);
    this.cameras.main.startFollow(this.spriteLudo);
  }
}
