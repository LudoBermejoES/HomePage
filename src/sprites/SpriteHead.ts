import * as Phaser from 'phaser';
import { DialogTemplateAnimation } from '../ui/Interfaces';

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
  template: DialogTemplateAnimation | undefined;
}

export function preloadHead(scene: Phaser.Scene, names: string[]) {
  names.forEach((name) => {
    const nameHead = `${name}Head`;
    scene.load.aseprite(
      `${nameHead}Sprite`,
      `assets/sprites/heads/${nameHead}.png`,
      `assets/sprites/heads/${nameHead}.json`
    );
  });

  scene.load.aseprite(
    'Pak0HeadSprite',
    'assets/sprites/heads/Pak0.png',
    'assets/sprites/heads/Pak0.json'
  );
}

export default class SpriteHead extends Phaser.GameObjects.Sprite {
  constructor(config: Props) {
    super(config.scene, config.x, config.y, `${config.name}HeadSprite`);
    config.scene.add.existing(this);
    this.anims
      .createFromAseprite(`${config.name}HeadSprite`)
      .forEach((anim) => {
        anim.repeat = -1;
      });
    const anim = this.anims.get(config?.template?.animation || 'talking');
    anim.repeat = config?.template?.repeat || -1;
    this.anims.play(config?.template?.animation || 'talking', true);
    this.setPosition(config.x, config.y);
  }
}
