import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const graphics = this.add.graphics();
        
        // Player
        graphics.fillStyle(0x4a90e2, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('player', 32, 32);
        graphics.clear();

        // Enemy
        graphics.fillStyle(0xe74c3c, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('enemy', 32, 32);
        graphics.clear();

        // Bullet
        graphics.fillStyle(0xf1c40f, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
        graphics.clear();
    }

    create() {
        this.scene.start('SetupScene');
    }
}
