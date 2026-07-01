import Phaser from "phaser";
import { missions } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, addHud, addNav, addRpgPanel, addTitle, addWrappedText, fitImageToBox, layout } from "./SceneHelpers.js";
import RepetinSystem from "../systems/RepetinSystem.js";

function formatFoundAt(value) {
  if (!value) return "Aun no encontrada";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
  }

  create() {
    const l = layout(this);
    addCoverBackground(this, "backgrounds.menu", 0.76);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x08020f, 0.26);
    addTitle(this, "Bolsa Arcana", l.W / 2, l.safeTop + 40, 27);
    addHud(this, l.safeTop + 92);
    addWrappedText(this, "Mochila encantada de reliquias recuperadas", l.W / 2, l.safeTop + 132, l.contentW, {
      fontSize: "13px",
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
    const startY = l.safeTop + 188;
    const rowH = 76;
    const y = startY + index * rowH;
    addRpgPanel(this, l.W / 2, y, l.contentW, 66, { fill: 0x281038, alpha: 0.72, stroke: unlocked ? 0xffd166 : 0x4b1a65, depth: 18 });
    const img = this.add.image(l.safeX + 35, y, mission.relicKey).setAlpha(unlocked ? 1 : 0.22).setDepth(20);
    fitImageToBox(img, 48, 48);
    if (!unlocked) img.setTint(0x1d1a2a);
    addWrappedText(this, unlocked ? mission.relic : `Reliquia del día ${mission.day}`, l.safeX + 72, y - 27, l.contentW - 92, {
      fontSize: "14px",
      color: unlocked ? "#fff2ff" : "#9c89b8",
      fontStyle: "bold",
      depth: 21
    });
    const shortDescription = unlocked && mission.description.length > 70 ? `${mission.description.slice(0, 67)}...` : mission.description;
    addWrappedText(this, unlocked ? shortDescription : "Silueta sellada dentro de la bolsa.", l.safeX + 72, y - 7, l.contentW - 92, {
      fontSize: "9px",
      color: unlocked ? "#ffd166" : "#766388",
      depth: 21
    });
    addWrappedText(this, unlocked ? `Día ${mission.day} · ${formatFoundAt(progress.data.relicFoundAt?.[mission.id])}` : "Función desconocida.", l.safeX + 72, y + 21, l.contentW - 92, {
      fontSize: "9px",
      color: unlocked ? "#68e5ff" : "#5f5370",
      depth: 21
    });
  }
}
