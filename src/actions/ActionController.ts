import * as Phaser from 'phaser';
import { Action, ActionList } from '../scenes/baseScene';
import Sit from './sit';
import SpriteLudo from '../sprites/SpriteLudo';
import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import ExecutableAction from './ExecutableAction';
import OnTheFlyImage from '../sprites/OnTheFlyImage';
import OnTheFlySprite from '../sprites/OnTheFlySprite';

export default class ActionController {
  static executeActions(
    sprite: SpriteLudo | SpriteMovement,
    actionsToExecute?: ActionList
  ): (ExecutableAction | false)[] {
    if (!actionsToExecute?.actions?.length) return [];
    const actions: Action[] = actionsToExecute.actions.map((a) => a);
    const result: (ExecutableAction | false)[] = [];
    result.push(
      this.executeAction(sprite, actionsToExecute.object, actions.shift())
    );
    return result;
  }

  static executeAction(
    sprite: SpriteLudo | SpriteMovement,
    object: OnTheFlyImage | OnTheFlySprite | undefined,
    action: Action | undefined
  ): ExecutableAction | false {
    if (!action) return false;
    const actionToExecute: Sit = new Sit();

    if (action.name === 'sit') {
      actionToExecute.execute(action, sprite, object);
    }
    return actionToExecute;
  }

  static cancelAction(sprite: SpriteLudo | SpriteMovement) {
    if (sprite.action === 'sit') {
      sprite.action = '';
    }
  }
}
