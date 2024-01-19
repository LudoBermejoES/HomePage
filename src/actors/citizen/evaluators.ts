import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import {
  LazyGoal,
  EscapeGoal,
  WalkGoal,
  PursueGoal,
  AttackGoal
} from './goals';
import { CitizenActor } from './actor';
import Statics from '../statics/staticsCity';
import * as Phaser from 'phaser';
import BaseScene from '../../scenes/baseScene';

class WalkEvaluator extends GoalEvaluator<CitizenActor> {
  calculateDesirability() {
    return 0.5;
  }

  setGoal(Citizen: CitizenActor) {
    const currentSubgoal = Citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof WalkGoal === false) {
      Citizen.brain.clearSubgoals();

      Citizen.brain.addSubgoal(new WalkGoal(Citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class PursueEvaluator extends GoalEvaluator<CitizenActor> {
  CHECKING_INTERVAL = 1000;
  DISTANCE_TO_START_PURSUING = 200;

  lastTime: number = 0;

  isCitizenchable(Citizen: CitizenActor): Phaser.Physics.Arcade.Sprite | null {
    const nearestCitizench: Phaser.GameObjects.GameObject | null =
      Citizen.scene.physics.closest(
        Citizen,
        Statics.groupOfCrows.children.entries
      );
    const toCitizench = nearestCitizench as Phaser.Physics.Arcade.Sprite;

    if (
      toCitizench &&
      !(toCitizench as CitizenActor).isAfraid &&
      Phaser.Math.Distance.BetweenPoints(
        Citizen,
        nearestCitizench as Phaser.Physics.Arcade.Sprite
      ) < this.DISTANCE_TO_START_PURSUING
    ) {
      return toCitizench;
    }
    return null;
  }

  calculateDesirability(Citizen: CitizenActor) {
    if (Citizen.scene.time.now + this.CHECKING_INTERVAL > this.lastTime) {
      this.lastTime = Citizen.scene.time.now;
      const nearestCitizench = this.isCitizenchable(Citizen);
      if (nearestCitizench) {
        const tileXY = (
          nearestCitizench?.scene as BaseScene
        ).frontLayer?.worldToTileXY(nearestCitizench.x, nearestCitizench.y);
        if (tileXY) {
          if (
            Statics.tilesNotSafeForLivingBeings[tileXY.y] &&
            Statics.tilesNotSafeForLivingBeings[tileXY.y][tileXY.x] !== 1
          ) {
            Citizen.isHuntingTo = nearestCitizench || undefined;
          }
        }
      }
    }

    return Citizen.isHuntingTo ? 0.7 : 0;
  }

  setGoal(Citizen: CitizenActor) {
    const currentSubgoal = Citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof PursueGoal === false) {
      Citizen.brain.clearSubgoals();

      Citizen.brain.addSubgoal(new PursueGoal(Citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class EscapeEvaluator extends GoalEvaluator<CitizenActor> {
  calculateDesirability(citizen: CitizenActor) {
    return citizen.isAfraid ? 1 : 0;
  }

  setGoal(citizen: CitizenActor) {
    const currentSubgoal = citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof EscapeGoal === false) {
      citizen.brain.clearSubgoals();

      citizen.brain.addSubgoal(new EscapeGoal(citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class AttackEvaluator extends GoalEvaluator<CitizenActor> {
  calculateDesirability(citizen: CitizenActor) {
    return citizen.isAttacking ? 0.8 : 0;
  }

  setGoal(citizen: CitizenActor) {
    const currentSubgoal = citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof AttackGoal === false) {
      citizen.brain.clearSubgoals();

      citizen.brain.addSubgoal(new AttackGoal(citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class LazyEvaluator extends GoalEvaluator<CitizenActor> {
  MIN_TIME_TO_BE_LAZY: number = 60000;
  MAX_TIME_TO_BE_LAZY: number = 100000;
  timeToBeLazy: number = Phaser.Math.Between(
    this.MIN_TIME_TO_BE_LAZY,
    this.MAX_TIME_TO_BE_LAZY
  );

  calculateDesirability(citizen: CitizenActor) {
    if (citizen.isLazy) return 0.9;
    const scene = citizen.scene as BaseScene;
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

  setGoal(Citizen: CitizenActor) {
    const currentSubgoal = Citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof LazyGoal === false) {
      Citizen.brain.clearSubgoals();

      Citizen.brain.addSubgoal(new LazyGoal(Citizen));
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
