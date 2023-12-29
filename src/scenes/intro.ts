import * as Phaser from 'phaser';
import { TextButton, loadImages } from '../ui/TextButton';
export default class City extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  preload() {
    this.load.image('background', 'assets/backgrounds/road_to_city.png');
    this.load.video('intro', 'assets/videos/intro.webm');
    loadImages(this);
  }

  addVideoIntro(image: Phaser.GameObjects.Image) {
    const video = this.add.video(0, 0, 'intro');
    video.width = image.width;
    video.height = image.height;
    video.setOrigin(0, 0).setLoop(false).setMute(true);
    video.alpha = 0;
    this.tweens.chain({
      targets: video,
      tweens: [
        {
          alpha: 1,
          duration: 5000
        }
      ]
    });

    video.play();
  }

  drawText(): Phaser.GameObjects.Text {
    const title = this.add.text(190, 136, 'A new life', {
      fontFamily: 'font1',
      fontSize: '150px'
    });
    title.alpha = 0;
    title.x = this.cameras.main.width / 2 - title.width / 2;
    title.y = this.scale.getViewPort().height / 2 - title.height / 2;
    const title2 = this.add.text(190, 136, 'Insert coin to continue', {
      fontFamily: 'font1',
      fontSize: '50px'
    });
    title2.x = title.x + title.width / 2 - title2.width / 2;
    title2.y = title.y + title.height;
    title2.alpha = 0;

    return title;
  }

  createDialog(): TextButton {
    const dialog: TextButton = new TextButton(this, "Let's go to the city!");
    dialog.alpha = 0;
    dialog.setPosition(
      this.renderer.width / 2 - dialog.width / 2 - dialog.text.width / 2,
      this.renderer.height - dialog.height * 2 - 32 * 3
    );
    dialog.text.on('pointerdown', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start('busTravel');
        }
      );
    });
    return dialog;
  }
  create() {
    const image = this.add.image(0, 0, 'background').setOrigin(0, 0);
    image.x = this.cameras.main.width / 2 - image.width / 2;
    image.y = this.scale.getViewPort().height / 2 - image.height / 2;
    image.visible = false;
    this.addVideoIntro(image);
    const title = this.drawText();
    const dialog = this.createDialog();
    this.tweens.chain({
      targets: title,
      delay: 3000,
      tweens: [
        {
          alpha: 1,
          duration: 3000
        }
      ]
    });
    this.tweens.chain({
      targets: dialog,
      delay: 6000,
      tweens: [
        {
          alpha: 1,
          duration: 1000
        }
      ]
    });

    this.preloadNextImages();
  }

  preloadNextImages() {
    this.load.image(
      '_Terrains_and_Fences_32x32',
      'assets/map/exteriors/1_Terrains_and_Fences_32x32.png'
    );
    this.load.image(
      '_City_Terrains_32x32',
      'assets/map/exteriors/2_City_Terrains_32x32.png'
    );
    this.load.tilemapTiledJSON(
      '_Terrains_and_Fences_32x32',
      'assets/map/bus.tmj'
    );
    this.load.spritesheet('BusSprite', 'assets/sprites/BusSprite.png', {
      frameWidth: 118,
      frameHeight: 62
    });
  }
}
