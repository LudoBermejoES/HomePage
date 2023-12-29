import * as Phaser from 'phaser';

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
}

export function preloadLudoHead(scene: Phaser.Scene) {
  scene.load.aseprite(
    'LudoHeadSprite',
    'assets/sprites/heads/LudoHead.png',
    'assets/sprites/heads/LudoHead.json'
  );
}

export default class SpriteLudoHead extends Phaser.GameObjects.Sprite {
  constructor(config: Props) {
    super(config.scene, config.x, config.y, 'LudoHeadSprite');
    config.scene.add.existing(this);
    this.anims.createFromAseprite('LudoHeadSprite').forEach((anim) => {
      anim.repeat = -1;
    });
    this.anims.play('talking', true);
    this.setPosition(config.x, config.y);
  }
}
