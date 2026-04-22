import Phaser from 'phaser';
import { GameState } from '../state/GameState';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    create(): void {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 4, '업그레이드 선택', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Inter'
        }).setOrigin(0.5);

        const upgradeOptions = [
            { name: '공격력 증가', effect: () => GameState.playerStats.attackDamage += 5 },
            { name: '공격 속도 증가', effect: () => GameState.playerStats.attackRate *= 0.9 },
            { name: '최대 체력 증가', effect: () => {
                GameState.playerStats.maxHp += 20;
                GameState.playerStats.hp += 20;
            }},
            { name: '이동 속도 증가', effect: () => GameState.playerStats.speed += 20 }
        ];

        // 랜덤하게 3개 선택
        const selected = Phaser.Utils.Array.Shuffle(upgradeOptions).slice(0, 3);

        selected.forEach((option, index) => {
            const btn = this.add.container(width / 2, height / 2 + (index * 60));
            const bg = this.add.rectangle(0, 0, 300, 40, 0x2ecc71).setInteractive();
            const text = this.add.text(0, 0, option.name, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            
            btn.add([bg, text]);
            
            bg.on('pointerdown', () => {
                option.effect();
                GameState.upgrades.push(option.name);
                this.scene.start('BattleScene');
            });

            bg.on('pointerover', () => bg.setFillStyle(0x27ae60));
            bg.on('pointerout', () => bg.setFillStyle(0x2ecc71));
        });
    }
}
