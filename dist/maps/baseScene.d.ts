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
    calculateAreaToCapture(): {
        xToCheck: number;
        yToCheck: number;
        widthToCheck: number;
        heightToCheck: number;
    } | undefined;
    checkPixels(gameObject1: Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody, gameObject2: Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody): void;
    prepareCollisionLayer(layer: Phaser.Tilemaps.LayerData): Phaser.Tilemaps.TilemapLayer;
    drawLayers(layers: Phaser.Tilemaps.LayerData[]): {
        allLayers: Phaser.Tilemaps.TilemapLayer[];
        collisionLayers: Phaser.Tilemaps.TilemapLayer[];
    };
    drawPortals(objects: Phaser.Types.Tilemaps.TiledObject[]): void;
    getPlayertart(objects: Phaser.Types.Tilemaps.TiledObject[]): void;
    create(tile: string, pixelCollision?: boolean): void;
    preparePathFinding(collisionLayers: Phaser.Tilemaps.TilemapLayer[]): void;
    update(): void;
}
//# sourceMappingURL=baseScene.d.ts.map