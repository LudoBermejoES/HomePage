import { Think } from '../../AI/base/goals/Think';
import {
  RestingEvaluator,
  GoToRestEvaluator,
  WalkEvaluator,
  GotoTalk,
  TalkingEvaluator
} from './evaluators';
import { GameEntity } from '../../AI/base/core/GameEntity';
import { DEPTH } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/statics';
import { Citizens } from './data/citizens.json';
import BaseScene from '../../scenes/baseScene';
import Conversations from './data/conversations.json';

export interface CharacterInfo {
  name: string;
  age: number;
  profession: string;
  background: Background;
  characteristics: Characteristics;
  skills: { [key: string]: number | undefined };
  advantages: string[];
  disadvantages: string[];
  quirks?: string[];
  id: number;
  sprite?: string;
  hobbies?: string[];
}

interface Props {
  scene: BaseScene;
  x: number;
  y: number;
  texture?: string;
  info: CharacterInfo;
}

export interface Background {
  childhood: string;
  current: string;
}

export interface Characteristics {
  strength: number;
  dexterity: number;
  intelligence: number;
  health: number;
}

export interface Conversation {
  id: number;
  text: string[];
  lastTimeTalked?: number;
}

export class CitizenActor extends GameEntity {
  brain: Think<CitizenActor>;
  isAfraid: boolean = false;
  isTired: boolean = false;
  isResting: boolean = false;
  isTalking: boolean = false;
  static baseScale: 0.7;
  info: CharacterInfo;
  velocity: number = 125;
  currentEnergy: number = -1;
  conversations: Conversation[] = [];

  groupOfRelations: Phaser.Physics.Arcade.Group;

  static cyclesToRest: number = 1000;

  constructor(config: Props) {
    super({ ...config });
    this.prepareAnimsFromAseSprite();
    this.currentEnergy = Phaser.Math.Between(
      500,
      config.info.characteristics.health * CitizenActor.cyclesToRest
    );
    this.info = config.info;
    this.conversations = this.getConversations(config.info);
    this.brain = new Think(this);
    this.brain.addEvaluator(
      new GoToRestEvaluator(config.scene.CITIZEN_PRIORITIES.GOTO_REST)
    );
    this.brain.addEvaluator(
      new RestingEvaluator(config.scene.CITIZEN_PRIORITIES.RESTING)
    );
    this.brain.addEvaluator(
      new WalkEvaluator(config.scene.CITIZEN_PRIORITIES.WALKING)
    );
    this.brain.addEvaluator(
      new GotoTalk(config.scene.CITIZEN_PRIORITIES.GOTO_TALK)
    );
    this.brain.addEvaluator(
      new TalkingEvaluator(config.scene.CITIZEN_PRIORITIES.TALKING_GOAL)
    );
    this.name = config.info.name;
    if (this.body) {
      this.body.immovable = false;
      this.body.enable = true;
      this.setBounce(0);
      this.setOriginalBodySize();
    }
  }

  getConversations(info: CharacterInfo): Conversation[] {
    return Conversations.filter(
      (conversation) => conversation.id1 === info.id
    ).map((conversation) => ({
      id: Number(conversation.id2),
      text: conversation.conversation
    }));
  }

  setOriginalBodySize() {
    if (!this.body) return;
    this.body.setOffset(this.body.width / 3, this.body.height / 3);
    this.body.setSize(this.body.width / 3, this.body.height / 3, false);
  }

  update() {
    super.update();
    if (this.brain) {
      this.brain?.execute();
      this.brain?.arbitrate();
    }
  }

  prepareRelations(groupOfCitizens: Phaser.Physics.Arcade.Group) {
    const ids: number[] = this.conversations.map(
      (conversation) => conversation.id
    );
    this.groupOfRelations = this.scene.physics.add.group();
    groupOfCitizens.children.entries.forEach(
      (c: Phaser.GameObjects.GameObject) => {
        const citizen: CitizenActor = c as CitizenActor;
        if (ids.includes(citizen.info.id)) {
          this.groupOfRelations.add(citizen);
        }
      }
    );
  }

  static preloadCitizens(scene: Phaser.Scene) {
    Citizens.filter((citizen) => citizen.sprite).forEach((citizenInfo) => {
      scene.load.aseprite(
        citizenInfo.name || '',
        `assets/sprites/citizens/${citizenInfo.sprite}.webp`,
        `assets/sprites/citizens/${citizenInfo.sprite}.json`
      );
    });
  }

  static createCitizens(scene: BaseScene) {
    Citizens.filter((citizen) => citizen.sprite).forEach((citizenInfo) => {
      const citizen = new CitizenActor({
        scene,
        x: 0,
        y: 0,
        texture: citizenInfo.name,
        info: citizenInfo
      });
      citizen.scale = CitizenActor.baseScale;
      citizen.setPushable(false);
      citizen.depth = DEPTH.CITIZENS;
      const { x, y } = CitizenActor.getValidPositionForCitizens(
        citizen,
        Citizens.filter((citizen) => citizen.sprite).length - 1,
        true,
        Statics.groupOfCitizens
      );
      citizen.setPosition(x, y);
      citizen.scale = 0.7;
      citizen.anims.play('stop_down', true);
      scene.add.existing(citizen);
      Statics.groupOfCitizens.add(citizen);
      scene.physics.add.collider(
        Statics.groupOfCitizens,
        Statics.groupEnemiesOfCitizens,
        undefined,
        (spriteCo) => {
          const citizen = spriteCo as CitizenActor;
          citizen.isAfraid = true;
        }
      );
    });
    Statics.groupOfCitizens.runChildUpdate = true;
    CitizenActor.createGroupsOfRelationships(Statics.groupOfCitizens);
  }

  static createGroupsOfRelationships(
    groupOfCitizens: Phaser.Physics.Arcade.Group
  ) {
    groupOfCitizens.children.entries.forEach(
      (c: Phaser.GameObjects.GameObject) => {
        const citizen: CitizenActor = c as CitizenActor;
        citizen.prepareRelations(groupOfCitizens);
      }
    );
  }
}
