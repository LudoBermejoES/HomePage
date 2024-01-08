import * as Phaser from 'phaser';
import { DEPTH } from '../lib/constants';

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
}

export default class SpriteCrow extends Phaser.Physics.Arcade.Sprite {
  idle_anims: string[] = ['idle_left', 'idle_right', 'idle_up', 'idle_down'];
  chooseIdleAnim(): string {
    return this.idle_anims[Phaser.Math.Between(0, this.idle_anims.length - 1)];
  }

  constructor(config: Props) {
    super(config.scene, config.x, config.y, 'CrowSprite');
    config.scene.physics.add.existing(this, false);
    this.anims.createFromAseprite('CrowSprite').forEach((anim) => {
      anim.repeat = -1;
    });
    this.anims.play('idle_right', true);
    this.scale = 0.8;
  }
}

function getValidPosition(
  currentCrow: SpriteCrow,
  crows: SpriteCrow[],
  map: Phaser.Tilemaps.Tilemap,
  TOTAL_CROWS: number
): { x: number; y: number } {
  let x: number = 0;
  let y: number = 0;
  let valid: boolean = false;
  const validDistanceX = map.widthInPixels / TOTAL_CROWS / 2;
  const validDistanceY = map.heightInPixels / TOTAL_CROWS / 2;
  while (!valid) {
    let internalValid: boolean = true;
    x = Phaser.Math.Between(10, map.widthInPixels);
    y = Phaser.Math.Between(10, map.heightInPixels);
    crows.forEach((crow) => {
      if (crow !== currentCrow)
        if (
          Math.abs(crow.x - x) < validDistanceX ||
          Math.abs(crow.y - y) < validDistanceY
        ) {
          internalValid = false;
        }
    });
    valid = internalValid;
  }
  return {
    x,
    y
  };
}

function flyCrow(
  scene: Phaser.Scene,
  crows: SpriteCrow[],
  TOTAL_CROWS: number,
  sprite: Phaser.Physics.Arcade.Sprite,
  map: Phaser.Tilemaps.Tilemap
) {
  const crow = sprite as SpriteCrow;
  const { x, y } = getValidPosition(crow, crows, map, TOTAL_CROWS);

  const difX = Math.abs(x - crow.x);
  const difY = Math.abs(y - crow.y);
  let anim: string = '';
  if (difX > difY) {
    x > crow.x ? (anim = 'flape_right') : (anim = 'flape_left');
  } else {
    y > crow.y ? (anim = 'flape_up') : (anim = 'flape_down');
  }

  crow.anims.play(anim);
  if (crow.body) crow.body.enable = false;

  scene.tweens.add({
    targets: crow,
    x: x,
    y: y,
    ease: 'quad.out',
    duration: Math.abs(x - crow.x) * 10,
    repeat: 0,
    onComplete: () => {
      if (crow.body) crow.body.enable = true;
      crow.anims.play(crow.chooseIdleAnim(), true);
      crow.setVelocity(0, 0);
    }
  });
}
export function createCrows(
  scene: Phaser.Scene,
  TOTAL_CROWS: number,
  sprites: Phaser.Physics.Arcade.Sprite[],
  map: Phaser.Tilemaps.Tilemap
) {
  const crows: SpriteCrow[] = [];
  for (let i = 0; i <= TOTAL_CROWS; i++) {
    const crow = new SpriteCrow({
      scene,
      x: 0,
      y: 0
    });
    crow.depth = DEPTH.ANIMALS;
    const { x, y } = getValidPosition(crow, crows, map, TOTAL_CROWS);
    crow.setPosition(x, y);
    crow.anims.play(crow.chooseIdleAnim(), true);
    scene.add.existing(crow);
    crows.push(crow);
    sprites.forEach((sprite) => {
      scene.physics.add.collider(crow, sprite, undefined, (spriteCo) => {
        const crow = spriteCo as SpriteCrow;

        flyCrow(scene, crows, TOTAL_CROWS, crow, map);
      });
    });
  }
}
