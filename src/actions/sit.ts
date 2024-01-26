import * as Phaser from 'phaser';
import { Action } from '../scenes/baseScene';
import SpriteLudo from '../sprites/SpriteLudo';
import { DEPTH } from '../lib/constants';
import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import ExecutableAction from './ExecutableAction';
import InteractableObject from '../sprites/interactableObjects/InteractableObject';

interface iCustomPosition {
  x: number;
  y: number;
  halfSpriteWidth?: boolean;
  halfSpriteHeight?: boolean;
}

export default class Sit extends ExecutableAction {
  mask: Phaser.GameObjects.Graphics | undefined;
  setPositionSprite(
    positions: (string | iCustomPosition)[],
    sprite: SpriteLudo | SpriteMovement,
    object: InteractableObject
  ) {
    this.object = object;
    const numberOfActors = object.actorsInHere.length;
    sprite.setVelocity(0, 0);
    if (positions[numberOfActors] === 'center') {
      sprite.setPosition(
        object.x + object.width / 2,
        object.y + object.height / 2
      );
    } else if (positions[numberOfActors] === 'left') {
      sprite.setPosition(
        object.x + sprite.width / 2,
        object.y + object.height / 2
      );
    } else if (positions[numberOfActors] === 'right') {
      sprite.setPosition(
        object.x + object.width - sprite.width / 2,
        object.y + object.height / 2
      );
    } else if (positions[numberOfActors] === 'up') {
      sprite.setPosition(object.x, object.y + sprite.height / 2);
    } else if (positions[numberOfActors] === 'down') {
      sprite.setPosition(object.x + object.width / 2, object.y + object.height);
    } else if (positions[numberOfActors] === 'down_left') {
      sprite.setPosition(
        object.x - sprite.width / 2,
        object.y + object.height - sprite.height / 2
      );
    } else if (positions[numberOfActors] === 'down_right') {
      sprite.setPosition(
        object.x + object.width - sprite.width / 2,
        object.y + object.height - sprite.height / 2
      );
    } else if (positions[numberOfActors] == 'down_center') {
      sprite.setPosition(
        object.x + object.width / 2 - sprite.width / 2,
        object.y + object.height - sprite.height / 2
      );
    } else {
      const data: iCustomPosition = positions[
        numberOfActors
      ] as iCustomPosition;
      if (data && data.x !== undefined) {
        let x = object.x + data.x;
        let y = object.y + data.y;
        if (data.halfSpriteWidth) {
          x += object.width / 2 - (sprite.body || sprite).width / 2;
        }
        if (data.halfSpriteHeight) {
          y += object.height / 2 - (sprite.body || sprite).height / 2;
        }
        sprite.setPosition(x, y);
      }
    }
  }

  cancelAction(sprite: SpriteLudo | SpriteMovement) {
    if (sprite.name === 'ludo' && sprite?.scene?.input?.keyboard) {
      sprite.scene.input.keyboard.off(
        Phaser.Input.Keyboard.Events.ANY_KEY_DOWN
      );
      sprite.scene.input.off('pointerup', this.cancelAction, this);
      sprite.depth = DEPTH.PLAYER;
    } else {
      sprite.depth = DEPTH.CITIZENS;
    }
    sprite.action = '';
    if (this.mask) {
      this.mask.destroy();
      this.mask = undefined;
      sprite.clearMask();
    }
    this.destroy();
  }

  execute(
    config: Action,
    sprite: SpriteLudo | SpriteMovement,
    object: InteractableObject | undefined
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
      sprite.scene.time.delayedCall(1000, () => {
        sprite.scene?.input?.keyboard?.on(
          Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
          () => this.cancelAction(sprite)
        );
        sprite.scene.input.on('pointerup', () => this.cancelAction(sprite));
      });
    }
  }
}
