import Phaser from "phaser";
import { GameState } from "../state/GameState";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import { SKILL_CONFIGS } from "../constants/skillTypes";

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
  private skillIcons: Map<string, {
    container: Phaser.GameObjects.Container,
    overlay: Phaser.GameObjects.Graphics,
    text: Phaser.GameObjects.Text
  }> = new Map();

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

    this.createSkillUI();
  }

  createSkillUI(): void {
    const { width, height } = this.scale;
    const skills = GameState.playerStats.skills;
    const slotSize = 50;
    const padding = 10;
    
    skills.forEach((skillType, index) => {
      const x = width - (index + 1) * (slotSize + padding) - 10;
      const y = height - slotSize - 20;
      
      const container = this.add.container(x, y);
      
      // 배경 박스
      const bg = this.add.rectangle(0, 0, slotSize, slotSize, 0x333333, 0.8).setOrigin(0);
      bg.setStrokeStyle(2, 0x00ffff);
      
      // 스킬 이름/아이콘 (첫 글자)
      const icon = this.add.text(slotSize / 2, slotSize / 2, skillType[0], {
        fontSize: "24px",
        color: "#fff",
        fontStyle: "bold"
      }).setOrigin(0.5);
      
      // 쿨타임 오버레이 (회색 칠해지는 부분)
      const overlay = this.add.graphics();
      
      // 남은 시간 텍스트
      const timeText = this.add.text(slotSize / 2, slotSize / 2, "", {
        fontSize: "14px",
        color: "#fff",
        fontStyle: "bold"
      }).setOrigin(0.5);
      
      container.add([bg, icon, overlay, timeText]);
      
      this.skillIcons.set(skillType, {
        container,
        overlay,
        text: timeText
      });
    });
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

    this.updateSkillUI();
  }

  updateSkillUI(): void {
    this.skillIcons.forEach((ui, skillType) => {
      const cooldown = this.player.getCooldown(skillType as any);
      const config = (SKILL_CONFIGS as any)[skillType];
      const maxCooldown = config.cooldown;
      const slotSize = 50;

      ui.overlay.clear();

      if (cooldown > 0) {
        const ratio = cooldown / maxCooldown;
        ui.overlay.fillStyle(0x000000, 0.6);
        ui.overlay.fillRect(0, slotSize * (1 - ratio), slotSize, slotSize * ratio);
        
        ui.text.setText(`${(cooldown / 1000).toFixed(1)}`);
        ui.text.setVisible(true);
      } else {
        ui.text.setVisible(false);
      }
    });
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
