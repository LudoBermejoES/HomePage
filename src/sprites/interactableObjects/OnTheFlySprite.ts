import * as Phaser from 'phaser';
import { SIZES, DEPTH } from '../../lib/constants';
import SpriteLudo from '../SpriteLudo';
import OverlapSprite from '../OverlapArea';
import { SpriteMovement } from '../../AI/base/core/SpriteMovement';
import InteractableObject from './InteractableObject';
interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  name: string;
  type: string;
  spriteLudo: SpriteLudo;
  gotoScene?: string;
}

export default class OnTheFlySprite extends InteractableObject {
  colliderArea?: Phaser.Physics.Arcade.Collider;
  type: string;
  needsTrigger: boolean = false;
  triggered: boolean = false;
  spriteOverlapArea?: Phaser.Physics.Arcade.Sprite;
  gotoScene: string | undefined;
  actorsInHere: (SpriteMovement | SpriteLudo)[] = [];
  config: Props;

  constructor(config: Props) {
    super(config);
    this.config = config;
    this.type = config.type || '';
    this.gotoScene = config.gotoScene || undefined;
    this.depth = this.getDepth();
    this.visible = true;
    this.createAreaIfNeeded(config);
    this.setPipeline('Light2D');
    this.depth = this.getDepth();

    this.setOrigin(0, 0);
    config.scene.physics.add.existing(this, true);
    this.anims.createFromAseprite(config.name);
    if (this.anims.get('default')) {
      this.anims.get('default').repeat = -1;
      this.anims.play('default', true);
    } else {
      this.setFrame(0);
    }
    this.createCollider(config);
  }

  getDepth() {
    return this.type.toLowerCase().includes('door')
      ? DEPTH.DOOR_SPRITES
      : DEPTH.ON_THE_FLY_OBJECTS_ABOVE_PLAYER;
  }
  createAreaIfNeeded(config: Props) {
    this.needsTrigger = false;
    if (this.type.toLowerCase().includes('door')) {
      this.setInteractive({ useHandCursor: true });

      this.preparePointerEvents();
      this.spriteOverlapArea = new OverlapSprite({
        ...config,
        parent: this
      });
      this.needsTrigger = true;
    }
  }
  createCollider(config: Props) {
    this.body?.setSize(this.width, SIZES.BLOCK, true);
    this.collider = config.scene.physics.add.overlap(
      this,
      config.spriteLudo,
      () => {
        if (this.needsTrigger && !this.triggered) return;
        if (!config.spriteLudo) return;
        if (config.type === 'door') {
          if (!config.spriteLudo.movePath.length)
            config.spriteLudo.enterBuilding(this);
          this.triggered = false;
          this.onEnterArea();
        }
      }
    );
  }

  onEnterArea() {
    if (this.type.toLowerCase().includes('door')) {
      this.anims.play('open_door', true);
      this.prepareOver(this.config);

      this.triggered = true;
    }

    return false;
  }
  onLeaveArea() {
    if (this.type.toLowerCase().includes('door')) {
      this.removeOver();

      this.triggered = false;
      this.anims.play('close_door', true);
    }
  }
}
