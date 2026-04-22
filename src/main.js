import Phaser from 'phaser';
import { phaserConfig } from './config/phaserConfig';
import { BootScene } from './scenes/BootScene';
import { SetupScene } from './scenes/SetupScene';
import { BattleScene } from './scenes/BattleScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { GameOverScene } from './scenes/GameOverScene';

const gameConfig = {
    ...phaserConfig,
    scene: [
        BootScene, 
        SetupScene, 
        BattleScene, 
        UpgradeScene, 
        GameOverScene
    ]
};

new Phaser.Game(gameConfig);
