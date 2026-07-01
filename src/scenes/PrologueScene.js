import Phaser from "phaser";
import { addCoverBackground, addRpgButton, addRpgPanel, addTitle, addWrappedText, layout } from "./SceneHelpers.js";

const pages = [
  "El Gobierno Mundial escondio 7 reliquias porque descubrio algo peligroso: los detalles pueden romper la rutina.",
  "Don Repetin quiere que todo vuelva al ciclo: trabajo, cansancio, ropa sucia, platos, dormir, repetir.",
  "El mapa todavia guarda magia. La mision es recuperar las reliquias antes de que todos los dias parezcan el mismo."
];

export default class PrologueScene extends Phaser.Scene {
  constructor() {
    super("PrologueScene");
  }

  create() {
    this.page = 0;
    const l = layout(this);
    addCoverBackground(this, "backgrounds.map", 0.82);
    this.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x07020e, 0.5);
    this.add.image(l.W / 2, l.safeTop + 58, "logos.projectUs").setScale(0.2);
    addTitle(this, "Prólogo", l.W / 2, l.safeTop + 142, 28);
    this.panel = addRpgPanel(this, l.W / 2, l.H * 0.44, l.contentW, l.H * 0.34, { fill: 0x0d0618, alpha: 0.88, stroke: 0xffd166 });
    this.text = addWrappedText(this, "", l.safeX + 24, l.H * 0.34, l.contentW - 48, {
      fontSize: "20px",
      color: "#fff2ff",
      lineSpacing: 8
    });
    this.skipButton = addRpgButton(this, l.W / 2, l.H * 0.765, l.contentW * 0.58, 42, "Saltar prólogo", () => {
      this.typeEvent?.remove(false);
      this.scene.start("BaseScene");
    }, {
      fill: 0x341044,
      stroke: 0xffd166,
      alpha: 0.9,
      fontSize: "12px",
      depth: 85
    });
    this.renderPage();
  }

  renderPage() {
    const l = layout(this);
    this.typeEvent?.remove(false);
    this.text.setText("");
    this.nextButton?.destroy();
    let index = 0;
    const body = pages[this.page];
    this.typeEvent = this.time.addEvent({
      delay: 18,
      repeat: body.length,
      callback: () => {
        this.text.setText(body.slice(0, index));
        index += 1;
        if (index > body.length) {
          this.typeEvent = null;
          const isLast = this.page >= pages.length - 1;
          this.nextButton = addRpgButton(this, l.W / 2, l.H * 0.68, l.contentW * 0.72, 48, isLast ? "Comenzar aventura" : "Siguiente", () => {
            if (isLast) this.scene.start("BaseScene");
            else {
              this.page += 1;
              this.renderPage();
            }
          });
        }
      }
    });
  }
}
