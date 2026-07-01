import Phaser from "phaser";
import { addCoverBackground, addRpgButton, addVeil, addWrappedText, fitImageToBox, layout, createDomOverlay } from "./SceneHelpers.js";
import { progress } from "../state/progress.js";

const FULL_NAME = "AGUSTINA AYELÉN BLASCO VILLARRUEL";
const sequence = [
  "Analizando identidad...",
  "No.",
  "Este archivo no es para cualquiera.",
  "La única jugadora compatible es..."
];

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super("LoginScene");
  }

  create() {
    const l = layout(this);
    addCoverBackground(this, "backgrounds.menu", 0.78);
    addVeil(this, 0.18);

    const logo = this.add.image(l.W / 2, l.safeTop + 66, "logos.projectUs").setDepth(28);
    fitImageToBox(logo, l.contentW * 0.72, 92);

    addWrappedText(this, "Entrada al mundo", l.W / 2, l.safeTop + 142, l.contentW, {
      fontSize: "25px",
      color: "#fff2ff",
      align: "center",
      stroke: "#651a72",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.buildLoginOverlay();
  }

  buildLoginOverlay() {
    const l = layout(this);
    const html = `
      <form class="rpg-login-card">
        <div class="rpg-kicker">Archivo clasificado del Gobierno Mundial</div>
        <div class="rpg-title">Portal de acceso</div>
        <div class="rpg-subtitle">Decime quién quiere cruzar el portal.</div>
        <div class="rpg-terminal" data-terminal>> Esperando identidad compatible...</div>
        <div class="rpg-row" data-input-row>
          <input class="rpg-input" autocomplete="off" placeholder="TU NOMBRE" />
          <button class="rpg-btn">Abrir portal</button>
        </div>
      </form>
    `;
    const { dom, wrapper } = createDomOverlay(this, l.W / 2, l.H * 0.59, html);
    this.loginDom = dom;
    this.terminalEl = wrapper.querySelector("[data-terminal]");
    this.inputRow = wrapper.querySelector("[data-input-row]");
    const input = wrapper.querySelector("input");
    wrapper.addEventListener("submit", (event) => {
      event.preventDefault();
      input.blur();
      this.inputRow.style.display = "none";
      this.runConsole();
    });
  }

  runConsole() {
    let fullText = "";
    let lineIndex = 0;
    const writeLine = () => {
      if (lineIndex >= sequence.length) {
        this.typeFinalName(fullText);
        return;
      }
      const line = `> ${sequence[lineIndex]}\n`;
      this.typeLine(line, fullText, (nextText) => {
        fullText = nextText;
        lineIndex += 1;
        this.time.delayedCall(220, writeLine);
      });
    };
    writeLine();
  }

  typeFinalName(prefix) {
    const l = layout(this);
    const line = `> ${FULL_NAME}\n`;
    this.typeLine(line, prefix, (finalText) => {
      this.terminalEl.textContent = finalText;
      progress.setLogin("Agustina");
      addRpgButton(this, l.W / 2, l.H * 0.82, l.contentW * 0.64, 48, "Continuar", () => this.scene.start("PrologueScene"));
    }, 32);
  }

  typeLine(line, prefix, done, delay = 22) {
    let char = 0;
    this.time.addEvent({
      delay,
      repeat: line.length,
      callback: () => {
        this.terminalEl.textContent = prefix + line.slice(0, char);
        char += 1;
        if (char > line.length) done(prefix + line);
      }
    });
  }
}
