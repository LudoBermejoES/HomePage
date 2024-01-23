import * as Phaser from 'phaser';
import { DEPTH } from '../lib/constants';
import SpriteLudo from './SpriteLudo';
import { ActionList } from '../scenes/baseScene';
interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
  spriteLudo: SpriteLudo;
  actions?: ActionList;
}

export default class OnTheFlyImage extends Phaser.Physics.Arcade.Image {
  collider?: Phaser.Physics.Arcade.Collider;
  actionList?: ActionList;
  glow?: Phaser.FX.Glow;
  timer?: Phaser.Time.TimerEvent;
  config: Props;

  constructor(config: Props) {
    super(config.scene, config.x, config.y, config.name);
    this.depth = this.getDepth();
    this.actionList = config.actions;
    this.visible = true;
    this.setOrigin(0, 0);
    this.config = config;

    this.prepareForActions(config);
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

    this.on('pointerover', () => {
      if (!this.glow) this.glow = this.preFX?.addGlow();
    });
    this.on('pointerout', () => {
      if (this.glow) {
        this.glow.destroy();
        this.glow = undefined;
      }
    });
  }

  getDepth() {
    return DEPTH.ON_THE_FLY_OBJECTS;
  }

  createCollider(config: Props) {
    this.collider = config.scene.physics.add.overlap(
      this,
      config.spriteLudo,
      () => {
        if (!this.glow) this.glow = this.preFX?.addGlow();
        if (!this.timer) {
          this.timer = config.scene.time.addEvent({
            delay: 100, // ms
            callback: () => {
              if (!config.scene.physics.collide(this, config.spriteLudo)) {
                this.glow?.destroy();
                this.timer?.destroy();
                this.glow = undefined;
                this.timer = undefined;
              }
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
