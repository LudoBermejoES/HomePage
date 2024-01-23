import { Think } from '../../AI/base/goals/Think';
import { RestEvaluator, EscapeEvaluator, BoredEvaluator } from './evaluators';
import { GameEntity } from '../../AI/base/core/GameEntity';
import { DEPTH } from '../../lib/constants';
import * as Phaser from 'phaser';
import Statics from '../statics/statics';
import { Props } from '../../AI/base/core/SpriteMovement';

export class CrowActor extends GameEntity {
  idle_anims: string[] = ['idle_left', 'idle_right', 'idle_up', 'idle_down'];
  brain: Think<CrowActor>;
  isAfraid: boolean = false;
  isBored: boolean = false;
  groupEnemies: Phaser.Physics.Arcade.Group;
  groupCrows: Phaser.Physics.Arcade.Group;
  map: Phaser.Tilemaps.Tilemap;
  static TOTAL_CROWS: number = 0;

  constructor(config: Props) {
    super({ ...config, texture: 'CrowSprite' });
    this.prepareAnimsFromAseSprite();

    this.brain = new Think(this);

    this.brain.addEvaluator(new RestEvaluator());
    this.brain.addEvaluator(new EscapeEvaluator());
    this.brain.addEvaluator(new BoredEvaluator());
    if (this.body) this.body.immovable = false;
  }

  chooseIdleAnim(): string {
    return this.idle_anims[Phaser.Math.Between(0, this.idle_anims.length - 1)];
  }

  set groupEnemiesOfCrows(groupEnemiesOfCrows: Phaser.Physics.Arcade.Group) {
    this.groupEnemies = groupEnemiesOfCrows;
  }

  set groupOfCrows(groupOfCrows: Phaser.Physics.Arcade.Group) {
    this.groupCrows = groupOfCrows;
  }

  set mapOfScene(map: Phaser.Tilemaps.Tilemap) {
    this.map = map;
  }

  update() {
    super.update();
    if (this.brain) {
      this.brain?.execute();
      this.brain?.arbitrate();
    }
  }

  static createCrows(scene: Phaser.Scene, TOTAL_CROWS: number) {
    for (let i = 0; i < TOTAL_CROWS; i++) {
      CrowActor.TOTAL_CROWS = TOTAL_CROWS;
      const crow = new CrowActor({
        scene,
        x: 0,
        y: 0
      });
      crow.mapOfScene = Statics.map;
      crow.depth = DEPTH.FLYING_ANIMALS;
      crow.scale = 0.5;
      const { x, y } = CrowActor.getValidPositionForFlyingCreatures(
        crow,
        TOTAL_CROWS,
        Statics.groupOfCrows
      );
      crow.setPosition(x, y);
      crow.anims.play(crow.chooseIdleAnim(), true);
      scene.add.existing(crow);
      Statics.groupOfCrows.add(crow);
    }
    Statics.groupOfCrows.runChildUpdate = true;
    scene.physics.add.overlap(
      Statics.groupOfCrows,
      Statics.groupEnemiesOfCrows,
      undefined,
      (spriteCo) => {
        const crow = spriteCo as CrowActor;
        crow.isAfraid = true;
      }
    );
  }
}
