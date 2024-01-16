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
      if (!this.timerEvent) {
        this.timerEvent = owner.scene.time.delayedCall(2000, () => {
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

class PursueGoal extends Goal<CatActor> {
  MOVE_SPEED: 0.5;
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

    const cat = this.owner;
    if (!cat) return;
  }
}

class EscapeGoal extends Goal<CatActor> {
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;
    const cat = this.owner;
    const { x, y } = CatActor.getValidPosition(cat, CatActor.TOTAL_CATS);
    let duration: number = 0;
    const difX = Math.abs(x - cat.x);
    const difY = Math.abs(y - cat.y);
    let anim: string = '';
    if (difX > difY) {
      x > cat.x ? (anim = 'right_move') : (anim = 'left_move');
      duration = Math.abs(x - cat.x) * 10;
    } else {
      y > cat.y ? (anim = 'down_move') : (anim = 'up_move');
      duration = Math.abs(y - cat.y) * 10;
    }

    cat.anims.play(anim);
    if (cat.body) cat.body.enable = false;

    cat.scene.tweens.add({
      targets: cat,
      x: x,
      y: y,
      ease: 'quad.out',
      duration,
      repeat: 0,
      onComplete: () => {
        cat.isAfraid = false;
        this.status = Goal.STATUS.COMPLETED;
      }
    });
  }

  execute() {
    this.replanIfFailed();
  }

  terminate() {
    const cat = this.owner;
    if (!cat) return;
    cat.setVelocity(0, 0);
  }
}

class AttackGoal extends Goal<CatActor> {
  constructor(owner: CatActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    if (this.owner?.body) this.owner.body.enable = false;

    const cat = this.owner;
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

  terminate() {
    const cat = this.owner;
    if (!cat) return;
    cat.setVelocity(0, 0);
  }
}

export { AttackGoal, EscapeGoal, WalkGoal, PursueGoal };
