import Phaser from "phaser";
import { missions } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, addGhostButton, addGroundedActor, addRpgButton, addRpgPanel, addWrappedText, fitImageToBox, flashMessage, layout } from "./SceneHelpers.js";
import DialogueSystem from "../systems/DialogueSystem.js";
import BossBattleSystem from "../systems/BossBattleSystem.js";

export default class BossScene extends Phaser.Scene {
  constructor() {
    super("BossScene");
  }

  create() {
    if (progress.relicCount < missions.length) {
      this.scene.start("BaseScene");
      return;
    }
    const l = layout(this);
    addCoverBackground(this, "backgrounds.battle");
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x07020e, 0.18);
    addGhostButton(this, l.safeX + 38, l.safeTop + 20, "Base", () => this.scene.start("BaseScene"), 76);
    this.system = new BossBattleSystem();
    this.effects = [];
    this.addStage();
    this.dialogue = new DialogueSystem(this, { y: l.H * 0.69, height: 168, fontSize: "12px" });
    this.dialogue.say({ speaker: "Narrador", portrait: "portraits.donRepetinMock", text: "Una sombra espera entre ruido, tareas pendientes y relojes imposibles." });
    this.renderActions();
  }

  addStage() {
    const l = layout(this);
    addRpgPanel(this, l.W / 2, l.H * 0.38, l.contentW, l.H * 0.42, { alpha: 0.16, stroke: 0xffd166, depth: 8 });
    addWrappedText(this, "Castillo de la Repetición", l.W / 2, l.H * 0.17, l.contentW, {
      fontSize: "21px",
      color: "#fff2ff",
      fontStyle: "bold",
      align: "center",
      stroke: "#651a72",
      strokeThickness: 4,
      depth: 12
    }).setOrigin(0.5);
    const groundY = l.H * 0.545;
    const agustinaActor = addGroundedActor(this, "characters.agustinaBattle", l.W * 0.20, groundY, 184, { depth: 16, shadowW: 78 });
    const agustinActor = addGroundedActor(this, "characters.agustinBattle", l.W * 0.37, groundY + 8, 180, { depth: 15, shadowW: 78 });
    const tomasActor = addGroundedActor(this, "characters.tomas", l.W * 0.50, groundY, 84, { depth: 18, shadowW: 42 });
    const bossActor = addGroundedActor(this, "boss.donRepetinShadow", l.W * 0.77, groundY, 224, { depth: 17, shadowW: 100 });
    this.agustina = agustinaActor.sprite;
    this.agustin = agustinActor.sprite;
    this.tomas = tomasActor.sprite;
    this.boss = bossActor.sprite;
  }

  renderActions() {
    const l = layout(this);
    this.actionGroup?.destroy();
    this.actionGroup = this.add.container(0, 0).setDepth(70);
    const actions = this.system.getActions().filter((action) => !action.disabled);
    const cols = actions.length === 1 ? 1 : 2;
    const buttonW = cols === 1 ? l.contentW * 0.72 : (l.contentW - 12) / 2;
    const startX = cols === 1 ? l.W / 2 : l.safeX + buttonW / 2;
    const startY = l.H * 0.835;
    actions.forEach((action, index) => {
      const x = startX + (index % cols) * (buttonW + 12);
      const y = startY + Math.floor(index / cols) * 42;
      const button = addRpgButton(this, x, y, buttonW, 36, action.label, () => this.handleAction(action.id), {
        fontSize: action.label.length > 18 ? "11px" : "12px",
        depth: 70
      });
      this.actionGroup.add(button);
    });
  }

  handleAction(action) {
    if (action === "continue") {
      this.fadeBattleArtifacts(() => this.scene.start("EpilogueScene"));
      return;
    }
    const result = this.system.act(action);
    this.dialogue.say(result);
    this.animateResult(result.kind);
    this.renderActions();
    if (this.system.state.defeated) progress.completeBoss();
  }

  animateResult(kind) {
    if (kind === "locked") {
      flashMessage(this, "Todavia no es el momento.", 142);
      return;
    }
    if (["shake", "glitch", "guard"].includes(kind)) {
      this.boss.setTexture("boss.donRepetin");
      this.cameras.main.shake(kind === "shake" ? 260 : 140, 0.008);
    }
    if (kind === "glitch") {
      const l = layout(this);
      const glitch = this.add.image(l.W / 2, l.H / 2, "effects.screenGlitch").setDisplaySize(l.W, l.H).setAlpha(0.55).setDepth(90);
      this.tweens.add({ targets: glitch, alpha: 0, duration: 450, onComplete: () => glitch.destroy() });
    }
    if (kind === "hint") {
      this.boss.setTexture("boss.donRepetin");
      this.tomas.setTexture("characters.tomasAlert");
      flashMessage(this, "Tomás encontró la pista: no alcanza con atacar.", 206);
    }
    if (kind === "fusion") this.playRelicFusion();
    if (kind === "fruit") this.playFruitMoment();
    if (kind === "gear") this.playSweetGear();
    if (kind === "victory") this.playDuoVictory();
  }

  playRelicFusion() {
    const l = layout(this);
    this.clearEffects();
    this.boss.setTexture("boss.donRepetinAngry");
    const center = { x: l.W / 2, y: l.H * 0.36 };
    this.fusionRelics = missions.map((mission, index) => {
      const startX = l.safeX + 24 + index * ((l.contentW - 48) / 6);
      const relic = this.add.image(startX, l.H * 0.2, mission.relicKey).setDepth(40);
      fitImageToBox(relic, 38, 38);
      this.tweens.add({
        targets: relic,
        x: center.x + Math.cos(index) * 44,
        y: center.y + Math.sin(index) * 44,
        duration: 700,
        ease: "Back.easeInOut",
        delay: index * 65
      });
      return relic;
    });
    const circle = this.add.image(center.x, center.y, "effects.relicFusionCircle").setAlpha(0).setDepth(38);
    fitImageToBox(circle, 210, 210);
    this.effects.push(circle);
    this.tweens.add({ targets: circle, alpha: 1, angle: 360, scale: 0.72, duration: 1200, delay: 520 });
    this.time.delayedCall(1450, () => {
      this.fusionRelics.forEach((relic) => this.tweens.add({ targets: relic, alpha: 0, scale: 0.04, duration: 320, onComplete: () => relic.destroy() }));
      this.fruit = this.add.image(center.x, center.y, "special.duruDuru").setScale(0.02).setDepth(45);
      this.effects.push(this.fruit);
      const burst = this.add.image(center.x, center.y, "effects.impactBurst").setDepth(44);
      fitImageToBox(burst, 170, 170);
      this.effects.push(burst);
      this.tweens.add({ targets: this.fruit, scale: 0.18, y: center.y - 22, duration: 560, ease: "Back.easeOut" });
    });
  }

  playFruitMoment() {
    this.boss.setTexture("boss.donRepetinAngry");
    if (this.fruit) {
      this.tweens.add({
        targets: this.fruit,
        x: this.agustina.x,
        y: this.agustina.y - 120,
        scale: 0.08,
        alpha: 0,
        duration: 620,
        onComplete: () => {
          this.fruit?.destroy();
          this.fruit = null;
          this.effects = this.effects.filter((item) => item.active);
        }
      });
    }
    this.time.delayedCall(640, () => {
      this.effects.forEach((item) => {
        if (item.active && item !== this.fruit) item.destroy();
      });
      this.effects = [];
      this.clearFloatingRelics();
    });
    this.cameras.main.flash(260, 255, 210, 130);
  }

  playSweetGear() {
    this.clearFloatingRelics();
    fitImageToBox(this.agustina.setTexture("characters.agustinaSweetGearPose"), 130, 220);
    const aura = this.add.image(this.agustina.x, this.agustina.y - 86, "effects.impactBurst").setScale(0.18).setAlpha(0.45).setDepth(10);
    fitImageToBox(aura, 118, 118);
    aura.setTint(0xff8fe5);
    this.effects.push(aura);
    this.tweens.add({ targets: aura, scale: 0.30, alpha: 0.18, duration: 850, yoyo: true, repeat: -1 });
    flashMessage(this, "Transformación completa. Falta el movimiento conjunto.", 206);
  }

  playDuoVictory() {
    const l = layout(this);
    this.clearFloatingRelics();
    this.effects.forEach((item) => item.active && item.destroy());
    this.effects = [];
    this.agustina.setVisible(false);
    this.agustin.setTexture("characters.duoAttackPose").setPosition(l.W * 0.34, l.H * 0.56).setDepth(30);
    fitImageToBox(this.agustin, 170, 235);
    this.boss.setTexture("boss.donRepetinDefeated");
    fitImageToBox(this.boss, 130, 230);
    const slash = this.add.image(l.W / 2, l.H * 0.36, "effects.duoAttackSlash").setDepth(42);
    const impact = this.add.image(l.W * 0.76, l.H * 0.41, "effects.impactBurst").setDepth(43);
    const smoke = this.add.image(l.W * 0.78, l.H * 0.50, "effects.bossSmoke").setDepth(44);
    fitImageToBox(slash, l.contentW, 190);
    fitImageToBox(impact, 160, 160);
    fitImageToBox(smoke, 160, 160);
    this.effects.push(slash, impact, smoke);
    this.cameras.main.flash(420, 255, 240, 210);
    this.tweens.add({ targets: this.boss, alpha: 0.72, y: l.H * 0.56, duration: 700 });
  }

  clearFloatingRelics() {
    this.fusionRelics?.forEach((relic) => relic.active && relic.destroy());
    this.fusionRelics = [];
  }

  clearEffects() {
    this.effects.forEach((item) => item.active && item.destroy());
    this.effects = [];
  }

  fadeBattleArtifacts(done) {
    const targets = [this.actionGroup, ...this.effects].filter(Boolean);
    this.tweens.add({ targets, alpha: 0, duration: 420, onComplete: done });
  }
}
