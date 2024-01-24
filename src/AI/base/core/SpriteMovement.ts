import * as Phaser from 'phaser';

import { SIZES } from '../../../lib/constants';
import Statics from '../../../actors/statics/statics';
import OnTheFlyImage from '../../../sprites/OnTheFlyImage';
import OnTheFlySprite from '../../../sprites/OnTheFlySprite';

export interface Props {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture?: string;
}

export abstract class SpriteMovement extends Phaser.Physics.Arcade.Sprite {
  movePath: Phaser.Math.Vector2[] | undefined;
  moveToTarget: Phaser.Math.Vector2 | undefined;
  speedToMove: number = 10;
  /** config */
  config: Props;
  action: '';

  constructor(config: Props) {
    /**
     * The name of this game entity.
     * @type {String}
     */
    if (!config.texture) return;
    super(config.scene, config.x, config.y, config.texture);
    this.name = '';
    this.scene.physics.add.existing(this, false);
    this.setBounce(0);
    this.setPipeline('Light2D');
    this.config = config;
  }

  updatePathMovement(
    minDistanceX: number = 5,
    minDistanceY: number = 5
  ): boolean {
    this.debugShowVelocity = true;

    let dx = 0;
    let dy = 0;
    if (!this.body) return false;
    if (this.moveToTarget) {
      dx =
        this.moveToTarget.x * SIZES.BLOCK +
        SIZES.MID_BLOCK -
        (this.x + this.body.width / 2);
      dy =
        this.moveToTarget.y * SIZES.BLOCK +
        +SIZES.MID_BLOCK -
        (this.y + this.body.height / 2);

      if (Math.abs(dx) < minDistanceX) {
        dx = 0;
      }
      if (Math.abs(dy) < minDistanceY) {
        dy = 0;
      }

      if (dx === 0 && dy === 0) {
        if (this.movePath && this.movePath.length > 0) {
          this.moveTo(this.movePath.shift()!);
          return true;
        }

        this.moveToTarget = undefined;
      }
    }
    const leftDown = dx < 0;
    const rightDown = dx > 0;
    const upDown = dy < 0;
    const downDown = dy > 0;
    const speedX = leftDown
      ? -this.speedToMove
      : rightDown
        ? this.speedToMove
        : 0;

    const speedY = upDown ? -this.speedToMove : downDown ? this.speedToMove : 0;

    const ANIMATION_NAMES = this.getAnimationNames();
    let animation: string =
      speedX < 0
        ? ANIMATION_NAMES.LEFT
        : speedX > 0
          ? ANIMATION_NAMES.RIGHT
          : '';
    animation =
      speedY < 0
        ? ANIMATION_NAMES.UP
        : speedY > 0
          ? ANIMATION_NAMES.DOWN
          : animation;

    this.setVelocity(speedX, speedY);
    if (!this.anims.get(animation)) {
      console.log(this);
    }
    this.anims.play(animation, true);

    return leftDown || rightDown || upDown || downDown;
  }
  moveAlongPath(path: Phaser.Math.Vector2[], speedToMove: number) {
    this.speedToMove = speedToMove;
    this.movePath = path;
    if (this.movePath.length > 0) {
      this.moveTo(this.movePath.shift()!);
    }
  }

  moveTo(target: Phaser.Math.Vector2) {
    this.moveToTarget = target;
  }

  getAnimationNames(): {
    LEFT: string;
    RIGHT: string;
    UP: string;
    DOWN: string;
  } {
    if (this.anims.get('left_move')) {
      return {
        LEFT: 'left_move',
        RIGHT: 'right_move',
        UP: 'up_move',
        DOWN: 'down_move'
      };
    } else {
      return {
        LEFT: 'move_left',
        RIGHT: 'move_right',
        UP: 'move_up',
        DOWN: 'move_down'
      };
    }
  }

  static getValidPositionForFlyingCreatures(
    currentActor: SpriteMovement,
    TOTAL_ACTORS: number,
    groupOfActors: Phaser.GameObjects.Group
  ): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;
    let valid: boolean = false;
    const validDistanceX = Statics.map.widthInPixels / TOTAL_ACTORS / 2;
    const validDistanceY = Statics.map.heightInPixels / TOTAL_ACTORS / 2;
    while (!valid) {
      let internalValid: boolean = true;
      x = Phaser.Math.Between(10, Statics.map.widthInPixels);
      y = Phaser.Math.Between(10, Statics.map.heightInPixels);
      groupOfActors.children.entries.forEach((actor) => {
        const theActor = actor as SpriteMovement;
        if (theActor !== currentActor)
          if (
            Math.abs(theActor.x - x) < validDistanceX ||
            Math.abs(theActor.y - y) < validDistanceY
          ) {
            internalValid = false;
          }
      });
      valid = internalValid;
    }
    return {
      x,
      y
    };
  }

  static getValidPositionForCitizens(
    currentcitizen: SpriteMovement,
    TOTAL_CITIZENS: number,
    firstIteration: boolean = false,
    groupOfActors: Phaser.GameObjects.Group
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
          groupOfActors.children.entries.forEach((citizen) => {
            const thecitizen = citizen as SpriteMovement;
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

  static getNearestTotallySafePosition(originPosition: {
    x: number;
    y: number;
  }): {
    x: number;
    y: number;
    originTileIsSafe: boolean;
  } {
    const valid = false;

    const validTiles: { tileX: number; tileY: number }[] = [];
    Statics.tilesNotTotallySafeForLivingBeings.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (Statics.tilesNotTotallySafeForLivingBeings[y][x] === 0)
          validTiles.push({ tileX: x, tileY: y });
      });
    });
    if (
      SpriteMovement.getTotallySafeForLivingBeingsPosition(originPosition) === 0
    )
      return { ...originPosition, originTileIsSafe: true };

    let sum = 1;
    while (!valid) {
      const { x, y } = originPosition;
      if (
        SpriteMovement.getTotallySafeForLivingBeingsPosition({
          x: x + sum,
          y: y
        }) === 0
      )
        return { x: x + sum, y: y, originTileIsSafe: false };
      if (
        SpriteMovement.getTotallySafeForLivingBeingsPosition({
          x: x - sum,
          y: y
        }) === 0
      )
        return { x: x - sum, y: y, originTileIsSafe: false };
      if (
        SpriteMovement.getTotallySafeForLivingBeingsPosition({
          x: x,
          y: y + sum
        }) === 0
      )
        return { x: x, y: y + sum, originTileIsSafe: false };
      if (
        SpriteMovement.getTotallySafeForLivingBeingsPosition({
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

  static getNearestTotallySafePositionForPosition(pos: Phaser.Math.Vector2): {
    x: number;
    y: number;
    originTileIsSafe: boolean;
  } {
    const originPosition = {
      x: Math.round(pos.x / SIZES.BLOCK),
      y: Math.round(pos.y / SIZES.BLOCK)
    };
    return SpriteMovement.getNearestTotallySafePosition(originPosition);
  }

  static getNearestTotallySafePositionForObject(
    actor: SpriteMovement | OnTheFlyImage | OnTheFlySprite
  ): {
    x: number;
    y: number;
    originTileIsSafe: boolean;
  } {
    const originPosition = {
      x: Math.round(actor.x / SIZES.BLOCK),
      y: Math.round(actor.y / SIZES.BLOCK)
    };
    return SpriteMovement.getNearestTotallySafePosition(originPosition);
  }

  static getRandomTotallySafePositionNearOwner(
    citizen: SpriteMovement | OnTheFlyImage | OnTheFlySprite,
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

  static getValidPositionForNotFlyingCreatures(
    actor: SpriteMovement,
    TOTAL_CREATURES: number,
    firstIteration: boolean = false,
    groupOfActors: Phaser.GameObjects.Group
  ): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;
    let valid: boolean = false;
    const validDistanceX = Statics.map.widthInPixels / TOTAL_CREATURES / 2;
    const validDistanceY = Statics.map.heightInPixels / TOTAL_CREATURES / 2;

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
          groupOfActors.children.entries.forEach((cat) => {
            const thecat = cat as SpriteMovement;
            if (thecat !== actor)
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
}
