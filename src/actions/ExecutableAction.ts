import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import SpriteLudo from '../sprites/SpriteLudo';
import OnTheFlyImage from '../sprites/OnTheFlyImage';
import OnTheFlySprite from '../sprites/OnTheFlySprite';

export default class ExecutableAction {
  object: OnTheFlyImage | OnTheFlySprite | undefined;
  addActor(
    sprite: SpriteMovement | SpriteLudo,
    object: OnTheFlyImage | OnTheFlySprite
  ) {
    console.log('Añado actor', sprite, object.texture.key, object.actorsInHere);
    object.actorsInHere.push(sprite);
  }
  removeActor(
    sprite: SpriteMovement | SpriteLudo,
    object: OnTheFlyImage | OnTheFlySprite
  ) {
    console.log(
      'Borro actor',
      sprite,
      object.texture.key,
      object.actorsInHere,
      object.actorsInHere.indexOf(sprite)
    );
    object.actorsInHere.splice(object.actorsInHere.indexOf(sprite), 1);
  }
  execute(
    config: Action,
    sprite: SpriteLudo | SpriteMovement,
    object: OnTheFlyImage | OnTheFlySprite | undefined
  ) {}

  cancelAction(
    sprite: SpriteLudo | SpriteMovement,
    object: OnTheFlyImage | OnTheFlySprite
  ) {}

  destroy() {
    this.object = undefined;
  }
}
