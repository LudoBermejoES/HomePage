import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import { RestGoal, EscapeGoal } from './goals';
import { CrowActor } from './actor';

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

class EscapeEvaluator extends GoalEvaluator<CrowActor> {
  calculateDesirability(crow: CrowActor) {
    return crow.isAfraid === true ? 1 : 0;
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

export { EscapeEvaluator, RestEvaluator };
