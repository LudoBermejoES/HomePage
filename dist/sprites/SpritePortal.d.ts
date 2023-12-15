import * as Phaser from 'phaser';
interface PortalProps {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
}
export default class SpritePortal extends Phaser.Physics.Arcade.Sprite {
    namePortal: string;
    constructor(config: PortalProps);
    createAnims(): void;
}
export {};
//# sourceMappingURL=SpritePortal.d.ts.map