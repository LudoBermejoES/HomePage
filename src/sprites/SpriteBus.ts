import * as Phaser from 'phaser';

interface BusProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export default class SpriteBus extends Phaser.Physics.Arcade.Sprite {
  constructor(config: BusProps) {
    super(config.scene, config.x, config.y, 'BusSprite');
    config.scene.physics.add.existing(this, false);

    this.anims.createFromAseprite('BusSprite').forEach((anim) => {
      anim.repeat = anim.key.includes('door') ? 0 : -1;
    });
    this.anims.play('move_right', true);
  }
}
