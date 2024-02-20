import { Goal } from '../../AI/base/goals/Goal';
import { CitizenActor } from './actor';
import Pathfinding from '../../AI/base/pathfinding/aStar';
import Statics from '../statics/statics';
import * as Phaser from 'phaser';
import ActionController from '../../actions/ActionController';
import ExecutableAction from '../../actions/ExecutableAction';
import { SpriteMovement } from '../../AI/base/core/SpriteMovement';
import InteractableObject from '../../sprites/interactableObjects/InteractableObject';
import { SIZES } from '../../lib/constants';
import { ConversationNPC } from '../../ui/ConversationsNPC';
import {
  Conversation,
  ConversationBetweenNPC
} from '../../conversations/conversation';

class WalkGoal extends Goal<CitizenActor> {
  timerEvent: Phaser.Time.TimerEvent | undefined;
  lastPosToGo: Phaser.Math.Vector2 | undefined;

  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    this.owner.clearTint();
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

class GotoTalkGoal extends Goal<CitizenActor> {
  timerEvent: Phaser.Time.TimerEvent | undefined;
  lastPosToGo: Phaser.Math.Vector2 | undefined;
  target: CitizenActor;
  lastPositionTarget: Phaser.Math.Vector2 | undefined;
  constructor(owner: CitizenActor, target: CitizenActor) {
    super(owner);
    this.target = target;
  }

  activate() {
    if (!this.owner) return;
    this.timerEvent = this.owner.scene.time.addEvent({
      delay: 2000,
      callback: this.checkNewPath,
      callbackScope: this
    });
    this.owner.isMovingToTalkWith = this.target;
  }

  checkNewPath() {
    const owner = this.owner;
    if (!owner) return;
    const xTarget = Math.round(this.target.x / SIZES.BLOCK);
    const yTarget = Math.round(this.target.y / SIZES.BLOCK);

    if (
      this.lastPosToGo &&
      (this.lastPosToGo.x !== xTarget || this.lastPosToGo.y !== yTarget)
    ) {
      this.lastPosToGo = undefined;
      owner.movePath = undefined;
      owner.moveToTarget = undefined;
    }
  }

  execute() {
    const owner = this.owner;
    if (!owner) return;

    //owner.setTint(0xffff00);
    const ownerPos = {
      x: Math.round(owner.x / SIZES.BLOCK),
      y: Math.round(owner.y / SIZES.BLOCK)
    };
    const targetPos = {
      x: Math.round(this.target.x / SIZES.BLOCK),
      y: Math.round(this.target.y / SIZES.BLOCK)
    };

    if (
      Math.abs(ownerPos.x - targetPos.x) + Math.abs(ownerPos.y - targetPos.y) <=
      2
    ) {
      owner.inAConversationWith = this.target;
      owner.isTalking = true;
      owner.inAConversationWith.isTalking = true;
      this.status = Goal.STATUS.COMPLETED;
      this.lastPosToGo = undefined;
      if (this.owner) {
        this.owner.movePath = undefined;
        this.owner.moveToTarget = undefined;
      }
      this.timerEvent?.destroy();
      this.timerEvent = undefined;
      owner.setVelocity(0, 0);
      owner.isMovingToTalkWith = undefined;
      return;
    }

    if (owner.movePath && owner.movePath.length) {
      owner.updatePathMovement();
      if (this.lastPosToGo) return;
    }

    const pathFinding = new Pathfinding(
      Statics.tilesNotTotallySafeForLivingBeings
    );
    const x = Math.round(this.target.x / SIZES.BLOCK);
    const y = Math.round(this.target.y / SIZES.BLOCK);
    const path = pathFinding.moveTotallySafeFromEntityToEntity(
      owner,
      this.target
    );

    if (path) {
      this.lastPosToGo = new Phaser.Math.Vector2(x, y);
      this.lastPositionTarget = new Phaser.Math.Vector2(
        this.target.x,
        this.target.y
      );
      owner.moveAlongPath(path, owner.velocity);
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

    const placesToLook = [...Statics.groupOfPlacesToRest.children.entries];
    let nearestPlaceToRest: InteractableObject = owner.scene.physics.closest(
      owner,
      Statics.groupOfPlacesToRest.children.entries
    ) as InteractableObject;

    if (!nearestPlaceToRest) return;
    while (!(nearestPlaceToRest as InteractableObject).areThereFreeSpots()) {
      placesToLook.splice(placesToLook.indexOf(nearestPlaceToRest), 1);
      nearestPlaceToRest = owner.scene.physics.closest(
        nearestPlaceToRest as InteractableObject,
        placesToLook
      ) as InteractableObject;
      if (!nearestPlaceToRest) return;
    }

    nearestPlaceToRest.addActor(owner);

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
  nearestPlaceToRest: InteractableObject;
  lastValidPosition: Phaser.Math.Vector2 | undefined;
  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    this.owner.movePath = undefined;
    this.owner.moveToTarget = undefined;
    this.nearestPlaceToRest = this.owner.scene.physics.closest(
      this.owner,
      Statics.groupOfPlacesToRest.children.entries
    ) as InteractableObject;
    this.lastValidPosition = this.owner.body?.position;
    this.actions = ActionController.executeActions(
      this.owner,
      this.nearestPlaceToRest.actionList
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
      this.owner.currentEnergy += 5;
      return;
    }
    this.status = Goal.STATUS.COMPLETED;
  }

  terminate() {
    if (!this.owner) return;

    this.actions.forEach((action) => {
      if (action) {
        (action as ExecutableAction).cancelAction(this.owner as SpriteMovement);
      }
    });

    this.nearestPlaceToRest.removeActor(this.owner);

    if (this.owner.body && this.lastValidPosition) {
      this.owner.body.position = this.lastValidPosition;
      this.owner.body.position = this.lastValidPosition;
    }

    this.actions = [];

    this.owner.isTired = false;
    this.owner.isResting = false;
  }
}

class TalkingGoal extends Goal<CitizenActor> {
  actions: (ExecutableAction | false)[] = [];
  nearestPlaceToRest: InteractableObject;
  lastValidPosition: Phaser.Math.Vector2 | undefined;
  constructor(owner: CitizenActor) {
    super(owner);
  }

  activate() {
    if (!this.owner) return;
    const owner = this.owner;
    owner.movePath = undefined;
    owner.moveToTarget = undefined;
    owner.setVelocity(0, 0);
    const animation: string | undefined = owner?.anims.currentAnim?.key;
    if (!animation) return;
    const animationName = animation.replace('move', 'stop');
    owner.anims.play(animationName, true);
  }

  onCompleteDialog() {
    if (!this.owner) return;
    this.status = Goal.STATUS.COMPLETED;
  }

  execute() {
    console.log('Inicio el goal');
    if (!this.owner) return;
    const owner = this.owner;
    if (!owner.inAConversationWith) return;
    if (!owner.currentConversation) {
      console.log('Creo la conversacion ');

      owner.scene.cameras.main.startFollow(owner);
      owner.currentConversation = new ConversationNPC(
        owner.scene,
        owner,
        owner.inAConversationWith,
        {
          scene: owner.scene,
          widthDialog: 300,
          callback: (conversation: Conversation) => {
            if (!owner.inAConversationWith) return;
            owner.inAConversationWith.inAConversationWith = undefined;
            owner.inAConversationWith.isTalking = false;
            owner.inAConversationWith.currentConversation = undefined;
            owner.inAConversationWith.lastConversation = owner.scene.time.now;

            owner.inAConversationWith = undefined;
            owner.isTalking = false;
            owner.currentConversation = undefined;
            owner.lastConversation = owner.scene.time.now;
            if (!owner.inAConversationWith) return;

            console.log(
              'Termino con owner',
              owner.info.name,
              ' y esta con ',
              owner.inAConversationWith.info.name
            );
            owner.isTalking = false;
            conversation.lastTime = owner.scene.time.now;
            const id: string = `${Math.min(
              owner.info.id,
              owner.inAConversationWith.info.id
            )}-${Math.min(owner.info.id, owner.inAConversationWith.info.id)}`;

            let conversationBetweenNPC: ConversationBetweenNPC | undefined =
              owner.conversationsGroup.conversationsBetweenNPC.find(
                (c) => c.id === id
              );

            if (!conversationBetweenNPC) {
              conversationBetweenNPC = {
                id,
                lastTime: 0
              };
              owner.conversationsGroup.conversationsBetweenNPC.push(
                conversationBetweenNPC
              );
            }
            conversationBetweenNPC.lastTime = owner.scene.time.now;
            const subgoal = owner.inAConversationWith.brain.currentSubgoal();
            if (subgoal) {
              subgoal.status = Goal.STATUS.COMPLETED;
            }
            this.status = Goal.STATUS.COMPLETED;
          }
        }
      );
      owner.inAConversationWith.currentConversation = owner.currentConversation;
    }
  }

  terminate() {
    if (!this.owner) return;
    this.owner.inAConversationWith = undefined;
    this.owner.isTalking = false;
    this.owner.currentConversation = undefined;
  }
}

export { WalkGoal, GoToRestGoal, RestingGoal, GotoTalkGoal, TalkingGoal };
