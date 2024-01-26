import * as Phaser from 'phaser';
import { SpriteMovement } from '../../AI/base/core/SpriteMovement';
import SpriteLudo from '../SpriteLudo';
import { ActionList } from '../../scenes/baseScene';
import { DEPTH } from '../../lib/constants';

interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
  spriteLudo: SpriteLudo;
  actions?: ActionList;
  maxActors?: number;
  gotoScene?: string;
}

export default class InteractableObject extends Phaser.Physics.Arcade.Sprite {
  actorsInHere: (SpriteMovement | SpriteLudo)[] = [];
  maxActorsInHere: number = 1;
  collider?: Phaser.Physics.Arcade.Collider;
  actionList?: ActionList;
  glow?: Phaser.FX.Glow;
  timer?: Phaser.Time.TimerEvent;
  config: Props;
  pressE: Phaser.GameObjects.Sprite | undefined;

  static currentObject: InteractableObject | undefined;

  constructor(config: Props) {
    super(config.scene, config.x, config.y, config.name);
    this.depth = this.getDepth();
    this.actionList = config.actions;
    this.visible = true;
    this.maxActorsInHere = config.maxActors || 1;
    this.setOrigin(0, 0);
    this.config = config;
    this.setPipeline('Light2D');

    this.prepareForActions(config);
  }

  addActor(sprite: SpriteMovement | SpriteLudo) {
    this.actorsInHere.push(sprite);
  }
  removeActor(sprite: SpriteMovement | SpriteLudo) {
    this.actorsInHere.splice(this.actorsInHere.indexOf(sprite), 1);
  }

  getDepth() {
    return DEPTH.ON_THE_FLY_OBJECTS;
  }

  areThereFreeSpots() {
    if (this.actorsInHere.length === this.maxActorsInHere - 1) {
      return false;
    }
    return true;
  }

  prepareForActions(config: Props) {
    if (!this.actionList) return;
    this.actionList.object = this;
    this.createCollider(config);
    config.scene.physics.add.existing(this, true);
    this.setInteractive({ useHandCursor: true });
    if (this.body) {
      this.body.immovable = false;
      this.body.setSize(
        this.body.width + (this.body.width * 20) / 100,
        this.body.height + (this.body.height * 20) / 100,
        true
      );
      4;
      this.body.y += (this.body.height - this.height) / 2;
    }
    this.preparePointerEvents();
  }

  preparePointerEvents() {
    this.on('pointerover', () => {
      if (!this.glow) this.glow = this.postFX?.addGlow();
    });
    this.on('pointerout', () => {
      this.removeOver();
    });
  }

  prepareOver(config: Props) {
    InteractableObject.currentObject = this;
    if (!this.glow) this.glow = this.postFX?.addGlow();
    if (!this.pressE) {
      this.pressE = config.scene.add.sprite(
        this.x + this.width / 2,
        this.y - 20,
        'PressE'
      );

      this.pressE.scale = 0.7;

      this.pressE.anims.createFromAseprite('PressE').forEach((anim) => {
        anim.repeat = -1;
      });
      this.pressE.anims.play('press');
    }
  }

  removeOver() {
    if (this.timer) {
      this.timer.destroy();
      this.timer = undefined;
    }
    if (this.glow) {
      this.postFX.remove(this.glow);
      this.glow.destroy();
      this.glow = undefined;
    }
    if (this.pressE) {
      this.pressE.destroy();
      this.pressE = undefined;
    }
    InteractableObject.currentObject = undefined;
  }

  createCollider(config: Props) {
    this.collider = config.scene.physics.add.overlap(
      this,
      config.spriteLudo,
      () => {
        this.prepareOver(config);
        if (!this.timer) {
          this.timer = config.scene.time.addEvent({
            delay: 100, // ms
            callback: () => {
              if (!config.scene.physics.overlap(this, config.spriteLudo))
                this.removeOver();
            },
            loop: true
          });
        }
      },
      undefined,
      this
    );
  }
}
