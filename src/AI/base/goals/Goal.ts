import { GameEntity } from '../core/GameEntity';
import { Telegram } from '../core/Telegram';

export type GoalStatus = string;

interface iToJSON {
  type: string;
  owner: string | null | undefined;
  status: GoalStatus;
  subgoals: Goal<GameEntity>[]; // Fix: Add type argument 'T' to the 'Goal' array declaration
}

export interface StatusTypes {
  // the goal has been activated and will be processed each update step
  readonly ACTIVE: 'active';
  // the goal is waiting to be activated
  readonly INACTIVE: 'inactive';
  // the goal has completed and will be removed on the next update
  readonly COMPLETED: 'completed';
  // the goal has failed and will either replan or be removed on the next update
  readonly FAILED: 'failed';
}

export class Goal<T extends GameEntity> {
  static readonly STATUS: StatusTypes = {
    ACTIVE: 'active', // the goal has been activated and will be processed each update step
    INACTIVE: 'inactive', // the goal is waiting to be activated
    COMPLETED: 'completed', // the goal has completed and will be removed on the next update
    FAILED: 'failed' // the goal has failed and will either replan or be removed on the next update
  };

  /**
   * The owner of this goal.
   */
  owner: T | null;

  /**
   * The status of this goal.
   * @default {@link StatusTypes.INACTIVE}
   */
  status: GoalStatus;

  constructor(owner: T | null = null) {
    /**
     * The owner of this goal.
     * @type {?GameEntity}
     * @default null
     */
    this.owner = owner;

    /**
     * The status of this goal.
     * @type {Status}
     * @default INACTIVE
     */
    this.status = Goal.STATUS.INACTIVE;
  }

  /**
   * Executed when this goal is activated.
   */
  activate() {}

  /**
   * Executed in each simulation step.
   */
  execute() {}

  /**
   * Executed when this goal is satisfied.
   */
  terminate() {}

  /**
   * Goals can handle messages. Many don't though, so this defines a default behavior.
   *
   * @param telegram - The telegram with the message data.
   * @return Whether the message was processed or not.
   */
  handleMessage(telegram: Telegram): boolean {
    return false;
  }

  /**
   * Returns true if the status of this goal is *ACTIVE*.
   */
  active(): boolean {
    return this.status === Goal.STATUS.ACTIVE;
  }

  /**
   * Returns true if the status of this goal is *INACTIVE*.
   */
  inactive(): boolean {
    return this.status === Goal.STATUS.INACTIVE;
  }

  /**
   * Returns true if the status of this goal is *COMPLETED*.
   */
  completed(): boolean {
    return this.status === Goal.STATUS.COMPLETED;
  }

  /**
   * Returns true if the status of this goal is *FAILED*.
   */
  failed(): boolean {
    return this.status === Goal.STATUS.FAILED;
  }

  /**
   * Ensures the goal is replanned if it has failed.
   */
  replanIfFailed() {
    if (this.failed() === true) {
      this.status = Goal.STATUS.INACTIVE;
    }

    return this;
  }

  /**
   * Ensures the goal is activated if it is inactive.
   */
  activateIfInactive() {
    if (this.inactive() === true) {
      this.status = Goal.STATUS.ACTIVE;

      this.activate();
    }

    return this;
  }

  /**
   * Transforms this instance into a JSON object.
   */
  toJSON() {
    const data: iToJSON = {
      type: this.constructor.name,
      owner: this.owner?.uuid,
      status: this.status,
      subgoals: []
    };
    return data;
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param json - The JSON object.
   */
  fromJSON(json: { [s: string]: unknown }) {
    this.owner = json.owner; // uuid
    this.status = json.status;

    return this;
  }

  /**
   * Restores UUIDs with references to GameEntity objects.
   *
   * @param entities - Maps game entities to UUIDs.
   */
  resolveReferences(entities: Map<string, GameEntity>) {
    if (this.owner !== null) this.owner = entities.get(this.owner) || null;

    return this;
  }
}
