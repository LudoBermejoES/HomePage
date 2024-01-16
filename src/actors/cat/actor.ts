import { Think } from '../../AI/base/goals/Think';
import { WalkEvaluator, PursueEvaluator } from './evaluators';
import { GameEntity, Props } from '../../AI/base/core/GameEntity';
import { DEPTH, SIZES } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/staticsCity';

export class CatActor extends GameEntity {
  brain: Think<CatActor>;
  isAfraid: boolean = false;
  isLazy: boolean = false;
  isHuntingTo: Phaser.GameObjects.GameObject | undefined;
  static TOTAL_CATS: number = 0;

  constructor(config: Props) {
    super({ ...config, texture: 'CatSprite' });
    this.prepareAnimsFromAseSprite();

    this.brain = new Think(this);

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

  static getValidPosition(
    currentcat: CatActor,
    TOTAL_CATS: number,
    firstIteration: boolean = false
  ): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;
    let valid: boolean = false;
    const validDistanceX = Statics.map.widthInPixels / TOTAL_CATS / 2;
    const validDistanceY = Statics.map.heightInPixels / TOTAL_CATS / 2;

    const validTiles: { tileX: number; tileY: number }[] = [];
    Statics.tilesNotSafeForLivingBeings.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (Statics.tilesNotSafeForLivingBeings[y][x] === 0)
          validTiles.push({ tileX: x, tileY: y });
      });
    });

    while (!valid) {
      let internalValid: boolean = true;
      const { tileX, tileY } =
        validTiles[Phaser.Math.Between(0, validTiles.length - 1)];

      if (Statics.tilesNotSafeForLivingBeings[tileY][tileX] === 0) {
        x = tileX * SIZES.BLOCK;
        y = tileY * SIZES.BLOCK;
        if (firstIteration)
          Statics.groupOfCats.children.entries.forEach((cat) => {
            const thecat = cat as CatActor;
            if (thecat !== currentcat)
              if (
                Math.abs(thecat.x - x) < validDistanceX ||
                Math.abs(thecat.y - y) < validDistanceY
              ) {
                internalValid = false;
              }
          });
      } else {
        internalValid = false;
      }
      valid = internalValid;
    }
    return {
      x,
      y
    };
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
      cat.depth = DEPTH.FLOOR_ANIMALS;
      const { x, y } = CatActor.getValidPosition(cat, TOTAL_CATS, true);
      cat.setPosition(x, y);
      cat.anims.play('wait', true);
      scene.add.existing(cat);
      Statics.groupOfCats.add(cat);
    }

    Statics.groupOfCats.runChildUpdate = true;
    scene.physics.add.collider(
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
