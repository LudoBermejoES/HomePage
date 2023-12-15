import SpriteLudo from '../sprites/SpriteLudo';
import * as Phaser from 'phaser';
import SpritePortal from '../sprites/SpritePortal';
import {
  Grid,
  PathNode,
  Pathfinding,
  DistanceMethod
} from '@raresail/phaser-pathfinding';
export default class BaseScene extends Phaser.Scene {
  controls!: Phaser.Cameras.Controls.SmoothedKeyControl;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spriteLudo!: SpriteLudo;
  map!: Phaser.Tilemaps.Tilemap;
  mapCollisions!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  canvas!: Phaser.Textures.CanvasTexture;
  rt!: Phaser.GameObjects.RenderTexture;
  pixelCollision!: boolean;
  pathfinding!: Pathfinding;

  calculateAreaToCapture() {
    if (this.spriteLudo.body === null) {
      return;
    }
    let collideX: string = '';
    let collideY: string = '';
    if (this.spriteLudo.collideX + this.spriteLudo.collideY === '') {
      collideX = this.spriteLudo.lastX;
      collideY = this.spriteLudo.lastY;
    } else {
      collideX = this.spriteLudo.collideX;
      collideY = this.spriteLudo.collideY;
    }

    const bodyBound = {
      origX: Number(this.spriteLudo.body.x),
      origY: Number(this.spriteLudo.body.y),
      x: Number(this.spriteLudo.body.x),
      y: Number(this.spriteLudo.body.y),
      width: this.spriteLudo.body.width,
      height: this.spriteLudo.body.height
    };

    let xToCheck = bodyBound.x + 10;
    let widthToCheck = this.spriteLudo.body.width - 20;
    if (collideX !== '') {
      xToCheck = collideX === 'left' ? bodyBound.x - 5 : bodyBound.x + 5;
      widthToCheck = this.spriteLudo.body.width - 5;
    }

    let yToCheck = bodyBound.y;
    let heightToCheck = this.spriteLudo.body.height - 20;
    if (collideY !== '') {
      yToCheck = collideY === 'up' ? bodyBound.y - 5 : bodyBound.y + 5;
      heightToCheck = this.spriteLudo.body.height - 5;
    }

    return {
      xToCheck,
      yToCheck,
      widthToCheck,
      heightToCheck
    };
  }
  checkPixels() {
    const { xToCheck, yToCheck, widthToCheck, heightToCheck } =
      this.calculateAreaToCapture() as {
        xToCheck: number;
        yToCheck: number;
        widthToCheck: number;
        heightToCheck: number;
      };

    this.rt.snapshotArea(
      xToCheck,
      -550 + yToCheck,
      widthToCheck,
      heightToCheck,
      (pixels) => {
        // const imagen = document.getElementById('imagen') as HTMLImageElement;
        // imagen.src = (pixels as HTMLImageElement).src;
        const image = pixels as HTMLImageElement;
        if (this.textures.exists('snap')) {
          this.textures.remove('snap');
        }
        const snap = this.textures.createCanvas(
          'snap',
          image.width,
          image.height
        );
        if (!snap) return;

        snap.draw(0, 0, image);
        const pixelsList = snap.getPixels(0, 0, image.width, image.height);
        let totalPixels: number = 0;
        pixelsList.forEach(
          (pixelsColumn: Phaser.Types.Textures.PixelConfig[]) => {
            const some = pixelsColumn.filter(
              (pixel: Phaser.Types.Textures.PixelConfig) =>
                pixel.alpha > 0 && pixel.color !== 0
            );
            totalPixels += some.length;
          }
        );

        if (totalPixels > 0) {
          if (this.spriteLudo.lastX) {
            this.spriteLudo.collideX = this.spriteLudo.lastX;
          }

          if (this.spriteLudo.lastY) {
            this.spriteLudo.collideY = this.spriteLudo.lastY;
          }
        } else {
          this.spriteLudo.collideX = '';
          this.spriteLudo.collideY = '';
        }
      }
    );
  }

  prepareCollisionLayer(
    layer: Phaser.Tilemaps.LayerData
  ): Phaser.Tilemaps.TilemapLayer | null {
    const collisionLayer = this.mapCollisions.createLayer(
      layer.name,
      this.tileset
    );
    if (!collisionLayer) return collisionLayer;
    collisionLayer.setCollisionByExclusion([-1]);
    collisionLayer.visible = false;
    this.rt.draw(collisionLayer);
    this.rt.visible = false;
    this.rt.x = 400;
    this.rt.y = 300;

    this.physics.add.collider(
      this.spriteLudo,
      collisionLayer,
      undefined,
      () => {
        if (this.pixelCollision) {
          this.checkPixels();
          return false;
        }
        return true;
      }
    );
    return collisionLayer;
  }

  drawLayers(layers: Phaser.Tilemaps.LayerData[]): {
    allLayers: Phaser.Tilemaps.TilemapLayer[];
    collisionLayers: Phaser.Tilemaps.TilemapLayer[];
    pathFinderCollisionLayers: Phaser.Tilemaps.TilemapLayer[];
  } {
    const collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    const pathFinderCollisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    const allLayers: Phaser.Tilemaps.TilemapLayer[] = [];

    layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
      const layerCreated = this.map.createLayer(layer.name, this.tileset);
      if (layerCreated) {
        allLayers.push(layerCreated);
        if (layer.name.indexOf('PathfinderCollision') > -1) {
          pathFinderCollisionLayers.push(layerCreated);
        }
      }
      if (layer.name.toLowerCase().indexOf('collision') > -1) {
        const layerCollisionCreated = this.prepareCollisionLayer(layer);
        if (layerCollisionCreated) collisionLayers.push(layerCollisionCreated);
      }
    });
    return {
      allLayers,
      collisionLayers,
      pathFinderCollisionLayers
    };
  }
  drawPortals(objects: Phaser.Tilemaps.ObjectLayer[]) {
    const messages = objects.filter(
      (objectList) => objectList.name === 'Portals'
    );
    messages.forEach((messageObject: Phaser.Tilemaps.ObjectLayer) => {
      messageObject.objects.forEach(
        (message: Phaser.Types.Tilemaps.TiledObject) => {
          const moveToArea = new SpritePortal({
            scene: this,
            x: message.x || 0,
            y: message.y || 0,
            width: message.width || 0,
            height: message.height || 0,
            name: message.name
          });
          this.add.existing(moveToArea);

          this.physics.add.collider(
            this.spriteLudo,
            moveToArea,
            undefined,
            () => {
              if (!this.spriteLudo.moveToTarget) {
                this.scene.launch(message.name);
                this.scene.sleep(this.scene.key);
              }
              return false;
            }
          );
        }
      );
    });
  }

  getPlayertart(objects: Phaser.Types.Tilemaps.TiledObject[]) {
    const messages = objects.filter(
      (objectList) => objectList.name === 'Player'
    );
    if (messages.length) {
      const startObject: Phaser.Types.Tilemaps.TiledObject = (
        messages[0] as Phaser.Tilemaps.ObjectLayer
      ).objects[0];
      if (startObject) {
        this.spriteLudo.x = startObject.x || 0 + (startObject.width || 0) / 2;
        this.spriteLudo.y = startObject.y || 0 + (startObject.height || 0) / 2;
      }
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
    this.mapCollisions = this.make.tilemap({ key: `tilemap_${tile}` });
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
    this.rt = this.add.renderTexture(0, 0, 800, 600);

    const { collisionLayers, pathFinderCollisionLayers } = this.drawLayers(
      this.map.layers
    );

    this.preparePathfinding([...collisionLayers, ...pathFinderCollisionLayers]);
    this.drawPortals(this.map.objects);
    this.getPlayertart(this.map.objects);

    this.add.existing(this.spriteLudo);
    this.physics.world.setBounds(
      0,
      0,
      this.map.width * 16,
      this.map.height * 16
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.map.width * 16,
      this.map.height * 16
    );
  }

  update() {
    if (!this.spriteLudo.moveToTarget) {
      this.spriteLudo.updateMovement();
    } else {
      this.spriteLudo.updatePathMovement();
    }
    return true;
  }

  preparePathfinding(collisionLayers: Phaser.Tilemaps.TilemapLayer[]) {
    const grid = Grid.createFromMap(this.map, collisionLayers);

    // The pathfinding instance is created from the grid and is used to get the path between 2 vectors on the map
    this.pathfinding = new Pathfinding(grid);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const touchX = pointer.worldX - this.spriteLudo.width / 2;
      const touchY = pointer.worldY - this.spriteLudo.height / 2;
      const startVec = collisionLayers[0].worldToTileXY(
        this.spriteLudo.x,
        this.spriteLudo.y
      );
      const targetVec = collisionLayers[0].worldToTileXY(touchX, touchY);
      const path = this.pathfinding.findPathBetweenTl(startVec, targetVec, {
        simplify: false,
        distanceMethod: DistanceMethod.Octile,
        diagonal: false
      });
      const vectorPath: Phaser.Math.Vector2[] = path.map(
        (pathNode: PathNode) => {
          return new Phaser.Math.Vector2(pathNode.worldX, pathNode.worldY);
        }
      );
      console.log('PATHFINDING', vectorPath);
      this.spriteLudo.moveAlongPath(vectorPath);
    });
  }
}
