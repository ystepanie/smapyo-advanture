import Phaser from 'phaser';

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0f0f13',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: []
};

// Global Game State for Roguelike Elements
const GameState = {
    level: 1,
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
        this.scene.start('BattleScene');
    }
}

class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    create() {
        this.add.text(16, 16, `Floor: ${GameState.level}`, { fontSize: '24px', fill: '#fff' });
        
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
            // Reset Game State
            GameState.level = 1;
            GameState.playerStats = {
                hp: 100,
                maxHp: 100,
                speed: 200,
                attackDamage: 10,
                attackRate: 500,
                bulletSpeed: 400
            };
            this.scene.start('BattleScene');
        });
    }
}

const gameConfig = {
    ...config,
    scene: [BootScene, BattleScene, UpgradeScene, GameOverScene]
};

new Phaser.Game(gameConfig);
