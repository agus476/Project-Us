import Phaser from "phaser";
import { achievements } from "../data/achievements.js";
import { missions } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCover, addHud, addNav, addTitle, H, W } from "./SceneHelpers.js";
import RepetinSystem from "../systems/RepetinSystem.js";

export default class AchievementsScene extends Phaser.Scene {
  constructor() {
    super("AchievementsScene");
  }

  create() {
    addCover(this, "backgrounds.menu", 0.76);
    this.add.rectangle(W / 2, H / 2, W, H, 0x08020f, 0.24);
    addTitle(this, "Logros", W / 2, 70, 30);
    addHud(this, 122);
    const rows = [...missions.map((mission) => mission.achievement), "boss"];
    rows.forEach((id, index) => {
      const item = achievements[id];
      const unlocked = progress.hasAchievement(id);
      const y = 188 + index * 72;
      this.add.rectangle(W / 2, y, W - 34, 58, 0x10051c, 0.67).setStrokeStyle(1, unlocked ? 0x7cffc4 : 0x4b1a65);
      this.add.circle(52, y, 12, unlocked ? 0x7cffc4 : 0x322b42).setStrokeStyle(2, 0xffd166);
      this.add.text(78, y - 19, unlocked ? item.title : "Logro oculto", {
        fontFamily: "Trebuchet MS, Verdana",
        fontSize: "16px",
        color: unlocked ? "#fff2ff" : "#9c89b8",
        fontStyle: "bold"
      });
      this.add.text(78, y + 4, unlocked ? item.description : "Completa mas aventura para revelarlo.", {
        fontFamily: "Trebuchet MS, Verdana",
        fontSize: "12px",
        color: unlocked ? "#ffd166" : "#766388",
        wordWrap: { width: W - 112 }
      });
    });
    addNav(this, "AchievementsScene");
    const repetin = new RepetinSystem(this, { x: W - 92, y: 218 });
    this.time.delayedCall(1000, () => repetin.maybe("achievements"));
  }
}
