import { GameEntity } from './GameEntity';

/**
 * Class for representing a telegram, an envelope which contains a message and certain metadata like sender and receiver.
 * Part of the messaging system for game entities.
 */
export class Telegram {
  /** The sender. */
  sender: GameEntity;

  /** The receiver. */
  receiver: GameEntity;

  /** The actual message. */
  message: string;

  /** A time value in millisecond used to delay the message dispatching. */
  delay: number;

  /** An object for custom data. */
  data: object;

  /**
   * Constructs a new telegram object.
   *
   * @param sender - The sender.
   * @param receiver - The receiver.
   * @param message - The actual message.
   * @param delay - A time value in millisecond used to delay the message dispatching.
   * @param data - An object for custom data.
   */
  constructor(
    sender?: GameEntity,
    receiver?: GameEntity,
    message?: string,
    delay?: number,
    data?: object
  ) {
    if (sender === undefined) return;
    if (receiver === undefined) return;
    if (message === undefined) return;
    if (delay === undefined) return;
    if (data === undefined) return;

    /**
     * The sender.
     * @type {GameEntity}
     */
    this.sender = sender;

    /**
     * The receiver.
     * @type {GameEntity}
     */
    this.receiver = receiver;

    /**
     * The actual message.
     * @type {String}
     */
    this.message = message;

    /**
     * A time value in millisecond used to delay the message dispatching.
     * @type {Number}
     */
    this.delay = delay;

    /**
     * An object for custom data.
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Transforms this instance into a JSON object.
   *
   * @return The JSON object.
   */
  toJSON() {
    return {
      type: this.constructor.name,
      sender: this.sender.uuid,
      receiver: this.receiver.uuid,
      message: this.message,
      delay: this.delay,
      data: this.data
    };
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param json - The JSON object.
   */
  fromJSON(json: { [s: string]: unknown }) {
    this.sender = json.sender as GameEntity;
    this.receiver = json.receiver as GameEntity;
    this.message = json.message as string;
    this.delay = json.delay as number;
    this.data = json.data as object;

    return this;
  }

  /**
   * Restores UUIDs with references to GameEntity objects.
   *
   * @param entities - Maps game entities to UUIDs.
   */
  resolveReferences(entities: Map<string, GameEntity>) {
    this.sender = entities.get(this.sender);
    this.receiver = entities.get(this.receiver);

    return this;
  }
}
