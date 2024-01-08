import * as Phaser from 'phaser';
import { TextButton, loadImages } from '../ui/TextButton';
export default class City extends Phaser.Scene {
  title: {
    en: string;
    es: string;
  };
  button: {
    en: string;
    es: string;
  };
  constructor() {
    super('Intro');
    this.title = {
      en: 'A new life',
      es: 'Una nueva vida'
    };
    this.button = {
      en: "Let's go to the city",
      es: '¡Vamos a la ciudad!'
    };
  }

  preload() {
    this.load.image('bus', 'assets/sprites/bus.png');
    this.load.image('background', 'assets/images/backgroundIntro.png');
    this.load.aseprite(
      'rabbitIntro',
      'assets/sprites/rabbit.png',
      'assets/sprites/rabbit.json'
    );
    //this.load.video('intro', 'assets/videos/intro.webm');
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

  getLanguage(): string {
    return navigator.language || navigator.userLanguage || 'en';
  }

  getTitle(): string {
    return this.getLanguage() === 'es' ? this.title.es : this.title.en;
  }

  getButton(): string {
    return this.getLanguage() === 'es' ? this.button.es : this.button.en;
  }
  drawText(): Phaser.GameObjects.Text {
    const title = this.add.text(190, 136, this.getTitle(), {
      fontFamily: 'font1',
      fontSize: '150px'
    });
    title.alpha = 0;
    title.x = this.cameras.main.width / 2 - title.width / 2;
    title.y = this.scale.getViewPort().height / 2 - title.height / 2;

    return title;
  }

  createDialog(): TextButton {
    const dialog: TextButton = new TextButton(this, this.getButton());
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
    image.scale = 0.5;
    image.x = this.cameras.main.width / 2 - (image.width * image.scaleX) / 2;
    image.y =
      this.scale.getViewPort().height / 2 - (image.height * image.scaleY) / 2;

    const bus = this.add.image(0, 0, 'bus').setOrigin(0, 0);

    bus.x = this.cameras.main.width;
    bus.y = this.scale.getViewPort().height / 2 - bus.height * bus.scaleY * 2;
    bus.scale = 4;

    this.tweens.chain({
      targets: bus,
      tweens: [
        {
          duration: 10000,
          ease: 'quint.easeOut',
          scale: 0,
          repeat: -1,
          x: this.cameras.main.width / 2 + 10,
          y: this.scale.getViewPort().height / 1.43
        }
      ]
    });
    //this.addVideoIntro(image);
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
