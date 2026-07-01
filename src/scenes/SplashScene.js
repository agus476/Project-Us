import Phaser from "phaser";
import { addCoverBackground, addRpgButton, addWrappedText, layout } from "./SceneHelpers.js";

export default class SplashScene extends Phaser.Scene {
  constructor() {
    super("SplashScene");
  }

  create() {
    const l = layout(this);
    addCoverBackground(this, "backgrounds.menu", 0.66);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x08020f, 0.22);
    const logo = this.add.image(l.W / 2, l.H * 0.24, "logos.projectUs").setAlpha(0);
    const scale = Math.min((l.contentW * 0.78) / logo.width, 180 / logo.height);
    logo.setScale(scale);
    const chapter = addWrappedText(this, "Capítulo I: Sweet Week", l.W / 2, l.H * 0.39, l.contentW, {
      fontSize: "24px",
      color: "#ffd166",
      align: "center",
      stroke: "#5f2a89",
      strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({ targets: logo, alpha: 1, y: l.H * 0.22, duration: 700, ease: "Back.easeOut" });
    this.tweens.add({ targets: chapter, y: l.H * 0.37, duration: 650, delay: 220, ease: "Back.easeOut" });
    const button = addRpgButton(this, l.W / 2, l.H * 0.75, l.contentW * 0.72, 50, "Iniciar aventura", () => this.scene.start("LoginScene"));
    this.tweens.add({ targets: button, scale: 1.03, delay: 640, duration: 350, yoyo: true });
  }
}
