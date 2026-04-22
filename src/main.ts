import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { SetupScene } from './scenes/SetupScene';
import { BattleScene } from './scenes/BattleScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        SetupScene,
        BattleScene,
        UpgradeScene,
        GameOverScene
    ]
};

new Phaser.Game(config);
