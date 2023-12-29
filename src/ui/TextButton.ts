import * as Phaser from 'phaser';
import { NineSlice, PositionConfig, NineSliceConfig } from 'phaser3-nineslice';

export function loadImages(scene: Phaser.Scene) {
  scene.load.image('buttonBackground', 'assets/ui/buttonBackground.png');
}

export class TextButton extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  sizeOfBlocks: number = 32;

  constructor(scene: Phaser.Scene, text: string) {
    super(scene, 0, 0);
    this.text = this.createText(scene, text);
    const rt = this.createBackground(scene, this.text);

    this.setDepth(150);
    this.text.destroy();
    this.text = this.createText(scene, text);
    this.text.x = this.x + this.text.width / 2;
    this.text.y = this.y + this.sizeOfBlocks / 2 - this.text.height / 6;

    rt.x = this.text.x;
    rt.y = this.text.y;
    this.text.setInteractive({ cursor: 'pointer' });
    scene.add.existing(this);
  }

  createBackground(scene: Phaser.Scene, text: Phaser.GameObjects.Text) {
    const LayoutConfig: NineSliceConfig = {
      sourceKey: 'buttonBackground',
      sourceLayout: {
        width: 8,
        height: 8
      }
    };

    const position: PositionConfig = {
      x: 0,
      y: 0,
      width: text.width + this.sizeOfBlocks,
      height: text.height + this.sizeOfBlocks
    };
    const button = new NineSlice(scene, LayoutConfig, position);
    const rt: Phaser.GameObjects.RenderTexture =
      button as Phaser.GameObjects.RenderTexture;
    this.add(rt);
    return rt;
  }

  createText(scene: Phaser.Scene, text: string): Phaser.GameObjects.Text {
    const style = {
      fontFamily: 'font2',
      fontSize: '30px',
      color: '#000000',
      baclgroundColor: '#ffffff',
      align: 'left',
      wordWrap: {
        useAdvancedWrap: true
      }
    };
    const message = scene.add.text(0, 0, text, style);
    message.setOrigin(0.5, 0.5);
    message.setDepth(155);
    scene.add.existing(message);
    this.add(message);

    return message;
  }
}
