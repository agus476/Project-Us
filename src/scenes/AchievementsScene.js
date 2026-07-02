import Phaser from "phaser";
import { achievements } from "../data/achievements.js";
import { missions } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCover, addHud, addNav, addTitle, addWrappedText, layout } from "./SceneHelpers.js";
import RepetinSystem from "../systems/RepetinSystem.js";

export default class AchievementsScene extends Phaser.Scene {
  constructor() {
    super("AchievementsScene");
  }

  create() {
    const l = layout(this);
    addCover(this, "backgrounds.menu", 0.76);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x08020f, 0.24);
    addTitle(this, "Logros", l.W / 2, l.safeTop + 26, 24);
    addHud(this, l.safeTop + 66);

    const rows = [...missions.map((mission) => mission.achievement), "boss"];
    rows.forEach((id, index) => {
      const item = achievements[id];
      const unlocked = progress.hasAchievement(id);
      const y = l.safeTop + 134 + index * 58;

      this.add.rectangle(l.W / 2, y, l.contentW, 52, 0x10051c, 0.67).setStrokeStyle(1, unlocked ? 0x7cffc4 : 0x4b1a65);
      this.add.circle(l.safeX + 26, y, 11, unlocked ? 0x7cffc4 : 0x322b42).setStrokeStyle(2, 0xffd166);

      addWrappedText(this, unlocked ? item.title : "Logro oculto", l.safeX + 52, y - 18, l.contentW - 72, {
        fontSize: "13px",
        color: unlocked ? "#fff2ff" : "#9c89b8",
        fontStyle: "bold",
        stroke: "#130719",
        strokeThickness: 2,
        depth: 21
      });

      addWrappedText(this, unlocked ? item.description : "Completa mas aventura para revelarlo.", l.safeX + 52, y + 1, l.contentW - 76, {
        fontSize: "10px",
        color: unlocked ? "#ffd166" : "#766388",
        lineSpacing: 1,
        stroke: "#130719",
        strokeThickness: 2,
        depth: 21
      });
    });

    addNav(this, "AchievementsScene");
    const repetin = new RepetinSystem(this, { x: l.W - 92, y: l.H * 0.23, width: 168, height: 84 });
    this.time.delayedCall(1000, () => repetin.maybe("achievements"));
  }
}
