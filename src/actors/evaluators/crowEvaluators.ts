/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GoalEvaluator } from 'yuka';

import { RestGoal, GatherGoal } from '../goals/crowGoals.js';
import { CrowActor } from '../crowActor.js';

class RestEvaluator extends GoalEvaluator<CrowActor> {
  calculateDesirability(crow: CrowActor) {
    return crow.tired() === true ? 1 : 0;
  }

  setGoal(crow: CrowActor) {
    const currentSubgoal = crow.brain.currentSubgoal();

    if (currentSubgoal instanceof RestGoal === false) {
      crow.brain.clearSubgoals();

      crow.brain.addSubgoal(new RestGoal(crow));
    }
  }
}

class GatherEvaluator extends GoalEvaluator<CrowActor> {
  calculateDesirability() {
    return 0.5;
  }

  setGoal(crow: CrowActor) {
    const currentSubgoal = crow.brain.currentSubgoal();

    if (currentSubgoal instanceof GatherGoal === false) {
      crow.brain.clearSubgoals();

      crow.brain.addSubgoal(new GatherGoal(crow));
    }
  }
}

export { RestEvaluator, GatherEvaluator };
