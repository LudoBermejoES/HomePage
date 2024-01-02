import * as Phaser from 'phaser';
import { Dialog } from './Dialog';
import SpriteHead from '../sprites/SpriteHead';
import { DialogObject } from './Interfaces';

type configSize = {
  scene: Phaser.Scene;
  widthDialog: number;
  callback: CallableFunction;
};

export class DialogScene {
  sizeOfBlocks: number = 32;
  dialogLines: DialogObject[];
  config: configSize;
  constructor(
    scene: Phaser.Scene,
    dialogLines: DialogObject[],
    config: configSize
  ) {
    this.dialogLines = dialogLines;
    this.config = config;
    this.startDialog(config.callback);
  }

  async startDialog(callback: CallableFunction) {
    const { scene, widthDialog } = this.config;
    const dialogLine: DialogObject | undefined = this.dialogLines.shift();
    if (!dialogLine) {
      callback();
      return;
    }
    const spriteHead: SpriteHead = new SpriteHead({
      scene,
      x: 0,
      y: 0,
      name: dialogLine.name,
      template: dialogLine.template
    });
    const language = navigator.language || navigator.userLanguage;
    const line: string = language.includes('es')
      ? dialogLine.es
      : dialogLine.en;
    new Dialog(
      scene,
      line,
      {
        x: widthDialog - widthDialog / 4,
        y: scene.scale.getViewPort().height - 75,
        width: widthDialog,
        height: 96
      },
      dialogLine.name,
      spriteHead as Phaser.GameObjects.Sprite,
      () => {
        this.startDialog(callback);
      }
    );
  }
}
