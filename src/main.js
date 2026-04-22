import Phaser from 'phaser';

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0f0f13',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: []
};

const TeamStats = {
    'SM1팀': { speed: 3, power: 3, hp: 3, color: 0x4a90e2, description: '균형 잡힌 표준 능력치' },
    'SM2팀': { speed: 2, power: 5, hp: 4, color: 0xe67e22, description: '강력한 공격력과 높은 체력' },
    'SM3팀': { speed: 5, power: 2, hp: 2, color: 0x9b59b6, description: '빠른 기동력과 연사력' }
};

// Global Game State for Roguelike Elements
const GameState = {
    level: 1,
    playerInfo: {
        name: '',
        team: ''
    },
    playerStats: {
        hp: 100,
        maxHp: 100,
        speed: 200,
        attackDamage: 10,
        attackRate: 500, // ms
        bulletSpeed: 400
    },
    upgrades: []
};

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create simple graphics as placeholders
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

class SetupScene extends Phaser.Scene {
    constructor() {
        super('SetupScene');
    }

    create() {
        const { width, height } = this.scale;

        // Title
        this.add.text(width / 2, 80, '삼표 어드벤처: 새로운 시작', { 
            fontSize: '36px', 
            fontWeight: 'bold',
            fill: '#ffffff',
            fontFamily: 'Inter'
        }).setOrigin(0.5);

        this.add.text(width / 2, 130, '팀을 선택하고 이름을 입력하세요', { 
            fontSize: '18px', 
            fill: '#aaaaaa' 
        }).setOrigin(0.5);

        // Name Input using DOM
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = '사원명 입력';
        inputElement.style.width = '300px';
        inputElement.style.height = '40px';
        inputElement.style.padding = '0 15px';
        inputElement.style.fontSize = '18px';
        inputElement.style.borderRadius = '8px';
        inputElement.style.border = '2px solid #4a90e2';
        inputElement.style.backgroundColor = '#1a1a2e';
        inputElement.style.color = '#fff';
        inputElement.style.outline = 'none';

        const domInput = this.add.dom(width / 2, 220, inputElement);

        // Team Selection
        const teams = Object.keys(TeamStats);
        const teamButtons = [];
        let selectedTeam = '';

        const statText = this.add.text(width / 2, 430, '', { fontSize: '16px', fill: '#f1c40f' }).setOrigin(0.5);
        const descText = this.add.text(width / 2, 455, '', { fontSize: '14px', fill: '#aaaaaa' }).setOrigin(0.5);

        teams.forEach((team, index) => {
            const x = (width / 2) - 150 + (index * 150);
            const y = 350;

            const stats = TeamStats[team];
            const btn = this.add.rectangle(x, y, 120, 50, 0x333333).setInteractive();
            const txt = this.add.text(x, y, team, { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
            
            btn.on('pointerover', () => {
                if (selectedTeam !== team) btn.setFillStyle(0x444444);
                // Preview stats
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

        // Start Button
        const startBtn = this.add.rectangle(width / 2, 530, 200, 60, 0x2ecc71).setInteractive();
        this.add.text(width / 2, 530, '게임 시작', { fontSize: '24px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);

        startBtn.on('pointerover', () => startBtn.setFillStyle(0x27ae60));
        startBtn.on('pointerout', () => startBtn.setFillStyle(0x2ecc71));
        startBtn.on('pointerdown', () => {
            const name = inputElement.value.trim();
            if (!name) {
                alert('이름을 입력해주세요!');
                return;
            }
            if (!selectedTeam) {
                alert('팀을 선택해주세요!');
                return;
            }

            // Apply Team Stats
            const baseStats = TeamStats[selectedTeam];
            GameState.playerInfo.name = name;
            GameState.playerInfo.team = selectedTeam;
            
            // Map 1-5 stats to game values
            GameState.playerStats.speed = 150 + (baseStats.speed * 20);
            GameState.playerStats.attackDamage = 5 + (baseStats.power * 3);
            GameState.playerStats.maxHp = 60 + (baseStats.hp * 20);
            GameState.playerStats.hp = GameState.playerStats.maxHp;
            
            // Adjust attack rate for SM3 (higher speed = faster attack)
            if (selectedTeam === 'SM3팀') {
                GameState.playerStats.attackRate = 400;
            } else {
                GameState.playerStats.attackRate = 500;
            }

            this.scene.start('BattleScene');
        });
    }
}

class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    create() {
        this.add.text(16, 16, `${GameState.playerInfo.team} ${GameState.playerInfo.name} 사원 - Floor: ${GameState.level}`, { 
            fontSize: '18px', 
            fill: '#fff',
            fontFamily: 'Inter'
        });
        
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.hp = GameState.playerStats.hp;

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 20
        });

        this.enemies = this.physics.add.group();
        this.spawnEnemies();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.lastFired = 0;

        // UI for HP
        this.hpText = this.add.text(16, 50, `HP: ${this.player.hp}/${GameState.playerStats.maxHp}`, { fontSize: '18px', fill: '#2ecc71' });

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
    }

    spawnEnemies() {
        const count = 3 + GameState.level;
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            if (Phaser.Math.Distance.Between(x, y, 400, 300) > 200) {
                const enemy = this.enemies.create(x, y, 'enemy');
                enemy.hp = 20 + (GameState.level * 5);
            }
        }
    }

    update(time) {
        // Player Movement
        const speed = GameState.playerStats.speed;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        // Auto-shoot nearest enemy
        if (time > this.lastFired) {
            const nearestEnemy = this.enemies.getChildren().reduce((prev, curr) => {
                const distPrev = Phaser.Math.Distance.Between(this.player.x, this.player.y, prev.x, prev.y);
                const distCurr = Phaser.Math.Distance.Between(this.player.x, this.player.y, curr.x, curr.y);
                return distCurr < distPrev ? curr : prev;
            }, this.enemies.getChildren()[0]);

            if (nearestEnemy) {
                this.fireBullet(nearestEnemy);
                this.lastFired = time + GameState.playerStats.attackRate;
            }
        }

        // Enemy AI (simple follow)
        this.enemies.getChildren().forEach(enemy => {
            this.physics.moveToObject(enemy, this.player, 100 + (GameState.level * 5));
        });

        // Check Victory
        if (this.enemies.countActive() === 0) {
            this.victory();
        }
    }

    fireBullet(target) {
        const bullet = this.bullets.get(this.player.x, this.player.y);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            this.physics.moveToObject(bullet, target, GameState.playerStats.bulletSpeed);
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        
        enemy.hp -= GameState.playerStats.attackDamage;
        if (enemy.hp <= 0) {
            enemy.destroy();
        }
    }

    hitPlayer(player, enemy) {
        // Simple cooldown for damage
        if (!player.lastHit || this.time.now > player.lastHit + 1000) {
            player.hp -= 10;
            player.lastHit = this.time.now;
            this.hpText.setText(`HP: ${player.hp}/${GameState.playerStats.maxHp}`);
            
            // Visual feedback
            this.cameras.main.shake(100, 0.01);
            player.setTint(0xff0000);
            this.time.delayedCall(200, () => player.clearTint());

            if (player.hp <= 0) {
                this.scene.start('GameOverScene');
            }
        }
    }

    victory() {
        GameState.level++;
        GameState.playerStats.hp = this.player.hp; // carry over HP
        this.scene.start('UpgradeScene');
    }
}

class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    create() {
        this.add.text(400, 100, 'CHOOSE AN ENHANCEMENT', { fontSize: '32px', fill: '#f1c40f' }).setOrigin(0.5);

        const options = [
            { name: 'Attack Damage +5', effect: () => GameState.playerStats.attackDamage += 5 },
            { name: 'Max HP +20', effect: () => { GameState.playerStats.maxHp += 20; GameState.playerStats.hp += 20; } },
            { name: 'Attack Speed +20%', effect: () => GameState.playerStats.attackRate *= 0.8 },
            { name: 'Move Speed +10%', effect: () => GameState.playerStats.speed *= 1.1 }
        ];

        // Pick 3 random
        const shuffled = options.sort(() => 0.5 - Math.random()).slice(0, 3);

        shuffled.forEach((opt, index) => {
            const btn = this.add.rectangle(400, 250 + (index * 80), 300, 60, 0x333333).setInteractive();
            const txt = this.add.text(400, 250 + (index * 80), opt.name, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(0x444444));
            btn.on('pointerout', () => btn.setFillStyle(0x333333));
            btn.on('pointerdown', () => {
                opt.effect();
                this.scene.start('BattleScene');
            });
        });
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#e74c3c' }).setOrigin(0.5);
        this.add.text(400, 400, 'Click to Restart', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        
        this.input.on('pointerdown', () => {
            // Reset Game State to Team Selection
            GameState.level = 1;
            this.scene.start('SetupScene');
        });
    }
}

const gameConfig = {
    ...config,
    scene: [BootScene, SetupScene, BattleScene, UpgradeScene, GameOverScene]
};

new Phaser.Game(gameConfig);
