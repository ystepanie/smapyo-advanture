class GameStateManager {
    constructor() {
        this.reset();
    }

    reset() {
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
            bulletRange: 250 // 기본 사거리 설정
        };
        this.upgrades = [];
    }

    applyTeamStats(teamName, teamStats) {
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
