import { EntityManager } from './EntityManager';
import { Telegram } from './Telegram';
import { generateUUID } from '../libs/generateUUID';
import { entitiesToIds } from '../libs/entitiesToIds';
import * as Phaser from 'phaser';
import { SIZES } from '../../../lib/constants';

export interface GameEntityConstructor {
  new (): GameEntity;
}

export interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture?: string;
}

/**
 * Base class for all game entities.
 */
export abstract class GameEntity extends Phaser.Physics.Arcade.Sprite {
  movePath: Phaser.Math.Vector2[] | undefined;
  moveToTarget: Phaser.Math.Vector2 | undefined;
  speedToMove: number = 10;
  /** config */
  config: Props;

  /**
   * The uuid of this game entity.
   */
  _uuid: string | null;

  /**
   * The uuid of this game entity.
   */
  _started: boolean;

  /**
   * The child entities of this game entity.
   */
  children: GameEntity[];

  /**
   * A reference to the parent entity of this game entity.
   * Automatically set when added to a {@link GameEntity}.
   * @default null
   */
  parent: GameEntity | null;

  /**
   * A list of neighbors of this game entity.
   */
  neighbors: GameEntity[];

  /**
   * Game entities within this radius are considered as neighbors of this entity.
   * @default 1
   */
  neighborhoodRadius: number;

  /**
   * Whether the neighborhood of this game entity is updated or not.
   * @default false
   */
  updateNeighborhood: boolean;

  /**
   * The bounding radius of this game entity in world units.
   * @default 0
   */
  boundingRadius: number;

  /**
   * The maximum turn rate of this game entity in radians per seconds.
   * @default π
   */
  maxTurnRate: number;

  /**
   * Whether the entity can activate a trigger or not.
   * @default true
   */
  canActivateTrigger: boolean;

  /**
   * A reference to the entity manager of this game entity.
   * Automatically set when added to an {@link EntityManager}.
   * @default null
   */
  manager: EntityManager | null;

  /**
   * Constructs a new game entity.
   */
  constructor(config: Props) {
    /**
     * The name of this game entity.
     * @type {String}
     */
    if (!config.texture) return;
    super(config.scene, config.x, config.y, config.texture);
    this.name = '';
    this.scene.physics.add.existing(this, false);

    this.config = config;

    /**
     * Whether this game entity is active or not.
     * @type {Boolean}
     * @default true
     */
    this.active = true;

    /**
     * The child entities of this game entity.
     * @type {Array<GameEntity>}
     */
    this.children = [];

    /**
     * A reference to the parent entity of this game entity.
     * Automatically set when added to a {@link GameEntity}.
     * @type {?GameEntity}
     * @default null
     * @readonly
     */
    this.parent = null;

    /**
     * A list of neighbors of this game entity.
     * @type {Array<GameEntity>}
     * @readonly
     */
    this.neighbors = [];

    /**
     * Game entities within this radius are considered as neighbors of this entity.
     * @type {Number}
     * @default 1
     */
    this.neighborhoodRadius = 1;

    /**
     * Whether the neighborhood of this game entity is updated or not.
     * @type {Boolean}
     * @default false
     */
    this.updateNeighborhood = false;

    /**
     * The bounding radius of this game entity in world units.
     * @type {Number}
     * @default 0
     */
    this.boundingRadius = 0;

    /**
     * Whether the entity can activate a trigger or not.
     * @type {Boolean}
     * @default true
     */
    this.canActivateTrigger = true;

    /**
     * A reference to the entity manager of this game entity.
     * Automatically set when added to an {@link EntityManager}.
     * @type {EntityManager}
     * @default null
     * @readonly
     */
    this.manager = null;

    // private properties

    // flag to indicate whether the entity was updated by its manager at least once or not

    this._started = false;

    //

    this._uuid = null;
  }

  /**
   * Unique ID, primarily used in context of serialization/deserialization.
   * @type {String}
   * @readonly
   */
  get uuid() {
    if (this._uuid === null) {
      this._uuid = generateUUID();
    }

    return this._uuid;
  }

  prepareAnimsFromAseSprite() {
    this.anims.createFromAseprite(this.config.texture).forEach((anim) => {
      anim.repeat = -1;
    });
  }

  /**
   * Executed when this game entity is updated for the first time by its {@link EntityManager}.
   *
   * @return {GameEntity} A reference to this game entity.
   */
  start() {
    return this;
  }

  /**
   * Adds a game entity as a child to this game entity.
   *
   * @param {GameEntity} entity - The game entity to add.
   * @return {GameEntity} A reference to this game entity.
   */
  add(entity: GameEntity) {
    if (entity.parent !== null) {
      entity.parent.remove(entity);
    }

    this.children.push(entity);
    entity.parent = this;

    return this;
  }

  /**
   * Removes a game entity as a child from this game entity.
   *
   * @param {GameEntity} entity - The game entity to remove.
   * @return {GameEntity} A reference to this game entity.
   */
  remove(entity: GameEntity) {
    const index = this.children.indexOf(entity);
    this.children.splice(index, 1);

    entity.parent = null;

    return this;
  }

  /**
   * Holds the implementation for the message handling of this game entity.
   *
   * @param {Telegram} telegram - The telegram with the message data.
   * @return {Boolean} Whether the message was processed or not.
   */
  handleMessage(s: Telegram) {
    return false;
  }

  /**
   * Holds the implementation for the line of sight test of this game entity.
   * This method is used by {@link Vision#visible} in order to determine whether
   * this game entity blocks the given line of sight or not. Implement this method
   * when your game entity acts as an obstacle.
   *
   * @param {Ray} ray - The ray that represents the line of sight.
   * @param {Vector3} intersectionPoint - The intersection point.
   * @return {Vector3} The intersection point.
   */
  lineOfSightTest() {
    return null;
  }

  /**
   * Sends a message with the given data to the specified receiver.
   *
   * @param {GameEntity} receiver - The receiver.
   * @param {String} message - The actual message.
   * @param {Number} delay - A time value in millisecond used to delay the message dispatching.
   * @param {Object} data - An object for custom data.
   * @return {GameEntity} A reference to this game entity.
   */
  sendMessage(receiver: GameEntity, message: string, delay = 0, data = null) {
    if (this.manager !== null) {
      this.manager.sendMessage(this, receiver, message, delay, data);
    } else {
      Logger.error(
        'YUKA.GameEntity: The game entity must be added to a manager in order to send a message.'
      );
    }

    return this;
  }

  /**
   * Transforms this instance into a JSON object.
   *
   * @return {Object} The JSON object.
   */
  toJSONAI() {
    return {
      type: this.constructor.name,
      uuid: this.uuid,
      name: this.name,
      active: this.active,
      children: entitiesToIds(this.children),
      parent: this.parent !== null ? this.parent.uuid : null,
      neighbors: entitiesToIds(this.neighbors),
      neighborhoodRadius: this.neighborhoodRadius,
      updateNeighborhood: this.updateNeighborhood,
      boundingRadius: this.boundingRadius,
      maxTurnRate: this.maxTurnRate,
      canActivateTrigger: this.canActivateTrigger,
      _started: this._started
    };
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param {Object} json - The JSON object.
   * @return {GameEntity} A reference to this game entity.
   */
  fromJSONAI(json: GameEntity) {
    this.name = json.name;
    this.active = json.active;
    this.neighborhoodRadius = json.neighborhoodRadius;
    this.updateNeighborhood = json.updateNeighborhood;
    this.boundingRadius = json.boundingRadius;
    this.maxTurnRate = json.maxTurnRate;
    this.canActivateTrigger = json.canActivateTrigger;

    this.children = json.children.slice();
    this.neighbors = json.neighbors.slice();
    this.parent = json.parent;

    this._started = json._started;

    this._uuid = json.uuid;

    return this;
  }

  /**
   * Restores UUIDs with references to GameEntity objects.
   *
   * @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
   * @return {GameEntity} A reference to this game entity.
   */
  resolveReferences(entities: Map<string, GameEntity>) {
    //

    const neighbors = this.neighbors;

    for (let i = 0, l = neighbors.length; i < l; i++) {
      neighbors[i] = entities.get(neighbors[i]);
    }

    //

    const children = this.children;

    for (let i = 0, l = children.length; i < l; i++) {
      children[i] = entities.get(children[i]);
    }

    //

    this.parent = entities.get(this.parent?._uuid) || null;

    return this;
    4;
  }

  moveAlongPath(path: Phaser.Math.Vector2[], speedToMove: number = 2) {
    this.speedToMove = speedToMove;
    this.movePath = path;
    if (this.movePath.length > 0) {
      this.moveTo(this.movePath.shift()!);
    }
  }

  moveTo(target: Phaser.Math.Vector2) {
    this.moveToTarget = target;
  }

  getAnimationNames(): {
    LEFT: string;
    RIGHT: string;
    UP: string;
    DOWN: string;
  } {
    if (this.anims.get('left_move')) {
      return {
        LEFT: 'left_move',
        RIGHT: 'right_move',
        UP: 'up_move',
        DOWN: 'down_move'
      };
    } else {
      return {
        LEFT: 'move_left',
        RIGHT: 'move_right',
        UP: 'move_up',
        DOWN: 'move_down'
      };
    }
  }

  updatePathMovement(
    minDistanceX: number = 5,
    minDistanceY: number = 5
  ): boolean {
    let dx = 0;
    let dy = 0;

    if (this.moveToTarget) {
      dx = this.moveToTarget.x * SIZES.BLOCK + SIZES.BLOCK / 2 - this.x;
      dy = this.moveToTarget.y * SIZES.BLOCK + SIZES.BLOCK / 2 - this.y - 10;

      if (Math.abs(dx) < minDistanceX) {
        dx = 0;
      }
      if (Math.abs(dy) < minDistanceY) {
        dy = 0;
      }

      if (dx === 0 && dy === 0) {
        if (this.movePath && this.movePath.length > 0) {
          this.moveTo(this.movePath.shift()!);
          return true;
        }

        this.moveToTarget = undefined;
      }
    }
    const leftDown = dx < 0;
    const rightDown = dx > 0;
    const upDown = dy < 0;
    const downDown = dy > 0;
    const speedX = leftDown
      ? -this.speedToMove
      : rightDown
        ? this.speedToMove
        : 0;
    const speedY = upDown ? -this.speedToMove : downDown ? this.speedToMove : 0;

    const ANIMATION_NAMES = this.getAnimationNames();
    let animation: string =
      speedX < 0
        ? ANIMATION_NAMES.LEFT
        : speedX > 0
          ? ANIMATION_NAMES.RIGHT
          : '';
    animation =
      speedY < 0
        ? ANIMATION_NAMES.UP
        : speedY > 0
          ? ANIMATION_NAMES.DOWN
          : animation;

    this.setPosition(this.x + speedX, this.y + speedY);
    this.anims.play(animation, true);

    return leftDown || rightDown || upDown || downDown;
  }
}

export type RenderCallback<ComponentType> = (
  entity: GameEntity,
  renderComponent: ComponentType
) => void;
