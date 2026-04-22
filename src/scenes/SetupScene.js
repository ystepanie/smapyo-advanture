import Phaser from 'phaser';
import { TeamStats, UI_COLORS } from '../constants';
import { GameState } from '../state/GameState';

export class SetupScene extends Phaser.Scene {
    constructor() {
        super('SetupScene');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 80, '삼표 어드벤처: 새로운 시작', { 
            fontSize: '36px', 
            fontWeight: 'bold',
            fill: '#ffffff',
            fontFamily: 'Inter'
        }).setOrigin(0.5);

        this.add.text(width / 2, 130, '팀을 선택하고 이름을 입력하세요', { 
            fontSize: '18px', 
            fill: UI_COLORS.SECONDARY 
        }).setOrigin(0.5);

        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = '사원명 입력';
        inputElement.style.width = '300px';
        inputElement.style.height = '40px';
        inputElement.style.padding = '0 15px';
        inputElement.style.fontSize = '18px';
        inputElement.style.borderRadius = '8px';
        inputElement.style.border = `2px solid ${UI_COLORS.PRIMARY}`;
        inputElement.style.backgroundColor = '#1a1a2e';
        inputElement.style.color = '#fff';
        inputElement.style.outline = 'none';

        this.add.dom(width / 2, 220, inputElement);

        const teams = Object.keys(TeamStats);
        const teamButtons = [];
        let selectedTeam = '';

        const statText = this.add.text(width / 2, 430, '', { fontSize: '16px', fill: UI_COLORS.WARNING }).setOrigin(0.5);
        const descText = this.add.text(width / 2, 455, '', { fontSize: '14px', fill: UI_COLORS.SECONDARY }).setOrigin(0.5);

        teams.forEach((team, index) => {
            const x = (width / 2) - 150 + (index * 150);
            const y = 350;

            const stats = TeamStats[team];
            const btn = this.add.rectangle(x, y, 120, 50, 0x333333).setInteractive();
            this.add.text(x, y, team, { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
            
            btn.on('pointerover', () => {
                if (selectedTeam !== team) btn.setFillStyle(0x444444);
                statText.setText(`속도: ${'★'.repeat(stats.speed)}${'☆'.repeat(5-stats.speed)}  힘: ${'★'.repeat(stats.power)}${'☆'.repeat(5-stats.power)}  체력: ${'★'.repeat(stats.hp)}${'☆'.repeat(5-stats.hp)}`);
                descText.setText(stats.description);
            });
            btn.on('pointerout', () => {
                if (selectedTeam !== team) {
                    btn.setFillStyle(0x333333);
                    if (!selectedTeam) {
                        statText.setText('');
                        descText.setText('');
                    } else {
                        const s = TeamStats[selectedTeam];
                        statText.setText(`속도: ${'★'.repeat(s.speed)}${'☆'.repeat(5-s.speed)}  힘: ${'★'.repeat(s.power)}${'☆'.repeat(5-s.power)}  체력: ${'★'.repeat(s.hp)}${'☆'.repeat(5-s.hp)}`);
                        descText.setText(s.description);
                    }
                }
            });
            btn.on('pointerdown', () => {
                selectedTeam = team;
                teamButtons.forEach(b => b.setFillStyle(0x333333));
                btn.setFillStyle(stats.color);
            });

            teamButtons.push(btn);
        });

        const startBtn = this.add.rectangle(width / 2, 530, 200, 60, 0x2ecc71).setInteractive();
        this.add.text(width / 2, 530, '게임 시작', { fontSize: '24px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);

        startBtn.on('pointerover', () => startBtn.setFillStyle(0x27ae60));
        startBtn.on('pointerout', () => startBtn.setFillStyle(UI_COLORS.SUCCESS));
        startBtn.on('pointerdown', () => {
            const name = inputElement.value.trim();
            if (!name) return alert('이름을 입력해주세요!');
            if (!selectedTeam) return alert('팀을 선택해주세요!');

            GameState.playerInfo.name = name;
            GameState.applyTeamStats(selectedTeam, TeamStats[selectedTeam]);
            this.scene.start('BattleScene');
        });
    }
}
