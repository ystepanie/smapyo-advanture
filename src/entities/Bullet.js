import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, target, speed) {
        this.enableBody(true, x, y, true, true);
        this.scene.physics.moveToObject(this, target, speed);
    }

    onHit() {
        this.disableBody(true, true);
    }

    update() {
        if (this.active && (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600)) {
            this.onHit();
        }
    }
}
