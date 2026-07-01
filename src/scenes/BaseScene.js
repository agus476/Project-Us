import Phaser from "phaser";
import { getDailyMission, missions } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, flashMessage, layout } from "./SceneHelpers.js";
import RepetinSystem from "../systems/RepetinSystem.js";

const BASE_ART_W = 432;
const BASE_ART_H = 750;

export default class BaseScene extends Phaser.Scene {
  constructor() {
    super("BaseScene");
  }

  create() {
    const l = layout(this);
    const artKey = this.textures.exists("backgrounds.baseHubFinal") ? "backgrounds.baseHubFinal" : "backgrounds.campamento";

    // Fondo de apoyo para llenar toda la pantalla sin dejar cortes notorios.
    addCoverBackground(this, artKey, 0.22).setTint(0xd39bd9);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x14081d, 0.28).setDepth(1);

    // Imagen principal completa, SIN recorte, preservando calidad.
    const hub = this.add.image(l.W / 2, l.H / 2, artKey).setDepth(10);
    const hubScale = Math.min(l.W / hub.width, l.H / hub.height);
    hub.setScale(hubScale).setScrollFactor(0);

    const displayW = BASE_ART_W * hubScale;
    const displayH = BASE_ART_H * hubScale;
    const left = l.W / 2 - displayW / 2;
    const top = l.H / 2 - displayH / 2;


    const addDynamicCounter = () => {
      const cx = left + 216 * hubScale;
      const cy = top + 542 * hubScale;
      const w = 142 * hubScale;
      const h = 25 * hubScale;
      const g = this.add.graphics().setDepth(82);
      g.fillStyle(0x1b0a2b, 0.96);
      g.lineStyle(Math.max(2, 2 * hubScale), 0xffd166, 0.95);
      g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 11 * hubScale);
      g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 11 * hubScale);
      this.add.text(cx, cy, `${progress.relicCount}/7 reliquias recuperadas`, {
        fontFamily: "Trebuchet MS, Verdana",
        fontSize: `${Math.max(9, 11 * hubScale)}px`,
        color: "#ffe9a8",
        fontStyle: "bold",
        align: "center",
        stroke: "#2a0b36",
        strokeThickness: Math.max(2, 2 * hubScale)
      }).setOrigin(0.5).setDepth(83);
    };
    addDynamicCounter();

    const daily = getDailyMission(progress);
    const bossUnlocked = progress.relicCount >= missions.length;

    const createHotspotFromArt = (artX, artY, artW, artH, onClick, disabled = false) => {
      const x = left + artX * hubScale;
      const y = top + artY * hubScale;
      const w = artW * hubScale;
      const h = artH * hubScale;
      const zone = this.add.rectangle(x, y, w, h, 0xffffff, 0.001)
        .setDepth(80)
        .setInteractive({ useHandCursor: !disabled });
      if (disabled) {
        zone.disableInteractive();
      } else {
        zone.on("pointerdown", onClick);
      }
      return zone;
    };

    // Hotspots alineados a los carteles del arte final.
    createHotspotFromArt(307, 192, 82, 44, () => {
      if (bossUnlocked) this.scene.start("BossScene");
      else flashMessage(this, "Faltan reliquias para abrir el Castillo de la Repetición.", top + 110 * hubScale);
    });
    createHotspotFromArt(275, 289, 66, 36, () => this.scene.start("MapScene"));
    createHotspotFromArt(381, 370, 74, 38, () => this.scene.start("AchievementsScene"));
    createHotspotFromArt(63, 536, 110, 56, () => this.scene.start("InventoryScene"));
    createHotspotFromArt(214, 688, 172, 66, () => this.scene.start("MissionScene", { missionId: daily.id }));

    const repetin = new RepetinSystem(this, {
      x: left + 334 * hubScale,
      y: top + 212 * hubScale,
      width: 150,
      height: 76
    });
    this.time.delayedCall(900, () => repetin.maybe("base"));
  }
}
