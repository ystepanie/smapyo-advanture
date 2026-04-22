import Phaser from "phaser";
import { ENEMY_TYPES, EnemyConfig } from "../constants/enemyTypes";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public speed: number;
  public attackRate: number;
  public damage: number;
  public lastFired: number;
  public enemyType: string;
  private config: EnemyConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    typeKey: string,
    level: number,
  ) {
    const config = ENEMY_TYPES[typeKey] || ENEMY_TYPES.MANAGER;
    super(scene, x, y, "enemy");
    this.config = config;
    this.enemyType = config.name;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 설정값에 따른 능력치 세팅
    this.hp = config.hpBase + level * config.hpPerLevel;
    this.speed = config.speedBase + level * config.speedPerLevel;
    this.attackRate = config.attackRate;
    this.damage = config.damageBase + level * config.damagePerLevel;

    this.setScale(config.scale);
    if (config.tint) {
      this.setTint(config.tint);
    }

    this.lastFired = 0;
    this.setDepth(5);

    // 적들끼리 부딪혔을 때 살짝 튕겨나가게 설정
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setBounce(0.5, 0.5);
    }
  }

  update(player: Phaser.GameObjects.Components.Transform, time: number): void {
    if (!this.active) return;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      (player as any).x,
      (player as any).y,
    );

    // 일정 거리 이상일 때만 추격
    if (distance > 200) {
      this.scene.physics.moveToObject(this, player, this.speed);
    } else {
      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setVelocity(0);
      }
    }

    if (time > this.lastFired + this.attackRate) {
      this.fire(player);
      this.lastFired = time;
    }
  }

  fire(target: Phaser.GameObjects.Components.Transform): void {
    const bullet = (this.scene as any).enemyBullets.get(this.x, this.y);
    if (bullet) {
      // 총알에도 데미지 정보 전달 (bullet 클래스가 damage를 지원한다고 가정하거나, 나중에 수정)
      bullet.damage = this.damage;
      bullet.fire(this.x, this.y, target, this.config.bulletSpeed);
      if (this.config.bulletTint) {
        bullet.setTint(this.config.bulletTint);
      }
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }
}
