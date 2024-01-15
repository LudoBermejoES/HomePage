import { GameEntity } from '../core/GameEntity';
import { CompositeGoal } from './CompositeGoal';
import { Goal } from './Goal';
import { GoalEvaluator } from './GoalEvaluator';

export class Think<T extends GameEntity> extends CompositeGoal<T> {
  /**
   * A list of goal evaluators.
   */
  readonly evaluators: Array<GoalEvaluator<T>>;

  /**
   * Constructs a new *Think* object.
   *
   * @param owner - The owner of this instance.
   */
  /**
   * A map of registered types for deserialization.
   */
  private _typesMap: Map<string, () => GoalEvaluator<T>>;

  constructor(owner: T) {
    super(owner);

    /**
     * A list of goal evaluators.
     * @type {Array<GoalEvaluator>}
     */
    this.evaluators = [];
    this._typesMap = new Map();
  }

  /**
   * Executed when this goal is activated.
   */
  activate() {
    this.arbitrate();
  }

  /**
   * Executed in each simulation step.
   */
  execute() {
    this.activateIfInactive();

    const subgoalStatus = this.executeSubgoals();

    if (
      subgoalStatus === Goal.STATUS.COMPLETED ||
      subgoalStatus === Goal.STATUS.FAILED
    ) {
      this.status = Goal.STATUS.INACTIVE;
    }
  }

  /**
   * Executed when this goal is satisfied.
   */
  terminate() {
    this.clearSubgoals();
  }

  /**
   * Adds the given goal evaluator to this instance.
   *
   * @param evaluator - The goal evaluator to add.
   */
  addEvaluator(evaluator: GoalEvaluator<T>) {
    this.evaluators.push(evaluator);

    return this;
  }

  /**
   * Removes the given goal evaluator from this instance.
   *
   * @param evaluator - The goal evaluator to remove.
   */
  removeEvaluator(evaluator: GoalEvaluator<T>) {
    const index = this.evaluators.indexOf(evaluator);
    this.evaluators.splice(index, 1);

    return this;
  }

  /**
   * This method represents the top level decision process of an agent.
   * It iterates through each goal evaluator and selects the one that
   * has the highest score as the current goal.
   *
   * @return A reference to this instance.
   */
  arbitrate() {
    const evaluators = this.evaluators;

    let bestDesirability = -1;
    let bestEvaluator = null;

    // try to find the best top-level goal/strategy for the entity

    for (let i = 0, l = evaluators.length; i < l; i++) {
      const evaluator = evaluators[i];

      let desirability = evaluator.calculateDesirability(this.owner);
      desirability *= evaluator.characterBias;

      if (desirability >= bestDesirability) {
        bestDesirability = desirability;
        bestEvaluator = evaluator;
      }
    }

    // use the evaluator to set the respective goal

    if (bestEvaluator !== null) {
      bestEvaluator.setGoal(this.owner);
    } else {
      console.error(
        'Think: Unable to determine goal evaluator for game entity:',
        this.owner
      );
    }

    return this;
  }

  /**
   * Transforms this instance into a JSON object.
   *
   * @return {Object} The JSON object.
   */
  toJSON() {
    const json = super.toJSON();

    json.evaluators = [];

    for (let i = 0, l = this.evaluators.length; i < l; i++) {
      const evaluator = this.evaluators[i];
      json.evaluators.push(evaluator.toJSON());
    }

    return json;
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param {Object} json - The JSON object.
   * @return {Think} A reference to this instance.
   */
  fromJSON(json: { [s: string]: unknown }) {
    super.fromJSON(json);

    const typesMap = this._typesMap;

    this.evaluators.length = 0;
    this.terminate();

    // evaluators

    for (let i = 0, l = json.evaluators.length; i < l; i++) {
      const evaluatorJSON = json.evaluators[i];
      const type = evaluatorJSON.type;

      const ctor = typesMap.get(type);

      if (ctor !== undefined) {
        const evaluator = new ctor().fromJSON(evaluatorJSON);
        this.evaluators.push(evaluator);
      } else {
        console.warn('YUKA.Think: Unsupported goal evaluator type:', type);
        continue;
      }
    }

    // goals

    function parseGoal(goalJSON) {
      const type = goalJSON.type;

      const ctor = typesMap.get(type);

      if (ctor !== undefined) {
        const goal = new ctor().fromJSON(goalJSON);

        const subgoalsJSON = goalJSON.subgoals;

        if (subgoalsJSON !== undefined) {
          // composite goal

          for (let i = 0, l = subgoalsJSON.length; i < l; i++) {
            const subgoal = parseGoal(subgoalsJSON[i]);

            if (subgoal) goal.subgoals.push(subgoal);
          }
        }

        return goal;
      } else {
        Logger.warn('YUKA.Think: Unsupported goal evaluator type:', type);
        return;
      }
    }

    for (let i = 0, l = json.subgoals.length; i < l; i++) {
      const subgoal = parseGoal(json.subgoals[i]);

      if (subgoal) this.subgoals.push(subgoal);
    }

    return this;
  }

  /**
   * Registers a custom type for deserialization. When calling {@link Think#fromJSON}
   * this instance is able to pick the correct constructor in order to create custom
   * goals or goal evaluators.
   *
   * @param type - The name of the goal or goal evaluator.
   * @param constructor - The constructor function.
   */
  registerType(type: string, constructor: () => GoalEvaluator<T>) {
    this._typesMap.set(type, constructor);

    return this;
  }
}
