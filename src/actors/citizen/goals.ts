import { Goal } from '../../AI/base/goals/Goal';
import { CitizenActor } from './actor';
import Pathfinding from '../../AI/base/pathfinding/aStar';
import Statics from '../statics/statics';
import * as Phaser from 'phaser';
import OnTheFlyImage from '../../sprites/OnTheFlyImage';
import ActionController from '../../actions/ActionController';
import ExecutableAction from '../../actions/ExecutableAction';
import { SpriteMovement } from '../../AI/base/core/SpriteMovement';

class WalkGoal extends Goal<CitizenActor> {
  timerEvent: Phaser.Time.TimerEvent | undefined;
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  constructor(owner: CitizenActor) {
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

    const pathFinding = new Pathfinding(
      Statics.tilesNotTotallySafeForLivingBeings
    );
    const { x, y } = CitizenActor.getValidPositionForCitizens(
      owner,
      Statics.groupOfCitizens.children.entries.length - 1,
      false,
      Statics.groupOfCitizens
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

class GoToRestGoal extends Goal<CitizenActor> {
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  MOVE_SPEED = 150;

  bubble?: Phaser.GameObjects.Sprite;
  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    this.owner.movePath = undefined;
    this.owner.moveToTarget = undefined;
    this.owner.setVelocity(0, 0);
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

  execute() {
    const owner = this.owner;
    if (!owner) return;
    if (owner.movePath && owner.movePath.length) {
      owner.updatePathMovement();
      if (this.lastPosToGo) return;
    }

    if (owner.movePath && !owner.movePath.length) {
      if (!owner.isResting) {
        owner.isResting = true;
      }
      return;
    }

    const nearestPlaceToRest = owner.scene.physics.closest(
      owner,
      Statics.groupOfPlacesToRest.children.entries
    ) as OnTheFlyImage;

    if (!nearestPlaceToRest) return;

    const position = new Phaser.Math.Vector2(
      nearestPlaceToRest.x < owner.x
        ? nearestPlaceToRest.x + nearestPlaceToRest.width
        : nearestPlaceToRest.x,
      nearestPlaceToRest.y < owner.y
        ? nearestPlaceToRest.y + nearestPlaceToRest.height
        : nearestPlaceToRest.y
    );

    const endVec =
      CitizenActor.getNearestTotallySafePositionForPosition(position);

    const foundPath = this.moveToATotallySafeTile({ owner, ...endVec });

    const { x, y } = position;

    if (foundPath) {
      this.lastPosToGo = new Phaser.Math.Vector2(
        nearestPlaceToRest.x,
        nearestPlaceToRest.y
      );
      owner.moveAlongPath(foundPath, this.MOVE_SPEED);
    } else {
      owner.x = x;
      owner.y = y;
    }

    this.replanIfFailed();
  }

  terminate() {
    if (!this.owner) return;
    this.owner.setVelocity(0, 0);
  }
}

class RestingGoal extends Goal<CitizenActor> {
  actions: (ExecutableAction | false)[] = [];
  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    this.owner.movePath = undefined;
    this.owner.moveToTarget = undefined;
    const nearestPlaceToRest = this.owner.scene.physics.closest(
      this.owner,
      Statics.groupOfPlacesToRest.children.entries
    ) as OnTheFlyImage;

    this.actions = ActionController.executeActions(
      this.owner,
      nearestPlaceToRest.actionList
    );
  }

  execute() {
    if (!this.owner) return;
    const energyToGet =
      (this.owner.info?.characteristics?.health || -1) *
      (CitizenActor.cyclesToRest / 3);
    if (energyToGet < 0) {
      this.owner.isResting = false;
      this.status = Goal.STATUS.COMPLETED;
      return;
    }
    if (this.owner.currentEnergy < energyToGet) {
      this.owner.currentEnergy++;
      return;
    }
    this.status = Goal.STATUS.COMPLETED;
  }

  terminate() {
    if (!this.owner) return;

    this.actions.forEach((action) => {
      if (action) {
        (action as ExecutableAction).cancelAction(
          this.owner as SpriteMovement,
          (action as ExecutableAction).object
        );
      }
    });

    this.actions = [];

    this.owner.isTired = false;
    this.owner.isResting = false;
  }
}

export { WalkGoal, GoToRestGoal, RestingGoal };
