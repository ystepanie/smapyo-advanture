import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    public hp: number;
    public speed: number;
    public attackRate: number;
    public lastFired: number;

    constructor(scene: Phaser.Scene, x: number, y: number, level: number) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.hp = 20 + (level * 5);
        this.speed = 100 + (level * 5);
        this.attackRate = 1500;
        this.lastFired = 0;
        this.setDepth(5);
    }

    update(player: Phaser.GameObjects.Components.Transform, time: number): void {
        if (!this.active) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, (player as any).x, (player as any).y);
        
        if (distance > 200) {
            this.scene.physics.moveToObject(this, player, this.speed);
        } else {
            (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
        }

        if (time > this.lastFired + this.attackRate) {
            this.fire(player);
            this.lastFired = time;
        }
    }

    fire(target: Phaser.GameObjects.Components.Transform): void {
        const bullet = (this.scene as any).enemyBullets.get(this.x, this.y);
        if (bullet) {
            bullet.fire(this.x, this.y, target, 250);
            bullet.setTint(0xff0000);
        }
    }

    takeDamage(amount: number): boolean {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }
}
