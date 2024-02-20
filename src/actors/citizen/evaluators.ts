import { GoalEvaluator } from '../../AI/base/goals/GoalEvaluator';
import {
  GoToRestGoal,
  RestingGoal,
  WalkGoal,
  GotoTalkGoal,
  TalkingGoal
} from './goals';
import { CitizenActor } from './actor';
import * as Phaser from 'phaser';
class WalkEvaluator extends GoalEvaluator<CitizenActor> {
  WALKING_PRIORITY: number = 0.5;

  constructor(WALKING_PRIORITY: number) {
    super();
    this.WALKING_PRIORITY = WALKING_PRIORITY;
  }
  calculateDesirability() {
    return this.WALKING_PRIORITY;
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

class GotoTalkEvaluator extends GoalEvaluator<CitizenActor> {
  TALK_PRIORITY: number = 0.7;
  DISTANCE_TO_START_TALKING: number = 500;
  TIME_TO_TALK_AGAIN: number = 1000 * 60 * 2;

  constructor(TALK_PRIORITY: number) {
    super();
    this.TALK_PRIORITY = TALK_PRIORITY;
  }

  checkIfTheyCanTalk(citizen: CitizenActor, nearestCitizen: CitizenActor) {
    if (
      citizen.lastConversation &&
      citizen.lastConversation + this.TIME_TO_TALK_AGAIN >
        citizen.scene.time.now
    ) {
      return false;
    }

    if (
      nearestCitizen.lastConversation &&
      nearestCitizen.lastConversation + this.TIME_TO_TALK_AGAIN >
        citizen.scene.time.now
    ) {
      return false;
    }

    const idToSearch: string = `${Math.min(
      citizen.info.id,
      nearestCitizen.info.id
    )}-${Math.min(citizen.info.id, nearestCitizen.info.id)}`;

    const lastConversation =
      citizen.conversationsGroup.conversationsBetweenNPC.find(
        (c) => c.id === idToSearch
      );

    if (
      lastConversation &&
      lastConversation.lastTime &&
      lastConversation.lastTime + this.TIME_TO_TALK_AGAIN >
        citizen.scene.time.now
    ) {
      return false;
    }

    const canTalk =
      !nearestCitizen.isTired &&
      !nearestCitizen.isTalking &&
      [undefined, citizen].includes(nearestCitizen.isMovingToTalkWith);

    return canTalk;
  }

  calculateDesirability(citizen: CitizenActor) {
    const nearestRelation: Phaser.GameObjects.GameObject | null =
      citizen.scene.physics.closest(
        citizen,
        citizen.groupOfRelations.children.entries
      );
    if (!nearestRelation) return 0;

    const nearestCitizen: CitizenActor = nearestRelation as CitizenActor;

    const canTalk = this.checkIfTheyCanTalk(citizen, nearestCitizen);

    if (
      canTalk &&
      Phaser.Math.Distance.BetweenPoints(
        citizen,
        nearestRelation as Phaser.Physics.Arcade.Sprite
      ) < this.DISTANCE_TO_START_TALKING
    ) {
      return this.TALK_PRIORITY;
    }
    return 0;
  }

  setGoal(citizen: CitizenActor) {
    const nearestRelation: Phaser.GameObjects.GameObject | null =
      citizen.scene.physics.closest(
        citizen,
        citizen.groupOfRelations.children.entries
      );
    const currentSubgoal = citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof GotoTalkGoal === false) {
      citizen.brain.clearSubgoals();

      citizen.brain.addSubgoal(
        new GotoTalkGoal(citizen, nearestRelation as CitizenActor)
      );
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

class GoToRestEvaluator extends GoalEvaluator<CitizenActor> {
  GOTO_REST_PRIORITY: number = 0.6;
  constructor(GOTO_REST_PRIORITY: number) {
    super();
    this.GOTO_REST_PRIORITY = GOTO_REST_PRIORITY;
  }
  calculateDesirability(citizen: CitizenActor) {
    if (citizen.isTired) return 0.9;
    if (citizen.currentEnergy !== 0) {
      citizen.currentEnergy--;
      return 0;
    }
    citizen.isTired = true;
    return this.GOTO_REST_PRIORITY;
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
  RESTING_PRIORITY: number = 0.95;
  ORIGINAL_ENERGY: number = -1;
  currentEnergy: number = -1;

  constructor(RESTING_PRIORITY: number) {
    super();
    this.RESTING_PRIORITY = RESTING_PRIORITY;
  }

  calculateDesirability(citizen: CitizenActor) {
    if (citizen.isResting) return this.RESTING_PRIORITY;
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

class TalkingEvaluator extends GoalEvaluator<CitizenActor> {
  TALKING_PRIORITY: number = 0.95;

  constructor(TALKING_PRIORITY: number) {
    super();
    this.TALKING_PRIORITY = TALKING_PRIORITY;
  }

  calculateDesirability(citizen: CitizenActor) {
    if (citizen.isTalking) {
      return this.TALKING_PRIORITY;
    }
    return 0;
  }

  setGoal(Citizen: CitizenActor) {
    const currentSubgoal = Citizen.brain.currentSubgoal();
    if (currentSubgoal instanceof TalkingGoal === false) {
      Citizen.brain.clearSubgoals();

      Citizen.brain.addSubgoal(new TalkingGoal(Citizen));
    }
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }
}

export {
  GoToRestEvaluator,
  WalkEvaluator,
  RestingEvaluator,
  GotoTalkEvaluator as GotoTalk,
  TalkingEvaluator
};
