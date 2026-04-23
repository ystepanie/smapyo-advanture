import { SkillType } from "./skillTypes";

export interface PlayerConfig {
  teamName: string;
  description: string;
  color: number;
  baseStats: {
    speed: number;
    power: number;
    hp: number;
    attackRate: number;
    bulletSpeed: number;
    bulletRange: number;
    maxAmmo: number;
  };
  skills: SkillType[];
}

export const PLAYER_TYPES: Record<string, PlayerConfig> = {
  SM1팀: {
    teamName: "SM1팀",
    description: "균형 잡힌 표준 능력치 + 대쉬/보호막",
    color: 0x4a90e2,
    baseStats: {
      speed: 3,
      power: 3,
      hp: 3,
      attackRate: 500,
      bulletSpeed: 400,
      bulletRange: 250,
      maxAmmo: 20,
    },
    skills: [SkillType.DASH, SkillType.SHIELD, SkillType.RELOAD],
  },
  SM2팀: {
    teamName: "SM2팀",
    description: "강력한 공격력과 높은 체력 + 버스트",
    color: 0xe67e22,
    baseStats: {
      speed: 2,
      power: 5,
      hp: 4,
      attackRate: 500,
      bulletSpeed: 350,
      bulletRange: 200,
      maxAmmo: 12,
    },
    skills: [SkillType.DASH, SkillType.BURST, SkillType.RELOAD],
  },
  SM3팀: {
    teamName: "SM3팀",
    description: "빠른 기동력과 연사력 + 대쉬 특화",
    color: 0x9b59b6,
    baseStats: {
      speed: 5,
      power: 2,
      hp: 2,
      attackRate: 400,
      bulletSpeed: 500,
      bulletRange: 300,
      maxAmmo: 30,
    },
    skills: [SkillType.DASH, SkillType.RELOAD],
  },
};
