import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import { WalkGoal, PursueGoal } from './goals';
import { CatActor } from './actor';
import Statics from '../statics/staticsCity';
import * as Phaser from 'phaser';
import BaseScene from '../../scenes/baseScene';
import { CrowActor } from '../crow/actor';

class WalkEvaluator extends GoalEvaluator<CatActor> {
  calculateDesirability() {
    return 0.5;
  }

  setGoal(Cat: CatActor) {
    const currentSubgoal = Cat.brain.currentSubgoal();
    if (currentSubgoal instanceof WalkGoal === false) {
      Cat.brain.clearSubgoals();

      Cat.brain.addSubgoal(new WalkGoal(Cat));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class PursueEvaluator extends GoalEvaluator<CatActor> {
  CHECKING_INTERVAL = 1000;
  DISTANCE_TO_START_PURSUING = 200;

  lastTime: number = 0;

  isCatchable(Cat: CatActor): Phaser.Physics.Arcade.Sprite | null {
    const nearestCatch: Phaser.GameObjects.GameObject | null =
      Cat.scene.physics.closest(Cat, Statics.groupOfCrows.children.entries);
    const toCatch = nearestCatch as Phaser.Physics.Arcade.Sprite;

    if (
      toCatch &&
      !(toCatch as CrowActor).isAfraid &&
      Phaser.Math.Distance.BetweenPoints(
        Cat,
        nearestCatch as Phaser.Physics.Arcade.Sprite
      ) < this.DISTANCE_TO_START_PURSUING
    ) {
      return toCatch;
    }
    return null;
  }

  calculateDesirability(Cat: CatActor) {
    if (Cat.scene.time.now + this.CHECKING_INTERVAL > this.lastTime) {
      this.lastTime = Cat.scene.time.now;
      const nearestCatch = this.isCatchable(Cat);
      if (nearestCatch) {
        const tileXY = (
          nearestCatch?.scene as BaseScene
        ).frontLayer?.worldToTileXY(nearestCatch.x, nearestCatch.y);
        if (tileXY) {
          if (
            Statics.tilesNotSafeForLivingBeings[tileXY.y] &&
            Statics.tilesNotSafeForLivingBeings[tileXY.y][tileXY.x] !== 1
          ) {
            Cat.isHuntingTo = nearestCatch || undefined;
          }
        }
      }
    }

    return Cat.isHuntingTo ? 1 : 0;
  }

  setGoal(Cat: CatActor) {
    const currentSubgoal = Cat.brain.currentSubgoal();
    if (currentSubgoal instanceof PursueGoal === false) {
      Cat.brain.clearSubgoals();

      Cat.brain.addSubgoal(new PursueGoal(Cat));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

export { PursueEvaluator, WalkEvaluator };
