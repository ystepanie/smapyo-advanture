import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    create() {
        this.add.text(16, 16, `${GameState.playerInfo.team} ${GameState.playerInfo.name} 사원 - Floor: ${GameState.level}`, { 
            fontSize: '18px', 
            fill: '#fff',
            fontFamily: 'Inter'
        });
        
        this.player = new Player(this, 400, 300, GameState.playerStats);

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 20,
            runChildUpdate: true
        });

        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        this.spawnEnemies();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.lastFired = 0;

        this.hpText = this.add.text(16, 50, `HP: ${this.player.hp}/${GameState.playerStats.maxHp}`, { fontSize: '18px', fill: '#2ecc71' });

        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
    }

    spawnEnemies() {
        const count = 3 + GameState.level;
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            if (Phaser.Math.Distance.Between(x, y, 400, 300) > 200) {
                const enemy = new Enemy(this, x, y, GameState.level);
                this.enemies.add(enemy);
            }
        }
    }

    update(time) {
        this.player.update(this.cursors);

        if (time > this.lastFired) {
            const nearestEnemy = this.enemies.getChildren().reduce((prev, curr) => {
                if (!prev) return curr;
                const distPrev = Phaser.Math.Distance.Between(this.player.x, this.player.y, prev.x, prev.y);
                const distCurr = Phaser.Math.Distance.Between(this.player.x, this.player.y, curr.x, curr.y);
                return distCurr < distPrev ? curr : prev;
            }, null);

            if (nearestEnemy) {
                this.fireBullet(nearestEnemy);
                this.lastFired = time + GameState.playerStats.attackRate;
            }
        }

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        if (this.enemies.countActive() === 0) {
            this.victory();
        }
    }

    fireBullet(target) {
        const bullet = this.bullets.get(this.player.x, this.player.y);
        if (bullet) {
            bullet.fire(this.player.x, this.player.y, target, GameState.playerStats.bulletSpeed);
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.onHit();
        if (enemy.takeDamage(GameState.playerStats.attackDamage)) {
            // Enemy destroyed
        }
    }

    hitPlayer(player, enemy) {
        if (player.takeDamage(10, this.time.now)) {
            this.hpText.setText(`HP: ${player.hp}/${GameState.playerStats.maxHp}`);
            if (player.hp <= 0) {
                this.scene.start('GameOverScene');
            }
        }
    }

    victory() {
        GameState.level++;
        GameState.playerStats.hp = this.player.hp;
        this.scene.start('UpgradeScene');
    }
}
