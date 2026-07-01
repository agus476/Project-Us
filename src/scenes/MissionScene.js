import Phaser from "phaser";
import { isAvailable, missions, normalizeCode } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, addGhostButton, addGroundedActor, addHud, addNav, addRelicStrip, addRpgPanel, addWrappedText, fitImageToBox, flashMessage, layout } from "./SceneHelpers.js";
import DialogueSystem from "../systems/DialogueSystem.js";
import RepetinSystem from "../systems/RepetinSystem.js";

export default class MissionScene extends Phaser.Scene {
  constructor() {
    super("MissionScene");
  }

  create(data = {}) {
    const l = layout(this);
    this.mission = missions.find((item) => item.id === data.missionId) || missions[0];

    addCoverBackground(this, this.mission.backgroundKey || "backgrounds.menu", 1);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x08020f, 0.16).setDepth(1);

    addGhostButton(this, l.safeX + 44, l.safeTop + 22, "Volver", () => this.scene.start("MapScene"), 88).setDepth(80);

    addWrappedText(this, `Día ${this.mission.day}`, l.W / 2, l.safeTop + 34, l.contentW, {
      fontSize: "12px",
      color: "#68e5ff",
      fontStyle: "bold",
      align: "center",
      stroke: "#351343",
      strokeThickness: 3,
      depth: 20
    }).setOrigin(0.5);

    addWrappedText(this, this.mission.title, l.W / 2, l.safeTop + 65, l.contentW - 66, {
      fontSize: "19px",
      color: "#fff2ff",
      fontStyle: "bold",
      align: "center",
      stroke: "#651a72",
      strokeThickness: 4,
      depth: 20
    }).setOrigin(0.5);

    addWrappedText(this, this.mission.place || "Ruta de Sweet Week", l.W / 2, l.safeTop + 92, l.contentW - 90, {
      fontSize: "10px",
      color: "#ffe6a7",
      fontStyle: "bold",
      align: "center",
      stroke: "#351343",
      strokeThickness: 3,
      depth: 20
    }).setOrigin(0.5);

    addHud(this, l.safeTop + 122);
    addRelicStrip(this, l.safeX + 30, l.safeTop + 160, (l.contentW - 60) / 6, 30);

    const clueY = l.H * 0.48;
    if (this.textures.exists("ui.missionPanel")) {
      const panel = this.add.image(l.W / 2, clueY, "ui.missionPanel").setDepth(11).setAlpha(0.90);
      panel.setDisplaySize(l.contentW + 54, 128);
    } else {
      addRpgPanel(this, l.W / 2, clueY, l.contentW, 126, { alpha: 0.54, stroke: 0xffd166, depth: 12 });
    }

    addWrappedText(this, "Pista del lugar", l.safeX + 42, clueY - 40, l.contentW * 0.55, {
      fontSize: "12px",
      color: "#68e5ff",
      fontStyle: "bold",
      stroke: "#351343",
      strokeThickness: 3,
      depth: 20
    });
    addWrappedText(this, this.mission.hint, l.safeX + 42, clueY - 18, l.contentW * 0.58, {
      fontSize: "11px",
      color: "#fff2ff",
      lineSpacing: 2,
      depth: 20,
      stroke: "#130719",
      strokeThickness: 2
    });

    const tomasGroundY = l.H * 0.665;
    addGroundedActor(this, "characters.tomas", l.safeX + 60, tomasGroundY, 100, { name: "Tomas", depth: 24, shadowW: 58 });

    const relicX = l.W * 0.74;
    const relicY = l.H * 0.625;
    this.relic = this.add.image(relicX, relicY, this.mission.relicKey).setDepth(22);
    fitImageToBox(this.relic, 88, 88);
    const showRelicNow = progress.isCleared(this.mission.id);
    this.relic.setVisible(showRelicNow).setAlpha(showRelicNow ? 1 : 0);

    this.hiddenRelicHint = addWrappedText(this, "?", relicX, relicY, 90, {
      fontSize: "38px",
      color: "#ffd166",
      align: "center",
      stroke: "#651a72",
      strokeThickness: 5,
      depth: 23
    }).setOrigin(0.5);
    this.hiddenRelicHint.setVisible(!showRelicNow);

    this.tweens.add({ targets: showRelicNow ? this.relic : this.hiddenRelicHint, y: relicY - 8, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.relicLabel = addWrappedText(this, showRelicNow ? this.mission.relic : "Reliquia oculta", relicX, relicY + 48, 122, {
      fontSize: "11px",
      color: "#ffd166",
      align: "center",
      depth: 23,
      stroke: "#351343",
      strokeThickness: 3
    }).setOrigin(0.5);

    this.dialogue = new DialogueSystem(this, { y: l.H * 0.755, height: 154, fontSize: "12px" });
    if (!isAvailable(this.mission)) {
      this.dialogue.say({ speaker: "Sistema", portrait: "portraits.donRepetinMock", text: `Zona sellada hasta ${this.mission.date}. El mapa todavía no permite esta ruta.` });
    } else if (progress.isCleared(this.mission.id)) {
      this.dialogue.say({ speaker: "Tomas", portrait: "portraits.tomasClue", text: `${this.mission.relic} asegurada. La bolsa arcana ya la reconoce.` });
    } else {
      this.dialogue.say({ speaker: "Tomas", portrait: "portraits.tomasClue", text: this.mission.tomas });
      this.addCodeOverlay();
    }

    addNav(this);
    const repetin = new RepetinSystem(this, { x: l.W - 94, y: l.H * 0.25, width: 170, height: 86 });
    this.time.delayedCall(1100, () => repetin.maybe("mission"));
  }

  addCodeOverlay() {
    const l = layout(this);
    const element = document.createElement("form");
    element.className = "code-panel code-panel-v4";
    element.innerHTML = '<input autocomplete="off" placeholder="CODIGO" /><button>Validar</button>';
    this.codeDom = this.add.dom(l.W / 2, l.H * 0.89, element).setDepth(75);
    element.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = normalizeCode(element.querySelector("input").value);
      if (value === normalizeCode(this.mission.code)) this.correctCode();
      else this.wrongCode();
    });
  }

  wrongCode() {
    const l = layout(this);
    this.cameras.main.shake(240, 0.01);
    const glitch = this.add.image(l.W / 2, l.H / 2, "effects.screenGlitch").setDisplaySize(l.W, l.H).setAlpha(0.52).setDepth(90);
    this.tweens.add({ targets: glitch, alpha: 0, duration: 420, onComplete: () => glitch.destroy() });
    this.dialogue.say({ speaker: "Don Repetin", portrait: "portraits.donRepetinAngry", text: "Código incorrecto. Podrías dejarlo para después. Es literalmente mi modelo de negocio." });
  }

  correctCode() {
    const l = layout(this);
    this.codeDom?.destroy();
    progress.unlockMission(this.mission);
    this.hiddenRelicHint?.setVisible(false);
    this.relic.setVisible(true).setAlpha(1);
    this.relicLabel?.setText(this.mission.relic);
    this.dialogue.say({ speaker: "Sistema", portrait: this.mission.relicKey, text: this.mission.message });
    const spotlight = addRpgPanel(this, l.W / 2, l.H * 0.50, l.contentW, 126, { fill: 0xffd166, alpha: 0.12, stroke: 0x7cffc4, depth: 24 });
    const burst = this.add.image(this.relic.x, this.relic.y, "effects.impactBurst").setDepth(28);
    fitImageToBox(burst, 180, 180);
    this.tweens.add({ targets: this.relic, x: l.W / 2, y: l.H * 0.42, scale: this.relic.scale * 1.2, angle: 360, duration: 850, ease: "Back.easeOut" });
    this.tweens.add({ targets: burst, alpha: 0, scale: burst.scale * 1.35, duration: 850, onComplete: () => burst.destroy() });
    this.tweens.add({ targets: spotlight, alpha: 0, delay: 900, duration: 500, onComplete: () => spotlight.destroy() });
    flashMessage(this, `Reliquia obtenida: ${this.mission.relic}`, l.safeTop + 190);
  }
}
