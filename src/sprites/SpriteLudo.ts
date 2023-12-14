import * as Phaser from 'phaser';

interface LudoProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
}

export default class SpriteLudo extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  velocity: number = 200;
  collideX: string = '';
  collideY: string = '';
  lastCollideXBeforeStopping: string = '';
  lastCollideYBeforeStopping: string = '';
  lastX: string = '';
  lastY: string = '';
  constructor(config: LudoProps) {
    super(config.scene, config.x, config.y, 'LudoSprite');
    this.cursors = config.cursors;
    config.scene.physics.add.existing(this, false);
    this.setPosition(10, 200);
    this.setCollideWorldBounds(true);
    this.body.onCollide = true;
    this.createAnims();

    //this.body.setOffset(10, 20);
    this.width -= 6;
    this.height -= 10;
    //this.body.setSize(10, 10, false);
  }
  createAnims() {
    this.anims.create({
      key: 'stop',
      frames: this.anims.generateFrameNumbers('LudoSprite', {
        start: 0,
        end: 0
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('LudoSprite', {
        start: 4,
        end: 7
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('LudoSprite', {
        start: 8,
        end: 11
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('LudoSprite', {
        start: 12,
        end: 15
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('LudoSprite', {
        start: 0,
        end: 3
      }),
      frameRate: 10,
      repeat: -1
    });
  }

  updateMovement() {
    let hasMoved = false;
    this.lastX = '';
    this.lastY = '';

    if (this.cursors.left.isDown) {
      console.log('LEFT', this.collideX);
      this.lastX = 'left';
      if (this.collideX !== 'left') {
        this.setVelocityX(-this.velocity);
      } else {
        this.setVelocityX(0);
      }
      hasMoved = true;

      this.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.lastX = 'right';
      if (this.collideX !== 'right') {
        this.setVelocityX(this.velocity);
      } else {
        this.setVelocityX(0);
      }
      hasMoved = true;

      this.anims.play('right', true);
    } else {
      this.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.lastY = 'up';
      if (this.collideY !== 'up') {
        this.setVelocityY(-this.velocity);
      } else {
        this.setVelocityY(0);
      }
      hasMoved = true;

      this.anims.play('up', true);
    } else if (this.cursors.down.isDown) {
      this.lastY = 'down';
      if (this.collideY !== 'down') {
        this.setVelocityY(this.velocity);
      } else {
        this.setVelocityY(0);
      }
      hasMoved = true;

      this.anims.play('down', true);
    } else {
      this.setVelocityY(0);
    }
    this.body.enable = hasMoved;
    if (!hasMoved) {
      this.anims.play('stop', true);
      this.lastCollideXBeforeStopping = this.collideX;
      this.lastCollideYBeforeStopping = this.collideY;
      this.collideX = '';
      this.collideY = '';
    }
  }
}
