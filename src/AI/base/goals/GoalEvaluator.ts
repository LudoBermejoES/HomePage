import { GameEntity } from '../core/GameEntity';

/**
 * Base class for representing a goal evaluator in context of Goal-driven agent design.
 */
export class GoalEvaluator<T extends GameEntity> {
  /**
   * Can be used to adjust the preferences of agents. When the desirability score
   * for a goal has been evaluated, it is multiplied by this value.
   * @default 1
   */
  characterBias: number;

  /**
   * Constructs a new goal evaluator.
   *
   * @param characterBias - Can be used to adjust the preferences of agents.
   */
  constructor(characterBias: number = 1) {
    /**
     * Can be used to adjust the preferences of agents. When the desirability score
     * for a goal has been evaluated, it is multiplied by this value.
     * @type {Number}
     * @default 1
     */
    this.characterBias = characterBias;
  }

  /**
   * Calculates the desirability. It's a score between 0 and 1 representing the desirability
   * of a goal. This goal is considered as a top level strategy of the agent like *Explore* or
   * *AttackTarget*. Must be implemented by all concrete goal evaluators.
   *
   * @param owner - The owner of this goal evaluator.
   * @return The desirability.
   */
  calculateDesirability(owner: T) {
    return 0;
  }

  /**
   * Executed if this goal evaluator produces the highest desirability. Must be implemented
   * by all concrete goal evaluators.
   *
   * @param owner - The owner of this goal evaluator.
   */
  setGoal(owner: T) {
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }

  /**
   * Transforms this instance into a JSON object.
   *
   * @return The JSON object.
   */
  toJSON(): { [s: string]: any } {
    return {
      type: this.constructor.name,
      characterBias: this.characterBias
    };
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param json - The JSON object.
   */
  fromJSON(json: { [s: string]: any }) {
    this.characterBias = json.characterBias;

    return this;
  }
}
