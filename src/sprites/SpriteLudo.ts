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
  moveToTarget: Phaser.Math.Vector2 | undefined;
  movePath: Phaser.Math.Vector2[] = [];

  constructor(config: LudoProps) {
    super(config.scene, config.x, config.y, 'LudoSprite');
    this.cursors = config.cursors;
    config.scene.physics.add.existing(this, false);
    this.setPosition(10, 200);
    this.setCollideWorldBounds(true);
    if (this.body) this.body.onCollide = true;
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

  moveAlongPath(path: Phaser.Math.Vector2[]) {
    this.movePath = path;
    if (this.movePath.length > 0) {
      this.moveTo(this.movePath.shift()!);
    }
  }

  updatePathMovement(): boolean {
    if (this.body) this.body.enable = true;

    let dx = 0;
    let dy = 0;

    if (this.moveToTarget) {
      dx = this.moveToTarget.x - this.x;
      dy = this.moveToTarget.y - this.y;

      if (Math.abs(dx) < 5) {
        dx = 0;
      }
      if (Math.abs(dy) < 5) {
        dy = 0;
      }

      if (dx === 0 && dy === 0) {
        if (this.movePath.length > 0) {
          this.moveTo(this.movePath.shift()!);
          return true;
        }
        this.moveToTarget = undefined;
      }
    }
    // this logic is the same except we determine
    // if a key is down based on dx and dy
    const leftDown = dx < 0;
    const rightDown = dx > 0;
    const upDown = dy < 0;
    const downDown = dy > 0;

    const speed = 200;

    if (leftDown) {
      this.anims.play('left', true);
      this.setVelocity(-speed, 0);
    } else if (rightDown) {
      this.anims.play('right', true);
      this.setVelocity(speed, 0);
    } else if (upDown) {
      this.anims.play('up', true);
      this.setVelocity(0, -speed);
    } else if (downDown) {
      this.anims.play('down', true);
      this.setVelocity(0, speed);
    } else {
      this.anims.play('stop', true);
      this.setVelocity(0, 0);
    }

    return leftDown || rightDown || upDown || downDown;
  }

  moveTo(target: Phaser.Math.Vector2) {
    this.moveToTarget = target;
  }

  updateMovement() {
    let hasMoved = false;
    this.lastX = '';
    this.lastY = '';

    if (this.cursors.left.isDown) {
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

    if (this.body) this.body.enable = hasMoved;
    if (!hasMoved) {
      this.anims.play('stop', true);
      this.lastCollideXBeforeStopping = this.collideX;
      this.lastCollideYBeforeStopping = this.collideY;
      this.collideX = '';
      this.collideY = '';
    }
  }
}
