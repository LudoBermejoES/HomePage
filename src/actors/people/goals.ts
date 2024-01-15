import { Goal } from '../../AI/base/goals/Goal';

import { CrowActor } from './actor';

class RestGoal extends Goal<CrowActor> {
  constructor(owner: CrowActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    const crow = this.owner;
    if (crow.body) crow.body.enable = true;
  }

  execute() {
    //this.status = Goal.STATUS.COMPLETED;
    this.replanIfFailed();
  }
}

class EscapeGoal extends Goal<CrowActor> {
  constructor(owner: CrowActor) {
    super(owner);
  }

  activate() {
    if (this.owner?.body) this.owner.body.enable = false;
    if (!this.owner) return;
    const crow = this.owner;
    const { x, y } = CrowActor.getValidPosition(
      crow,
      crow.groupCrows,
      crow.map,
      crow.groupCrows.children.entries.length
    );

    const difX = Math.abs(x - crow.x);
    const difY = Math.abs(y - crow.y);
    let anim: string = '';
    if (difX > difY) {
      x > crow.x ? (anim = 'flape_right') : (anim = 'flape_left');
    } else {
      y > crow.y ? (anim = 'flape_up') : (anim = 'flape_down');
    }

    crow.anims.play(anim);
    if (crow.body) crow.body.enable = false;

    crow.scene.tweens.add({
      targets: crow,
      x: x,
      y: y,
      ease: 'quad.out',
      duration: Math.abs(x - crow.x) * 10,
      repeat: 0,
      onComplete: () => {
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
    crow.isAfraid = false;
    crow.anims.play(crow.chooseIdleAnim(), true);
    crow.setVelocity(0, 0);
  }
}

export { RestGoal, EscapeGoal };
