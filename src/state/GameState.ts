import { PLAYER_TYPES } from "../constants/playerTypes";

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRate: number;
  bulletSpeed: number;
  bulletRange: number;
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
  }
}

export const GameState = new GameStateManager();
