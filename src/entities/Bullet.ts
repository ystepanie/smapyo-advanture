import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    private startX: number = 0;
    private startY: number = 0;
    private range: number = 300;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
    }

    fire(x: number, y: number, target: { x: number; y: number }, speed: number, range: number = 300): void {
        this.startX = x;
        this.startY = y;
        this.range = range;
        this.enableBody(true, x, y, true, true);
        this.scene.physics.moveToObject(this, target, speed);
    }

    onHit(): void {
        this.disableBody(true, true);
    }

    update(): void {
        if (!this.active) return;

        const traveled = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600 || traveled > this.range) {
            this.onHit();
        }
    }
}
