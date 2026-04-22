import Phaser from "phaser";
import { GameState } from "../state/GameState";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super("BattleScene");
  }

  create() {
    this.add.text(
      16,
      16,
      `${GameState.playerInfo.team} ${GameState.playerInfo.name} 사원 - Floor: ${GameState.level}`,
      {
        fontSize: "18px",
        fill: "#fff",
        fontFamily: "Inter",
      },
    );

    this.player = new Player(this, 400, 300, GameState.playerStats);

    // Tilemap 구현
    const map = this.make.tilemap({ key: "city-map" });
    const tileset = map.addTilesetImage("city", "city-tiles");

    // 레이어 생성
    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    groundLayer.setScale(1.25);
    groundLayer.setDepth(-1);

    this.buildings = this.physics.add.staticGroup();

    // 프레임 번호로 건물 배치 (타일셋 이미지상의 위치를 기반으로 프레임 자동 할당)
    // 81번, 85번 프레임 등은 타일셋 하단의 건물 이미지들입니다.
    this.buildings.create(200, 200, "city-tiles", 81).setScale(1).refreshBody();
    this.buildings.create(600, 400, "city-tiles", 85).setScale(1).refreshBody();
    this.buildings.create(400, 100, "city-tiles", 90).setScale(1).refreshBody();

    this.physics.add.collider(this.player, this.buildings);

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 20,
      runChildUpdate: true,
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
    });
    this.physics.add.collider(this.enemies, this.buildings);

    this.spawnEnemies();
    console.log(`Enemies spawned: ${this.enemies.getLength()}`);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.lastFired = 0;

    this.hpText = this.add.text(
      16,
      50,
      `HP: ${this.player.hp}/${GameState.playerStats.maxHp}`,
      { fontSize: "18px", fill: "#2ecc71" },
    );

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer,
      null,
      this,
    );
  }

  spawnEnemies() {
    const count = 20 + GameState.level * 10;
    let spawned = 0;
    let attempts = 0;

    while (spawned < count && attempts < 100) {
      attempts++;
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);

      // 플레이어와 너무 가깝지 않은 곳에 소환
      if (
        Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 150
      ) {
        const enemy = new Enemy(this, x, y, GameState.level);
        this.enemies.add(enemy);
        spawned++;
      }
    }
  }

  update(time) {
    this.player.update(this.cursors);

    if (time > this.lastFired) {
      const nearestEnemy = this.enemies.getChildren().reduce((prev, curr) => {
        if (!prev) return curr;
        const distPrev = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          prev.x,
          prev.y,
        );
        const distCurr = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          curr.x,
          curr.y,
        );
        return distCurr < distPrev ? curr : prev;
      }, null);

      if (nearestEnemy) {
        this.fireBullet(nearestEnemy);
        this.lastFired = time + GameState.playerStats.attackRate;
      }
    }

    this.enemies.getChildren().forEach((enemy) => {
      enemy.update(this.player);
    });

    if (this.enemies.countActive() === 0) {
      this.victory();
    }
  }

  fireBullet(target) {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.fire(
        this.player.x,
        this.player.y,
        target,
        GameState.playerStats.bulletSpeed,
      );
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
        this.scene.start("GameOverScene");
      }
    }
  }

  victory() {
    GameState.level++;
    GameState.playerStats.hp = this.player.hp;
    this.scene.start("UpgradeScene");
  }
}
