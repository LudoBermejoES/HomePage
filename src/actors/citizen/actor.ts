import { Think } from '../../AI/base/goals/Think';
import {
  RestingEvaluator,
  GoToRestEvaluator,
  WalkEvaluator
} from './evaluators';
import { GameEntity } from '../../AI/base/core/GameEntity';
import { DEPTH } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/statics';
import { Citizens } from './data/citizens.json';
import BaseScene from '../../scenes/baseScene';

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
  scene: Phaser.Scene;
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

export class CitizenActor extends GameEntity {
  brain: Think<CitizenActor>;
  isAfraid: boolean = false;
  isTired: boolean = false;
  isResting: boolean = false;
  static baseScale: 0.7;
  info?: CharacterInfo;
  velocity: number = 125;
  currentEnergy: number = -1;

  static cyclesToRest: number = 1000;

  constructor(config: Props) {
    super({ ...config });
    this.prepareAnimsFromAseSprite();
    this.currentEnergy = Phaser.Math.Between(
      500,
      config.info.characteristics.health * CitizenActor.cyclesToRest
    );
    this.info = config.info;
    this.brain = new Think(this);
    this.brain.addEvaluator(new GoToRestEvaluator());
    this.brain.addEvaluator(new RestingEvaluator());
    this.brain.addEvaluator(new WalkEvaluator());
    if (this.body) this.body.immovable = false;
  }

  update() {
    super.update();
    if (this.brain) {
      this.brain?.execute();
      this.brain?.arbitrate();
    }
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

  static createCitizens(scene: Phaser.Scene) {
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
    const groupScene: BaseScene = scene as BaseScene;
    groupScene.allLayers.forEach((layer: Phaser.Tilemaps.TilemapLayer) => {
      scene.physics.add.collider(
        Statics.groupOfCitizens,
        layer,
        undefined,
        (spriteLudo, tile) => {
          /*const tileBlock: Phaser.Tilemaps.Tile = tile as Phaser.Tilemaps.Tile;
          if (
            tileBlock.properties.collision &&
            scene.spriteLudo.moveToTarget === undefined
          ) {
            return true;
          }
          return false;*/
        }
      );
    });
  }
}
