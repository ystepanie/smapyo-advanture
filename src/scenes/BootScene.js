import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets
        this.load.image('player', 'assets/images/player.png');
        this.load.spritesheet('city-tiles', 'assets/images/tileset.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.tilemapTiledJSON('city-map', 'assets/maps/city.json');

        const graphics = this.add.graphics();
        
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
