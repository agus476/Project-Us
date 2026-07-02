import Phaser from "phaser";
import { missions } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, addHud, addNav, addRpgPanel, addTitle, addWrappedText, fitImageToBox, layout } from "./SceneHelpers.js";
import RepetinSystem from "../systems/RepetinSystem.js";

function formatFoundAt(value) {
  if (!value) return "Aun no encontrada";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function shorten(text, limit) {
  if (!text || text.length <= limit) return text;
  return `${text.slice(0, limit - 3).trim()}...`;
}

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
  }

  create() {
    const l = layout(this);
    addCoverBackground(this, "backgrounds.menu", 0.76);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x08020f, 0.26);
    addTitle(this, "Bolsa Arcana", l.W / 2, l.safeTop + 26, 23);
    addHud(this, l.safeTop + 66);
    addWrappedText(this, "Mochila encantada de reliquias recuperadas", l.W / 2, l.safeTop + 106, l.contentW, {
      fontSize: "12px",
      color: "#ffd166",
      align: "center"
    }).setOrigin(0.5);

    missions.forEach((mission, index) => this.addRelicEntry(mission, index));
    addNav(this, "InventoryScene");
    const repetin = new RepetinSystem(this, { x: l.W - 92, y: l.H * 0.23, width: 168, height: 84 });
    this.time.delayedCall(1000, () => repetin.maybe("inventory"));
  }

  addRelicEntry(mission, index) {
    const l = layout(this);
    const unlocked = progress.hasRelic(mission.id);
    const startY = l.safeTop + 144;
    const rowH = 58;
    const panelH = 52;
    const y = startY + index * rowH;

    addRpgPanel(this, l.W / 2, y, l.contentW, panelH, { fill: 0x281038, alpha: 0.76, stroke: unlocked ? 0xffd166 : 0x4b1a65, depth: 18 });

    const img = this.add.image(l.safeX + 30, y, mission.relicKey).setAlpha(unlocked ? 1 : 0.22).setDepth(20);
    fitImageToBox(img, 34, 34);
    if (!unlocked) img.setTint(0x1d1a2a);

    addWrappedText(this, unlocked ? mission.relic : `Reliquia del dia ${mission.day}`, l.safeX + 58, y - 18, l.contentW - 74, {
      fontSize: "12px",
      color: unlocked ? "#fff2ff" : "#9c89b8",
      fontStyle: "bold",
      depth: 21,
      stroke: "#130719",
      strokeThickness: 2
    });

    const description = unlocked ? shorten(mission.description, 86) : "Silueta sellada dentro de la bolsa.";
    addWrappedText(this, description, l.safeX + 58, y, l.contentW - 76, {
      fontSize: "9px",
      color: unlocked ? "#ffe6a7" : "#8f7aa7",
      lineSpacing: 0,
      depth: 21,
      stroke: "#130719",
      strokeThickness: 2
    });

    addWrappedText(this, unlocked ? `Dia ${mission.day} · ${formatFoundAt(progress.data.relicFoundAt?.[mission.id])}` : "Funcion desconocida.", l.safeX + 62, y + 18, l.contentW - 88, {
      fontSize: "8px",
      color: unlocked ? "#68e5ff" : "#5f5370",
      depth: 21
    });
  }
}
