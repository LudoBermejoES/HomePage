import * as Phaser from 'phaser';
import Intro from './scenes/intro';
import BusTravel from './scenes/busTravel';
import City from './scenes/city';
import Training from './scenes/training';
import PubSolitaryOwl from './scenes/PubSolitaryOwl';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scene: [Intro, City, PubSolitaryOwl, BusTravel, Training],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  // Allows Phaser canvas to be responsive to browser sizing
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,

    // Minimum size
    min: {
      width: 1024,
      height: 576
    },
    max: {
      width: 1920,
      height: 1200
    }
  },
  render: {
    // prevent tile bleeding
    antialiasGL: false,
    // prevent pixel art from becoming blurre when scaled
    pixelArt: true
  },
  fx: {
    glow: {
      distance: 32,
      quality: 0.1
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(config);
