import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, level) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.hp = 20 + (level * 5);
        this.speed = 100 + (level * 5);
        this.setDepth(5);
    }

    update(player) {
        if (!this.active) return;
        this.scene.physics.moveToObject(this, player, this.speed);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }
}
