import * as Phaser from 'phaser';

interface PortalProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export default class SpritePortal extends Phaser.Physics.Arcade.Sprite {
  namePortal: string;
  constructor(config: PortalProps) {
    super(
      config.scene,
      config.x + config.width / 2,
      config.y + config.height / 2,
      'PortalSprite'
    );
    config.scene.physics.add.existing(this, false);
    this.setCollideWorldBounds(true);
    this.namePortal = config.name;
    this.createAnims();
    this.anims.play('portal', true);
  }
  createAnims() {
    this.anims.create({
      key: 'portal',
      frames: this.anims.generateFrameNumbers('PortalSprite', {
        start: 0,
        end: 12
      }),
      frameRate: 32,
      repeat: -1
    });
  }
}
