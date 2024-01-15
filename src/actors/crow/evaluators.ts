import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import { BoredGoal, RestGoal, EscapeGoal } from './goals';
import { CrowActor } from './actor';
import * as Phaser from 'phaser';

class RestEvaluator extends GoalEvaluator<CrowActor> {
  calculateDesirability() {
    return 0.5;
  }

  setGoal(crow: CrowActor) {
    const currentSubgoal = crow.brain.currentSubgoal();
    if (currentSubgoal instanceof RestGoal === false) {
      crow.brain.clearSubgoals();

      crow.brain.addSubgoal(new RestGoal(crow));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class FlyEvaluator extends GoalEvaluator<CrowActor> {
  calculateDesirability(crow: CrowActor) {
    return crow.isAfraid || crow.isBored ? 1 : 0;
  }

  setGoal(crow: CrowActor) {
    const currentSubgoal = crow.brain.currentSubgoal();
    if (currentSubgoal instanceof EscapeGoal === false) {
      crow.brain.clearSubgoals();

      crow.brain.addSubgoal(new EscapeGoal(crow));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class BoredEvaluator extends GoalEvaluator<CrowActor> {
  MIN_TIME_BORED = 3000;
  MAX_TIME_BORED = 10000;
  currentBoredTime = 0;
  maxBoredTime = Phaser.Math.Between(this.MIN_TIME_BORED, this.MAX_TIME_BORED);
  lastX: number = 0;
  lastY: number = 0;
  calculateDesirability(crow: CrowActor) {
    if (!crow) return 0;

    const currentSubgoal = crow.brain.currentSubgoal();
    if (currentSubgoal instanceof RestGoal === false) return 0;

    if (this.lastX === crow.x && this.lastY === crow.y) {
      if (this.currentBoredTime++ > this.maxBoredTime) {
        this.currentBoredTime = 0;
        this.maxBoredTime = Phaser.Math.Between(
          this.MIN_TIME_BORED,
          this.MAX_TIME_BORED
        );
        return 1;
      }
    }

    this.lastX = crow.x;
    this.lastY = crow.y;
    return 0;
  }

  setGoal(Cat: CrowActor) {
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

export { BoredEvaluator, FlyEvaluator as EscapeEvaluator, RestEvaluator };
