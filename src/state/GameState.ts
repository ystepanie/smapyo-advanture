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
        name: '',
        team: ''
    };
    public playerStats: PlayerStats = {
        hp: 100,
        maxHp: 100,
        speed: 200,
        attackDamage: 10,
        attackRate: 500,
        bulletSpeed: 400,
        bulletRange: 250
    };
    public upgrades: any[] = [];

    constructor() {
        this.reset();
    }

    reset(): void {
        this.level = 1;
        this.playerInfo = {
            name: '',
            team: ''
        };
        this.playerStats = {
            hp: 100,
            maxHp: 100,
            speed: 200,
            attackDamage: 10,
            attackRate: 500,
            bulletSpeed: 400,
            bulletRange: 250
        };
        this.upgrades = [];
    }

    applyTeamStats(teamName: string, teamStats: any): void {
        this.playerInfo.team = teamName;
        this.playerStats.speed = 150 + (teamStats.speed * 20);
        this.playerStats.attackDamage = 5 + (teamStats.power * 3);
        this.playerStats.maxHp = 60 + (teamStats.hp * 20);
        this.playerStats.hp = this.playerStats.maxHp;
        
        if (teamName === 'SM3팀') {
            this.playerStats.attackRate = 400;
        } else {
            this.playerStats.attackRate = 500;
        }
    }
}

export const GameState = new GameStateManager();
