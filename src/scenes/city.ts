import BaseScene, { Action } from './baseScene';
import SpriteBus from '../sprites/SpriteBus';
import { CrowActor } from '../actors/crow/actor';
import { CatActor } from '../actors/cat/actor';
import Statics from '../actors/statics/statics';
import { SIZES } from '../lib/constants';
import { CitizenActor } from '../actors/citizen/actor';
import OnTheFlyImage from '../sprites/OnTheFlyImage';

export default class City extends BaseScene {
  busSprite: SpriteBus | undefined;
  TOTAL_CROWS: number = 15;
  TOTAL_CATS: number = 5;

  constructor() {
    super('city');
  }

  preloadStaticImages() {
    this.load.image(
      'ME_Singles_City_Props_Bench_6',
      'assets/sprites/statics/ME_Singles_City_Props_Bench_6.webp'
    );
    this.load.image(
      'ME_Singles_Camping_Benched_Table_1',
      'assets/sprites/statics/ME_Singles_Camping_Benched_Table_1.webp'
    );
    this.load.image(
      'ME_Singles_Camping_Benched_Table_2',
      'assets/sprites/statics/ME_Singles_Camping_Benched_Table_2.webp'
    );
    this.load.image(
      'ME_Singles_Camping_Benched_Table_3',
      'assets/sprites/statics/ME_Singles_Camping_Benched_Table_3.webp'
    );
    this.load.image(
      'ME_Singles_Camping_Benched_Table_4',
      'assets/sprites/statics/ME_Singles_Camping_Benched_Table_4.webp'
    );
    this.load.image(
      'ME_Singles_City_Props_Bench_1',
      'assets/sprites/statics/ME_Singles_City_Props_Bench_1.webp'
    );
    this.load.image(
      'ME_Singles_City_Props_Bench_2',
      'assets/sprites/statics/ME_Singles_City_Props_Bench_2.webp'
    );
    this.load.image(
      'ME_Singles_City_Props_Bench_3',
      'assets/sprites/statics/ME_Singles_City_Props_Bench_3.webp'
    );
    this.load.image(
      'ME_Singles_City_Props_Bench_4',
      'assets/sprites/statics/ME_Singles_City_Props_Bench_4.webp'
    );
    this.load.image(
      'ME_Singles_City_Props_Bench_5',
      'assets/sprites/statics/ME_Singles_City_Props_Bench_5.webp'
    );
  }

  preloadSprites() {
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
      'SleepBubble',
      'assets/sprites/SleepBubble.png',
      'assets/sprites/SleepBubble.json'
    );
    this.load.aseprite(
      'ModularBuildingDoor2',
      'assets/sprites/ModularBuildingDoor2.png',
      'assets/sprites/ModularBuildingDoor2.json'
    );
  }

  preloadMap() {
    this.load.image('map_tiles_city', 'assets/map/city.webp');
    this.load.tilemapTiledJSON('tilemap_city', 'assets/map/city.json');
  }

  preload() {
    this.preloadStaticImages();
    this.preloadSprites();
    this.preloadMap();

    CitizenActor.preloadCitizens(this);
    Statics.groupOfPlacesToRest = this.physics.add.group();
    Statics.groupOfCrows = this.physics.add.group();
    Statics.groupEnemiesOfCrows = this.physics.add.group();
    Statics.groupOfCats = this.physics.add.group();
    Statics.groupEnemiesOfCat = this.physics.add.group();
    Statics.groupOfCitizens = this.physics.add.group();
    Statics.groupEnemiesOfCitizens = this.physics.add.group();
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
    Statics.groupEnemiesOfCat.add(this.busSprite);
    Statics.groupEnemiesOfCat.add(this.spriteLudo);
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
    this.spriteLudo.anims.play('move_down', true);
    this.tweens.add({
      targets: this.spriteLudo,
      alpha: 1,
      scaleX: this.spriteLudo.scaleByDefault,
      y: this.spriteLudo.y + SIZES.BLOCK,
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
    super.create('city', true);
    this.cameras.main.setZoom(1.5);

    Statics.map = this.map;
    Statics.tilesCollision = this.tilesCollision;
    Statics.tilesNotSafeForLivingBeings = this.tilesNotSafeForLivingBeings;
    Statics.tilesNotTotallySafeForLivingBeings =
      this.tilesNotTotallySafeForLivingBeings;

    if (this.spriteLudo.body) this.spriteLudo.body.enable = false;
    this.spriteLudo.visible = false;
    this.createBusSprite();

    Statics.groupOfPlacesToRest.children.entries = this.groupOfActions.filter(
      (entry: Phaser.GameObjects.GameObject) => {
        const object = entry as OnTheFlyImage;
        if (!object.actionList) return false;
        return object.actionList.actions.find(
          (action: Action) => action.name === 'sit'
        );
      }
    );

    CrowActor.createCrows(this, this.TOTAL_CROWS);
    CatActor.createCats(this, this.TOTAL_CATS);
    CitizenActor.createCitizens(this);

    this.prepareAndAnimateBus(this.map.objects);
    this.preparePassOfTime();
  }
}
