import { Goal } from '../../AI/base/goals/Goal';
import { CatActor } from './actor';
import Pathfinding from '../../AI/base/pathfinding/aStar';
import Statics from '../statics/statics';
import { GameEntity } from '../../AI/base/core/GameEntity';
import * as Phaser from 'phaser';
import { CrowActor } from '../crow/actor';
import { SIZES } from '../../lib/constants';

class WalkGoal extends Goal<CatActor> {
  MOVE_SPEED = 0.5;
  timerEvent: Phaser.Time.TimerEvent | undefined;
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
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

    const pathFinding = new Pathfinding(Statics.tilesNotSafeForLivingBeings);
    const { x, y } = CatActor.getValidPositionForNotFlyingCreatures(
      owner,
      CatActor.TOTAL_CATS,
      false,
      Statics.groupOfCats
    );
    const path = pathFinding.moveSafeFromEntityToPoint(
      owner,
      new Phaser.Math.Vector2(x, y)
    );

    if (path) {
      this.lastPosToGo = new Phaser.Math.Vector2(x, y);
      owner.moveAlongPath(path, owner.velocity);
    } else {
      owner.x = x;
      owner.y = y;
    }

    this.replanIfFailed();
  }

  terminate() {}
}

class PursueGoal extends Goal<CatActor> {
  MOVE_SPEED: 0.5;
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
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
      this.owner.moveAlongPath(path, this.owner.velocityHunt);
    }
    this.replanIfFailed();
  }

  terminate() {
    if (!this.owner) return;
  }
}

class EscapeGoal extends Goal<CatActor> {
  MOVE_SPEED: 0.5;
  constructor(owner: CatActor) {
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
    const { x, y } = CatActor.getRandomTotallySafePositionNearOwner(owner);
    const path = pathFinding.moveEntityToTile(owner, { x, y });
    if (path) owner.moveAlongPath(path, owner.velocityEscape);

    this.replanIfFailed();
  }

  terminate() {
    const cat = this.owner;
    if (!cat) return;
  }
}

class AttackGoal extends Goal<CatActor> {
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;

    const cat = this.owner;
    cat.setVelocity(0, 0);
    const crow = cat.isHuntingTo as CrowActor;
    const { x, y } = crow;
    const difX = Math.abs(x - cat.x);
    const difY = Math.abs(y - cat.y);
    let anim: string = '';
    if (difX > difY) {
      x > cat.x
        ? (anim = 'right_before_attack')
        : (anim = 'left_before_attack');
    } else {
      y > cat.y ? (anim = 'down_before_attack') : (anim = 'up_before_attack');
    }

    cat.anims.play({ key: anim, repeat: 5 }, true);
    cat.on('animationcomplete', () => {
      cat.off('animationcomplete');

      cat.scene.tweens.add({
        targets: cat,
        x: crow.x,
        y: crow.y,
        ease: 'quad.out',
        duration: 100,
        onComplete: () => {
          crow.isAfraid = true;
          cat.isHuntingTo = undefined;
          cat.isAttacking = false;
          this.status = Goal.STATUS.COMPLETED;
        }
      });
    });
  }

  execute() {
    this.replanIfFailed();
  }

  terminate() {}
}

class LazyGoal extends Goal<CatActor> {
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  MOVE_SPEED = 0.2;
  MIN_TIME_TO_SLEEP = 5000;
  MAX_TIME_TO_SLEEP = 10000;
  bubble?: Phaser.GameObjects.Sprite;
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    this.owner.movePath = undefined;
    this.owner.moveToTarget = undefined;
    this.owner.isLazy = true;
  }

  moveToATotallySafeTile({
    owner,
    x,
    y
  }: {
    owner: CatActor;
    x: number;
    y: number;
  }) {
    const pathFinding = new Pathfinding(Statics.tilesNotSafeForLivingBeings);
    return pathFinding.moveEntityToTile(owner, { x, y });
  }

  moveInTotallySafeTiles(owner: CatActor): {
    x: number;
    y: number;
    path: Phaser.Math.Vector2[] | undefined;
  } {
    const pathFinding = new Pathfinding(
      Statics.tilesNotTotallySafeForLivingBeings
    );
    const { x, y } = CatActor.getRandomTotallySafePositionNearOwner(owner);
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
        owner.setVelocity(0, 0);
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

    const position = CatActor.getNearestTotallySafePositionForObject(owner);
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
      owner.moveAlongPath(foundPath, owner.velocityLazy);
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
