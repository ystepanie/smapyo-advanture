export enum SkillType {
  DASH = "DASH",
  SHIELD = "SHIELD",
  BURST = "BURST",
}

export interface SkillConfig {
  name: string;
  type: SkillType;
  cooldown: number;
  duration?: number;
  power?: number;
  description: string;
}

export const SKILL_CONFIGS: Record<SkillType, SkillConfig> = {
  [SkillType.DASH]: {
    name: "대쉬",
    type: SkillType.DASH,
    cooldown: 1500,
    duration: 200,
    power: 600,
    description: "진행 방향으로 빠르게 이동합니다.",
  },
  [SkillType.SHIELD]: {
    name: "보호막",
    type: SkillType.SHIELD,
    cooldown: 5000,
    duration: 2000,
    description: "잠시 동안 무적 상태가 됩니다.",
  },
  [SkillType.BURST]: {
    name: "버스트",
    type: SkillType.BURST,
    cooldown: 8000,
    duration: 3000,
    power: 2,
    description: "잠시 동안 공격 속도가 2배가 됩니다.",
  },
};
