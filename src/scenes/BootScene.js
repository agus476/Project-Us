import Phaser from "phaser";
import { flattenAssets } from "../data/assets.js";
import { H, W } from "./SceneHelpers.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const width = W - 80;
    this.add.text(W / 2, H / 2 - 54, "Cargando aventura...", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "22px",
      color: "#fff2ff"
    }).setOrigin(0.5);
    const frame = this.add.rectangle(W / 2, H / 2, width, 24, 0x261143).setStrokeStyle(3, 0xffd166);
    const bar = this.add.rectangle((W - width) / 2 + 6, H / 2, 1, 16, 0x68e5ff).setOrigin(0, 0.5);
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
