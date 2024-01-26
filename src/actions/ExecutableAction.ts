import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import SpriteLudo from '../sprites/SpriteLudo';
import InteractableObject from '../sprites/interactableObjects/InteractableObject';

export default class ExecutableAction {
  object: InteractableObject | undefined;

  execute(
    config: Action,
    sprite: SpriteLudo | SpriteMovement,
    object: InteractableObject | undefined
  ) {}

  cancelAction(sprite: SpriteLudo | SpriteMovement) {}

  destroy() {
    this.object = undefined;
  }
}
