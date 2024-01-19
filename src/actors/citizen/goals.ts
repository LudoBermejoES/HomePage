import { Goal } from '../../AI/base/goals/Goal';
import { CitizenActor } from './actor';
import Pathfinding from '../../AI/base/pathfinding/aStar';
import Statics from '../statics/staticsCity';
import { GameEntity } from '../../AI/base/core/GameEntity';
import * as Phaser from 'phaser';
import { CrowActor } from '../crow/actor';
import { SIZES } from '../../lib/constants';

class WalkGoal extends Goal<CitizenActor> {
  MOVE_SPEED = 0.5;
  timerEvent: Phaser.Time.TimerEvent | undefined;
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  constructor(owner: CitizenActor) {
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

    const pathFinding = new Pathfinding(
      Statics.tilesNotTotallySafeForLivingBeings
    );
    const { x, y } = CitizenActor.getValidPosition(
      owner,
      Statics.groupOfCitizens.children.entries.length - 1
    );
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

class PursueGoal extends Goal<CitizenActor> {
  MOVE_SPEED: 0.5;
  constructor(owner: CitizenActor) {
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
      this.owner.updatePathMovement(30, 30);
      return;
    }
    if (!this.owner.isHuntingTo) {
      return;
    }
    const isHuntingTo = this.owner.isHuntingTo as GameEntity;
    if (this.owner.movePath && this.owner.movePath.length === 0) {
      this.owner.isAttacking = true;
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
    }
    this.replanIfFailed();
  }

  terminate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;
  }
}

class EscapeGoal extends Goal<CitizenActor> {
  MOVE_SPEED: 0.5;
  constructor(owner: CitizenActor) {
    super(owner);
    owner.movePath = undefined;
    owner.moveToTarget = undefined;
  }

  activate() {}

  execute() {
    const owner = this.owner;
    if (!owner) return;
    if (owner.movePath && owner.movePath.length) {
      owner.updatePathMovement();
      return;
    }

    if (owner.movePath && !owner.movePath.length) {
      this.status = Goal.STATUS.COMPLETED;
      owner.isAfraid = false;
      return;
    }

    const pathFinding = new Pathfinding(Statics.tilesNotSafeForLivingBeings);
    const { x, y } = CitizenActor.getRandomTotallySafePositionNearOwner(owner);
    console.log('Mi posicion más segura es ', x, y);
    const path = pathFinding.moveEntityToTile(owner, { x, y });
    console.log(path);
    if (path) owner.moveAlongPath(path, 2);

    this.replanIfFailed();
  }

  terminate() {
    const citizen = this.owner;
    if (!citizen) return;
    citizen.setVelocity(0, 0);
  }
}

class AttackGoal extends Goal<CitizenActor> {
  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;

    const citizen = this.owner;
    const crow = citizen.isHuntingTo as CrowActor;
    const { x, y } = crow;
    const difX = Math.abs(x - citizen.x);
    const difY = Math.abs(y - citizen.y);
    let anim: string = '';
    if (difX > difY) {
      x > citizen.x
        ? (anim = 'right_before_attack')
        : (anim = 'left_before_attack');
    } else {
      y > citizen.y
        ? (anim = 'down_before_attack')
        : (anim = 'up_before_attack');
    }

    citizen.anims.play({ key: anim, repeat: 5 }, true);
    citizen.on('animationcomplete', () => {
      citizen.off('animationcomplete');

      citizen.scene.tweens.add({
        targets: citizen,
        x: crow.x,
        y: crow.y,
        ease: 'quad.out',
        duration: 100,
        onComplete: () => {
          crow.isAfraid = true;
          citizen.isHuntingTo = undefined;
          citizen.isAttacking = false;
          this.status = Goal.STATUS.COMPLETED;
        }
      });
    });
  }

  execute() {
    this.replanIfFailed();
  }

  terminate() {
    const citizen = this.owner;
    if (!citizen) return;
    citizen.setVelocity(0, 0);
  }
}

class LazyGoal extends Goal<CitizenActor> {
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  MOVE_SPEED = 0.2;
  MIN_TIME_TO_SLEEP = 5000;
  MAX_TIME_TO_SLEEP = 10000;
  bubble?: Phaser.GameObjects.Sprite;
  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    // if (this.owner?.body) this.owner.body.enable = false;
    this.owner.movePath = undefined;
    this.owner.moveToTarget = undefined;
    this.owner.isLazy = true;
  }

  moveToATotallySafeTile({
    owner,
    x,
    y
  }: {
    owner: CitizenActor;
    x: number;
    y: number;
  }) {
    const pathFinding = new Pathfinding(
      Statics.tilesNotTotallySafeForLivingBeings
    );
    return pathFinding.moveEntityToTile(owner, { x, y });
  }

  moveInTotallySafeTiles(owner: CitizenActor): {
    x: number;
    y: number;
    path: Phaser.Math.Vector2[] | undefined;
  } {
    const pathFinding = new Pathfinding(
      Statics.tilesNotTotallySafeForLivingBeings
    );
    const { x, y } = CitizenActor.getRandomTotallySafePositionNearOwner(owner);
    return {
      x: x * SIZES.BLOCK,
      y: y * x * SIZES.BLOCK,
      path: pathFinding.moveEntityToTile(owner, { x, y })
    };
  }

  execute() {
    const owner = this.owner;
    if (!owner) return;
    if (owner.movePath && owner.movePath.length) {
      owner.updatePathMovement();
      if (this.lastPosToGo) return;
    }

    if (owner.movePath && !owner.movePath.length) {
      const currentAnim = owner.anims.currentAnim;
      if (!currentAnim || currentAnim.key !== 'sleep') {
        owner.anims.play({ key: 'sleep', repeat: 1 }, true);

        this.bubble = owner.scene.add.sprite(
          owner.x,
          owner.y - owner.height / 2,
          'SleepBubble'
        );

        this.bubble.anims.createFromAseprite('SleepBubble').forEach((anim) => {
          anim.repeat = -1;
        });

        this.bubble.anims.play('start');

        owner.scene.time.delayedCall(
          Phaser.Math.Between(this.MIN_TIME_TO_SLEEP, this.MAX_TIME_TO_SLEEP),
          () => {
            owner.isLazy = false;
            this.bubble?.destroy();
            this.bubble = undefined;

            this.status = Goal.STATUS.COMPLETED;
          }
        );
      }
      return;
    }

    const position = CitizenActor.getNearestTotallySafePosition(owner);
    const firstMoveToATotallySafeTile = !position.originTileIsSafe;

    let foundPath: Phaser.Math.Vector2[] | undefined;
    if (firstMoveToATotallySafeTile) {
      foundPath = this.moveToATotallySafeTile({ owner, ...position });
    } else {
      const { x, y, path } = this.moveInTotallySafeTiles(owner);
      position.x = x;
      position.y = y;
      foundPath = path;
    }

    const { x, y } = position;

    if (foundPath) {
      this.lastPosToGo = new Phaser.Math.Vector2(x, y);
      owner.moveAlongPath(foundPath, this.MOVE_SPEED);
    } else {
      owner.x = x;
      owner.y = y;
    }

    this.replanIfFailed();
  }

  terminate() {
    if (!this.owner) return;
  }
}

export { AttackGoal, EscapeGoal, LazyGoal, WalkGoal, PursueGoal };
