import * as Phaser from 'phaser';
import { SIZES, DEPTH } from '../lib/constants';
import OnTheFlySprite from './OnTheFlySprite';

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
  lastXForMoveAnimation: string = '';
  lastYForMoveAnimation: string = '';
  moveToTarget: Phaser.Math.Vector2 | undefined;
  movePath: Phaser.Math.Vector2[] = [];

  constructor(config: LudoProps) {
    super(config.scene, config.x, config.y, 'LudoSprite');
    this.cursors = config.cursors;
    this.depth = DEPTH.PLAYER;
    config.scene.physics.add.existing(this, false);
    this.setCollideWorldBounds(true);
    this.anims.createFromAseprite('LudoSprite').forEach((anim) => {
      anim.repeat = -1;
    });
    this.setPosition(30, 400);
    //this.setCollideWorldBounds(true);
    if (!this.body) return;
    this.body.onCollide = true;
    this.setOriginalBodySize();
  }

  setOriginalBodySize() {
    if (!this.body) return;
    this.body.setOffset(this.body.width / 4, this.body.height / 2);
    this.body.setSize(this.body.width / 2, this.body.height / 2, false);
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
      dx = this.moveToTarget.x * SIZES.BLOCK - this.x;
      dy = this.moveToTarget.y * SIZES.BLOCK - this.y - 10;

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

    const defaultSpeed = 10;
    const speedX = leftDown ? -defaultSpeed : rightDown ? defaultSpeed : 0;
    const speedY = upDown ? -defaultSpeed : downDown ? defaultSpeed : 0;

    let animation: string =
      speedX < 0 ? 'left_move' : speedX > 0 ? 'right_move' : '';
    animation = speedY < 0 ? 'up_move' : speedY > 0 ? 'down_move' : animation;

    if (!animation) {
      animation = this.lastX === 'left' ? 'left_stop' : 'right_stop';
      animation =
        this.lastY === 'up'
          ? 'up_stop'
          : this.lastY === 'down'
            ? 'down_stop'
            : animation;
    } else {
      this.lastX = speedX < 0 ? 'left' : speedX > 0 ? 'right' : '';
      this.lastY = speedY < 0 ? 'up' : speedY > 0 ? 'down' : '';
    }
    this.setPosition(this.x + speedX, this.y + speedY);
    this.anims.play(animation, true);

    return leftDown || rightDown || upDown || downDown;
  }

  moveTo(target: Phaser.Math.Vector2) {
    this.moveToTarget = target;
  }

  updateMovement() {
    const speedX = this.cursors.left.isDown
      ? -this.velocity
      : this.cursors.right.isDown
        ? this.velocity
        : 0;
    const speedY = this.cursors.up.isDown
      ? -this.velocity
      : this.cursors.down.isDown
        ? this.velocity
        : 0;

    let animation: string =
      speedX < 0 ? 'left_move' : speedX > 0 ? 'right_move' : '';
    animation = speedY < 0 ? 'up_move' : speedY > 0 ? 'down_move' : animation;

    if (!animation) {
      animation = this.lastX === 'left' ? 'left_stop' : 'right_stop';
      animation =
        this.lastY === 'up'
          ? 'up_stop'
          : this.lastY === 'down'
            ? 'down_stop'
            : animation;
    } else {
      this.lastX = speedX < 0 ? 'left' : speedX > 0 ? 'right' : '';
      this.lastY = speedY < 0 ? 'up' : speedY > 0 ? 'down' : '';
    }
    this.setVelocity(speedX, speedY);
    this.anims.play(animation, true);
  }

  enterBuilding(door: OnTheFlySprite, scene: string | undefined) {
    if (!this.body) return;
    this.body.enable = false;

    const tweens = [
      {
        alpha: 0,
        scale: 0,
        y: door.y,
        duration: 1000,
        ease: 'Linear',
        onStart: () => {},
        onComplete: () => {
          console.log('PRUEBA');
        }
      }
    ];
    if (!scene) {
      tweens.push({
        alpha: 1,
        scale: 1,
        y: door.y + SIZES.THREE_BLOCKS,
        duration: 1000,
        ease: 'Linear',
        onStart: () => {
          this.anims.play('down_move', true);
        },
        onComplete: () => {
          this.body && (this.body.enable = true);
        }
      });
    }
    if (!scene)
      this.scene.tweens.chain({
        targets: this,
        tweens
      });
  }
}
