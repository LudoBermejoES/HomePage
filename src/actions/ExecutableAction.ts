import * as Phaser from 'phaser';
import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import SpriteLudo from '../sprites/SpriteLudo';

export default abstract class ExecutableAction {
  execute(
    config: Action,
    sprite: SpriteLudo | SpriteMovement,
    object:
      | Phaser.Physics.Arcade.Sprite
      | Phaser.Physics.Arcade.Image
      | undefined
  ) {}

  cancelAction(sprite: SpriteLudo | SpriteMovement) {}
}
