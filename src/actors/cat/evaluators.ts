import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import { BoredGoal, WalkGoal, PursueGoal } from './goals';
import { CatActor } from './actor';
import Statics from '../statics/staticsCity';
import * as Phaser from 'phaser';
import BaseScene from '../../scenes/baseScene';
import { CrowActor } from '../crow/actor';

class BoredEvaluator extends GoalEvaluator<CatActor> {
  MAX_TIME_BORED = 100;
  currentBoredTime = 0;
  lastX: number = 0;
  lastY: number = 0;
  calculateDesirability(cat: CatActor) {
    if (!cat) return 0;

    if (this.lastX === cat.x && this.lastY === cat.y) {
      if (this.currentBoredTime++ > this.MAX_TIME_BORED) {
        this.currentBoredTime = 0;
        return 1;
      }
    }

    this.lastX = cat.x;
    this.lastY = cat.y;
    return 0;
  }

  setGoal(Cat: CatActor) {
    const currentSubgoal = Cat.brain.currentSubgoal();
    if (currentSubgoal instanceof BoredGoal === false) {
      Cat.brain.clearSubgoals();

      Cat.brain.addSubgoal(new BoredGoal(Cat));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

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
    if (Cat.isBored) return null;

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
    if (Cat.isBored) return 0;
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

export { BoredEvaluator, PursueEvaluator, WalkEvaluator };
