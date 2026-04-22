import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, stats) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Scale down to match original 32x32 size
        this.setDisplaySize(32, 32);
        this.body.setSize(this.width, this.height);
        
        this.setCollideWorldBounds(true);
        this.hp = stats.hp;
        this.maxHp = stats.maxHp;
        this.speed = stats.speed;
        this.lastHit = 0;
    }

    update(cursors) {
        this.setVelocity(0);

        if (cursors.left.isDown) this.setVelocityX(-this.speed);
        else if (cursors.right.isDown) this.setVelocityX(this.speed);

        if (cursors.up.isDown) this.setVelocityY(-this.speed);
        else if (cursors.down.isDown) this.setVelocityY(this.speed);
    }

    takeDamage(amount, time) {
        if (time > this.lastHit + 1000) {
            this.hp -= amount;
            this.lastHit = time;
            
            this.scene.cameras.main.shake(100, 0.01);
            this.setTint(0xff0000);
            this.scene.time.delayedCall(200, () => this.clearTint());
            
            return true;
        }
        return false;
    }
}
