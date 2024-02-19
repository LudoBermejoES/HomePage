import { AStarFinder } from 'astar-typescript';
import * as Phaser from 'phaser';
import { SpriteMovement } from '../AI/base/core/SpriteMovement';
import { DEPTH, SIZES } from '../lib/constants';
import GotoSceneObject from '../objects/gotoSceneObject';
import OnTheFlyImage from '../sprites/interactableObjects/OnTheFlyImage';
import OnTheFlySprite from '../sprites/interactableObjects/OnTheFlySprite';
import OverlapSprite from '../sprites/OverlapArea';
import SpriteLudo from '../sprites/SpriteLudo';
import InteractableObject from '../sprites/interactableObjects/InteractableObject';

export interface Action {
  name: string;
  animation?: string;
  positions?: string[];
}

export interface ActionList {
  actions: Action[];
  image?: string;
  sprite?: string;
  object?: InteractableObject;
}

export interface CitizenPriorities {
  WALKING: number;
  GOTO_REST: number;
  RESTING: number;
  GOTO_TALK: number;
  TALKING_GOAL: number;
}

export default class BaseScene extends Phaser.Scene {
  MAX_ALPHA_NIGHT: number = 0.8;

  collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  controls!: Phaser.Cameras.Controls.SmoothedKeyControl;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  timerConfigCycleOfDays!: Phaser.Types.Time.TimerEventConfig;
  currentTimeOfCycle: number = 0;
  overlayCycleTween?: Phaser.Tweens.Tween;
  spriteLudo!: SpriteLudo;
  map!: Phaser.Tilemaps.Tilemap;
  frontLayer!: Phaser.Tilemaps.TilemapLayer | null;
  allLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  timer: Phaser.Time.TimerEvent | undefined;
  mapCollisions!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  canvas!: Phaser.Textures.CanvasTexture;
  rt!: Phaser.GameObjects.RenderTexture;
  pixelCollision!: boolean;
  aStarInstance!: AStarFinder;
  name: string = '';
  tilesCollision: number[][];
  tilesNotSafeForLivingBeings: number[][];
  tilesNotTotallySafeForLivingBeings: number[][];
  tilesActions: ActionList[];
  groupOfActions: (OnTheFlyImage | OnTheFlySprite)[];
  CITIZEN_PRIORITIES: CitizenPriorities = {
    WALKING: 0.5,
    GOTO_REST: 0.9,
    RESTING: 0.95,
    GOTO_TALK: 0.6,
    TALKING_GOAL: 0.95
  };

  preloadUI() {
    this.load.aseprite(
      'PressE',
      'assets/ui/PressE.webp',
      'assets/ui/PressE.json'
    );
  }

  drawLayers(layers: Phaser.Tilemaps.LayerData[]): {
    tilesCollision: number[][];
    tilesNotSafeForLivingBeings: number[][];
    tilesNotTotallySafeForLivingBeings: number[][];
    groupOfActions: (OnTheFlyImage | OnTheFlySprite)[];
  } {
    const tilesOnTop: Phaser.Tilemaps.Tile[] = [];
    this.allLayers = [];
    const tilesCollision: number[][] = Array(this.map.height)
      .fill(1)
      .map(() => new Array(this.map.width).fill(0));

    const tilesNotSafeForLivingBeings: number[][] = Array(this.map.height)
      .fill(1)
      .map(() => new Array(this.map.width).fill(0));

    const tilesNotTotallySafeForLivingBeings: number[][] = Array(
      this.map.height
    )
      .fill(1)
      .map(() => new Array(this.map.width).fill(0));

    const groupOfActions: (OnTheFlyImage | OnTheFlySprite)[] = [];

    layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
      layer.data.forEach((row: Phaser.Tilemaps.Tile[]) => {
        row.forEach((tile: Phaser.Tilemaps.Tile) => {
          if (
            tile.properties.visible !== undefined &&
            !tile.properties.visible
          ) {
            tile.visible = false;
          }
          if (tile.properties.hide) {
            tilesOnTop.push(tile);
          }

          if (tile.properties.safeForLivingBeings) {
            if (tile.properties.safeForLivingBeings !== 0) {
              tilesNotSafeForLivingBeings[tile.y][tile.x] = 0;
            } else {
              tilesNotSafeForLivingBeings[tile.y][tile.x] = 1;
            }

            if (tile.properties.safeForLivingBeings === 1) {
              tilesNotTotallySafeForLivingBeings[tile.y][tile.x] = 0;
            } else {
              tilesNotTotallySafeForLivingBeings[tile.y][tile.x] = 1;
            }
          }
          if (tile.properties.light) {
            this.lights
              .addLight(
                tile.x * SIZES.BLOCK + SIZES.MID_BLOCK,
                tile.y * SIZES.BLOCK + SIZES.MID_BLOCK,
                256
              )
              .setIntensity(1)
              .setColor(0xf2b22b)
              .setVisible(false);
          }

          if (tile.properties.collision) {
            tilesCollision[tile.y][tile.x] = 1;
            tilesNotSafeForLivingBeings[tile.y][tile.x] = 1;
            tilesNotTotallySafeForLivingBeings[tile.y][tile.x] = 1;
          }

          if (tile.properties.sprite) {
            const sprite = new OnTheFlySprite({
              scene: this,
              x: tile.x * 32 + (tile?.properties?.moveX || 0),
              y: tile.y * 32 + (tile?.properties?.moveY || 0),
              name: tile.properties.sprite,
              type: tile.properties.type,
              gotoScene: tile.properties.gotoScene,
              spriteLudo: this.spriteLudo
            });
            this.add.existing(sprite);
          }

          if (tile.properties.image) {
            let tileActions: ActionList | undefined;
            let maxActors: number = 1;
            if (tile.properties.interactive) {
              const data = JSON.parse(tile.properties.interactive);
              tileActions = {
                actions: data.actions,
                image: tile.properties.image,
                sprite: tile.properties.sprite
              };
              if (data.maxActors) maxActors = data.maxActors;
            }

            const sprite = new OnTheFlyImage({
              scene: this,
              x: tile.x * 32 + (tile?.properties?.moveX || 0),
              y: tile.y * 32 + (tile?.properties?.moveY || 0),
              name: tile.properties.image,
              spriteLudo: this.spriteLudo,
              actions: tileActions,
              maxActors: maxActors
            });

            if (tileActions) {
              groupOfActions.push(sprite);
            }

            this.add.existing(sprite);
          }
        });
      });

      const layerCreated = this.map.createLayer(layer.name, this.tileset);
      if (layerCreated) {
        layerCreated.setCollisionByProperty({ collision: true });
        this.add.existing(layerCreated);
        this.allLayers.push(layerCreated);
      }
    });

    if (layers.length) {
      this.frontLayer = this.map.createBlankLayer(
        'onTopOfLudo',
        this.tileset,
        0,
        0
      );
      tilesOnTop.forEach((tile: Phaser.Tilemaps.Tile) => {
        this.frontLayer?.putTileAt(tile, tile.x, tile.y);
      });

      if (this.frontLayer) {
        this.frontLayer.depth = DEPTH.ON_THE_FLY_OBJECTS_ABOVE_PLAYER;
        this.add.existing(this.frontLayer);
        this.allLayers.push(this.frontLayer);
      }
    }

    this.rt = this.make.renderTexture({
      width: this.frontLayer?.width,
      height: this.frontLayer?.height
    });
    this.collisionLayer = this.map.createBlankLayer(
      'collisionLayer',
      this.tileset,
      0,
      0
    );

    this.allLayers.forEach((layer: Phaser.Tilemaps.TilemapLayer) => {
      for (let i = 0; i <= layer.tilemap.width; i++) {
        for (let j = 0; j <= layer.tilemap.height; j++) {
          const tile = layer.tilemap.getTileAt(
            i,
            j,
            undefined,
            layer.layer.name
          );
          if (tile && tile.properties.collision) {
            this.collisionLayer?.putTileAt(tile, tile.x, tile.y);
          }
        }
      }
      this.rt.draw(layer);
      if (layer !== this.frontLayer) {
        layer.destroy();
      }
    });
    this.rt.setPipeline('Light2D');
    this.allLayers.length = 0;
    this.allLayers.push(this.collisionLayer!);
    this.allLayers.push(this.frontLayer!);
    this.frontLayer?.setPipeline('Light2D');

    if (this.collisionLayer) {
      this.collisionLayer?.setCollisionByProperty({ collision: true });
      this.add.existing(this.collisionLayer);
      this.collisionLayer.visible = false;
    }

    this.rt.x = this.rt.width / 2;
    this.rt.y = this.rt.height / 2;
    this.add.existing(this.rt);

    this.allLayers.forEach((layer: Phaser.Tilemaps.TilemapLayer) => {
      this.physics.add.collider(
        this.spriteLudo,
        layer,
        undefined,
        (spriteLudo, tile) => {
          const tileBlock: Phaser.Tilemaps.Tile = tile as Phaser.Tilemaps.Tile;
          if (
            tileBlock.properties.collision &&
            this.spriteLudo.moveToTarget === undefined
          ) {
            return true;
          }
          return false;
        }
      );
    });

    return {
      tilesCollision,
      tilesNotSafeForLivingBeings,
      tilesNotTotallySafeForLivingBeings,
      groupOfActions
    };
  }

  getObject(
    nameToLook: string,
    objectsLayers: Phaser.Tilemaps.ObjectLayer[]
  ): Phaser.Types.Tilemaps.TiledObject | undefined {
    let result: Phaser.Types.Tilemaps.TiledObject | undefined = undefined;
    objectsLayers.forEach((objectsLayer: Phaser.Tilemaps.ObjectLayer) => {
      const resultSearch = objectsLayer.objects.filter(
        (objectList) => objectList.name === nameToLook
      );
      if (resultSearch.length) result = resultSearch[0];
    });

    return result;
  }

  getPlayerStart(objects: Phaser.Tilemaps.ObjectLayer[]) {
    const startObject = this.getObject('playerStart', objects);

    if (startObject) {
      this.spriteLudo.x = startObject.x || 0 + (startObject.width || 0) / 2;
      this.spriteLudo.y = startObject.y || 0 + (startObject.height || 0) / 2;
    }
  }

  prepareGotoScene(objects: Phaser.Tilemaps.ObjectLayer[]) {
    const sceneObject = this.getObject('gotoScene', objects);
    const gotoSceneObject = new GotoSceneObject({
      onEnterArea: () => {
        const scene = sceneObject?.properties?.find(
          (prop: { name: string }) => prop.name === 'scene'
        );
        if (scene) {
          const pause = sceneObject?.properties?.find(
            (prop: { name: string }) => prop.name === 'pause'
          );
          const resume = sceneObject?.properties?.find(
            (prop: { name: string }) => prop.name === 'resume'
          );
          if (pause?.value === true) {
            this.scene.pause();
            this.scene.launch(scene.value);
          } else if (resume?.value === true) {
            this.scene.resume(scene.value);
            this.scene.stop();
          } else {
            this.scene.start(scene.value);
          }
        }
        return true;
      },
      onLeaveArea: () => {}
    });
    if (sceneObject && sceneObject.x && sceneObject.y) {
      new OverlapSprite({
        x: sceneObject.x,
        y: sceneObject.y,
        parent: sceneObject,
        gotoSceneObject: gotoSceneObject,
        type: 'gotoScene',
        scene: this,
        spriteLudo: this.spriteLudo,
        name: 'overlapArea' + sceneObject.x + sceneObject.y
      });
    }
  }

  create(tile: string, pixelCollision: boolean = false) {
    this.pixelCollision = pixelCollision;
    const image = this.game.textures.get('map_tiles');
    if (this.textures.exists('pixelCollision')) {
      this.textures.remove('pixelCollision');
    }
    const canvas = this.textures.createCanvas(
      'pixelCollision',
      image.getSourceImage().width,
      image.getSourceImage().height
    );
    if (canvas) this.canvas = canvas;
    // create the Tilemap
    this.map = this.make.tilemap({ key: `tilemap_${tile}` });
    // add the tileset image we are using

    const tileset = this.map.addTilesetImage(tile, `map_tiles_${tile}`);
    if (!tileset) return;
    this.tileset = tileset;
    // create the layers we want in the right order
    const cursors = this?.input?.keyboard?.createCursorKeys();
    if (cursors) this.cursors = cursors;
    this.spriteLudo = new SpriteLudo({
      scene: this,
      x: 100,
      y: 0,
      cursors: this.cursors
    });
    this.add.existing(this.spriteLudo);

    this.rt = this.add.renderTexture(0, 0, 800, 600);
    const {
      tilesCollision,
      tilesNotSafeForLivingBeings,
      tilesNotTotallySafeForLivingBeings,
      groupOfActions
    } = this.drawLayers(this.map.layers);

    this.groupOfActions = groupOfActions;
    this.tilesCollision = tilesCollision;
    this.tilesNotSafeForLivingBeings = tilesNotSafeForLivingBeings;
    this.tilesNotTotallySafeForLivingBeings =
      tilesNotTotallySafeForLivingBeings;

    this.getPlayerStart(this.map.objects);
    this.prepareGotoScene(this.map.objects);
    this.physics.world.setBounds(
      0,
      0,
      this.map.width * 32,
      this.map.height * 32
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.map.width * 32,
      this.map.height * 32
    );
    this.preparePathfinding(this.tilesNotSafeForLivingBeings);
    this.events.on('pause', () => {
      this.spriteLudo.body!.enable = false;
    });
    this.events.on('resume', () => {
      this.spriteLudo.leaveBuilding();
    });
  }

  update() {
    if (
      this.spriteLudo.alpha < 1 ||
      !this.spriteLudo.visible ||
      this.spriteLudo.action
    )
      return;
    if (!this.spriteLudo.moveToTarget) {
      this.spriteLudo.updateMovement();
    } else {
      this.spriteLudo.updatePathMovement();
    }
    return true;
  }

  getCollisionTileInAnyLayer(
    xO?: number,
    yO?: number
  ): Phaser.Tilemaps.Tile | null {
    const x = xO ? xO : this.spriteLudo.x;
    const y = yO ? yO : this.spriteLudo.y;
    let result: Phaser.Tilemaps.Tile | null = null;
    this.allLayers.forEach((layer: Phaser.Tilemaps.TilemapLayer) => {
      const tile = layer.getTileAtWorldXY(x, y, true);
      if (tile) {
        if (tile && !result) result = tile;
        if (tile && tile.properties.collision) result = tile;
      }
    });
    return result;
  }

  getValidTile(xO?: number, yO?: number): Phaser.Tilemaps.Tile | false {
    const tile: Phaser.Tilemaps.Tile | null = this.getCollisionTileInAnyLayer(
      xO,
      yO
    );
    if (!tile) return false;
    if (!tile.properties.collision) return tile;
    const tileDown: Phaser.Tilemaps.Tile | null =
      this.getCollisionTileInAnyLayer(tile.x, tile.y + 1);
    if (tileDown && !tileDown.properties.collision) return tileDown;
    const tileUp: Phaser.Tilemaps.Tile | null = this.getCollisionTileInAnyLayer(
      tile.x,
      tile.y - 1
    );
    if (tileUp && !tileUp.properties.collision) return tileUp;
    const tileLeft: Phaser.Tilemaps.Tile | null =
      this.getCollisionTileInAnyLayer(tile.x - 1, tile.y);
    if (tileLeft && !tileLeft.properties.collision) return tileLeft;
    const tileRight: Phaser.Tilemaps.Tile | null =
      this.getCollisionTileInAnyLayer(tile.x + 1, tile.y);
    if (tileRight && !tileRight.properties.collision) return tileRight;
    return false;
  }

  tileIsTotallySafeForLivingBeings(x: number, y: number): boolean {
    if (
      this.tilesNotTotallySafeForLivingBeings[y] &&
      this.tilesNotTotallySafeForLivingBeings[y][x] === 0
    )
      return true;
    return false;
  }

  tileIsSafeForLivingBeings(x: number, y: number): boolean {
    if (
      this.tilesNotSafeForLivingBeings[y] &&
      this.tilesNotSafeForLivingBeings[y][x] === 0
    )
      return true;
    return false;
  }

  getValidTileForTotallySafeWalk(
    x: number,
    y: number
  ): { x: number; y: number } | false {
    const tile = this.frontLayer?.getTileAtWorldXY(x, y, true);
    if (!tile) return false;
    if (this.tileIsTotallySafeForLivingBeings(tile.x, tile.y))
      return {
        x: tile.x,
        y: tile.y
      };
    if (this.tileIsTotallySafeForLivingBeings(tile.x, tile.y + 1))
      return {
        x: tile.x,
        y: tile.y + 1
      };
    if (this.tileIsTotallySafeForLivingBeings(tile.x, tile.y - 1))
      return {
        x: tile.x,
        y: tile.y - 1
      };

    if (this.tileIsTotallySafeForLivingBeings(tile.x + 1, tile.y))
      return {
        x: tile.x + 1,
        y: tile.y
      };

    if (this.tileIsTotallySafeForLivingBeings(tile.x - 1, tile.y))
      return {
        x: tile.x - 1,
        y: tile.y
      };

    return false;
  }

  getValidTileForSafeWalk(
    x: number,
    y: number
  ): { x: number; y: number } | false {
    const tile = this.frontLayer?.getTileAtWorldXY(x, y, true);
    if (!tile) return false;
    if (this.tileIsSafeForLivingBeings(tile.x, tile.y))
      return {
        x: tile.x,
        y: tile.y
      };
    if (this.tileIsSafeForLivingBeings(tile.x, tile.y + 1))
      return {
        x: tile.x,
        y: tile.y + 1
      };
    if (this.tileIsSafeForLivingBeings(tile.x, tile.y - 1))
      return {
        x: tile.x,
        y: tile.y - 1
      };

    if (this.tileIsSafeForLivingBeings(tile.x + 1, tile.y))
      return {
        x: tile.x + 1,
        y: tile.y
      };

    if (this.tileIsSafeForLivingBeings(tile.x - 1, tile.y))
      return {
        x: tile.x - 1,
        y: tile.y
      };

    return false;
  }

  prepareMovementByPointer(pointer: Phaser.Input.Pointer) {
    if (this.spriteLudo.alpha < 1 || !this.spriteLudo.visible) return;
    const touchX = pointer.worldX - this.spriteLudo.width / 2;
    const touchY = pointer.worldY - this.spriteLudo.height / 2;
    const targetVec = this.frontLayer?.worldToTileXY(touchX, touchY);
    if (!targetVec) return;
    targetVec.x += 1;
    targetVec.y += 1;
    const startVec = this.getValidTile();
    if (!startVec) return;
    const path = this.aStarInstance.findPath(startVec, targetVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    this.spriteLudo.moveAlongPath(vectorPath);
  }

  moveAndExecuteActions(object: InteractableObject, actions: ActionList) {
    const startVec = this.getValidTile();
    if (!startVec) return;

    const position = new Phaser.Math.Vector2(
      object.x < this.spriteLudo.x ? object.x + object.width : object.x,
      object.y < this.spriteLudo.y ? object.y + object.height : object.y
    );

    const endVec =
      SpriteMovement.getNearestTotallySafePositionForPosition(position);

    const path = this.aStarInstance.findPath(startVec, endVec);
    const vectorPath: Phaser.Math.Vector2[] = [];
    path.forEach((pathPoint: number[]) => {
      vectorPath.push(
        new Phaser.Math.Vector2({
          x: pathPoint[0],
          y: pathPoint[1]
        })
      );
    });
    this.spriteLudo.moveAlongPath(vectorPath, { ...actions, object });
  }

  doPathfinding(
    pointer: Phaser.Input.Pointer,
    objectsClicked: Phaser.GameObjects.GameObject[]
  ) {
    const needToExecuteActions = objectsClicked.filter(
      (object) => (object as OnTheFlyImage).actionList
    );

    if (needToExecuteActions.length > 0) {
      const object = needToExecuteActions[0] as OnTheFlyImage;
      if (object.actionList)
        this.moveAndExecuteActions(object, object.actionList);
    } else {
      this.prepareMovementByPointer(pointer);
    }

    return;
    this.timer = this.time.addEvent({
      delay: 100, // ms
      callback: () => {
        this.spriteLudo.movePath = [];
        this.spriteLudo.moveToTarget = undefined;
        this.prepareMovementByPointer(pointer);
      },
      loop: true
    });
  }

  preparePathfinding(matrix: number[][]) {
    this.aStarInstance = new AStarFinder({
      grid: {
        matrix
      },
      diagonalAllowed: true,
      includeStartNode: false,
      includeEndNode: true,
      allowPathAsCloseAsPossible: true
    });

    this.input.on(
      'pointerdown',
      (
        pointer: Phaser.Input.Pointer,
        objectsClicked: Phaser.GameObjects.GameObject[]
      ) => {
        if (this.spriteLudo.action) {
          this.time.delayedCall(100, () =>
            this.doPathfinding(pointer, objectsClicked)
          );
        } else {
          this.doPathfinding(pointer, objectsClicked);
        }
      }
    );
  }

  preparePassOfTime(timeOfCycle: number = 10 * 60 * 1000) {
    /* add or load tilemap layers ... and stuff */
    if (!this.frontLayer) return;
    //this.lights.addLight(500, 250, 200);
    this.lights.enable().setAmbientColor(0xffffff);

    const allLight: Phaser.Display.Color =
      Phaser.Display.Color.ValueToColor(0xffffff);

    const noLight: Phaser.Display.Color =
      Phaser.Display.Color.ValueToColor(0x102c54);

    this.overlayCycleTween = this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: timeOfCycle / 2,
      ease: 'quad.out',
      yoyo: true,
      loop: -1,
      onUpdate: (tween) => {
        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          allLight,
          noLight,
          100,
          tween.getValue()
        );
        this.lights.setAmbientColor(
          Phaser.Display.Color.GetColor(
            colorObject.r,
            colorObject.g,
            colorObject.b
          )
        );

        this.lights.lights.forEach((light: Phaser.GameObjects.Light) => {
          if (!light.visible && tween.getValue() > 70) light.visible = true;
          else if (light.visible && tween.getValue() < 70)
            light.visible = false;
        });
      }
    });
  }
}
