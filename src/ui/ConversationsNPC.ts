import * as Phaser from 'phaser';
import { DialogNPC } from './DialogNPC';
import { CitizenActor } from '../actors/citizen/actor';
import { Conversation } from '../conversations/conversation';

type configSize = {
  scene: Phaser.Scene;
  widthDialog: number;
  callback: CallableFunction;
};

export class ConversationNPC {
  sizeOfBlocks: number = 32;
  config: configSize;
  dialogLines: string[];
  first: CitizenActor;
  second: CitizenActor;
  current: CitizenActor;
  currentConversation: Conversation;
  TIME_TO_TALK_AGAIN: number = 1000 * 40 * 2;

  constructor(
    scene: Phaser.Scene,
    first: CitizenActor,
    second: CitizenActor,
    config: configSize
  ) {
    const firstConversation = first.conversations.find(
      (c) => c.id1 === first.info.id && c.id2 === second.info.id
    );
    const secondConversation = second.conversations.find(
      (c) => c.id1 === second.info.id && c.id2 === first.info.id
    );

    if (!firstConversation || !secondConversation) return;

    const conversation =
      firstConversation.lastTime > secondConversation.lastTime
        ? secondConversation
        : firstConversation;

    this.currentConversation = conversation;

    this.dialogLines = conversation.conversation || [];
    this.config = config;
    this.first = first;
    this.second = second;
    this.startDialog(config.callback);
  }

  async startDialog(callback: CallableFunction) {
    if (!this.current || this.current === this.second) {
      this.current = this.first;
    } else {
      this.current = this.second;
    }

    const { scene, widthDialog } = this.config;
    const dialogLine: string | undefined = this.dialogLines.shift();
    if (!dialogLine) {
      callback(this.currentConversation);
      return;
    }

    const line: string = dialogLine;
    new DialogNPC(
      scene,
      line,
      {
        x: this.current.x,
        y: this.current.y - this.current.height,
        width: widthDialog,
        height: 96
      },
      () => {
        this.startDialog(callback);
      }
    );
  }
}
