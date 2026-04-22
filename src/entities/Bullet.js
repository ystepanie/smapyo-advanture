import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, target, speed, range = 300) {
        this.startX = x;
        this.startY = y;
        this.range = range;
        this.enableBody(true, x, y, true, true);
        this.scene.physics.moveToObject(this, target, speed);
    }

    onHit() {
        this.disableBody(true, true);
    }

    update() {
        if (!this.active) return;

        // 화면 밖으로 나가거나 사거리를 초과하면 제거
        const traveled = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600 || traveled > this.range) {
            this.onHit();
        }
    }
}
