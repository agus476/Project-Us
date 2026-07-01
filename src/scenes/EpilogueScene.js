import Phaser from "phaser";
import { progress } from "../state/progress.js";
import { addButton, addCover, addTitle, H, W } from "./SceneHelpers.js";
import DialogueSystem from "../systems/DialogueSystem.js";

export default class EpilogueScene extends Phaser.Scene {
  constructor() {
    super("EpilogueScene");
  }

  create() {
    progress.markEpilogueSeen();
    addCover(this, "backgrounds.menu", 0.76);
    this.add.rectangle(W / 2, H / 2, W, H, 0x08020f, 0.28);
    addTitle(this, "Epílogo", W / 2, 72, 32);
    this.add.image(W / 2, 136, "logos.projectUs").setScale(0.18);
    this.add.ellipse(W / 2, 560, 250, 34, 0x000000, 0.36);
    this.add.image(138, 552, "characters.agustinaSweetGearPose").setScale(0.31).setOrigin(0.5, 1);
    this.add.image(235, 560, "characters.agustinBattle").setScale(0.29).setOrigin(0.5, 1);
    this.add.image(306, 560, "characters.tomasAlert").setScale(0.2).setOrigin(0.5, 1);

    this.add.rectangle(W / 2, 282, W - 46, 128, 0x0c0614, 0.8).setStrokeStyle(3, 0xffd166);
    this.add.text(W / 2, 252, "Capítulo II", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "27px",
      color: "#fff2ff",
      fontStyle: "bold"
    }).setOrigin(0.5);
    this.add.text(W / 2, 302, "Bloqueado hasta\n14 de febrero", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "21px",
      color: "#ffd166",
      align: "center"
    }).setOrigin(0.5);

    const dialogue = new DialogueSystem(this, { y: 690 });
    dialogue.say({
      speaker: "Sistema",
      portrait: "portraits.agustinaHappy",
      text: "Don Repetin cayo. Las reliquias apagaron su brillo y Sweet Week quedo guardada como primer capitulo de Project Us."
    });
    addButton(this, W / 2, 836, "Volver a la base", () => this.scene.start("BaseScene"), 230);
  }
}
