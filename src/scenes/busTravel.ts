import * as Phaser from 'phaser';
import SpriteBus from '../sprites/SpriteBus';
import SpriteCar from '../sprites/SpriteCar';
import { loadCars as carNormalLoad } from '../sprites/SpriteCar';
import { loadCars as carClassicLoad } from '../sprites/SpriteCarClassic';
import SpriteSign from '../sprites/SpriteSign';
import SpriteCarClassic from '../sprites/SpriteCarClassic';
import SpriteTree from '../sprites/SpriteTree';
import { loadImages } from '../ui/Dialog';
import { preloadHead } from '../sprites/SpriteHead';
import { ScriptScene } from '../ui/ScriptScene';
import { DialogObject } from '../ui/Interfaces';
import { DialogScene } from '../ui/DialogScene';

export default class BusTravel extends Phaser.Scene {
  map!: Phaser.Tilemaps.Tilemap;
  tileSprite!: Phaser.GameObjects.TileSprite;
  bus: SpriteBus | undefined;
  objectsCreated: SpriteCar[] | SpriteCarClassic[] | SpriteSign[] = [];
  scripScene: ScriptScene = new ScriptScene();
  scriptLines: DialogObject[] = this.scripScene.getSceneChildren('BusScene');
  constructor() {
    super('busTravel');
  }

  preload() {
    const heads: string[] = this.scriptLines.map((line) => line.name);
    preloadHead(this, heads);
    this.load.image(
      '_Terrains_and_Fences_32x32',
      'assets/map/exteriors/1_Terrains_and_Fences_32x32.png'
    );
    this.load.image(
      '_City_Terrains_32x32',
      'assets/map/exteriors/2_City_Terrains_32x32.png'
    );
    this.load.tilemapTiledJSON(
      '_Terrains_and_Fences_32x32',
      'assets/map/bus.tmj'
    );
    this.load.aseprite(
      'BusSprite',
      'assets/sprites/bus.png',
      'assets/sprites/bus.json'
    );
    carNormalLoad(this);
    carClassicLoad(this);
    this.load.aseprite(
      'SignSprite',
      'assets/sprites/sign.png',
      'assets/sprites/sign.json'
    );
    this.load.aseprite(
      'TreeSprite',
      'assets/sprites/trees.png',
      'assets/sprites/trees.json'
    );

    loadImages(this);
    this.load.tilemapTiledJSON('_City_Terrains_32x32', 'assets/map/bus.tmj');
  }

  drawLayers(layers: Phaser.Tilemaps.LayerData[]) {
    layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
      this.map.createLayer(layer.name, [
        '_Terrains_and_Fences_32x32',
        '_City_Terrains_32x32'
      ]);
    });
  }
  doMovement(image: HTMLImageElement) {
    const snap = this.textures.createCanvas('snap', image.width, image.height);
    if (snap) {
      snap.draw(0, 0, image);
    }
    this.tileSprite = this.add
      .tileSprite(0, 0, image.width, image.height, 'snap')
      .setOrigin(0, 0);
  }

  createMap() {
    this.map = this.make.tilemap({ key: `_City_Terrains_32x32` });
    this.map.addTilesetImage(
      `_Terrains_and_Fences_32x32`,
      `_Terrains_and_Fences_32x32`
    );
    this.map.addTilesetImage('_City_Terrains_32x32', '_City_Terrains_32x32');
    this.drawLayers(this.map.layers);

    this.make.renderTexture(
      {
        width: this.map.width,
        height: this.map.height
      },
      false
    );
  }

  create() {
    this.createMap();

    this.game.renderer.snapshot((image) => {
      //this.cameras.main.fadeIn(3000);
      this.doMovement(image as HTMLImageElement);
      this.map.destroy();
      this.bus = new SpriteBus({
        scene: this,
        x: 300,
        y: 450
      });
      this.add.existing(this.bus);

      const widthDialog = this.scale.getViewPort().width / 1.5;
      new DialogScene(this, this.scriptLines, {
        scene: this,
        widthDialog
      });
    });
  }

  createTimers() {
    this.time.addEvent({
      delay: Math.random() * 3000 + 2000,
      callback: this.createCar,
      callbackScope: this,
      loop: false
    });
    this.time.addEvent({
      delay: Math.random() * 3000 + 3000,
      callback: this.createSign,
      callbackScope: this,
      loop: false
    });
    this.time.addEvent({
      delay: Math.random() * 1000 + 1000,
      callback: () => this.createTree(true),
      callbackScope: this,
      loop: false
    });
    this.time.addEvent({
      delay: Math.random() * 1000 + 1000,
      callback: () => this.createTree(false),
      callbackScope: this,
      loop: false
    });
  }

  chooseCar(): SpriteCar | SpriteCarClassic {
    const number = Math.floor(Math.random() * 2);
    if (number) {
      return new SpriteCar({
        scene: this,
        x: this.scale.width,
        y: 350,
        name: ''
      });
    }
    return new SpriteCarClassic({
      scene: this,
      x: this.scale.width,
      y: 300 + Math.random() * 50,
      name: ''
    });
  }

  createSign() {
    const commonConf = {
      scene: this,
      x: this.scale.width + 100,
      y: Phaser.Math.Between(0, 1) ? 130 : 550,
      depth: 100
    };
    const sign = new SpriteSign(commonConf);
    sign.setDepth(100);
    this.objectsCreated.push(sign);
    this.add.existing(sign);
    this.time.addEvent({
      delay: Math.random() * 3000 + 2000,
      callback: this.createSign,
      callbackScope: this,
      loop: false
    });
  }

  createTree(up: boolean) {
    const y = up
      ? Phaser.Math.Between(100, 130)
      : 550 + Phaser.Math.Between(0, 300);
    const commonConf = {
      scene: this,
      x: this.scale.width + 100,
      y,
      scale: Phaser.Math.Between(0.5, 1),
      depth: 50
    };
    const sign = new SpriteTree(commonConf);
    this.objectsCreated.push(sign);
    this.add.existing(sign);
    this.time.addEvent({
      delay: Math.random() * 1000 + 500,
      callback: () => this.createTree(up),
      callbackScope: this,
      loop: false
    });
  }

  createCar() {
    const car: SpriteCar | SpriteCarClassic = this.chooseCar();
    car.flipX = true;
    car.setVelocityX(-250 + Math.random() * -1000);
    car.anims.play('move', true);
    this.objectsCreated.push(car);
    this.add.existing(car);
    this.time.addEvent({
      delay: Math.random() * 3000 + 2000,
      callback: this.createCar,
      callbackScope: this,
      loop: false
    });
  }

  update() {
    if (this.bus) {
      //this.bus.setVelocityX(1);
    }
    if (this.tileSprite) this.tileSprite.tilePositionX += 4;
    const destroyedObjects: SpriteCar[] | SpriteCarClassic[] | SpriteSign[] =
      [];
    this.objectsCreated.forEach(
      (object: SpriteCar | SpriteCarClassic | SpriteSign) => {
        if (object.x < -100) {
          destroyedObjects.push(object);
        } else if (!object.body?.velocity?.x) {
          object.setPosition(object.x - 4, object.y);
        }
      }
    );
    this.objectsCreated = this.objectsCreated.filter(function (el) {
      return destroyedObjects.indexOf(el) < 0;
    });
    destroyedObjects.forEach((car) => car.destroy());
  }
}
