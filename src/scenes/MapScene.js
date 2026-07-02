import Phaser from "phaser";
import { DEV_MODE, isAvailable, missions, todayId } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, addHud, addNav, addRpgButton, addRpgPanel, addTitle, addWrappedText, fitImageToBox, layout } from "./SceneHelpers.js";
import RepetinSystem from "../systems/RepetinSystem.js";

const MAP_ASSET = { w: 1672, h: 941 };
const MAP_NODES = [
  [277, 624],
  [529, 357],
  [765, 354],
  [832, 457],
  [1084, 449],
  [1106, 602],
  [1324, 704]
];

export default class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
    this.nodeRefs = [];
    this.detailObjects = [];
  }

  create() {
    const l = layout(this);
    addCoverBackground(this, "backgrounds.campamento", 0.7);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x09030f, 0.34);
    addTitle(this, "Mapa de Sweet Week", l.W / 2, l.safeTop + 38, 25);
    addHud(this, l.safeTop + 88);

    this.mapBox = {
      w: Math.min(l.W - 14, l.contentW + 28),
      h: Math.min(l.H * 0.30, Math.min(l.W - 14, l.contentW + 28) * MAP_ASSET.h / MAP_ASSET.w),
      x: l.W / 2,
      y: l.H * 0.31
    };

    addRpgPanel(this, this.mapBox.x, this.mapBox.y, this.mapBox.w + 12, this.mapBox.h + 12, { alpha: 0.84, stroke: 0xffd166, depth: 8 });
    this.mapImage = this.add.image(this.mapBox.x, this.mapBox.y, "backgrounds.map").setDepth(9);
    this.mapImage.setDisplaySize(this.mapBox.w, this.mapBox.h);

    missions.forEach((mission, index) => this.addNode(mission, index));
    const selected = missions.find((mission) => isAvailable(mission) && !progress.isCleared(mission.id)) || missions[0];
    this.renderMissionDetail(selected);

    addNav(this, "MapScene");
    const repetin = new RepetinSystem(this, { x: l.W - 92, y: l.H * 0.18, width: 168, height: 86 });
    this.time.delayedCall(800, () => repetin.maybe("map"));
  }

  toScreen(sourceX, sourceY) {
    return {
      x: this.mapBox.x - this.mapBox.w / 2 + (sourceX / MAP_ASSET.w) * this.mapBox.w,
      y: this.mapBox.y - this.mapBox.h / 2 + (sourceY / MAP_ASSET.h) * this.mapBox.h
    };
  }

  addNode(mission, index) {
    const p = this.toScreen(...MAP_NODES[index]);
    const locked = !isAvailable(mission);
    const cleared = progress.isCleared(mission.id);

    const pulse = this.add.circle(p.x, p.y, 19, cleared ? 0xff7fc8 : 0xffd166, 0.26).setDepth(14);
    const node = this.add.circle(p.x, p.y, 14, locked ? 0x3a2849 : 0xff7fc8, 0.98)
      .setStrokeStyle(3, 0xfff0b8)
      .setInteractive({ useHandCursor: true })
      .setDepth(16);
    const label = this.add.text(p.x, p.y, locked ? "X" : String(mission.day), {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "16px",
      color: locked ? "#9c89b8" : "#fff2ff",
      stroke: "#651a72",
      strokeThickness: 4,
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(17);

    const badge = this.add.circle(p.x, p.y - 20, 7, 0xf542a7, 1).setStrokeStyle(2, 0xfff0b8).setDepth(18);
    const badgeHeart = this.add.text(p.x, p.y - 20, "♥", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "10px",
      color: "#fff7ff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(19);
    badge.setVisible(index === 0 || index === missions.length - 1);
    badgeHeart.setVisible(index === 0 || index === missions.length - 1);

    let check = null;
    if (cleared) {
      check = this.add.circle(p.x + 14, p.y - 14, 8, 0x7cffc4, 1).setStrokeStyle(2, 0x12071f).setDepth(18);
      this.add.text(p.x + 14, p.y - 14, "✓", {
        fontFamily: "Trebuchet MS, Verdana",
        fontSize: "10px",
        color: "#12071f",
        fontStyle: "bold"
      }).setOrigin(0.5).setDepth(19);
    }

    if (!locked) {
      this.tweens.add({ targets: pulse, scale: 1.28, alpha: 0.05, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    node.on("pointerdown", () => this.renderMissionDetail(mission));
    this.nodeRefs.push({ missionId: mission.id, pulse, node, label, badge, badgeHeart, check });
  }

  setSelectedNode(mission) {
    this.nodeRefs.forEach((ref) => {
      const active = ref.missionId === mission.id;
      ref.node.setScale(active ? 1.15 : 1);
      ref.pulse.setAlpha(active ? 0.32 : 0.18);
      ref.node.setStrokeStyle(active ? 4 : 3, active ? 0xffffff : 0xfff0b8);
    });
  }

  renderMissionDetail(mission) {
    this.setSelectedNode(mission);
    this.detailObjects.forEach((obj) => obj?.destroy?.());
    this.detailObjects = [];

    const l = layout(this);
    const locked = !isAvailable(mission);
    const cleared = progress.isCleared(mission.id);
    const status = locked ? `Bloqueada hasta ${mission.date}` : cleared ? "Completada" : DEV_MODE ? "Disponible" : `Disponible hoy (${todayId()})`;
    const statusColor = locked ? "#c5b3d8" : cleared ? "#7cffc4" : "#68e5ff";

    const cardX = l.W / 2;
    const cardY = l.H * 0.635;
    const cardW = l.contentW + 4;
    const cardH = 284;

    const panel = addRpgPanel(this, cardX, cardY, cardW, cardH, { alpha: 0.90, stroke: 0xffd166, depth: 21 });
    this.detailObjects.push(panel);

    const previewW = 132;
    const previewH = 158;
    const previewX = l.W - l.safeX - previewW / 2 - 8;
    const previewY = cardY - 20;
    const previewFrame = addRpgPanel(this, previewX, previewY, previewW + 10, previewH + 10, { alpha: 0.84, stroke: 0xffd166, depth: 23 });
    const preview = this.add.image(previewX, previewY, mission.backgroundKey).setDepth(24);
    preview.setDisplaySize(previewW, previewH);
    const previewMaskShape = this.add.graphics().fillRoundedRect(previewX - previewW / 2, previewY - previewH / 2, previewW, previewH, 18);
    const previewMask = previewMaskShape.createGeometryMask();
    previewMaskShape.setVisible(false);
    preview.setMask(previewMask);
    this.detailObjects.push(previewFrame, preview, previewMaskShape);

    const title = addWrappedText(this, mission.title, l.safeX + 24, cardY - 108, cardW - previewW - 52, {
      fontSize: "20px",
      color: "#fff0aa",
      fontStyle: "bold",
      stroke: "#351343",
      strokeThickness: 4,
      depth: 25
    });
    const statusLabel = addWrappedText(this, status, previewX, cardY - 108, previewW, {
      fontSize: "12px",
      color: statusColor,
      fontStyle: "bold",
      align: "center",
      stroke: "#130719",
      strokeThickness: 3,
      depth: 25
    }).setOrigin(0.5, 0);
    const place = addWrappedText(this, mission.place, l.safeX + 24, cardY - 48, cardW - previewW - 54, {
      fontSize: "12px",
      color: "#ffd166",
      fontStyle: "bold",
      stroke: "#130719",
      strokeThickness: 3,
      depth: 25
    });
    const intro = addWrappedText(this, mission.mapIntro || mission.description, l.safeX + 24, cardY - 6, cardW - previewW - 52, {
      fontSize: "12px",
      color: "#fff7ff",
      lineSpacing: 2,
      stroke: "#130719",
      strokeThickness: 2,
      depth: 25
    });
    const rewardTitle = addWrappedText(this, "Recompensa", l.safeX + 24, cardY + 64, 120, {
      fontSize: "13px",
      color: "#ffd166",
      fontStyle: "bold",
      stroke: "#130719",
      strokeThickness: 3,
      depth: 25
    });

    const relicX = l.safeX + 58;
    const relicY = cardY + 112;
    const relic = this.add.image(relicX, relicY, mission.relicKey).setDepth(25);
    fitImageToBox(relic, 48, 48);
    if (!cleared) {
      relic.setAlpha(0.22).setTint(0x33224a);
      const question = addWrappedText(this, "?", relicX, relicY, 40, {
        fontSize: "26px",
        color: "#ffd166",
        align: "center",
        fontStyle: "bold",
        stroke: "#651a72",
        strokeThickness: 4,
        depth: 26
      }).setOrigin(0.5);
      this.detailObjects.push(question);
    }
    const rewardLabel = addWrappedText(this, mission.relic, l.safeX + 94, cardY + 100, cardW - previewW - 166, {
      fontSize: "12px",
      color: cleared ? "#fff7ff" : "#cbb9d8",
      lineSpacing: 2,
      stroke: "#130719",
      strokeThickness: 2,
      depth: 25
    });

    const buttonLabel = locked ? "Ruta sellada" : cleared ? "Revisitar misión" : "Entrar a misión";
    const action = addRpgButton(this, previewX, cardY + 102, previewW + 8, 40, buttonLabel, () => {
      if (!locked) this.scene.start("MissionScene", { missionId: mission.id });
    }, {
      fill: locked ? 0x6b527e : 0xd94fa7,
      stroke: 0xffd166,
      color: "#fff2ff",
      fontSize: "13px",
      disabled: locked,
      depth: 26
    });

    this.detailObjects.push(title, statusLabel, place, intro, rewardTitle, relic, rewardLabel, action);
  }
}
