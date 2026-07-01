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
    { speaker: "Sistema", portrait: "relics.alegria", text: "Código aceptado. Mordida emocional validada." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Fragmento de la Alegría recuperado. La Piraña del Amazonas queda registrada como especie peligrosa, tierna y absolutamente culpable." },
    { speaker: "Don Repetin", portrait: "portraits.donRepetinAngry", text: "La alegría es ineficiente. La gente feliz lava menos platos y se distrae con abrazos." },
    { speaker: "Tomas", portrait: "portraits.tomasClue", text: "Ignoralo. Próxima zona: territorio gatuno. Entrar con respeto, snacks y cero acusaciones directas." }
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
    this.mission = missions.find((item) => item.id === data.missionId) || missions[0];
    this.navWasAdded = false;
    this.postMissionIndex = 0;
    this.postMissionButton = null;

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

    const clueY = l.safeTop + 205;
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
    addWrappedText(this, this.mission.hint, l.safeX + 42, clueY - 18, l.contentW - 84, {
      fontSize: "11px",
      color: "#fff2ff",
      lineSpacing: 2,
      depth: 20,
      stroke: "#130719",
      strokeThickness: 2
    });

    const tomasGroundY = l.H * 0.56;
    addGroundedActor(this, "characters.tomas", l.safeX + 60, tomasGroundY, 96, { name: "Tomas", depth: 24, shadowW: 58 });

    const relicX = l.W * 0.74;
    const relicY = l.H * 0.515;
    this.relic = this.add.image(relicX, relicY, this.mission.relicKey).setDepth(22);
    fitImageToBox(this.relic, 84, 84);
    const missionAvailable = isAvailable(this.mission);
    const missionCleared = progress.isCleared(this.mission.id);
    const showRelicNow = missionCleared;
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

    this.dialogue = new DialogueSystem(this, { y: l.H * 0.675, height: 136, fontSize: "12px" });
    if (!missionAvailable) {
      this.dialogue.say({ speaker: "Sistema", portrait: "portraits.donRepetinMock", text: `Zona sellada hasta ${this.mission.date}. El mapa todavía no permite esta ruta.` });
      this.showNav();
    } else if (missionCleared) {
      this.dialogue.say({ speaker: "Tomas", portrait: "portraits.tomasClue", text: `${this.mission.relic} asegurada. La bolsa arcana ya la reconoce.` });
      this.showNav();
    } else {
      this.dialogue.say({ speaker: "Tomas", portrait: "portraits.tomasClue", text: this.mission.tomas });
      this.addCodeOverlay();
    }

    const repetin = new RepetinSystem(this, { x: l.W - 94, y: l.H * 0.25, width: 170, height: 86 });
    this.time.delayedCall(1100, () => repetin.maybe("mission"));
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
    this.codeDom = this.add.dom(l.W / 2, l.H * 0.785, element).setDepth(95);
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
    const spotlight = addRpgPanel(this, l.W / 2, l.H * 0.48, l.contentW, 126, { fill: 0xffd166, alpha: 0.12, stroke: 0x7cffc4, depth: 24 });
    const burst = this.add.image(this.relic.x, this.relic.y, "effects.impactBurst").setDepth(28);
    fitImageToBox(burst, 180, 180);
    this.tweens.add({ targets: this.relic, x: l.W / 2, y: l.H * 0.39, scale: this.relic.scale * 1.2, angle: 360, duration: 850, ease: "Back.easeOut" });
    this.tweens.add({ targets: burst, alpha: 0, scale: burst.scale * 1.35, duration: 850, onComplete: () => burst.destroy() });
    this.tweens.add({ targets: spotlight, alpha: 0, delay: 900, duration: 500, onComplete: () => spotlight.destroy() });
    flashMessage(this, `Reliquia obtenida: ${this.mission.relic}`, l.safeTop + 150);
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
    this.postMissionButton = addRpgButton(this, l.W / 2, l.H * 0.805, l.contentW * 0.62, 42, isLast ? "Volver al mapa" : "Siguiente", () => this.advancePostMissionChat(), {
      fill: isLast ? 0x7d49d8 : 0xd94fa7,
      stroke: 0xffd166,
      fontSize: "13px",
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
