import Phaser from "phaser";
import { flattenAssets } from "../data/assets.js";
import { layout } from "./SceneHelpers.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const l = layout(this);
    const width = Math.min(l.contentW, l.W - 48);
    this.add.text(l.W / 2, l.H / 2 - 54, "Cargando aventura...", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "22px",
      color: "#fff2ff"
    }).setOrigin(0.5);
    const frame = this.add.rectangle(l.W / 2, l.H / 2, width, 24, 0x261143).setStrokeStyle(3, 0xffd166);
    const bar = this.add.rectangle(l.W / 2 - width / 2 + 6, l.H / 2, 1, 16, 0x68e5ff).setOrigin(0, 0.5);
    this.load.on("progress", (value) => {
      bar.width = Math.max(1, (width - 12) * value);
    });
    this.load.on("complete", () => frame.setStrokeStyle(3, 0x7cffc4));
    flattenAssets().forEach((asset) => this.load.image(asset.key, asset.url));
  }

  create() {
    this.scene.start("SplashScene");
  }
}
