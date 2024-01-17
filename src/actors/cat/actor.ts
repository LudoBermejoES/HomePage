import { Think } from '../../AI/base/goals/Think';
import {
  AttackEvaluator,
  EscapeEvaluator,
  LazyEvaluator,
  WalkEvaluator,
  PursueEvaluator
} from './evaluators';
import { GameEntity, Props } from '../../AI/base/core/GameEntity';
import { DEPTH, SIZES } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/staticsCity';

export class CatActor extends GameEntity {
  brain: Think<CatActor>;
  isAfraid: boolean = false;
  isLazy: boolean = false;
  isAttacking: boolean = false;
  isHuntingTo: Phaser.GameObjects.GameObject | undefined;
  static TOTAL_CATS: number = 0;

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

  static getRandomTotallySafePositionNearOwner(
    cat: CatActor,
    sizeOfArea: number = 10
  ): {
    x: number;
    y: number;
  } {
    const validTiles: { tileX: number; tileY: number }[] = [];
    const catTileXY = {
      x: Math.round(cat.x / SIZES.BLOCK),
      y: Math.round(cat.y / SIZES.BLOCK)
    };
    Statics.tilesNotTotallySafeForLivingBeings.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (Statics.tilesNotTotallySafeForLivingBeings[y][x] === 0) {
          if (
            Phaser.Math.Within(x, catTileXY.x, sizeOfArea) &&
            Phaser.Math.Within(y, catTileXY.y, sizeOfArea)
          ) {
            validTiles.push({ tileX: x, tileY: y });
          }
        }
      });
    });

    const { tileX, tileY } =
      validTiles[Phaser.Math.Between(0, validTiles.length - 1)];

    return {
      x: tileX,
      y: tileY
    };
  }

  static getTotallySafeForLivingBeingsPosition({
    x,
    y
  }: {
    x: number;
    y: number;
  }): number | undefined {
    if (
      Statics.tilesNotTotallySafeForLivingBeings[y] &&
      Statics.tilesNotTotallySafeForLivingBeings[y][x] !== undefined
    ) {
      return Statics.tilesNotTotallySafeForLivingBeings[y][x];
    }
    return undefined;
  }

  static getNearestTotallySafePosition(cat: CatActor): {
    x: number;
    y: number;
    originTileIsSafe: boolean;
  } {
    const validTiles: { tileX: number; tileY: number }[] = [];
    Statics.tilesNotTotallySafeForLivingBeings.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (Statics.tilesNotTotallySafeForLivingBeings[y][x] === 0)
          validTiles.push({ tileX: x, tileY: y });
      });
    });
    const valid = false;
    const originPosition = {
      x: Math.round(cat.x / SIZES.BLOCK),
      y: Math.round(cat.y / SIZES.BLOCK)
    };

    if (CatActor.getTotallySafeForLivingBeingsPosition(originPosition) === 0)
      return { ...originPosition, originTileIsSafe: true };

    let sum = 1;
    while (!valid) {
      const { x, y } = originPosition;
      if (
        CatActor.getTotallySafeForLivingBeingsPosition({ x: x + sum, y: y }) ===
        0
      )
        return { x: x + sum, y: y, originTileIsSafe: false };
      if (
        CatActor.getTotallySafeForLivingBeingsPosition({
          x: x - sum,
          y: y
        }) === 0
      )
        return { x: x - sum, y: y, originTileIsSafe: false };
      if (
        CatActor.getTotallySafeForLivingBeingsPosition({
          x: x,
          y: y + sum
        }) === 0
      )
        return { x: x, y: y + sum, originTileIsSafe: false };
      if (
        CatActor.getTotallySafeForLivingBeingsPosition({
          x: x,
          y: y - sum
        }) === 0
      )
        return { x: x, y: y - sum, originTileIsSafe: false };
      sum++;
    }
    return {
      x: 0,
      y: 0,
      originTileIsSafe: false
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
      cat.setPushable(false);
      cat.depth = DEPTH.FLOOR_ANIMALS;
      const { x, y } = CatActor.getValidPosition(cat, TOTAL_CATS, true);
      cat.setPosition(x, y);
      cat.anims.play('wait_down', true);
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
