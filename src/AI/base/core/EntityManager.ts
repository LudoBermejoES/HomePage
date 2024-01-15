import { Trigger } from '../trigger/Trigger';
import { GameEntity } from './GameEntity';
import { MessageDispatcher } from './MessageDispatcher';

/**
 * This class is used for managing all central objects of a game like
 * game entities.
 */
export class EntityManager {
  /**
   * Constructs a new entity manager.
   */
  entities: GameEntity[];
  private _triggers: Trigger[];
  private _messageDispatcher: MessageDispatcher;

  constructor() {
    /**
     * A list of {@link GameEntity game entities}.
     * @type {Array<GameEntity>}
     * @readonly
     */
    this.entities = [];

    this._triggers = []; // used to manage triggers
    this._messageDispatcher = new MessageDispatcher();
  }

  /**
   * Adds a game entity to this entity manager.
   *
   * @param {GameEntity} entity - The game entity to add.
   * @return {EntityManager} A reference to this entity manager.
   */
  add(entity: GameEntity) {
    this.entities.push(entity);

    entity.manager = this;

    return this;
  }

  /**
   * Removes a game entity from this entity manager.
   *
   * @param {GameEntity} entity - The game entity to remove.
   * @return {EntityManager} A reference to this entity manager.
   */
  remove(entity: GameEntity) {
    const index = this.entities.indexOf(entity);
    this.entities.splice(index, 1);

    entity.manager = null;

    return this;
  }

  /**
   * Clears the internal state of this entity manager.
   *
   * @return {EntityManager} A reference to this entity manager.
   */
  clear() {
    this.entities.length = 0;

    this._messageDispatcher.clear();

    return this;
  }

  /**
   * Returns an entity by the given name. If no game entity is found, *null*
   * is returned. This method should be used once (e.g. at {@link GameEntity#start})
   * and the result should be cached for later use.
   *
   * @param {String} name - The name of the game entity.
   * @return {GameEntity} The found game entity.
   */
  getEntityByName(name: string) {
    const entities = this.entities;

    for (let i = 0, l = entities.length; i < l; i++) {
      const entity = entities[i];

      if (entity.name === name) return entity;
    }

    return null;
  }

  /**
   * The central update method of this entity manager. Updates all
   * game entities and delayed messages.
   *
   * @param {Number} delta - The time delta.
   * @return {EntityManager} A reference to this entity manager.
   */
  update(delta: number) {
    const entities = this.entities;
    const triggers = this._triggers;

    // update entities

    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];

      this.updateEntity(entity, delta);
    }

    // process triggers (this is done after the entity update to ensure
    // up-to-date world matries)

    for (let i = triggers.length - 1; i >= 0; i--) {
      const trigger = triggers[i];

      this.processTrigger(trigger);
    }

    this._triggers.length = 0; // reset

    // handle messaging

    this._messageDispatcher.dispatchDelayedMessages(delta);

    return this;
  }

  /**
   * Processes a single trigger.
   *
   * @param {Trigger} trigger - The trigger to process.
   * @return {EntityManager} A reference to this entity manager.
   */
  processTrigger(trigger: Trigger) {
    trigger.updateRegion(); // ensure its region is up-to-date

    const entities = this.entities;

    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];

      if (
        trigger !== entity &&
        entity.active === true &&
        entity.canActivateTrigger === true
      ) {
        trigger.check(entity);
      }
    }

    return this;
  }

  /**
   * Updates a single entity.
   *
   * @param {GameEntity} entity - The game entity to update.
   * @param {Number} delta - The time delta.
   * @return {EntityManager} A reference to this entity manager.
   */
  updateEntity(entity: GameEntity, delta: number) {
    if (entity.active === true) {
      // check if start() should be executed

      if (entity._started === false) {
        entity.start();

        entity._started = true;
      }

      // update entity

      entity.update(delta);

      // update children

      const children = entity.children;

      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];

        this.updateEntity(child, delta);
      }

      // if the entity is a trigger, save the reference for further processing

      if (entity instanceof Trigger) {
        this._triggers.push(entity);
      }
    }

    return this;
  }
}
