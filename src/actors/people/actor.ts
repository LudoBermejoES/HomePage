import { Think } from '../../AI/base/goals/Think';
import { RestEvaluator, EscapeEvaluator } from './evaluators';
import { GameEntity, Props } from '../../AI/base/core/GameEntity';
import { DEPTH } from '../../lib/constants';
import * as Phaser from 'phaser';

export class CrowActor extends GameEntity {
  idle_anims: string[] = ['idle_left', 'idle_right', 'idle_up', 'idle_down'];
  brain: Think<CrowActor>;
  isAfraid: boolean = false;
  groupEnemies: Phaser.Physics.Arcade.Group;
  groupCrows: Phaser.Physics.Arcade.Group;
  map: Phaser.Tilemaps.Tilemap;
  constructor(config: Props) {
    super({ ...config, texture: 'CrowSprite' });
    this.prepareAnimsFromAseSprite();

    this.brain = new Think(this);

    this.brain.addEvaluator(new RestEvaluator());
    this.brain.addEvaluator(new EscapeEvaluator());
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

  static getValidPosition(
    currentCrow: CrowActor,
    groupCrows: Phaser.Physics.Arcade.Group,
    map: Phaser.Tilemaps.Tilemap,
    TOTAL_CROWS: number
  ): { x: number; y: number } {
    let x: number = 0;
    let y: number = 0;
    let valid: boolean = false;
    const validDistanceX = map.widthInPixels / TOTAL_CROWS / 2;
    const validDistanceY = map.heightInPixels / TOTAL_CROWS / 2;
    while (!valid) {
      let internalValid: boolean = true;
      x = Phaser.Math.Between(10, map.widthInPixels);
      y = Phaser.Math.Between(10, map.heightInPixels);
      groupCrows.children.entries.forEach((crow) => {
        const theCrow = crow as CrowActor;
        if (theCrow !== currentCrow)
          if (
            Math.abs(theCrow.x - x) < validDistanceX ||
            Math.abs(theCrow.y - y) < validDistanceY
          ) {
            internalValid = false;
          }
      });
      valid = internalValid;
    }
    return {
      x,
      y
    };
  }

  static createCrows(
    groupEnemiesOfCrows: Phaser.Physics.Arcade.Group,
    groupCrows: Phaser.Physics.Arcade.Group,
    scene: Phaser.Scene,
    TOTAL_CROWS: number,
    map: Phaser.Tilemaps.Tilemap
  ) {
    for (let i = 0; i < TOTAL_CROWS; i++) {
      const crow = new CrowActor({
        scene,
        x: 0,
        y: 0
      });
      crow.groupEnemiesOfCrows = groupEnemiesOfCrows;
      crow.groupOfCrows = groupCrows;
      crow.mapOfScene = map;
      crow.depth = DEPTH.FLYING_ANIMALS;
      const { x, y } = CrowActor.getValidPosition(
        crow,
        groupCrows,
        map,
        TOTAL_CROWS
      );
      crow.setPosition(x, y);
      crow.anims.play(crow.chooseIdleAnim(), true);
      scene.add.existing(crow);
      groupCrows.add(crow);
    }
    groupCrows.runChildUpdate = true;
    scene.physics.add.collider(
      groupCrows,
      groupEnemiesOfCrows,
      undefined,
      (spriteCo) => {
        const crow = spriteCo as CrowActor;
        crow.isAfraid = true;
      }
    );
  }
}
