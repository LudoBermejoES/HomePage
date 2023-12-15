import * as Phaser from 'phaser';
interface LudoProps {
    scene: Phaser.Scene;
    x: number;
    y: number;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
}
export default class SpriteLudo extends Phaser.Physics.Arcade.Sprite {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    velocity: number;
    collideX: string;
    collideY: string;
    lastCollideXBeforeStopping: string;
    lastCollideYBeforeStopping: string;
    lastX: string;
    lastY: string;
    constructor(config: LudoProps);
    createAnims(): void;
    updateMovement(): void;
}
export {};
//# sourceMappingURL=SpriteLudo.d.ts.map