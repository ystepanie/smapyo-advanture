import Phaser from 'phaser';
import { PlayerStats } from '../state/GameState';

export class Player extends Phaser.Physics.Arcade.Sprite {
    public hp: number;
    public maxHp: number;
    public speed: number;
    private lastHit: number;

    constructor(scene: Phaser.Scene, x: number, y: number, stats: PlayerStats) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(32 / this.width);
        (this.body as Phaser.Physics.Arcade.Body).setSize(this.width * 0.6, this.height * 0.8);
        (this.body as Phaser.Physics.Arcade.Body).setOffset(this.width * 0.2, this.height * 0.2);
        
        this.hp = stats.hp;
        this.maxHp = stats.maxHp;
        this.speed = stats.speed;
        this.lastHit = 0;
        this.setDepth(10);
    }

    update(cursors: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key }): void {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);

        if (cursors.left.isDown) {
            body.setVelocityX(-this.speed);
        } else if (cursors.right.isDown) {
            body.setVelocityX(this.speed);
        }

        if (cursors.up.isDown) {
            body.setVelocityY(-this.speed);
        } else if (cursors.down.isDown) {
            body.setVelocityY(this.speed);
        }

        body.velocity.normalize().scale(this.speed);
    }

    takeDamage(amount: number, time: number): boolean {
        if (time < this.lastHit + 1000) return false;
        
        this.hp -= amount;
        this.lastHit = time;
        this.setAlpha(0.5);
        this.scene.time.delayedCall(200, () => this.setAlpha(1));
        
        return true;
    }
}
