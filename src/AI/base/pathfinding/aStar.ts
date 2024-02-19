import { AStarFinder } from 'astar-typescript';
import { GameEntity } from '../core/GameEntity';
import BaseScene from '../../../scenes/baseScene';
import * as Phaser from 'phaser';

export default class Pathfinding {
  aStarInstance: AStarFinder;

  constructor(matrix: number[][]) {
    this.aStarInstance = new AStarFinder({
      grid: {
        matrix
      },
      diagonalAllowed: true,
      includeStartNode: false,
      includeEndNode: true,
      allowPathAsCloseAsPossible: true
    });
  }

  moveFromEntityToEntity(
    origin: GameEntity,
    target: GameEntity
  ): Phaser.Math.Vector2[] | undefined {
    const scene = origin.scene as BaseScene;
    const startVec = scene.getValidTileForSafeWalk(origin.x, origin.y);
    const targetVec = scene.getValidTileForSafeWalk(target.x, target.y);
    if (!startVec || !targetVec) return;
    const path = this.aStarInstance.findPath(startVec, targetVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    return vectorPath;
  }

  moveTotallySafeFromEntityToEntity(
    origin: GameEntity,
    target: GameEntity
  ): Phaser.Math.Vector2[] | undefined {
    const scene = origin.scene as BaseScene;
    const startVec = scene.getValidTileForTotallySafeWalk(origin.x, origin.y);
    const targetVec = scene.getValidTileForTotallySafeWalk(target.x, target.y);
    console.log('Voy de ', startVec, 'a', targetVec);
    if (!startVec || !targetVec) return;
    const path = this.aStarInstance.findPath(startVec, targetVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    return vectorPath;
  }

  moveTotallySafeFromEntityToPoint(
    origin: GameEntity,
    target: Phaser.Math.Vector2
  ): Phaser.Math.Vector2[] | undefined {
    const scene = origin.scene as BaseScene;
    const startVec = scene.getValidTileForTotallySafeWalk(origin.x, origin.y);
    const endVec = scene.getValidTileForTotallySafeWalk(target.x, target.y);
    if (!startVec || !endVec) return;
    const path = this.aStarInstance.findPath(startVec, endVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    return vectorPath;
  }

  moveEntityToTile(
    origin: GameEntity,
    { x, y }: { x: number; y: number }
  ): Phaser.Math.Vector2[] | undefined {
    const scene = origin.scene as BaseScene;
    const startVec = scene.getValidTileForSafeWalk(origin.x, origin.y);
    const endVec = { x, y };
    if (!startVec || !endVec) return;
    const path = this.aStarInstance.findPath(startVec, endVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    return vectorPath;
  }

  moveSafeFromEntityToPoint(
    origin: GameEntity,
    target: Phaser.Math.Vector2
  ): Phaser.Math.Vector2[] | undefined {
    const scene = origin.scene as BaseScene;
    const startVec = scene.getValidTileForSafeWalk(origin.x, origin.y);
    const endVec = scene.getValidTileForSafeWalk(target.x, target.y);
    if (!startVec || !endVec) return;
    const path = this.aStarInstance.findPath(startVec, endVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    return vectorPath;
  }
}
