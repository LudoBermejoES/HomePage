import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import {
  LazyGoal,
  EscapeGoal,
  WalkGoal,
  PursueGoal,
  AttackGoal
} from './goals';
import { CatActor } from './actor';
import Statics from '../statics/staticsCity';
import * as Phaser from 'phaser';
import BaseScene from '../../scenes/baseScene';

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
      !(toCatch as CatActor).isAfraid &&
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

    return Cat.isHuntingTo ? 0.7 : 0;
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

class EscapeEvaluator extends GoalEvaluator<CatActor> {
  calculateDesirability(cat: CatActor) {
    return cat.isAfraid ? 1 : 0;
  }

  setGoal(cat: CatActor) {
    const currentSubgoal = cat.brain.currentSubgoal();
    if (currentSubgoal instanceof EscapeGoal === false) {
      cat.brain.clearSubgoals();

      cat.brain.addSubgoal(new EscapeGoal(cat));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class AttackEvaluator extends GoalEvaluator<CatActor> {
  calculateDesirability(cat: CatActor) {
    return cat.isAttacking ? 0.8 : 0;
  }

  setGoal(cat: CatActor) {
    const currentSubgoal = cat.brain.currentSubgoal();
    if (currentSubgoal instanceof AttackGoal === false) {
      cat.brain.clearSubgoals();

      cat.brain.addSubgoal(new AttackGoal(cat));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class LazyEvaluator extends GoalEvaluator<CatActor> {
  MIN_TIME_TO_BE_LAZY: number = 60000;
  MAX_TIME_TO_BE_LAZY: number = 100000;
  timeToBeLazy: number = Phaser.Math.Between(
    this.MIN_TIME_TO_BE_LAZY,
    this.MAX_TIME_TO_BE_LAZY
  );

  calculateDesirability(cat: CatActor) {
    if (cat.isLazy) return 0.9;
    const scene = cat.scene as BaseScene;
    if (scene.overlayCycle) {
      const probability = 1 - scene.overlayCycle.alpha * 2;

      if (scene.time.now > this.timeToBeLazy) {
        if (Math.random() < probability / 5) {
          this.timeToBeLazy += Phaser.Math.Between(
            this.MIN_TIME_TO_BE_LAZY,
            this.MAX_TIME_TO_BE_LAZY
          );
          return 0.9;
        }
      }
    }

    return 0;
  }

  setGoal(Cat: CatActor) {
    const currentSubgoal = Cat.brain.currentSubgoal();
    if (currentSubgoal instanceof LazyGoal === false) {
      Cat.brain.clearSubgoals();

      Cat.brain.addSubgoal(new LazyGoal(Cat));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

export {
  AttackEvaluator,
  EscapeEvaluator,
  LazyEvaluator,
  PursueEvaluator,
  WalkEvaluator
};
