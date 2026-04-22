import Phaser from "phaser";
import { GameState } from "../state/GameState";
import { PLAYER_TYPES } from "../constants/playerTypes";

export class SetupScene extends Phaser.Scene {
  constructor() {
    super("SetupScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 4, "Smapyo Adventure", {
        fontSize: "48px",
        color: "#fff",
        fontFamily: "Inter",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 80, "팀을 선택하세요", {
        fontSize: "24px",
        color: "#fff",
        fontFamily: "Inter",
      })
      .setOrigin(0.5);

    Object.keys(PLAYER_TYPES).forEach((teamKey, index) => {
      const team = PLAYER_TYPES[teamKey];
      const btn = this.add.container(width / 2, height / 2 + index * 70);

      const bg = this.add.rectangle(0, 0, 350, 60, team.color).setInteractive();
      const title = this.add
        .text(0, -10, team.teamName, {
          fontSize: "20px",
          color: "#fff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const desc = this.add
        .text(0, 15, team.description, { fontSize: "14px", color: "#eee" })
        .setOrigin(0.5);

      btn.add([bg, title, desc]);

      bg.on("pointerdown", () => {
        GameState.applyTeamStats(teamKey);
        GameState.playerInfo.name = "혁명적";
        this.scene.start("BattleScene");
      });

      bg.on("pointerover", () => {
        bg.setAlpha(0.8);
        this.game.canvas.style.cursor = "pointer";
      });
      bg.on("pointerout", () => {
        bg.setAlpha(1);
        this.game.canvas.style.cursor = "default";
      });
    });
  }
}
