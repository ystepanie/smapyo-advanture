import Phaser from "phaser";
import { GameState } from "../state/GameState";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";

export class BattleScene extends Phaser.Scene {
  private player!: Player;
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private cursors!: any;
  private lastFired: number = 0;
  private hpText!: Phaser.GameObjects.Text;
  private aimGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super("BattleScene");
  }

  create(): void {
    this.add.text(
      16,
      16,
      `${GameState.playerInfo.team} ${GameState.playerInfo.name} 사원 - Floor: ${GameState.level}`,
      {
        fontSize: "18px",
        color: "#fff",
        fontFamily: "Inter",
      },
    );

    this.player = new Player(this, 400, 300, GameState.playerStats);

    const map = this.make.tilemap({ key: "city-map" });
    const tileset = map.addTilesetImage("city", "city-tiles");

    if (tileset) {
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      if (groundLayer) {
        groundLayer.setScale(1.25);
        groundLayer.setDepth(-1);
      }
    }

    this.buildings = this.physics.add.staticGroup();
    this.buildings.create(200, 200, "city-tiles", 81).setScale(1).refreshBody();
    this.buildings.create(600, 400, "city-tiles", 85).setScale(1).refreshBody();
    this.buildings.create(400, 100, "city-tiles", 90).setScale(1).refreshBody();

    this.physics.add.collider(this.player, this.buildings);

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 20,
      runChildUpdate: true,
    });

    this.enemyBullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 50,
      runChildUpdate: true,
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
    });
    this.physics.add.collider(this.enemies, this.buildings);
    this.physics.add.collider(this.enemies, this.enemies); // 적들끼리 충돌

    this.spawnEnemies();

    this.cursors = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.lastFired = 0;

    this.hpText = this.add.text(
      16,
      50,
      `HP: ${this.player.hp}/${GameState.playerStats.maxHp}`,
      { fontSize: "18px", color: "#2ecc71" },
    );

    this.aimGraphics = this.add.graphics();

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer as any,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      this.hitPlayerByBullet as any,
      undefined,
      this,
    );
  }

  spawnEnemies(): void {
    const level = GameState.level;
    const count = 5 + level * 2;
    let spawned = 0;
    let attempts = 0;

    while (spawned < count && attempts < 100) {
      attempts++;
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);

      if (
        Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) > 150
      ) {
        let typeKey = "MANAGER";
        const rand = Math.random();

        // 레벨에 따라 등장 확률 조정
        if (level >= 10 && rand < 0.1) {
          typeKey = "TEAMLEADER";
        } else if (level >= 5 && rand < 0.15) {
          typeKey = "DIRECTOR";
        } else if (level >= 2 && rand < 0.25) {
          typeKey = "SENIOR";
        }

        const enemy = new Enemy(this, x, y, typeKey, level);
        this.enemies.add(enemy);
        spawned++;
      }
    }
  }

  update(time: number): void {
    this.player.update(this.cursors);

    if (this.input.activePointer.isDown && time > this.lastFired) {
      this.fireBullet(this.input.activePointer);
      this.lastFired = time + GameState.playerStats.attackRate;
    }

    this.drawAimGuide();

    this.enemies.getChildren().forEach((enemy) => {
      (enemy as Enemy).update(this.player, time);
    });

    if (this.enemies.countActive() === 0) {
      this.victory();
    }
  }

  fireBullet(pointer: Phaser.Input.Pointer): void {
    const bullet = this.bullets.get(this.player.x, this.player.y) as Bullet;
    if (bullet) {
      bullet.fire(
        this.player.x,
        this.player.y,
        { x: pointer.worldX, y: pointer.worldY },
        GameState.playerStats.bulletSpeed,
        GameState.playerStats.bulletRange,
      );
    }
  }

  hitEnemy(bullet: Bullet, enemy: Enemy): void {
    bullet.onHit();
    enemy.takeDamage(GameState.playerStats.attackDamage);
  }

  hitPlayer(player: Player, enemy: Enemy): void {
    if (player.takeDamage(enemy.damage, this.time.now)) {
      this.hpText.setText(`HP: ${player.hp}/${GameState.playerStats.maxHp}`);
      if (player.hp <= 0) {
        this.scene.start("GameOverScene");
      }
    }
  }

  hitPlayerByBullet(player: Player, bullet: Bullet): void {
    bullet.onHit();
    if (player.takeDamage(bullet.damage, this.time.now)) {
      this.hpText.setText(`HP: ${player.hp}/${GameState.playerStats.maxHp}`);
      if (player.hp <= 0) {
        this.scene.start("GameOverScene");
      }
    }
  }

  drawAimGuide(): void {
    this.aimGraphics.clear();

    const pointer = this.input.activePointer;
    const startX = this.player.x;
    const startY = this.player.y;
    const angle = Phaser.Math.Angle.Between(
      startX,
      startY,
      pointer.worldX,
      pointer.worldY,
    );

    const range = GameState.playerStats.bulletRange;
    const endX = startX + Math.cos(angle) * range;
    const endY = startY + Math.sin(angle) * range;

    this.aimGraphics.lineStyle(2, 0xffffff, 0.5);
    this.aimGraphics.lineBetween(startX, startY, endX, endY);

    const headSize = 10;
    this.aimGraphics.lineBetween(
      endX,
      endY,
      endX - headSize * Math.cos(angle - Math.PI / 6),
      endY - headSize * Math.sin(angle - Math.PI / 6),
    );
    this.aimGraphics.lineBetween(
      endX,
      endY,
      endX - headSize * Math.cos(angle + Math.PI / 6),
      endY - headSize * Math.sin(angle + Math.PI / 6),
    );
  }

  victory(): void {
    GameState.level++;
    GameState.playerStats.hp = this.player.hp;
    this.scene.start("UpgradeScene");
  }
}
