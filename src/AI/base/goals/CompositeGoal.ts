import { GameEntity } from '../core/GameEntity';
import { Telegram } from '../core/Telegram';
import { Goal } from './Goal';

/**
 * Class representing a composite goal. Essentially it's a goal which consists of sub goals.
 */
export class CompositeGoal<T extends GameEntity> extends Goal<T> {
  /**
   * A list of sub goals.
   */
  readonly subgoals: Array<Goal<T>>;

  /**
   * Constructs a new composite goal.
   *
   * @param owner - The owner of this composite goal.
   */
  constructor(owner?: T) {
    super(owner);

    /**
     * A list of subgoals.
     * @type {Array<Goal>}
     */
    this.subgoals = [];
  }

  /**
   * Adds a goal as a sub goal to this instance.
   *
   * @param goal - The sub goal to add.
   */
  addSubgoal(goal: Goal<T>) {
    this.subgoals.unshift(goal);

    return this;
  }

  /**
   * Removes a sub goal from this instance.
   *
   * @param goal - The sub goal to remove.
   */
  removeSubgoal(goal: Goal<T>) {
    const index = this.subgoals.indexOf(goal);
    this.subgoals.splice(index, 1);

    return this;
  }

  /**
   * Removes all sub goals and ensures {@link Goal#terminate} is called for each sub goal.
   */
  clearSubgoals() {
    const subgoals = this.subgoals;

    for (let i = 0, l = subgoals.length; i < l; i++) {
      const subgoal = subgoals[i];

      subgoal.terminate();
    }

    subgoals.length = 0;

    return this;
  }

  /**
   * Returns the current sub goal. If no sub goals are defined, *null* is returned.
   *
   * @return The current sub goal.
   */
  currentSubgoal() {
    const length = this.subgoals.length;

    if (length > 0) {
      return this.subgoals[length - 1];
    } else {
      return null;
    }
  }

  /**
   * Executes the current sub goal of this composite goal.
   *
   * @return The status of this composite sub goal.
   */
  executeSubgoals() {
    const subgoals = this.subgoals;

    // remove all completed and failed goals from the back of the subgoal list

    for (let i = subgoals.length - 1; i >= 0; i--) {
      const subgoal = subgoals[i];

      if (subgoal.completed() === true || subgoal.failed() === true) {
        // if the current subgoal is a composite goal, terminate its subgoals too

        if (subgoal instanceof CompositeGoal) {
          subgoal.clearSubgoals();
        }

        // terminate the subgoal itself

        subgoal.terminate();
        subgoals.pop();
      } else {
        break;
      }
    }

    // if any subgoals remain, process the one at the back of the list

    const subgoal = this.currentSubgoal();

    if (subgoal !== null) {
      subgoal.activateIfInactive();

      subgoal.execute();

      // if subgoal is completed but more subgoals are in the list, return 'ACTIVE'
      // status in order to keep processing the list of subgoals

      if (subgoal.completed() === true && subgoals.length > 1) {
        return Goal.STATUS.ACTIVE;
      } else {
        return subgoal.status;
      }
    } else {
      return Goal.STATUS.COMPLETED;
    }
  }

  /**
   * Returns true if this composite goal has sub goals.
   *
   * @return Whether the composite goal has sub goals or not.
   */
  hasSubgoals() {
    return this.subgoals.length > 0;
  }

  /**
   * Returns true if the given message was processed by the current subgoal.
   *
   * @return {Boolean} Whether the message was processed or not.
   */
  handleMessage(telegram: Telegram) {
    const subgoal = this.currentSubgoal();

    if (subgoal !== null) {
      return subgoal.handleMessage(telegram);
    }

    return false;
  }

  /**
   * Transforms this instance into a JSON object.
   *
   * @return {Object} The JSON object.
   */
  toJSON() {
    const json = super.toJSON();

    json.subgoals = [];

    for (let i = 0, l = this.subgoals.length; i < l; i++) {
      const subgoal = this.subgoals[i];
      json.subgoals.push(subgoal.toJSON());
    }

    return json;
  }

  /**
   * Restores UUIDs with references to GameEntity objects.
   *
   * @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
   * @return {CompositeGoal} A reference to this composite goal.
   */
  resolveReferences(entities: Map<string, GameEntity>) {
    super.resolveReferences(entities);

    for (let i = 0, l = this.subgoals.length; i < l; i++) {
      const subgoal = this.subgoals[i];
      subgoal.resolveReferences(entities);
    }

    return this;
  }
}
