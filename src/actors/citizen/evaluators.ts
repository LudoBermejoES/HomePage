import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import { GoToRestGoal, RestingGoal, WalkGoal } from './goals';
import { CitizenActor } from './actor';

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
class GoToRestEvaluator extends GoalEvaluator<CitizenActor> {
  calculateDesirability(citizen: CitizenActor) {
    if (citizen.isTired) return 0.9;
    if (citizen.currentEnergy !== 0) {
      citizen.currentEnergy--;
      return 0;
    }
    citizen.isTired = true;
    return 0.9;
  }

  setGoal(Citizen: CitizenActor) {
    const currentSubgoal = Citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof GoToRestGoal === false) {
      Citizen.brain.clearSubgoals();

      Citizen.brain.addSubgoal(new GoToRestGoal(Citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class RestingEvaluator extends GoalEvaluator<CitizenActor> {
  ORIGINAL_ENERGY: number = -1;
  currentEnergy: number = -1;

  calculateDesirability(citizen: CitizenActor) {
    if (citizen.isResting) return 0.95;
    return 0;
  }

  setGoal(Citizen: CitizenActor) {
    const currentSubgoal = Citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof RestingGoal === false) {
      Citizen.brain.clearSubgoals();

      Citizen.brain.addSubgoal(new RestingGoal(Citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

export { GoToRestEvaluator, WalkEvaluator, RestingEvaluator };
