export interface EnemyConfig {
  name: string;
  hpBase: number;
  hpPerLevel: number;
  speedBase: number;
  speedPerLevel: number;
  attackRate: number;
  damageBase: number;
  damagePerLevel: number;
  scale: number;
  tint?: number;
  bulletSpeed: number;
  bulletTint?: number;
}

export const ENEMY_TYPES: Record<string, EnemyConfig> = {
  MANAGER: {
    name: "매니저",
    hpBase: 10,
    hpPerLevel: 5,
    speedBase: 100,
    speedPerLevel: 5,
    attackRate: 1500,
    damageBase: 5,
    damagePerLevel: 2,
    scale: 1,
    bulletSpeed: 250,
    bulletTint: 0xff0000,
  },
  SENIOR: {
    name: "책임",
    hpBase: 20,
    hpPerLevel: 10,
    speedBase: 80,
    speedPerLevel: 5,
    attackRate: 1200,
    damageBase: 10,
    damagePerLevel: 5,
    scale: 1.5,
    tint: 0xffaa00,
    bulletSpeed: 300,
    bulletTint: 0xffaa00,
  },
  DIRECTOR: {
    name: "수석",
    hpBase: 50,
    hpPerLevel: 20,
    speedBase: 120,
    speedPerLevel: 10,
    attackRate: 800,
    damageBase: 20,
    damagePerLevel: 10,
    scale: 2,
    tint: 0xff00ff,
    bulletSpeed: 400,
    bulletTint: 0xff00ff,
  },
  TEAMLEADER: {
    name: "팀장",
    hpBase: 100,
    hpPerLevel: 100,
    speedBase: 50,
    speedPerLevel: 10,
    attackRate: 2000,
    damageBase: 50,
    damagePerLevel: 25,
    scale: 3,
    tint: 0xff0000,
    bulletSpeed: 500,
    bulletTint: 0xff0000,
  },
};
