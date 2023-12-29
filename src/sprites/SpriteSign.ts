import * as Phaser from 'phaser';

interface BusProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export default class SpriteSign extends Phaser.Physics.Arcade.Sprite {
  constructor(config: BusProps) {
    super(config.scene, config.x, config.y, 'SignSprite');
    config.scene.physics.add.existing(this, false);
    this.setFrame(Phaser.Math.Between(0, 7));
  }
}
