import Phaser from "phaser";
import { layout } from "../scenes/SceneHelpers.js";
import { progress } from "../state/progress.js";

export default class RepetinSystem {
  constructor(scene, zone = {}) {
    this.scene = scene;
    this.lastAt = 0;
    const l = layout(scene);
    this.zone = {
      x: zone.x ?? l.W - 96,
      y: zone.y ?? 212,
      width: zone.width ?? 178,
      height: zone.height ?? 92
    };
  }

  maybe(context = "base") {
    const chance = { base: 0.2, map: 0.25, mission: 0.38, inventory: 0.18, achievements: 0.18 }[context] || 0.2;
    if (this.scene.time.now - this.lastAt < 7000 || Math.random() > chance) return;
    this.lastAt = this.scene.time.now;
    this.show(this.line());
  }

  line() {
    const count = progress.relicCount;
    if (count >= 7) return "Basta. Vengan al castillo.";
    if (count >= 5) return "Si siguen, mi rutina se rompe.";
    if (count >= 3) return "Esto no cambia nada... o si?";
    return "Mejor dejalo para despues.";
  }

  show(text) {
    const l = layout(this.scene);
    const { width, height } = this.zone;
    const x = Phaser.Math.Clamp(this.zone.x, l.safeX + width / 2, l.W - l.safeX - width / 2);
    const y = Phaser.Math.Clamp(this.zone.y, l.safeTop + height / 2, l.H - l.safeBottom - height / 2);
    const container = this.scene.add.container(x, y).setDepth(75);
    const glitch = this.scene.add.image(0, 0, "effects.screenGlitch").setDisplaySize(width, height).setAlpha(0.55);
    const portraitKey = progress.relicCount >= 5 ? "portraits.donRepetinAngry" : "portraits.donRepetinMock";
    const portrait = this.scene.add.image(-width / 2 + 34, 0, portraitKey).setDisplaySize(54, 54);
    const box = this.scene.add.rectangle(18, 0, width - 58, height - 22, 0x16051f, 0.88).setStrokeStyle(2, 0xff5c8a);
    const label = this.scene.add.text(-24, -27, text, {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "12px",
      color: "#fff2ff",
      wordWrap: { width: width - 76 }
    });
    container.add([glitch, box, portrait, label]);
    container.setAlpha(0);
    this.scene.tweens.add({ targets: container, alpha: 1, duration: 160 });
    this.scene.tweens.add({ targets: container, alpha: 0, delay: 2800, duration: 320, onComplete: () => container.destroy() });
  }
}
