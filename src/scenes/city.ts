import BaseScene from './baseScene';
import SpriteBus from '../sprites/SpriteBus';
import { CrowActor } from '../actors/crow/actor';
import { CatActor } from '../actors/cat/actor';
import Statics from '../actors/statics/staticsCity';

export default class City extends BaseScene {
  busSprite: SpriteBus | undefined;
  TOTAL_CROWS: number = 15;
  TOTAL_CATS: number = 5;

  constructor() {
    super('city');
  }

  preload() {
    this.load.aseprite(
      'EmptySprite',
      'assets/sprites/empty.png',
      'assets/sprites/empty.json'
    );
    this.load.aseprite(
      'BusSprite',
      'assets/sprites/bus.png',
      'assets/sprites/bus.json'
    );
    this.load.aseprite(
      'LudoSprite',
      'assets/sprites/Ludo.png',
      'assets/sprites/Ludo.json'
    );
    this.load.aseprite(
      'CrowSprite',
      'assets/sprites/crow.png',
      'assets/sprites/crow.json'
    );
    this.load.aseprite(
      'CatSprite',
      'assets/sprites/BlackCat.png',
      'assets/sprites/BlackCat.json'
    );
    this.load.aseprite(
      'CondoDoorOrange',
      'assets/sprites/CondoDoorOrange.png',
      'assets/sprites/CondoDoorOrange.json'
    );
    this.load.aseprite(
      'CondoDor',
      'assets/sprites/CondoDor.png',
      'assets/sprites/CondoDor.json'
    );
    this.load.aseprite(
      'MarketDoor',
      'assets/sprites/MarketDoor.png',
      'assets/sprites/MarketDoor.json'
    );
    this.load.aseprite(
      'MetropolisDoor2',
      'assets/sprites/MetropolisDoor2.png',
      'assets/sprites/MetropolisDoor2.json'
    );
    this.load.aseprite(
      'Fountain',
      'assets/sprites/Fountain.png',
      'assets/sprites/Fountain.json'
    );
    this.load.aseprite(
      'GasStationDoor',
      'assets/sprites/GasStationDoor.png',
      'assets/sprites/GasStationDoor.json'
    );
    this.load.aseprite(
      'RailingGate',
      'assets/sprites/RailingGate.png',
      'assets/sprites/RailingGate.json'
    );
    this.load.aseprite(
      'ShoppingCenterDoor',
      'assets/sprites/ShoppingCenterDoor.png',
      'assets/sprites/ShoppingCenterDoor.json'
    );
    this.load.aseprite(
      'PoliceStationDoor1',
      'assets/sprites/PoliceStationDoor1.png',
      'assets/sprites/PoliceStationDoor1.json'
    );
    this.load.aseprite(
      'PoliceStationDoor3',
      'assets/sprites/PoliceStationDoor3.png',
      'assets/sprites/PoliceStationDoor3.json'
    );
    this.load.aseprite(
      'ModularBuildingDoor2',
      'assets/sprites/ModularBuildingDoor2.png',
      'assets/sprites/ModularBuildingDoor2.json'
    );
    this.load.spritesheet('PortalSprite', 'assets/sprites/PortalSprite.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('map_tiles_city', 'assets/map/city.webp');
    this.load.tilemapTiledJSON('tilemap_city', 'assets/map/city.json');
    Statics.groupOfCrows = this.physics.add.group();
    Statics.groupEnemiesOfCrows = this.physics.add.group();
    Statics.groupOfCats = this.physics.add.group();
    Statics.groupEnemiesOfCat = this.physics.add.group();
    Statics.tilesNotTotallySafeForLivingBeings =
      this.tilesNotTotallySafeForLivingBeings;
  }

  createBusSprite() {
    this.busSprite = new SpriteBus({
      scene: this,
      x: 300,
      y: 450
    });
    Statics.groupEnemiesOfCrows.add(this.busSprite);
    this.busSprite.visible = false;
    this.add.existing(this.busSprite);
  }
  moveOutBus() {
    if (!this.busSprite) return;
    this.tweens.add({
      target: this.busSprite,
      x: this.map.widthInPixels + this.busSprite.width || 0,
      ease: 'quad.in',
      delay: 1000,
      targets: this.busSprite,
      duration: 3000,
      repeat: 0,
      hold: 500,
      onComplete: () => this.busSprite?.destroy()
    });
  }
  showPlayer() {
    this.busSprite?.off('animationcomplete');
    Statics.groupEnemiesOfCrows.add(this.spriteLudo);
    this.spriteLudo.visible = true;
    this.spriteLudo.setState(0.1);
    this.spriteLudo.alpha = 0.1;
    this.spriteLudo.anims.play('down_move', true);
    this.tweens.add({
      targets: this.spriteLudo,
      alpha: 1,
      scaleX: this.spriteLudo.scaleByDefault,
      y: this.spriteLudo.y + 32,
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        this.busSprite?.anims.play('closing_doors');
        this.busSprite?.on('animationcomplete', () => {
          this.busSprite?.anims.play('move_right', true);
        });
        this.spriteLudo.body!.enable = true;
        this.cameras.main.startFollow(this.spriteLudo);
        this.moveOutBus();
      }
    });
  }

  prepareAndAnimateBus(objectsLayers: Phaser.Tilemaps.ObjectLayer[]) {
    if (!this.busSprite) return;
    const busStartObject = this.getObject('busStart', objectsLayers);
    if (busStartObject) {
      this.busSprite.x =
        busStartObject.x || 0 + (busStartObject.width || 0) / 2;
      this.busSprite.y =
        busStartObject.y || 0 + (busStartObject.height || 0) / 2;
      this.busSprite.visible = true;
      const busEndObject = this.getObject('busEnd', objectsLayers);
      if (busEndObject && busEndObject.x) {
        const endPosition = busEndObject.x - this.busSprite.width / 2;

        this.tweens.add({
          targets: this.busSprite,
          x: endPosition,
          duration: 5000,
          repeat: 0,
          hold: 500,
          ease: 'cubic.out',
          onComplete: () => {
            this.busSprite?.anims.play('open_doors', true);
            this.busSprite?.on('animationcomplete', () => this.showPlayer());
          }
        });

        this.cameras.main.startFollow(this.busSprite);
      }
    }
  }

  create() {
    this.frontLayer?.preFX.addColorMatrix();
    super.create('city', true);
    this.cameras.main.setZoom(1);

    Statics.map = this.map;
    Statics.tilesCollision = this.tilesCollision;
    Statics.tilesNotSafeForLivingBeings = this.tilesNotSafeForLivingBeings;
    Statics.tilesNotTotallySafeForLivingBeings =
      this.tilesNotTotallySafeForLivingBeings;

    if (this.spriteLudo.body) this.spriteLudo.body.enable = false;
    this.spriteLudo.visible = false;
    this.createBusSprite();

    CrowActor.createCrows(this, this.TOTAL_CROWS);
    CatActor.createCats(this, this.TOTAL_CATS);

    this.prepareAndAnimateBus(this.map.objects);
    this.preparePassOfTime();
  }
}
