import * as Phaser from 'phaser';
import { SIZES, DEPTH } from '../lib/constants';
import OnTheFlySprite from './interactableObjects/OnTheFlySprite';
import { ActionList } from '../scenes/baseScene';
import ActionController from '../actions/ActionController';
import InteractableObject from './interactableObjects/InteractableObject';

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
  scaleByDefault: number = 0.7;
  actionsToExecute: ActionList | undefined;
  action: string | undefined;
  keyPress: Phaser.Input.Keyboard.Key | undefined;

  constructor(config: LudoProps) {
    super(config.scene, config.x, config.y, 'LudoSprite');
    this.cursors = config.cursors;
    this.depth = DEPTH.PLAYER;
    this.setPipeline('Light2D');
    config.scene.physics.add.existing(this, false);
    this.setCollideWorldBounds(true);
    this.anims.createFromAseprite('LudoSprite').forEach((anim) => {
      anim.repeat = -1;
    });
    this.setPosition(30, 400);
    this.setScale(this.scaleByDefault);
    //this.setCollideWorldBounds(true);
    if (!this.body) return;
    this.body.onCollide = true;
    this.name = 'ludo';

    this.keyPress = this.scene.input?.keyboard
      ?.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      .on('down', () => {
        const actions = InteractableObject.currentObject?.actionList;
        if (actions) {
          this.setVelocity(0, 0);
          this.action = 'wait';
          ActionController.executeActions(this, actions);
        } else if (InteractableObject.currentObject?.type === 'door') {
          this.enterBuilding(
            InteractableObject.currentObject as OnTheFlySprite
          );
        }
      });

    this.setOriginalBodySize();
  }

  setOriginalBodySize() {
    if (!this.body) return;
    this.body.setOffset(this.body.width / 4, this.body.height / 2);
    this.body.setSize(this.body.width / 2, this.body.height / 2, false);
  }

  moveAlongPath(
    path: Phaser.Math.Vector2[],
    actionsToExecute?: ActionList | undefined
  ) {
    this.actionsToExecute = actionsToExecute;
    this.movePath = path;
    if (this.movePath.length > 0) {
      this.moveTo(this.movePath.shift()!);
    }
  }

  updatePathMovement(): boolean {
    if (!this.body) return false;
    this.body.enable = true;

    let dx = 0;
    let dy = 0;

    if (this.moveToTarget) {
      dx =
        this.moveToTarget.x * SIZES.BLOCK +
        SIZES.MID_BLOCK -
        (this.x + this.body.width / 2);
      dy =
        this.moveToTarget.y * SIZES.BLOCK +
        +SIZES.MID_BLOCK -
        (this.y + this.body.height / 2);

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
        this.setVelocity(0, 0);
        if (this.actionsToExecute) {
          this.action = 'wait';
          ActionController.executeActions(this, this.actionsToExecute);
        }
        this.moveToTarget = undefined;
        return false;
      }
    }

    const leftDown = dx < 0;
    const rightDown = dx > 0;
    const upDown = dy < 0;
    const downDown = dy > 0;

    const speedX = leftDown ? -this.velocity : rightDown ? this.velocity : 0;
    const speedY = upDown ? -this.velocity : downDown ? this.velocity : 0;

    let animation: string =
      speedX < 0 ? 'move_left' : speedX > 0 ? 'move_right' : '';
    animation = speedY < 0 ? 'move_up' : speedY > 0 ? 'move_down' : animation;

    if (!animation) {
      animation = this.lastX === 'left' ? 'stop_left' : 'stop_right';
      animation =
        this.lastY === 'up'
          ? 'stop_up'
          : this.lastY === 'down'
            ? 'stop_down'
            : animation;
    } else {
      this.lastX = speedX < 0 ? 'left' : speedX > 0 ? 'right' : '';
      this.lastY = speedY < 0 ? 'up' : speedY > 0 ? 'down' : '';
    }
    this.setVelocity(speedX, speedY);

    if (!this.action) {
      this.anims.play(animation, true);
    }

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
      speedX < 0 ? 'move_left' : speedX > 0 ? 'move_right' : '';
    animation = speedY < 0 ? 'move_up' : speedY > 0 ? 'move_down' : animation;

    if (!animation) {
      animation = this.lastX === 'left' ? 'stop_left' : 'stop_right';
      animation =
        this.lastY === 'up'
          ? 'stop_up'
          : this.lastY === 'down'
            ? 'stop_down'
            : animation;
    } else {
      this.lastX = speedX < 0 ? 'left' : speedX > 0 ? 'right' : '';
      this.lastY = speedY < 0 ? 'up' : speedY > 0 ? 'down' : '';
    }
    this.setVelocity(speedX, speedY);
    if (!this.action) this.anims.play(animation, true);
  }

  enterBuilding(door: OnTheFlySprite) {
    if (!this.body) return;
    this.setVelocity(0, 0);
    this.action = 'enterBuilding';
    this.anims.play('move_up', true);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0,
      y: door.y,
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        this.action = '';
      }
    });
  }
  leaveBuilding() {
    if (this.body) this.body.enable = false;
    this.alpha = 0;
    this.scale = 0;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: this.scaleByDefault,
      y: this.y + SIZES.THREE_BLOCKS,
      duration: 1000,
      ease: 'Linear',
      onStart: () => {
        this.anims.play('move_down', true);
      },
      onComplete: () => {
        this.body && (this.body.enable = true);
      }
    });
  }
}
