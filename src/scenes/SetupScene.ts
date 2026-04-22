import Phaser from "phaser";
import { GameState } from "../state/GameState";

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
      .text(width / 2, height / 2 - 50, "팀을 선택하세요", {
        fontSize: "24px",
        color: "#fff",
        fontFamily: "Inter",
      })
      .setOrigin(0.5);

    const teams = [
      { name: "SM1팀", stats: { speed: 2, power: 1, hp: 2 } },
      { name: "SM2팀", stats: { speed: 1, power: 2, hp: 2 } },
      { name: "SM3팀", stats: { speed: 3, power: 1, hp: 1 } },
    ];

    teams.forEach((team, index) => {
      const btn = this.add.container(width / 2, height / 2 + index * 60);
      const bg = this.add.rectangle(0, 0, 200, 40, 0x3498db).setInteractive();
      const text = this.add
        .text(0, 0, team.name, { fontSize: "18px", color: "#fff" })
        .setOrigin(0.5);

      btn.add([bg, text]);

      bg.on("pointerdown", () => {
        GameState.applyTeamStats(team.name, team.stats);
        GameState.playerInfo.name = "혁명적";
        this.scene.start("BattleScene");
      });

      bg.on("pointerover", () => bg.setFillStyle(0x2980b9));
      bg.on("pointerout", () => bg.setFillStyle(0x3498db));
    });
  }
}
