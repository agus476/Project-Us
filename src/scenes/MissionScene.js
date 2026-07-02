import Phaser from "phaser";
import { isAvailable, missions, normalizeCode } from "../data/missions.js";
import { progress } from "../state/progress.js";
import { addCoverBackground, addGhostButton, addGroundedActor, addNav, addRpgButton, addRpgPanel, addWrappedText, fitImageToBox, flashMessage, layout } from "./SceneHelpers.js";
import DialogueSystem from "../systems/DialogueSystem.js";
import RepetinSystem from "../systems/RepetinSystem.js";

const POST_MISSION_CHAT = {
  "day-1": [
    { speaker: "Sistema", portrait: "relics.aroma", text: "Código aceptado. La señal física fue sincronizada con Project Us." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Miau. Con el Fragmento del Aroma ya puedo confirmar identidad: Agustina detectada. Nivel de sospecha: elegida por el mapa." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinMock", text: "Perfecto, empezaron con detalles. Eso suele terminar en planes, emoción y cero rutina. Malísimo para mi negocio." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Volvé cuando el mapa se vuelva a abrir. La próxima señal no viene por aroma: viene por antojo." }
  ],
  "day-2": [
    { speaker: "Sistema", portrait: "relics.sabor", text: "Código aceptado. Contrabando dulce reconocido por el mapa." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento del Sabor recuperado. Registro adicional: si desaparece un Milka Oreo, la mafia gatuna no declara sin abogado." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinMock", text: "Podrían haber comido algo normal y seguir con sus vidas. Pero no, tenían que romantizar el antojo." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "El mapa ya huele a problema. Próxima señal: una criatura afectiva con mordida rápida." }
  ],
  "day-3": [
    { speaker: "Sistema", portrait: "relics.alegria", text: "Código aceptado. Jaula dulce abierta. Criatura afectiva liberada." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento de la Alegría recuperado. La pidaña salió de la falsa laguna doméstica y apunta directo a la rutina." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinAngry", text: "La alegría es ineficiente. La gente feliz lava menos platos y se distrae con abra... ¿qué me mordió la capa?" },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Confirmo impacto: la pidaña mordió a Don Repetín con amor. Rutina debilitada. Próxima zona: territorio gatuno." }
  ],
  "day-4": [
    { speaker: "Sistema", portrait: "relics.hogar", text: "Código aceptado. Evidencia doméstica sincronizada." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento del Hogar recuperado. Vitto y Berta niegan todo. Eso, para la ley gatuna, significa que probablemente pasó algo." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinMock", text: "Hogar, rutina, platos, ropa. Todo estaba servido para mí. ¿Por qué tuvieron que meter ternura en el expediente?" },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "La base se fortaleció. Próxima señal: un recuerdo que duró más de lo que cualquier plan razonable permite." }
  ],
  "day-5": [
    { speaker: "Sistema", portrait: "relics.recuerdos", text: "Código aceptado. Archivo nocturno restaurado." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento de los Recuerdos recuperado. Sushi, charla y una anomalía temporal cerca de las 6 AM. Científicamente: se les fue de las manos." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinMock", text: "Dormir temprano era una opción. Una opción muy buena. Nadie me escucha." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "El mapa guardó esa noche como prueba. Próxima señal: una fórmula peligrosa, conocida como 85/15." }
  ],
  "day-6": [
    { speaker: "Sistema", portrait: "relics.complicidad", text: "Código aceptado. Cálculo sentimental verificado." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento de la Complicidad recuperado. Resultado oficial: Agustina 85% de razón. Agustín conserva 15% para delirar proyectos y sobrevivir." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinAngry", text: "Ese porcentaje es injusto. Aunque estadísticamente consistente. Me molesta más porque tiene sentido." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Queda una señal. La última no se esconde donde todo sale perfecto, sino donde el mundo pesa menos de a dos." }
  ],
  "day-7": [
    { speaker: "Sistema", portrait: "relics.amor", text: "Código aceptado. Última señal sincronizada." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento del Amor recuperado. El mapa confirma que no era solo una semana de dulzura: era una ruta completa hacia el castillo." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinAngry", text: "No. No no no. Con las siete reliquias activas, el Castillo de la Repetición queda expuesto." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Heroína, el camino final está abierto. Cuando estés lista, volvé a la Base y tocá el castillo." }
  ]
};

export default class MissionScene extends Phaser.Scene {
  constructor() {
    super("MissionScene");
  }

  create(data = {}) {
    const l = layout(this);
    const compact = l.compact;
    this.mission = missions.find((item) => item.id === data.missionId) || missions[0];
    this.navWasAdded = false;
    this.postMissionIndex = 0;
    this.postMissionButton = null;

    const missionAvailable = isAvailable(this.mission);
    const missionCleared = progress.isCleared(this.mission.id);
    const showRelicNow = missionCleared;

    addCoverBackground(this, this.mission.backgroundKey || "backgrounds.menu", 1);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x08020f, compact ? 0.30 : 0.16).setDepth(1);

    addGhostButton(this, l.safeX + 44, l.safeTop + 20, "Volver", () => this.scene.start("MapScene"), 96).setDepth(80);

    addWrappedText(this, `Día ${this.mission.day}`, l.W / 2, l.safeTop + 34, l.contentW, {
      fontSize: compact ? "12px" : "13px",
      color: "#68e5ff",
      fontStyle: "bold",
      align: "center",
      stroke: "#351343",
      strokeThickness: 3,
      depth: 20
    }).setOrigin(0.5);

    addWrappedText(this, this.mission.title, l.W / 2, l.safeTop + 62, l.contentW - 104, {
      fontSize: compact ? "18px" : "20px",
      color: "#fff2ff",
      fontStyle: "bold",
      align: "center",
      stroke: "#651a72",
      strokeThickness: 4,
      depth: 20
    }).setOrigin(0.5);

    addWrappedText(this, this.mission.place || "Ruta de Sweet Week", l.W / 2, l.safeTop + (compact ? 98 : 94), l.contentW - 100, {
      fontSize: compact ? "11px" : "12px",
      color: "#ffe6a7",
      fontStyle: "bold",
      align: "center",
      stroke: "#351343",
      strokeThickness: 3,
      depth: 20
    }).setOrigin(0.5);

    if (!missionAvailable) {
      this.renderLockedMission(l);
      this.dialogue = new DialogueSystem(this, {
        y: compact ? l.H - 230 : l.H * 0.675,
        height: compact ? 132 : 148,
        fontSize: compact ? "13px" : "13px"
      });
      this.dialogue.say({ speaker: "Sistema", portrait: "portraits.donRepetinMock", text: `Zona sellada hasta ${this.mission.date}. El mapa todavía no permite esta ruta.` });
      this.showNav();
    } else {
      this.renderMissionClue(l, { compact, showRelicNow });
      this.dialogue = new DialogueSystem(this, {
        y: compact ? l.H - 230 : l.H * 0.675,
        height: compact ? 136 : 148,
        fontSize: compact ? "13px" : "13px"
      });
      if (missionCleared) {
        this.dialogue.say({ speaker: "Tomas", portrait: "portraits.tomasClue", text: `${this.mission.relic} asegurada. La bolsa arcana ya la reconoce.` });
        this.showNav();
      } else {
        this.dialogue.say({ speaker: "Tomas", portrait: "portraits.tomasClue", text: this.mission.tomas });
        this.addCodeOverlay();
      }
    }

    const repetin = new RepetinSystem(this, { x: l.W - 94, y: compact ? l.safeTop + 150 : l.H * 0.25, width: compact ? 150 : 170, height: 76 });
    this.time.delayedCall(1100, () => repetin.maybe("mission"));
  }

  renderLockedMission(l) {
    const compact = l.compact;
    const boxY = compact ? l.H * 0.39 : l.safeTop + 205;
    const boxH = compact ? 120 : 128;
    addRpgPanel(this, l.W / 2, boxY, l.contentW, boxH, { alpha: 0.68, stroke: 0xff69c8, depth: 12 });
    addWrappedText(this, "Zona sellada", l.W / 2, boxY - 38, l.contentW - 44, {
      fontSize: compact ? "18px" : "20px",
      color: "#ffd166",
      fontStyle: "bold",
      align: "center",
      stroke: "#351343",
      strokeThickness: 4,
      depth: 20
    }).setOrigin(0.5);
    addWrappedText(this, `Esta ruta se abre el ${this.mission.date}.`, l.W / 2, boxY - 2, l.contentW - 52, {
      fontSize: compact ? "14px" : "15px",
      color: "#fff2ff",
      align: "center",
      stroke: "#130719",
      strokeThickness: 2,
      depth: 20
    }).setOrigin(0.5);
    addWrappedText(this, "Don Repetín todavía está bloqueando esta señal.", l.W / 2, boxY + 34, l.contentW - 52, {
      fontSize: compact ? "12px" : "13px",
      color: "#cbb9d8",
      align: "center",
      stroke: "#130719",
      strokeThickness: 2,
      depth: 20
    }).setOrigin(0.5);
  }

  renderMissionClue(l, { compact, showRelicNow }) {
    const clueY = compact ? l.safeTop + 184 : l.safeTop + 205;
    const clueH = compact ? 112 : 128;
    if (this.textures.exists("ui.missionPanel")) {
      const panel = this.add.image(l.W / 2, clueY, "ui.missionPanel").setDepth(11).setAlpha(0.90);
      panel.setDisplaySize(l.contentW + 38, clueH);
    } else {
      addRpgPanel(this, l.W / 2, clueY, l.contentW, clueH, { alpha: 0.54, stroke: 0xffd166, depth: 12 });
    }

    addWrappedText(this, "Pista del lugar", l.safeX + 36, clueY - (compact ? 34 : 40), l.contentW * 0.55, {
      fontSize: compact ? "12px" : "13px",
      color: "#68e5ff",
      fontStyle: "bold",
      stroke: "#351343",
      strokeThickness: 3,
      depth: 20
    });
    addWrappedText(this, this.mission.hint, l.safeX + 36, clueY - (compact ? 14 : 18), l.contentW - 72, {
      fontSize: compact ? "11px" : "12px",
      color: "#fff2ff",
      lineSpacing: 2,
      depth: 20,
      stroke: "#130719",
      strokeThickness: 2
    });

    const tomasGroundY = compact ? l.H * 0.49 : l.H * 0.56;
    addGroundedActor(this, "characters.tomas", l.safeX + 62, tomasGroundY, compact ? 76 : 96, { name: "Tomas", depth: 24, shadowW: compact ? 48 : 58 });

    const relicX = l.W * 0.76;
    const relicY = compact ? l.H * 0.45 : l.H * 0.515;
    this.relic = this.add.image(relicX, relicY, this.mission.relicKey).setDepth(22);
    fitImageToBox(this.relic, compact ? 66 : 84, compact ? 66 : 84);
    this.relic.setVisible(showRelicNow).setAlpha(showRelicNow ? 1 : 0);

    this.hiddenRelicHint = addWrappedText(this, "?", relicX, relicY, 90, {
      fontSize: compact ? "32px" : "38px",
      color: "#ffd166",
      align: "center",
      stroke: "#651a72",
      strokeThickness: 5,
      depth: 23
    }).setOrigin(0.5);
    this.hiddenRelicHint.setVisible(!showRelicNow);

    this.tweens.add({ targets: showRelicNow ? this.relic : this.hiddenRelicHint, y: relicY - 8, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.relicLabel = addWrappedText(this, showRelicNow ? this.mission.relic : "Reliquia oculta", relicX, relicY + (compact ? 40 : 48), 122, {
      fontSize: compact ? "10px" : "12px",
      color: "#ffd166",
      align: "center",
      depth: 23,
      stroke: "#351343",
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  showNav() {
    if (this.navWasAdded) return;
    addNav(this);
    this.navWasAdded = true;
  }

  addCodeOverlay() {
    const l = layout(this);
    const element = document.createElement("form");
    element.className = "code-panel code-panel-v4";
    element.innerHTML = '<input autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" placeholder="CODIGO" /><button type="submit">Validar</button>';
    this.codeDom = this.add.dom(l.W / 2, l.compact ? l.H - 92 : l.H * 0.785, element).setDepth(95);
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
    this.relic?.setVisible(true).setAlpha(1);
    this.relicLabel?.setText(this.mission.relic);
    this.dialogue.say({ speaker: "Sistema", portrait: this.mission.relicKey, text: this.mission.message });
    const burst = this.add.image(this.relic?.x ?? l.W / 2, this.relic?.y ?? l.H * 0.43, "effects.impactBurst").setDepth(28);
    fitImageToBox(burst, 180, 180);
    if (this.relic) this.tweens.add({ targets: this.relic, x: l.W / 2, y: l.compact ? l.H * 0.34 : l.H * 0.39, scale: this.relic.scale * 1.2, angle: 360, duration: 850, ease: "Back.easeOut" });
    this.tweens.add({ targets: burst, alpha: 0, scale: burst.scale * 1.35, duration: 850, onComplete: () => burst.destroy() });
    flashMessage(this, `Reliquia obtenida: ${this.mission.relic}`, l.safeTop + 130);
    this.time.delayedCall(900, () => this.startPostMissionChat());
  }

  startPostMissionChat() {
    const lines = POST_MISSION_CHAT[this.mission.id] || [];
    if (!lines.length) {
      this.showNav();
      return;
    }
    this.postMissionLines = lines;
    this.postMissionIndex = 0;
    this.showPostMissionLine();
  }

  showPostMissionLine() {
    const l = layout(this);
    const line = this.postMissionLines[this.postMissionIndex];
    if (!line) {
      this.postMissionButton?.destroy();
      this.postMissionButton = null;
      this.showNav();
      return;
    }

    this.dialogue.say(line);
    this.postMissionButton?.destroy();
    const isLast = this.postMissionIndex >= this.postMissionLines.length - 1;
    this.postMissionButton = addRpgButton(this, l.W / 2, l.compact ? l.H - 96 : l.H * 0.805, l.contentW * 0.62, 42, isLast ? "Volver al mapa" : "Siguiente", () => this.advancePostMissionChat(), {
      fill: isLast ? 0x7d49d8 : 0xd94fa7,
      stroke: 0xffd166,
      fontSize: "14px",
      depth: 96
    });
  }

  advancePostMissionChat() {
    if (this.dialogue?.timer && this.dialogue.timer.getProgress() < 1) {
      this.dialogue.advance();
      return;
    }
    if (this.dialogue && this.dialogue.page < this.dialogue.pages.length - 1) {
      this.dialogue.advance();
      return;
    }

    const isLast = this.postMissionIndex >= this.postMissionLines.length - 1;
    if (isLast) {
      this.postMissionButton?.destroy();
      this.postMissionButton = null;
      this.scene.start("MapScene");
      return;
    }

    this.postMissionIndex += 1;
    this.showPostMissionLine();
  }
}
