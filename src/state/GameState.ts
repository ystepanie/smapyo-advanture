import { PLAYER_TYPES } from "../constants/playerTypes";
import { SkillType } from "../constants/skillTypes";

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRate: number;
  bulletSpeed: number;
  bulletRange: number;
  ammo: number;
  maxAmmo: number;
  skills: SkillType[];
}

export interface PlayerInfo {
  name: string;
  team: string;
}

class GameStateManager {
  public level: number = 1;
  public playerInfo: PlayerInfo = {
    name: "",
    team: "",
  };
  public playerStats: PlayerStats = {
    hp: 100,
    maxHp: 100,
    speed: 200,
    attackDamage: 10,
    attackRate: 500,
    bulletSpeed: 400,
    bulletRange: 250,
    ammo: 20,
    maxAmmo: 20,
    skills: [],
  };
  public upgrades: any[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.level = 1;
    this.playerInfo = {
      name: "",
      team: "",
    };
    this.playerStats = {
      hp: 100,
      maxHp: 100,
      speed: 200,
      attackDamage: 10,
      attackRate: 500,
      bulletSpeed: 400,
      bulletRange: 250,
      ammo: 20,
      maxAmmo: 20,
      skills: [],
    };
    this.upgrades = [];
  }

  applyTeamStats(teamKey: string): void {
    const config = PLAYER_TYPES[teamKey];
    if (!config) return;

    const { baseStats } = config;
    this.playerInfo.team = config.teamName;
    this.playerStats.speed = 150 + baseStats.speed * 20;
    this.playerStats.attackDamage = 5 + baseStats.power * 3;
    this.playerStats.maxHp = 60 + baseStats.hp * 20;
    this.playerStats.hp = this.playerStats.maxHp;
    this.playerStats.attackRate = baseStats.attackRate;
    this.playerStats.bulletSpeed = baseStats.bulletSpeed;
    this.playerStats.bulletRange = baseStats.bulletRange;
    this.playerStats.maxAmmo = baseStats.maxAmmo;
    this.playerStats.ammo = baseStats.maxAmmo;
    this.playerStats.skills = [...config.skills];
  }
}

export const GameState = new GameStateManager();
