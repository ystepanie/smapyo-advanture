import Phaser from 'phaser';
import { GameState } from '../state/GameState';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#e74c3c' }).setOrigin(0.5);
        this.add.text(400, 400, '다시 시작하려면 클릭하세요', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        
        this.input.on('pointerdown', () => {
            GameState.reset();
            this.scene.start('SetupScene');
        });
    }
}
