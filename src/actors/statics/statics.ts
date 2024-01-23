export default class Statics {
  static groupOfPlacesToRest: Phaser.Physics.Arcade.Group;
  static groupEnemiesOfCat: Phaser.Physics.Arcade.Group;
  static groupOfCats: Phaser.Physics.Arcade.Group;
  static groupOfCrows: Phaser.Physics.Arcade.Group;
  static groupEnemiesOfCrows: Phaser.Physics.Arcade.Group;
  static groupOfCitizens: Phaser.Physics.Arcade.Group;
  static groupEnemiesOfCitizens: Phaser.Physics.Arcade.Group;
  static map: Phaser.Tilemaps.Tilemap;
  static tilesNotSafeForLivingBeings: number[][];
  static tilesNotTotallySafeForLivingBeings: number[][];
  static tilesCollision: number[][];
}
