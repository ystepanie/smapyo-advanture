import Phaser from "phaser";
import { GameState, PlayerStats } from "../state/GameState";
import { SkillType, SKILL_CONFIGS } from "../constants/skillTypes";

export class Player extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public maxHp: number;
  public speed: number;
  private lastHit: number;

  // 스킬 관련 상태
  private lastKeyTime: Record<string, number> = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  };
  
  private cooldowns: Record<string, number> = {
    [SkillType.DASH]: 0,
    [SkillType.RELOAD]: 0,
  };
  
  public isDashing: boolean = false;
  public isReloading: boolean = false;
  private dashDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number, stats: PlayerStats) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(32 / this.width);
    (this.body as Phaser.Physics.Arcade.Body).setSize(
      this.width * 0.6,
      this.height * 0.8,
    );
    (this.body as Phaser.Physics.Arcade.Body).setOffset(
      this.width * 0.2,
      this.height * 0.2,
    );

    this.hp = stats.hp;
    this.maxHp = stats.maxHp;
    this.speed = stats.speed;
    this.lastHit = 0;
    this.setDepth(10);

    this.setupKeyboardListeners();
  }

  public getCooldown(type: SkillType): number {
    return Math.max(0, (this.cooldowns[type] || 0) - this.scene.time.now);
  }

  private setupKeyboardListeners(): void {
    const keyMap: Record<string, string> = {
      W: "up",
      A: "left",
      S: "down",
      D: "right",
    };

    Object.keys(keyMap).forEach((k) => {
      const keyObj = this.scene.input.keyboard!.addKey(k);
      keyObj.on("down", () => {
        if (!GameState.playerStats.skills.includes(SkillType.DASH)) return;

        const now = this.scene.time.now;
        const direction = keyMap[k];

        if (now - this.lastKeyTime[direction] < 250) {
          this.attemptDash();
        }
        this.lastKeyTime[direction] = now;
      });
    });

    // R 키 장전 리스너
    const rKey = this.scene.input.keyboard!.addKey("R");
    rKey.on("down", () => {
      this.startReload();
    });
  }

  public startReload(): void {
    if (this.isReloading || GameState.playerStats.ammo === GameState.playerStats.maxAmmo) return;
    
    const config = SKILL_CONFIGS[SkillType.RELOAD];
    this.isReloading = true;
    this.cooldowns[SkillType.RELOAD] = this.scene.time.now + config.duration!;
    
    // 장전 중 시각 효과 (회색조 느낌)
    this.setTint(0x888888);
    
    this.scene.time.delayedCall(config.duration!, () => {
      GameState.playerStats.ammo = GameState.playerStats.maxAmmo;
      this.isReloading = false;
      this.clearTint();
    });
  }

  private attemptDash(): void {
    const now = this.scene.time.now;
    if (now < this.cooldowns[SkillType.DASH]) return;

    const config = SKILL_CONFIGS[SkillType.DASH];
    
    let vx = 0;
    let vy = 0;

    const keys = this.scene.input.keyboard!.addKeys("W,A,S,D") as any;
    if (keys.A.isDown) vx = -1;
    else if (keys.D.isDown) vx = 1;
    if (keys.W.isDown) vy = -1;
    else if (keys.S.isDown) vy = 1;

    if (vx === 0 && vy === 0) return;

    this.isDashing = true;
    this.dashDirection.set(vx, vy).normalize();
    this.cooldowns[SkillType.DASH] = now + config.cooldown;

    this.setTint(0x00ffff);
    
    this.scene.time.delayedCall(config.duration || 200, () => {
      this.isDashing = false;
      if (!this.isReloading) this.clearTint();
      else this.setTint(0x888888);
    });
  }

  update(cursors: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  }): void {
    if (!this.active) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.isDashing) {
      const config = SKILL_CONFIGS[SkillType.DASH];
      body.setVelocity(
        this.dashDirection.x * (config.power || 600),
        this.dashDirection.y * (config.power || 600),
      );
      return;
    }

    body.setVelocity(0);

    if (cursors.left.isDown) {
      body.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      body.setVelocityX(this.speed);
    }

    if (cursors.up.isDown) {
      body.setVelocityY(-this.speed);
    } else if (cursors.down.isDown) {
      body.setVelocityY(this.speed);
    }

    body.velocity.normalize().scale(this.speed);
  }

  public canShoot(): boolean {
    return !this.isReloading && GameState.playerStats.ammo > 0;
  }

  public consumeAmmo(): void {
    GameState.playerStats.ammo--;
    if (GameState.playerStats.ammo <= 0) {
      this.startReload();
    }
  }

  takeDamage(amount: number, time: number): boolean {
    if (this.isDashing) return false;
    if (time < this.lastHit + 1000) return false;

    this.hp -= amount;
    this.lastHit = time;
    this.setAlpha(0.5);
    this.scene.time.delayedCall(200, () => this.setAlpha(1));

    return true;
  }
}
