import * as Phaser from 'phaser';

interface BusProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
}
const carTypes: string[] = [
  'CocheAzul',
  'CocheMarron',
  'CocheNaranja',
  'CocheHuevo',
  'CochePolicia',
  'CocheVerde',
  'CocheVioleta'
];

export function loadCars(scene: Phaser.Scene) {
  carTypes.forEach((car) => {
    scene.load.aseprite(
      car,
      `assets/sprites/${car}.png`,
      `assets/sprites/${car}.json`
    );
  });
}

export default class SpriteCar extends Phaser.Physics.Arcade.Sprite {
  constructor(config: BusProps) {
    if (!config.name) {
      config.name = carTypes[Math.floor(Math.random() * carTypes.length)];
    }
    super(config.scene, config.x, config.y, config.name);

    config.scene.physics.add.existing(this, false);

    this.anims.create({
      key: 'move',
      frames: this.anims.generateFrameNumbers(config.name, {
        start: 0,
        end: 5
      }),
      frameRate: 32,
      repeat: -1
    });
  }
}
