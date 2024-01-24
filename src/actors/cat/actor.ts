import { Think } from '../../AI/base/goals/Think';
import {
  AttackEvaluator,
  EscapeEvaluator,
  LazyEvaluator,
  WalkEvaluator,
  PursueEvaluator
} from './evaluators';
import { GameEntity } from '../../AI/base/core/GameEntity';
import { DEPTH } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/statics';
import { Props } from '../../AI/base/core/SpriteMovement';
export class CatActor extends GameEntity {
  brain: Think<CatActor>;
  isAfraid: boolean = false;
  isLazy: boolean = false;
  isAttacking: boolean = false;
  isHuntingTo: Phaser.GameObjects.GameObject | undefined;
  static TOTAL_CATS: number = 0;
  velocity: number = 125;
  velocityEscape: number = 150;
  velocityHunt: number = 150;
  velocityLazy: number = 150;

  constructor(config: Props) {
    super({ ...config, texture: 'CatSprite' });
    this.prepareAnimsFromAseSprite();

    this.brain = new Think(this);

    this.brain.addEvaluator(new AttackEvaluator());
    this.brain.addEvaluator(new EscapeEvaluator());
    this.brain.addEvaluator(new LazyEvaluator());

    this.brain.addEvaluator(new WalkEvaluator());
    this.brain.addEvaluator(new PursueEvaluator());
    if (this.body) this.body.immovable = false;
  }

  update() {
    super.update();
    if (this.brain) {
      this.brain?.execute();
      this.brain?.arbitrate();
    }
  }

  static createCats(scene: Phaser.Scene, TOTAL_CATS: number) {
    CatActor.TOTAL_CATS = TOTAL_CATS;
    for (let i = 0; i < TOTAL_CATS; i++) {
      const cat = new CatActor({
        scene,
        x: 0,
        y: 0
      });
      cat.scale = 1.5;
      cat.setPushable(false);
      cat.depth = DEPTH.FLOOR_ANIMALS;
      const { x, y } = CatActor.getValidPositionForNotFlyingCreatures(
        cat,
        TOTAL_CATS,
        true,
        Statics.groupOfCats
      );
      cat.setPosition(x, y);
      cat.anims.play('wait_down', true);
      scene.add.existing(cat);
      Statics.groupOfCats.add(cat);
    }

    Statics.groupOfCats.runChildUpdate = true;
    scene.physics.add.overlap(
      Statics.groupOfCats,
      Statics.groupEnemiesOfCat,
      undefined,
      (spriteCo) => {
        const cat = spriteCo as CatActor;
        cat.isAfraid = true;
      }
    );
  }
}
