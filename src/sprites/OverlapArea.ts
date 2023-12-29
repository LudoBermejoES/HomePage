import * as Phaser from 'phaser';
import { DEPTH, SIZES } from '../lib/constants';
import SpriteLudo from './SpriteLudo';
import OnTheFlySprite from './OnTheFlySprite';
interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
  type: string;
  spriteLudo: SpriteLudo;
  parent: OnTheFlySprite;
}

export default class OverlapSprite extends Phaser.Physics.Arcade.Sprite {
  collider?: Phaser.Physics.Arcade.Collider;
  overlapping: boolean = false;

  constructor(config: Props) {
    super(
      config.scene,
      config.x,
      config.y,
      'overlapArea' + config.x + config.y
    );
    this.type = config.type;
    this.depth = DEPTH.OBJECTS;
    this.visible = true;
    this.setOrigin(0, 0);
    config.scene.physics.add.existing(this, true);
    this.createAreaByType(config);
    this.createCollider(config);
  }

  createAreaByType(config: Props) {
    const { type } = config;
    if (!this?.body) return;
    if (type === 'door') {
      config.scene.time.delayedCall(
        1000,
        () => {
          this.body?.setSize(SIZES.THREE_BLOCKS, SIZES.DOUBLE_BLOCK, true);
          this.body?.setOffset(-SIZES.BLOCK, config.parent.height);
        },
        [],
        this
      );
    } else {
      this.body.setSize(
        config.parent.width + SIZES.DOUBLE_BLOCK,
        config.parent.height + SIZES.DOUBLE_BLOCK,
        true
      );
      this.body?.setOffset(-SIZES.BLOCK, -SIZES.BLOCK);
    }
  }

  createCollider(config: Props) {
    this.collider = config.scene.physics.add.overlap(
      this,
      config.spriteLudo,
      () => {
        if (!this.collider) return;
        this.collider.update = () => {
          super.update();
          if (!this.scene.physics.overlap(this, config.spriteLudo)) {
            this.onLeave(config);
          }
        };
        return this.onEnter(config);
      }
    );
  }
  onEnter(config: Props) {
    if (this.overlapping) return;
    if (this.type === 'door') {
      this.anims.play('open_door', true);
    }
    this.overlapping = true;
    config.parent.onEnterArea();
    return false;
  }
  onLeave(config: Props) {
    const collider = this.collider;
    if (!collider) return;
    this.overlapping = false;
    collider.destroy();
    this.anims.play('close_door', true);
    config.parent.onLeaveArea();
    this.createCollider(config);
  }
}
