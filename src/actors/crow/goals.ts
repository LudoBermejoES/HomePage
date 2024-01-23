import { Goal } from '../../AI/base/goals/Goal';
import Statics from '../statics/statics';

import { CrowActor } from './actor';

class RestGoal extends Goal<CrowActor> {
  constructor(owner: CrowActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    const crow = this.owner;
  }

  execute() {
    //this.status = Goal.STATUS.COMPLETED;
    this.replanIfFailed();
  }
}

class BoredGoal extends Goal<CrowActor> {
  constructor(owner: CrowActor) {
    super(owner);
  }

  activate() {}

  execute() {
    if (!this.owner) return;
    this.owner.isBored = true;
    this.status = Goal.STATUS.COMPLETED;
  }
}

class EscapeGoal extends Goal<CrowActor> {
  constructor(owner: CrowActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    const crow = this.owner;
    const { x, y } = CrowActor.getValidPositionForFlyingCreatures(
      crow,
      CrowActor.TOTAL_CROWS,
      Statics.groupOfCrows
    );
    let duration: number = 0;
    const difX = Math.abs(x - crow.x);
    const difY = Math.abs(y - crow.y);
    let anim: string = '';
    if (difX > difY) {
      x > crow.x ? (anim = 'flape_right') : (anim = 'flape_left');
      duration = Math.abs(x - crow.x) * 10;
    } else {
      y > crow.y ? (anim = 'flape_down') : (anim = 'flape_up');
      duration = Math.abs(y - crow.y) * 10;
    }

    crow.anims.play(anim);

    crow.scene.tweens.add({
      targets: crow,
      x: x,
      y: y,
      ease: 'quad.out',
      duration,
      repeat: 0,
      onComplete: () => {
        crow.isAfraid = false;
        crow.isBored = false;
        this.status = Goal.STATUS.COMPLETED;
      }
    });
  }

  execute() {
    this.replanIfFailed();
  }

  terminate() {
    const crow = this.owner;
    if (!crow) return;
    crow.anims.play(crow.chooseIdleAnim(), true);
  }
}

export { BoredGoal, RestGoal, EscapeGoal };
