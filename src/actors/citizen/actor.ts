import { Think } from '../../AI/base/goals/Think';
import { EscapeEvaluator, WalkEvaluator } from './evaluators';
import { GameEntity, Props } from '../../AI/base/core/GameEntity';
import { DEPTH, SIZES } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/staticsCity';
import { Citizens } from './data/citizens.json';

export class CitizenActor extends GameEntity {
  brain: Think<CitizenActor>;
  isAfraid: boolean = false;
  isLazy: boolean = false;
  isAttacking: boolean = false;
  isHuntingTo: Phaser.GameObjects.GameObject | undefined;
  static baseScale: 0.7;
  info?: unknown;

  constructor(config: Props) {
    super({ ...config });
    this.prepareAnimsFromAseSprite();

    this.brain = new Think(this);

    this.brain.addEvaluator(new EscapeEvaluator());

    this.brain.addEvaluator(new WalkEvaluator());
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
    currentcitizen: CitizenActor,
    TOTAL_CITIZENS: number,
    firstIteration: boolean = false
  ): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;
    let valid: boolean = false;
    const validDistanceX = Statics.map.widthInPixels / TOTAL_CITIZENS / 2;
    const validDistanceY = Statics.map.heightInPixels / TOTAL_CITIZENS / 2;

    const validTiles: { tileX: number; tileY: number }[] = [];
    Statics.tilesNotTotallySafeForLivingBeings.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (Statics.tilesNotTotallySafeForLivingBeings[y][x] === 0)
          validTiles.push({ tileX: x, tileY: y });
      });
    });

    while (!valid) {
      let internalValid: boolean = true;
      const { tileX, tileY } =
        validTiles[Phaser.Math.Between(0, validTiles.length - 1)];

      if (Statics.tilesNotTotallySafeForLivingBeings[tileY][tileX] === 0) {
        x = tileX * SIZES.BLOCK;
        y = tileY * SIZES.BLOCK;
        if (firstIteration)
          Statics.groupOfCitizens.children.entries.forEach((citizen) => {
            const thecitizen = citizen as CitizenActor;
            if (thecitizen !== currentcitizen)
              if (
                Math.abs(thecitizen.x - x) < validDistanceX ||
                Math.abs(thecitizen.y - y) < validDistanceY
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
    citizen: CitizenActor,
    sizeOfArea: number = 10
  ): {
    x: number;
    y: number;
  } {
    const validTiles: { tileX: number; tileY: number }[] = [];
    const citizenTileXY = {
      x: Math.round(citizen.x / SIZES.BLOCK),
      y: Math.round(citizen.y / SIZES.BLOCK)
    };
    Statics.tilesNotTotallySafeForLivingBeings.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (Statics.tilesNotTotallySafeForLivingBeings[y][x] === 0) {
          if (
            Phaser.Math.Within(x, citizenTileXY.x, sizeOfArea) &&
            Phaser.Math.Within(y, citizenTileXY.y, sizeOfArea)
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

  static getNearestTotallySafePosition(citizen: CitizenActor): {
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
      x: Math.round(citizen.x / SIZES.BLOCK),
      y: Math.round(citizen.y / SIZES.BLOCK)
    };

    if (
      CitizenActor.getTotallySafeForLivingBeingsPosition(originPosition) === 0
    )
      return { ...originPosition, originTileIsSafe: true };

    let sum = 1;
    while (!valid) {
      const { x, y } = originPosition;
      if (
        CitizenActor.getTotallySafeForLivingBeingsPosition({
          x: x + sum,
          y: y
        }) === 0
      )
        return { x: x + sum, y: y, originTileIsSafe: false };
      if (
        CitizenActor.getTotallySafeForLivingBeingsPosition({
          x: x - sum,
          y: y
        }) === 0
      )
        return { x: x - sum, y: y, originTileIsSafe: false };
      if (
        CitizenActor.getTotallySafeForLivingBeingsPosition({
          x: x,
          y: y + sum
        }) === 0
      )
        return { x: x, y: y + sum, originTileIsSafe: false };
      if (
        CitizenActor.getTotallySafeForLivingBeingsPosition({
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

  static preloadCitizens(scene: Phaser.Scene) {
    Citizens.filter((citizen) => citizen.sprite).forEach((citizenInfo) => {
      scene.load.aseprite(
        citizenInfo.name || '',
        `assets/sprites/citizens/${citizenInfo.sprite}.webp`,
        `assets/sprites/citizens/${citizenInfo.sprite}.json`
      );
    });
  }

  static createCitizens(scene: Phaser.Scene) {
    Citizens.filter((citizen) => citizen.sprite).forEach((citizenInfo) => {
      const citizen = new CitizenActor({
        scene,
        x: 0,
        y: 0,
        texture: citizenInfo.name
      });
      citizen.info = citizenInfo;
      citizen.scale = CitizenActor.baseScale;
      citizen.setPushable(false);
      citizen.depth = DEPTH.CITIZENS;
      const { x, y } = CitizenActor.getValidPosition(
        citizen,
        Citizens.filter((citizen) => citizen.sprite).length - 1,
        true
      );
      citizen.setPosition(x, y);
      citizen.scale = 0.7;
      citizen.anims.play('stop_down', true);
      scene.add.existing(citizen);
      Statics.groupOfCitizens.add(citizen);
      scene.physics.add.collider(
        Statics.groupOfCitizens,
        Statics.groupEnemiesOfCitizens,
        undefined,
        (spriteCo) => {
          const citizen = spriteCo as CitizenActor;
          citizen.isAfraid = true;
        }
      );
    });
    Statics.groupOfCitizens.runChildUpdate = true;
  }
}
