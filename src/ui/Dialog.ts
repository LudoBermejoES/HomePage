import * as Phaser from 'phaser';
import { NineSliceConfig, PositionConfig, NineSlice } from 'phaser3-nineslice';
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
function animateText(
  target: Phaser.GameObjects.Text,
  spriteHead: Phaser.GameObjects.Sprite,
  speedInMs = 25
) {
  // store original text
  const message = target.text;
  const invisibleMessage = message.replace(/[^ ]/g, ' ');

  // clear text on screen
  target.text = '';

  // mutable state for visible text
  let visibleText = '';

  // use a Promise to wait for the animation to complete
  return new Promise((resolve) => {
    const timer = target.scene.time.addEvent({
      delay: speedInMs,
      loop: true,
      callback() {
        // if all characters are visible, stop the timer
        if (target.text === message) {
          timer.destroy();
          if (spriteHead) {
            if (spriteHead.anims.get('idle')) {
              spriteHead.anims.play('idle', true);
            } else {
              spriteHead.setFrame(0);
            }
          }
          const timerDestroy = target.scene.time.delayedCall(2000, () => {
            timerDestroy.destroy();
            target.destroy();
            return resolve(true);
          });
          return;
        }

        // add next character to visible text
        visibleText += message[visibleText.length];
        // right pad with invisibleText
        const invisibleText = invisibleMessage.substring(visibleText.length);

        // update text on screen

        target.text = visibleText + invisibleText;
      }
    });
  });
}

export function loadImages(scene: Phaser.Scene) {
  scene.load.image('actorBackground', 'assets/ui/buttonBackground.png');
  scene.load.image('dialogBackground', 'assets/ui/dialogBackground.png');
  scene.load.image('dialogCornerLeftTop', 'assets/ui/dialogCornerLeftTop.png');
  scene.load.image(
    'dialogCornerRightBottom',
    'assets/ui/dialogCornerRightBottom.png'
  );
}

export class Dialog extends Phaser.GameObjects.Container {
  sizeOfBlocks: number = 32;
  nameHead!: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.RenderTexture | undefined;
  text: Phaser.GameObjects.Text | undefined;
  corners: {
    leftCorner: Phaser.GameObjects.Image;
    rightCorner: Phaser.GameObjects.Image;
  };
  actor: {
    tx: Phaser.GameObjects.RenderTexture;
    spriteHead: Phaser.GameObjects.Sprite;
  };
  actorName: {
    backgroundActor: Phaser.GameObjects.RenderTexture;
    message: Phaser.GameObjects.Text;
  };

  constructor(
    scene: Phaser.Scene,
    textToShow: string,
    config: configSize,
    name: string,
    spriteHead: Phaser.GameObjects.Sprite,
    callback: CallbackFunction
  ) {
    super(scene, 0, 0);
    this.background = this.createBackground(scene, config);
    this.actorName = this.createActorName(scene, name, config);
    this.actor = this.createActor(scene, spriteHead, config);
    this.text = this.createText(scene, textToShow, config, callback);
    this.corners = this.createCorners(scene, config);

    scene.add.existing(this);
    this.setDepth(150);
  }

  createActor(
    scene: Phaser.Scene,
    spriteHead: Phaser.GameObjects.Sprite,
    config: configSize
  ) {
    const tx: Phaser.GameObjects.RenderTexture = this.createBackgroundActor(
      scene,
      spriteHead,
      config
    );
    this.add(spriteHead);
    this.add(tx);

    spriteHead.x = tx.x;
    spriteHead.y = tx.y + 2;
    return {
      spriteHead,
      tx
    };
  }

  createBackgroundActor(
    scene: Phaser.Scene,
    spriteHead: Phaser.GameObjects.Sprite,
    config: configSize
  ): Phaser.GameObjects.RenderTexture {
    const LayoutConfig: NineSliceConfig = {
      sourceKey: 'actorBackground',
      sourceLayout: {
        width: 8,
        height: 8
      }
    };
    const position: PositionConfig = {
      x: config.x - config.width / 2 + this.sizeOfBlocks * 1.5,
      y:
        config.y -
        config.height / 2 +
        this.sizeOfBlocks * 1.5 +
        this.sizeOfBlocks / 4,
      width: this.sizeOfBlocks * 2,
      height: this.sizeOfBlocks * 2
    };
    const button = new NineSlice(scene, LayoutConfig, position);
    const rt: Phaser.GameObjects.RenderTexture =
      button as Phaser.GameObjects.RenderTexture;
    this.add(rt);
    return rt;
  }

  createCorners(scene: Phaser.Scene, config: configSize) {
    const leftCorner: Phaser.GameObjects.Image = scene.add
      .image(
        config.x - config.width / 2 + this.sizeOfBlocks * 2.8,
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

  createBackgroundActorName(
    scene: Phaser.Scene,
    config: configSize
  ): Phaser.GameObjects.RenderTexture {
    const LayoutConfig: NineSliceConfig = {
      sourceKey: 'actorBackground',
      sourceLayout: {
        width: 8,
        height: 8
      }
    };

    const position: PositionConfig = {
      x: config.x - config.width / 2 + this.sizeOfBlocks * 1.5,
      y: config.y - config.height / 2,
      width: this.sizeOfBlocks * 2,
      height: this.sizeOfBlocks
    };
    const button = new NineSlice(scene, LayoutConfig, position);
    const rt: Phaser.GameObjects.RenderTexture =
      button as Phaser.GameObjects.RenderTexture;
    this.add(rt);
    return rt;
  }

  createActorName(scene: Phaser.Scene, text: string, config: configSize) {
    const backgroundActor: Phaser.GameObjects.RenderTexture =
      this.createBackgroundActorName(scene, config);
    const widthForCenter = config.width - this.sizeOfBlocks * 2;
    const heightForCenter = config.height - this.sizeOfBlocks * 2;

    const style = {
      fontFamily: 'font2',
      fontSize: '18px',
      color: '#000000',
      align: 'left',
      wordWrap: {
        width: this.sizeOfBlocks
      }
    };
    const message: Phaser.GameObjects.Text = scene.add.text(
      backgroundActor.x - backgroundActor.width / 4,
      scene.renderer.height -
        heightForCenter * 2 -
        this.sizeOfBlocks * 2 -
        this.sizeOfBlocks / 8,
      text,
      style
    );
    message.setDepth(151);
    this.add(message);
    this.nameHead = message;

    return {
      message,
      backgroundActor
    };
  }

  createText(
    scene: Phaser.Scene,
    text: string,
    config: configSize,
    callback: CallbackFunction
  ): Phaser.GameObjects.Text {
    const widthForCenter = config.width - this.sizeOfBlocks * 2;
    const heightForCenter = config.height - this.sizeOfBlocks * 2;

    const style = {
      fontFamily: 'font2',
      fontSize: '25px',
      color: '#000000',
      align: 'left',
      wordWrap: {
        width: widthForCenter - this.sizeOfBlocks * 2,
        useAdvancedWrap: true
      }
    };
    const message: Phaser.GameObjects.Text = scene.add.text(
      this.actorName.backgroundActor.x + this.sizeOfBlocks * 2,
      scene.renderer.height - heightForCenter * 2 - this.sizeOfBlocks,
      text,
      style
    );

    message.setDepth(151);
    this.add(message);
    scene.add.existing(message);
    animateText(message, this.actor.spriteHead).then(() => {
      callback();
      this.destroy();
    });
    return message;
  }

  destroy() {
    this.list.forEach((child) => {
      child.destroy();
    });
    this.nameHead.destroy();
    this.removeAll(true);
    super.destroy(true);
  }
}
