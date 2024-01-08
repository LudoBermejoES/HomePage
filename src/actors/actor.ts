import * as Phaser from 'phaser';
import * as YUKA from 'yuka';
import { applyMixins } from '../lib/helpers';

export class Actor {
  brain: YUKA.Think;
}
export interface Actor
  extends YUKA.MovingEntity,
    Phaser.Physics.Arcade.Sprite {}

applyMixins(Actor, [Phaser.Physics.Arcade.Sprite, YUKA.MovingEntity]);
