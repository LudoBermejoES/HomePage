import { GameEntity } from '../core/GameEntity';
import { TriggerRegion } from './TriggerRegion';

/**
 * Base class for representing triggers. A trigger generates an action if a game entity
 * touches its trigger region, a predefine area in 3D space.
 */
export class Trigger extends GameEntity {
  /**
   * The region of the trigger.
   */
  region: TriggerRegion;

  /**
   * Flag if the trigger can activate other triggers.
   * @default false
   */
  canActivateTrigger: boolean;

  private _typesMap: unknown;

  /**
   * Constructs a new trigger with the given values.
   *
   * @param [region] - The region of the trigger.
   */
  constructor(region: TriggerRegion = new TriggerRegion()) {
    super();

    /**
     * The region of the trigger.
     * @type {TriggerRegion}
     */
    this.region = region;

    //

    this.canActivateTrigger = false; // triggers can't activate other triggers by default

    this._typesMap = new Map(); // used for deserialization of custom trigger regions
  }

  /**
   * This method is called per simulation step for all game entities. If the game
   * entity touches the region of the trigger, the respective action is executed.
   *
   * @param entity - The entity to test
   */
  check(entity: GameEntity) {
    if (this.region.touching(entity) === true) {
      this.execute(entity);
    }

    return this;
  }

  /**
   * This method is called when the trigger should execute its action.
   * Must be implemented by all concrete triggers.
   *
   * @param entity - The entity that touched the trigger region.
   */
  execute(entity: GameEntity) {}

  /**
   * Updates the region of this trigger. Called by the {@link EntityManager} per
   * simulation step.
   *
   * @return A reference to this trigger.
   */
  updateRegion() {
    this.region.update(this);

    return this;
  }

  /**
   * Transforms this instance into a JSON object.
   */
  toJSON() {
    const json = super.toJSON();

    json.region = this.region.toJSON();

    return json;
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param json - The JSON object.
   */
  fromJSON(json: { [s: string]: unknown }) {
    super.fromJSON(json);

    const regionJSON = json.region;
    const type = regionJSON.type;

    switch (type) {
      case 'TriggerRegion':
        this.region = new TriggerRegion().fromJSON(regionJSON);
        break;
    }

    return this;
  }

  /**
   * Registers a custom type for deserialization. When calling {@link Trigger#fromJSON}
   * the trigger is able to pick the correct constructor in order to create custom
   * trigger regions.
   *
   * @param type - The name of the trigger region.
   * @param constructor - The constructor function.
   */
  registerType(type: string, constructor: () => TriggerRegion) {
    this._typesMap.set(type, constructor);

    return this;
  }
}
