import * as Phaser from 'phaser';
import City from './maps/city';
import Training from './maps/training';
const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  width: 800,
  height: 600,
  scene: [City, Training],

  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(config);
