import * as Phaser from 'phaser';
import { NineSliceConfig, PositionConfig, NineSlice } from 'phaser3-nineslice';
import { SIZES } from '../lib/constants';
type configSize = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CallbackFunction = () => void;

/*
 /* Create typewriter animation for text
 * @param {Phaser.GameObjects.Text} target
 * @param {number} [speedInMs=25]
 * @returns {Promise<void>}
 */

export function loadImages(scene: Phaser.Scene) {
  scene.load.image('actorBackground', 'assets/ui/buttonBackground.png');
  scene.load.image('dialogBackground', 'assets/ui/dialogBackground.png');
  scene.load.image('dialogCornerLeftTop', 'assets/ui/dialogCornerLeftTop.png');
  scene.load.image(
    'dialogCornerRightBottom',
    'assets/ui/dialogCornerRightBottom.png'
  );
}

export class DialogNPC extends Phaser.GameObjects.Container {
  sizeOfBlocks: number = 32;
  background: Phaser.GameObjects.RenderTexture | undefined;
  text: Phaser.GameObjects.Text | undefined;
  corners: {
    leftCorner: Phaser.GameObjects.Image;
    rightCorner: Phaser.GameObjects.Image;
  };
  static keyPress: Phaser.Input.Keyboard.Key | undefined;
  timer: Phaser.Time.TimerEvent | undefined;
  timerDestroy: Phaser.Time.TimerEvent | undefined;
  visibleText: string = '';
  textToShow: string = '';
  callbackF: CallbackFunction | undefined;
  resolve: CallbackFunction | undefined;
  constructor(
    scene: Phaser.Scene,
    textToShow: string,
    config: configSize,
    callback: CallbackFunction
  ) {
    super(scene, 0, 0);
    this.resolve = callback;

    this.callbackF = callback;
    this.textToShow = textToShow;
    this.background = this.createBackground(scene, config);
    this.text = this.createText(scene, textToShow, config, callback);
    this.corners = this.createCorners(scene, config);
    this.listenToKeyboard(scene);
    scene.add.existing(this);
    this.setDepth(150);
  }

  createCorners(scene: Phaser.Scene, config: configSize) {
    const leftCorner: Phaser.GameObjects.Image = scene.add
      .image(
        config.x - config.width / 2 + 8,
        config.y - config.height / 2 + 8,
        'dialogCornerLeftTop'
      )
      .setOrigin(0, 0);

    const rightCorner: Phaser.GameObjects.Image = scene.add
      .image(
        config.x + config.width / 2 - 16,
        config.y + config.height / 2 - 16,
        'dialogCornerRightBottom'
      )
      .setOrigin(0.5, 0.5);
    this.add(leftCorner);
    this.add(rightCorner);
    return {
      leftCorner,
      rightCorner
    };
  }

  createBackground(scene: Phaser.Scene, config: configSize) {
    const LayoutConfig: NineSliceConfig = {
      sourceKey: 'dialogBackground',
      sourceLayout: {
        width: 8,
        height: 8
      }
    };
    const position: PositionConfig = {
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height
    };
    const button = new NineSlice(scene, LayoutConfig, position);
    const rt: Phaser.GameObjects.RenderTexture =
      button as Phaser.GameObjects.RenderTexture;
    this.add(rt);
    return rt;
  }

  createText(
    scene: Phaser.Scene,
    text: string,
    config: configSize,
    callback: CallbackFunction
  ): Phaser.GameObjects.Text {
    const style = {
      fontFamily: 'font2',
      fontSize: '25px',
      color: '#000000',
      align: 'left',
      wordWrap: {
        width: config.width - SIZES.BLOCK,
        useAdvancedWrap: true
      }
    };
    const message: Phaser.GameObjects.Text = scene.add.text(
      config.x - config.width / 2 + SIZES.MID_BLOCK,
      config.y - config.height / 2 + SIZES.MID_BLOCK,
      text,
      style
    );

    message.setDepth(151);
    this.add(message);
    scene.add.existing(message);
    this.animateText(message).then(() => {
      callback();
      this.destroy();
    });
    return message;
  }

  endDialog() {
    if (this.timer) {
      this.timer.destroy();
      this.timer = undefined;
      this.text?.setText(this.textToShow);
      if (this.resolve && this.text)
        this.onFinishDialog(this.resolve, this.text);
    }
  }
  listenToKeyboard(scene: Phaser.Scene) {
    if (DialogNPC.keyPress) {
      DialogNPC.keyPress?.off('up');
      DialogNPC.keyPress.destroy();
    }
    DialogNPC.keyPress = scene?.input?.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    DialogNPC.keyPress?.on('up', () => {
      this.endDialog();
    });
  }

  onFinishDialog(resolve: CallbackFunction, target: Phaser.GameObjects.Text) {
    this.timerDestroy = target.scene.time.delayedCall(1000, () => {
      this.timerDestroy?.destroy();
      target.destroy();
      this.destroy();
      return resolve();
    });
  }

  callback(
    target: Phaser.GameObjects.Text,
    visibleText: string,
    invisibleMessage: string,
    message: string,
    resolve: CallbackFunction
  ) {
    // if all characters are visible, stop the timer
    if (target.text === message) {
      this.timer?.destroy();
      this.onFinishDialog(resolve, target);
      return;
    }
    // add next character to visible text
    this.visibleText += message[this.visibleText.length];
    // right pad with invisibleText
    const invisibleText = invisibleMessage.substring(this.visibleText.length);

    // update text on screen
    target.text = this.visibleText + invisibleText;
  }

  async animateText(target: Phaser.GameObjects.Text, speedInMs = 50) {
    // store original text
    const message = target.text;
    const invisibleMessage = message.replace(/[^ ]/g, ' ');

    // clear text on screen
    target.text = '';

    // mutable state for visible text
    const visibleText = '';

    // use a Promise to wait for the animation to complete
    return new Promise((resolve) => {
      this.timer = target.scene.time.addEvent({
        delay: speedInMs,
        loop: true,
        callback: () =>
          this.callback(
            target,
            visibleText,
            invisibleMessage,
            message,
            resolve as CallbackFunction
          )
      });
    });
  }

  destroy() {
    this.list.forEach((child) => {
      child.destroy();
    });

    this.timer?.destroy();
    this.timerDestroy?.destroy();
    this.background?.destroy();
    this.text?.destroy();
    this.corners.leftCorner?.destroy();
    this.corners.rightCorner?.destroy();
    this.removeAll(true);
    super.destroy(true);
  }
}
