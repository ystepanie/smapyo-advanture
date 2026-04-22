import Phaser from 'phaser';
import { GameState } from '../state/GameState';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(): void {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 3, 'Game Over', {
            fontSize: '64px',
            color: '#e74c3c',
            fontFamily: 'Inter'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `도달한 층: ${GameState.level}`, {
            fontSize: '24px',
            color: '#fff',
            fontFamily: 'Inter'
        }).setOrigin(0.5);

        const retryBtn = this.add.container(width / 2, height * 2 / 3);
        const bg = this.add.rectangle(0, 0, 200, 50, 0x3498db).setInteractive();
        const text = this.add.text(0, 0, '다시 시작', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        
        retryBtn.add([bg, text]);
        
        bg.on('pointerdown', () => {
            GameState.reset();
            this.scene.start('BootScene');
        });

        bg.on('pointerover', () => bg.setFillStyle(0x2980b9));
        bg.on('pointerout', () => bg.setFillStyle(0x3498db));
    }
}
