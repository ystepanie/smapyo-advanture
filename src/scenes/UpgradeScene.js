import Phaser from 'phaser';
import { GameState } from '../state/GameState';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    create() {
        this.add.text(400, 100, '강화 옵션 선택', { fontSize: '32px', fill: '#f1c40f' }).setOrigin(0.5);

        const options = [
            { name: '공격력 +5', effect: () => GameState.playerStats.attackDamage += 5 },
            { name: '최대 체력 +20', effect: () => { GameState.playerStats.maxHp += 20; GameState.playerStats.hp += 20; } },
            { name: '공격 속도 +20%', effect: () => GameState.playerStats.attackRate *= 0.8 },
            { name: '이동 속도 +10%', effect: () => GameState.playerStats.speed *= 1.1 }
        ];

        const shuffled = options.sort(() => 0.5 - Math.random()).slice(0, 3);

        shuffled.forEach((opt, index) => {
            const btn = this.add.rectangle(400, 250 + (index * 80), 300, 60, 0x333333).setInteractive();
            this.add.text(400, 250 + (index * 80), opt.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(0x444444));
            btn.on('pointerout', () => btn.setFillStyle(0x333333));
            btn.on('pointerdown', () => {
                opt.effect();
                this.scene.start('BattleScene');
            });
        });
    }
}
