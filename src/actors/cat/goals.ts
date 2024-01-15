import { Goal } from '../../AI/base/goals/Goal';
import { CatActor } from './actor';
import Pathfinding from '../../AI/base/pathfinding/aStar';
import Statics from '../statics/staticsCity';
import { GameEntity } from '../../AI/base/core/GameEntity';
import * as Phaser from 'phaser';
import { CrowActor } from '../crow/actor';

class WalkGoal extends Goal<CatActor> {
  MOVE_SPEED = 0.5;
  timerEvent: Phaser.Time.TimerEvent | undefined;
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;
  }

  execute() {
    const owner = this.owner;
    if (!owner) return;
    if (owner.movePath && owner.movePath.length) {
      if (owner.isBored && !this.timerEvent) {
        this.timerEvent = owner.scene.time.delayedCall(2000, () => {
          owner.isBored = false;
          this.timerEvent = undefined;
        });
      }

      owner.updatePathMovement();
      if (this.lastPosToGo) return;
    }

    if (
      this.lastPosToGo &&
      Math.abs(this.lastPosToGo.x - owner.x) < 10 &&
      Math.abs(this.lastPosToGo.y - owner.y) < 10
    ) {
      this.status = Goal.STATUS.COMPLETED;
      return;
    }

    const pathFinding = new Pathfinding(Statics.tilesNotSafeForLivingBeings);
    const { x, y } = CatActor.getValidPosition(owner, CatActor.TOTAL_CATS);
    const path = pathFinding.moveSafeFromEntityToPoint(
      owner,
      new Phaser.Math.Vector2(x, y)
    );

    if (path) {
      this.lastPosToGo = new Phaser.Math.Vector2(x, y);
      owner.moveAlongPath(path, this.MOVE_SPEED);
    } else {
      owner.x = x;
      owner.y = y;
    }

    this.replanIfFailed();
  }

  terminate() {}
}

class BoredGoal extends Goal<CatActor> {
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {}

  execute() {
    if (!this.owner) return;
    this.owner.isBored = true;
    this.status = Goal.STATUS.COMPLETED;
  }
}

class PursueGoal extends Goal<CatActor> {
  MOVE_SPEED: 0.3;
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;
    this.owner.movePath = undefined;
    this.owner.moveToTarget = undefined;
  }

  execute() {
    if (!this.owner) {
      return;
    }
    if (this.owner.movePath && this.owner.movePath.length) {
      this.owner.updatePathMovement(10, 10);
      return;
    }
    if (!this.owner.isHuntingTo) {
      return;
    }
    const isHuntingTo = this.owner.isHuntingTo as GameEntity;
    if (this.owner.movePath && this.owner.movePath.length === 0) {
      const crow = isHuntingTo as CrowActor;
      crow.isAfraid = true;
      this.owner.isHuntingTo = undefined;
      this.status = Goal.STATUS.COMPLETED;
      return;
    }

    const pathFinding = new Pathfinding(Statics.tilesNotSafeForLivingBeings);
    const path = pathFinding.moveSafeFromEntityToPoint(
      this.owner,
      new Phaser.Math.Vector2(isHuntingTo.x, isHuntingTo.y)
    );

    if (path) {
      this.owner.moveAlongPath(path, this.MOVE_SPEED);
    } else {
      this.owner.isBored = true;
    }
    this.replanIfFailed();
  }

  terminate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;

    const cat = this.owner;
    if (!cat) return;
  }
}

export { BoredGoal, WalkGoal, PursueGoal };
