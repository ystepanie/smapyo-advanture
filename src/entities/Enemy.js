import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, level) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.hp = 20 + (level * 5);
        this.speed = 100 + (level * 5);
        this.attackRate = 1500; // 적의 공격 속도 (1.5초마다)
        this.lastFired = 0;
        this.setDepth(5);
    }

    update(player, time) {
        if (!this.active) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        // 일정 거리 이상이면 플레이어를 추격
        if (distance > 200) {
            this.scene.physics.moveToObject(this, player, this.speed);
        } else {
            this.body.setVelocity(0); // 가까워지면 멈춰서 사격 준비
        }

        // 공격 주기에 맞춰 사격
        if (time > this.lastFired + this.attackRate) {
            this.fire(player);
            this.lastFired = time;
        }
    }

    fire(target) {
        // 씬의 enemyBullets 그룹에서 총알을 가져와 발사
        const bullet = this.scene.enemyBullets.get(this.x, this.y);
        if (bullet) {
            bullet.fire(this.x, this.y, target, 250); // 적 총알 속도는 약간 느리게 설정
            bullet.setTint(0xff0000); // 적 총알은 빨간색으로 표시
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }
}
