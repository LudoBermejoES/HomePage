import { GameEntity } from './GameEntity';
import { Telegram } from './Telegram';

interface Data {
  type: string;
  delayedTelegrams: unknown[];
}

/**
 * This class is the core of the messaging system for game entities and used by the
 * {@link EntityManager}. The implementation can directly dispatch messages or use a
 * delayed delivery for deferred communication. This can be useful if a game entity
 * wants to inform itself about a particular event in the future.
 */
export class MessageDispatcher {
  /**
   * A list of delayed telegrams.
   */
  readonly delayedTelegrams: Telegram[];

  /**
   * Constructs a new message dispatcher.
   */
  constructor() {
    /**
     * A list of delayed telegrams.
     * @type {Array<Telegram>}
     * @readonly
     */
    this.delayedTelegrams = [];
  }

  /**
   * Delivers the message to the receiver.
   *
   * @param telegram - The telegram to deliver.
   */
  deliver(telegram: Telegram) {
    const receiver = telegram.receiver;

    if (receiver.handleMessage(telegram) === false) {
      console.warn(
        'YUKA.MessageDispatcher: Message not handled by receiver: %o',
        receiver
      );
    }

    return this;
  }
  /**
   * Receives the raw telegram data and decides how to dispatch the telegram (with or without delay).
   *
   * @param sender - The sender.
   * @param receiver - The receiver.
   * @param message - The actual message.
   * @param delay - A time value in millisecond used to delay the message dispatching.
   * @param data - An object for custom data.
   */
  dispatch(
    sender: GameEntity,
    receiver: GameEntity,
    message: string,
    delay: number,
    data: object
  ) {
    const telegram = new Telegram(sender, receiver, message, delay, data);

    if (delay <= 0) {
      this.deliver(telegram);
    } else {
      this.delayedTelegrams.push(telegram);
    }

    return this;
  }

  /**
   * Used to process delayed messages.
   *
   * @param delta - The time delta.
   */
  dispatchDelayedMessages(delta: number) {
    let i = this.delayedTelegrams.length;

    while (i--) {
      const telegram = this.delayedTelegrams[i];

      telegram.delay -= delta;

      if (telegram.delay <= 0) {
        this.deliver(telegram);

        this.delayedTelegrams.pop();
      }
    }

    return this;
  }

  /**
   * Clears the internal state of this message dispatcher.
   */
  clear() {
    this.delayedTelegrams.length = 0;

    return this;
  }

  /**
   * Transforms this instance into a JSON object.
   *
   * @return The JSON object.
   */

  toJSON() {
    const data: Data = {
      type: this.constructor.name,
      delayedTelegrams: []
    };

    // delayed telegrams

    for (let i = 0, l = this.delayedTelegrams.length; i < l; i++) {
      const delayedTelegram = this.delayedTelegrams[i];
      data.delayedTelegrams.push(delayedTelegram.toJSON());
    }

    return data;
  }

  /**
   * Restores this instance from the given JSON object.
   *
   * @param json - The JSON object.
   */
  fromJSON(json: { [s: string]: any }) {
    this.clear();

    const telegramsJSON = json.delayedTelegrams;

    for (let i = 0, l = telegramsJSON.length; i < l; i++) {
      const telegramJSON = telegramsJSON[i];
      const telegram = new Telegram().fromJSON(telegramJSON);

      this.delayedTelegrams.push(telegram);
    }

    return this;
  }

  /**
   * Restores UUIDs with references to GameEntity objects.
   *
   * @param entities - Maps game entities to UUIDs.
   */
  resolveReferences(entities: Map<string, GameEntity>) {
    const delayedTelegrams = this.delayedTelegrams;

    for (let i = 0, l = delayedTelegrams.length; i < l; i++) {
      const delayedTelegram = delayedTelegrams[i];
      delayedTelegram.resolveReferences(entities);
    }

    return this;
  }
}
