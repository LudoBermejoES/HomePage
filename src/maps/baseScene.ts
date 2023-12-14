import SpriteLudo from '../sprites/SpriteLudo';
import * as Phaser from 'phaser';

export default class BaseScene extends Phaser.Scene {
  controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  spriteLudo: SpriteLudo;
  map: Phaser.Tilemaps.Tilemap;
  mapCollisions: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  canvas: Phaser.Textures.CanvasTexture;
  rt: Phaser.GameObjects.RenderTexture;
  pixelCollision: boolean;

  calculateAreaToCapture() {
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
  checkPixels(
    gameObject1:
      | Phaser.Tilemaps.Tile
      | Phaser.Types.Physics.Arcade.GameObjectWithBody,
    gameObject2:
      | Phaser.Tilemaps.Tile
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const { xToCheck, yToCheck, widthToCheck, heightToCheck } =
      this.calculateAreaToCapture();

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
        snap.draw(0, 0, image);
        const pixelsList = snap.getPixels(0, 0, image.width, image.height);
        let totalPixels: number = 0;
        pixelsList.forEach((pixelsColumn: any) => {
          const some = pixelsColumn.filter(
            (pixel: any) => pixel.alpha > 0 && pixel.color !== 0
          );
          totalPixels += some.length;
        });
        console.log(totalPixels);

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

  prepareCollisionLayer(layer: Phaser.Tilemaps.LayerData) {
    const collisionLayer = this.mapCollisions.createLayer(
      layer.name,
      this.tileset
    );
    collisionLayer.setCollisionByExclusion([-1]);
    collisionLayer.visible = false;
    this.rt.draw(collisionLayer);
    this.rt.visible = false;
    this.rt.x = 400;
    this.rt.y = 300;

    this.physics.add.collider(
      this.spriteLudo,
      collisionLayer,
      null,
      (
        object1:
          | Phaser.Tilemaps.Tile
          | Phaser.Types.Physics.Arcade.GameObjectWithBody,
        object2:
          | Phaser.Tilemaps.Tile
          | Phaser.Types.Physics.Arcade.GameObjectWithBody
      ) => {
        console.log(object1, object2);
        if (this.pixelCollision) {
          this.checkPixels(object1, object2);
          return false;
        }
        return true;
      }
    );
  }

  drawLayers(layers: Phaser.Tilemaps.LayerData[]) {
    layers.forEach((layer: Phaser.Tilemaps.LayerData) => {
      const createdLayer: Phaser.Tilemaps.TilemapLayer = this.map.createLayer(
        layer.name,
        this.tileset
      );
      createdLayer.visible = true;
      if (layer.name.toLowerCase().includes('collision')) {
        this.prepareCollisionLayer(layer);
      }
    });
  }

  create(tile: string, pixelCollision: boolean = false) {
    this.pixelCollision = pixelCollision;
    const image = this.game.textures.get('map_tiles');
    this.canvas = this.textures.createCanvas(
      'pixelCollision',
      image.getSourceImage().width,
      image.getSourceImage().height
    );

    // create the Tilemap
    this.map = this.make.tilemap({ key: 'tilemap' });
    this.mapCollisions = this.make.tilemap({ key: 'tilemap' });
    // add the tileset image we are using
    this.tileset = this.map.addTilesetImage(tile, 'map_tiles');
    // create the layers we want in the right order
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spriteLudo = new SpriteLudo({
      scene: this,
      x: 100,
      y: 0,
      cursors: this.cursors
    });
    this.rt = this.add.renderTexture(0, 0, 800, 600);

    this.drawLayers(this.map.layers);

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
    this.spriteLudo.updateMovement();
  }
}
