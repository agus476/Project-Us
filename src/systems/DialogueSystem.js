import Phaser from "phaser";
import { layout } from "../scenes/SceneHelpers.js";

function splitText(text, max = 92, minLast = 24) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const pages = [];
  let page = "";

  words.forEach((word) => {
    const next = page ? `${page} ${word}` : word;
    if (next.length > max && page) {
      pages.push(page);
      page = word;
    } else {
      page = next;
    }
  });

  if (page) pages.push(page);

  if (pages.length > 1) {
    const last = pages[pages.length - 1];
    const previous = pages[pages.length - 2];
    if (last.length < minLast && `${previous} ${last}`.length <= max + 22) {
      pages[pages.length - 2] = `${previous} ${last}`;
      pages.pop();
    }
  }

  return pages.length ? pages : [""];
}

export default class DialogueSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    const l = layout(scene);
    this.width = Math.min(options.width ?? l.contentW, l.W - 32);
    this.height = options.height ?? 172;
    const x = options.x ?? l.W / 2;
    const y = options.y ?? l.H - l.safeBottom - this.height / 2 - 72;
    this.group = scene.add.container(x, y).setDepth(options.depth ?? 94);

    const shadow = scene.add.rectangle(0, 8, this.width, this.height, 0x000000, 0.28);
    const box = scene.add.image(0, 0, "ui.dialogBox").setDisplaySize(this.width, this.height).setAlpha(0.97);
    const dark = scene.add.rectangle(0, 4, this.width - 30, this.height - 34, 0x14071f, 0.18);

    this.portrait = scene.add.image(-this.width / 2 + 48, 10, "portraits.tomasClue").setDisplaySize(62, 62);
    this.speaker = scene.add.text(-this.width / 2 + 86, -this.height / 2 + 34, "Tomas", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "15px",
      color: "#ffd166",
      fontStyle: "bold",
      stroke: "#1b0824",
      strokeThickness: 3
    });
    this.text = scene.add.text(-this.width / 2 + 86, -this.height / 2 + 58, "", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: options.fontSize ?? "14px",
      color: "#fff2ff",
      lineSpacing: 3,
      stroke: "#130719",
      strokeThickness: 2,
      wordWrap: { width: this.width - 112, useAdvancedWrap: true }
    });
    this.nextHint = scene.add.text(this.width / 2 - 26, this.height / 2 - 24, "", {
      fontFamily: "Trebuchet MS, Verdana",
      fontSize: "12px",
      color: "#ffd166",
      fontStyle: "bold"
    }).setOrigin(1, 0.5);
    this.nextZone = scene.add.rectangle(this.width / 2 - 62, this.height / 2 - 26, 118, 42, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    this.group.add([shadow, box, dark, this.portrait, this.speaker, this.text, this.nextHint, this.nextZone]);
    this.group.setSize(this.width, this.height).setInteractive(new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height), Phaser.Geom.Rectangle.Contains);
    this.group.on("pointerdown", (pointer, localX, localY, event) => {
      event?.stopPropagation?.();
      this.advance();
    });
    this.nextZone.on("pointerdown", (pointer, localX, localY, event) => {
      event?.stopPropagation?.();
      this.advance();
    });
    this.timer = null;
    this.pages = [""];
    this.page = 0;
    this.current = {};
  }

  say({ speaker = "Sistema", portrait = "portraits.tomasClue", text = "", speed = 12 }) {
    if (this.timer) this.timer.remove(false);
    this.current = { speaker, portrait, speed };
    this.pages = splitText(text, this.width < 390 ? 82 : 92, this.width < 390 ? 20 : 24);
    this.page = 0;
    this.renderPage();
  }

  setPortraitFrame(portrait) {
    const key = portrait || "portraits.tomasClue";
    this.portrait.setTexture(key);

    if (key === "portraits.tomasClue") {
      this.portrait.setDisplaySize(70, 70);
      this.portrait.setPosition(-this.width / 2 + 48, 8);
      return;
    }

    this.portrait.setDisplaySize(62, 62);
    this.portrait.setPosition(-this.width / 2 + 48, 10);
  }

  renderPage() {
    const { speaker, portrait, speed } = this.current;
    const text = this.pages[this.page] || "";
    this.setPortraitFrame(portrait);
    this.speaker.setText(speaker || "Sistema");
    this.text.setText("");
    this.nextHint.setText("");
    this.nextZone.setVisible(false).disableInteractive();
    let index = 0;
    this.timer = this.scene.time.addEvent({
      delay: speed ?? 12,
      repeat: text.length,
      callback: () => {
        this.text.setText(text.slice(0, index));
        index += 1;
        if (index > text.length && this.pages.length > 1) {
          const label = this.page < this.pages.length - 1 ? "Siguiente" : "Fin";
          this.nextHint.setText(label);
          if (this.page < this.pages.length - 1) {
            this.nextZone.setVisible(true).setInteractive({ useHandCursor: true });
          }
        }
      }
    });
  }

  advance() {
    if (this.timer && this.timer.getProgress() < 1) {
      this.timer.remove(false);
      this.text.setText(this.pages[this.page] || "");
      if (this.page < this.pages.length - 1) {
        this.nextHint.setText("Siguiente");
        this.nextZone.setVisible(true).setInteractive({ useHandCursor: true });
      } else {
        this.nextHint.setText("");
        this.nextZone.setVisible(false).disableInteractive();
      }
      return;
    }
    if (this.page >= this.pages.length - 1) return;
    this.page += 1;
    this.renderPage();
  }

  setVisible(value) {
    this.group.setVisible(value);
  }

  destroy() {
    if (this.timer) this.timer.remove(false);
    this.group.destroy();
  }
}
