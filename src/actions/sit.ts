import * as Phaser from 'phaser';
import { Action } from '../scenes/baseScene';
import SpriteLudo from '../sprites/SpriteLudo';
import { DEPTH } from '../lib/constants';
import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import ExecutableAction from './ExecutableAction';

export default class Sit extends ExecutableAction {
  mask: Phaser.GameObjects.Graphics | undefined;
  lastValidPosition: Phaser.Math.Vector2 | undefined;
  setPositionSprite(
    positions: string[],
    sprite: SpriteLudo | SpriteMovement,
    object: Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image
  ) {
    this.lastValidPosition = new Phaser.Math.Vector2({
      x: sprite.x,
      y: sprite.y
    });

    if (positions[0] === 'center') {
      sprite.setPosition(
        object.x + object.width / 2,
        object.y + object.height / 2
      );
    } else if (positions[0] === 'up') {
      sprite.setPosition(
        object.x + object.width / 2 - sprite.width / 2,
        object.y - sprite.height / 2
      );
    } else if (positions[0] === 'down') {
      sprite.setPosition(
        object.x + object.width / 2 - sprite.width / 2,
        object.y + object.height / 2 - sprite.height / 2
      );
    } else if (positions[0] === 'left') {
      sprite.setPosition(
        object.x - sprite.width / 2,
        object.y - sprite.height / 2
      );
    } else if (positions[0] === 'right') {
      sprite.setPosition(
        object.x + object.width - sprite.width / 2,
        object.y - sprite.height / 2
      );
    } else if (positions[0] === 'down_left') {
      sprite.setPosition(
        object.x - sprite.width / 2,
        object.y + object.height - sprite.height / 2
      );
    } else if (positions[0] === 'down_right') {
      sprite.setPosition(
        object.x + object.width - sprite.width / 2,
        object.y + object.height - sprite.height / 2
      );
    } else if (positions[0] == 'down_center') {
      sprite.setPosition(
        object.x + object.width / 2 - sprite.width / 2,
        object.y + object.height - sprite.height / 2
      );
    }
  }

  cancelAction(sprite: SpriteLudo | SpriteMovement) {
    if (sprite.name === 'ludo' && sprite?.scene?.input?.keyboard) {
      sprite.scene.input.keyboard.off(
        Phaser.Input.Keyboard.Events.ANY_KEY_DOWN
      );
      sprite.scene.input.off('pointerup', this.cancelAction, this);
      sprite.depth = DEPTH.PLAYER;
    }
    sprite.action = '';
    if (this.mask) {
      this.mask.destroy();
      this.mask = undefined;
      sprite.clearMask();
    }
    if (this.lastValidPosition)
      sprite.setPosition(this.lastValidPosition?.x, this.lastValidPosition?.y);
    this.lastValidPosition = undefined;
  }
  execute(
    config: Action,
    sprite: SpriteLudo | SpriteMovement,
    object:
      | Phaser.Physics.Arcade.Sprite
      | Phaser.Physics.Arcade.Image
      | undefined
  ) {
    if (config.positions && object) {
      this.setPositionSprite(config.positions, sprite, object);
    }

    if (config.animation) {
      sprite.anims.play(config.animation, true);
      if (config.animation === 'stop_up') {
        this.mask = sprite.scene.make
          .graphics()
          .fillStyle(0xffffff)
          .fillRect(
            sprite.x - sprite.width / 2,
            sprite.y - sprite.height / 2,
            sprite.width,
            sprite.height - sprite.height / 5
          );

        const mask = new Phaser.Display.Masks.GeometryMask(
          sprite.scene,
          this.mask
        );
        sprite.setMask(mask);
      }
    }

    sprite.action = 'sit';
    sprite.depth = DEPTH.PLAYER_OVER_EVERYTHING_ELSE;
    if (sprite.name === 'ludo' && sprite?.scene?.input?.keyboard) {
      sprite.scene.input.keyboard.on(
        Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
        () => this.cancelAction(sprite)
      );
      sprite.scene.input.on('pointerup', () => this.cancelAction(sprite));
    }
  }
}
