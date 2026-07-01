import Phaser from "phaser";
import { missions } from "../data/missions.js";
import { progress } from "../state/progress.js";

export const W = 430;
export const H = 932;

export function layout(scene) {
  const width = scene.scale.width;
  const height = scene.scale.height;
  const safeX = 22;
  const safeTop = 34;
  const safeBottom = 30;
  return {
    W: width,
    H: height,
    safeX,
    safeTop,
    safeBottom,
    contentW: width - safeX * 2,
    headerY: safeTop,
    headerH: height * 0.12,
    stageY: height * 0.12,
    stageH: height * 0.48,
    uiY: height * 0.6,
    uiH: height * 0.4
  };
}

export function fitImageToBox(image, maxW, maxH) {
  const scale = Math.min(maxW / image.width, maxH / image.height);
  image.setScale(scale);
  return scale;
}

export function clampToSafeArea(container, scene) {
  const l = layout(scene);
  container.x = Phaser.Math.Clamp(container.x, l.safeX, l.W - l.safeX);
  container.y = Phaser.Math.Clamp(container.y, l.safeTop, l.H - l.safeBottom);
  return container;
}

export function addCoverBackground(scene, key, alpha = 1) {
  const l = layout(scene);
  const image = scene.add.image(l.W / 2, l.H / 2, key);
  const scale = Math.max(l.W / image.width, l.H / image.height);
  image.setScale(scale).setAlpha(alpha).setScrollFactor(0);
  return image;
}

export const addCover = addCoverBackground;

export function addVeil(scene, alpha = 0.32) {
  const l = layout(scene);
  return scene.add.rectangle(l.W / 2, l.H / 2, l.W, l.H, 0x09030f, alpha);
}

export function addRpgPanel(scene, x, y, w, h, options = {}) {
  const fill = options.fill ?? 0x1f0b2b;
  const alpha = options.alpha ?? 0.84;
  const stroke = options.stroke ?? 0xffd166;
  const depth = options.depth ?? 20;
  const group = scene.add.container(x, y).setDepth(depth);
  const shadow = scene.add.rectangle(0, 6, w, h, 0x000000, 0.22);
  const panel = scene.add.rectangle(0, 0, w, h, fill, alpha)
    .setStrokeStyle(options.strokeWidth ?? 3, stroke);
  const top = scene.add.rectangle(0, -h / 2 + Math.min(16, h * 0.18), w - 12, Math.min(16, h * 0.18), 0xfff0ff, 0.08);
  group.add([shadow, panel, top]);
  group.panel = panel;
  return group;
}

export function addWrappedText(scene, text, x, y, maxWidth, style = {}) {
  const textStyle = {
    fontFamily: "Trebuchet MS, Verdana",
    fontSize: style.fontSize ?? "16px",
    color: style.color ?? "#fff2ff",
    fontStyle: style.fontStyle ?? "normal",
    align: style.align ?? "left",
    lineSpacing: style.lineSpacing ?? 4,
    wordWrap: { width: maxWidth, useAdvancedWrap: true }
  };
  if (style.stroke || style.strokeThickness) {
    textStyle.stroke = style.stroke ?? "#12071f";
    textStyle.strokeThickness = style.strokeThickness ?? 3;
  }
  return scene.add.text(x, y, text, textStyle).setDepth(style.depth ?? 30);
}

export function addTitle(scene, text, x, y, size = 28) {
  const l = layout(scene);
  return addWrappedText(scene, text, x ?? l.W / 2, y ?? 72, l.contentW, {
    fontSize: `${size}px`,
    color: "#fff2ff",
    fontStyle: "bold",
    align: "center",
    stroke: "#651a72",
    strokeThickness: 5,
    depth: 35
  }).setOrigin(0.5);
}

export function addRpgButton(scene, x, y, w, h, label, callback, options = {}) {
  const container = scene.add.container(x, y).setDepth(options.depth ?? 50);
  const bg = scene.add.rectangle(0, 0, w, h, options.fill ?? 0xd94fa7, options.alpha ?? 1)
    .setStrokeStyle(options.strokeWidth ?? 3, options.stroke ?? 0xffd166)
    .setInteractive({ useHandCursor: !options.disabled });
  const shadow = scene.add.rectangle(0, Math.max(4, h * 0.12), w, h, 0x5a1f62, 0.48);
  const shine = scene.add.rectangle(0, -h * 0.28, w - 10, Math.max(6, h * 0.18), 0xfff0ff, 0.18);
  const text = scene.add.text(0, 0, label, {
    fontFamily: "Trebuchet MS, Verdana",
    fontSize: options.fontSize ?? (label.length > 22 ? "13px" : "15px"),
    color: options.color ?? "#fff2ff",
    fontStyle: "900",
    align: "center",
    stroke: options.textStroke ?? "#651a72",
    strokeThickness: options.textStrokeThickness ?? 3,
    wordWrap: { width: w - 16, useAdvancedWrap: true }
  }).setOrigin(0.5);

  container.add([shadow, bg, shine, text]);
  if (options.disabled) {
    container.setAlpha(0.45);
  } else {
    bg.on("pointerover", () => scene.tweens.add({ targets: container, scale: 1.035, duration: 100 }));
    bg.on("pointerout", () => scene.tweens.add({ targets: container, scale: 1, duration: 100 }));
    bg.on("pointerdown", callback);
  }
  return clampToSafeArea(container, scene);
}

export function addButton(scene, x, y, label, onClick, width = 220, height = 46) {
  return addRpgButton(scene, x, y, width, height, label, onClick);
}

export function addGhostButton(scene, x, y, label, onClick, width = 124) {
  return addRpgButton(scene, x, y, width, 38, label, onClick, {
    fill: 0x341044,
    stroke: 0xffd166,
    color: "#fff2ff",
    alpha: 0.88
  });
}

export function addGroundedActor(scene, key, x, groundY, maxHeight, options = {}) {
  const depth = options.depth ?? 20;
  const shadowW = options.shadowW ?? Math.max(54, maxHeight * 0.54);
  const shadow = scene.add.ellipse(x, groundY, shadowW, Math.max(16, shadowW * 0.22), 0x000000, options.shadowAlpha ?? 0.42).setDepth(depth - 1);
  const sprite = scene.add.image(x, groundY, key).setOrigin(0.5, 1).setDepth(depth);
  fitImageToBox(sprite, options.maxW ?? maxHeight, maxHeight);
  if (options.flipX) sprite.setFlipX(true);
  if (options.name) {
    addWrappedText(scene, options.name, x, groundY + 12, 100, {
      fontSize: "11px",
      align: "center",
      color: "#ffffff",
      stroke: "#1a0924",
      strokeThickness: 3,
      depth: depth + 1
    }).setOrigin(0.5, 0);
  }
  if (options.idle !== false) {
    scene.tweens.add({
      targets: sprite,
      y: groundY - 4,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }
  return { sprite, shadow };
}

export function addCharacter(scene, key, x, y, scale = 0.34, name = "", depth = 10) {
  const image = scene.textures.get(key).getSourceImage();
  const maxHeight = image ? image.height * scale : 180;
  return addGroundedActor(scene, key, x, y, maxHeight, { name, depth });
}

export function addNav(scene, active = "") {
  const l = layout(scene);
  const items = [
    ["Base", "BaseScene"],
    ["Mapa", "MapScene"],
    ["Bolsa", "InventoryScene"],
    ["Logros", "AchievementsScene"]
  ];
  const y = l.H - l.safeBottom - 42;
  const barW = Math.min(l.contentW + 34, l.W - 8);
  const barH = 86;

  if (scene.textures.exists("ui.navBar")) {
    const nav = scene.add.image(l.W / 2, y, "ui.navBar").setDepth(45);
    nav.setDisplaySize(barW, barH);
    const buttonW = barW / 4;
    const startX = l.W / 2 - barW / 2;
    items.forEach(([label, target], index) => {
      const x = startX + buttonW * (index + 0.5);
      const activeItem = active === target;
      if (activeItem) {
        scene.add.rectangle(x, y + 3, buttonW * 0.82, 54, 0xff7fc8, 0.16)
          .setStrokeStyle(2, 0xffd166, 0.60)
          .setDepth(46);
      }
      const zone = scene.add.zone(x, y, buttonW, barH).setInteractive({ useHandCursor: true }).setDepth(60);
      zone.on("pointerdown", () => scene.scene.start(target));
      addWrappedText(scene, label, x, y + 25, buttonW - 10, {
        fontSize: "11px",
        color: activeItem ? "#ffffff" : "#fff2ff",
        align: "center",
        fontStyle: "bold",
        stroke: "#351343",
        strokeThickness: 3,
        depth: 61
      }).setOrigin(0.5);
    });
    return nav;
  }

  addRpgPanel(scene, l.W / 2, y, l.contentW, 58, { alpha: 0.82, stroke: 0xffd166, depth: 45 });
  const gap = 8;
  const buttonW = (l.contentW - gap * 3) / 4;
  items.forEach(([label, target], index) => {
    const x = l.safeX + buttonW / 2 + index * (buttonW + gap);
    addRpgButton(scene, x, y, buttonW, 36, label, () => scene.scene.start(target), {
      fill: active === target ? 0xff7fc8 : 0x4a1a62,
      stroke: 0xffd166,
      color: "#fff2ff",
      fontSize: "12px",
      depth: 55
    });
  });
}

export function addHud(scene, y) {
  const l = layout(scene);
  const hudY = y ?? l.safeTop + 82;
  addRpgPanel(scene, l.W / 2, hudY, l.contentW, 36, { alpha: 0.74, depth: 30 });
  addWrappedText(scene, `Reliquias ${progress.relicCount}/7`, l.W / 2, hudY, l.contentW - 24, {
    fontSize: "15px",
    color: "#ffd166",
    fontStyle: "bold",
    align: "center",
    depth: 31
  }).setOrigin(0.5);
}

export function addRelicStrip(scene, x, y, spacing = 50, maxSize = 44) {
  missions.forEach((mission, index) => {
    const unlocked = progress.hasRelic(mission.id);
    const img = scene.add.image(x + index * spacing, y, mission.relicKey).setDepth(25);
    fitImageToBox(img, maxSize, maxSize);
    img.setAlpha(unlocked ? 1 : 0.28);
    if (!unlocked) img.setTint(0x222033);
  });
}

export function flashMessage(scene, text, y) {
  const l = layout(scene);
  const msgY = y ?? l.safeTop + 120;
  const box = addRpgPanel(scene, l.W / 2, msgY, l.contentW, 58, { alpha: 0.9, stroke: 0xff69c8, depth: 90 });
  const label = addWrappedText(scene, text, l.W / 2, msgY, l.contentW - 28, {
    fontSize: "14px",
    color: "#fff2ff",
    align: "center",
    depth: 91
  }).setOrigin(0.5);
  scene.tweens.add({
    targets: [box, label],
    alpha: 0,
    delay: 2100,
    duration: 500,
    onComplete: () => {
      box.destroy();
      label.destroy();
    }
  });
}


export function createDomOverlay(scene, x, y, html, className = "rpg-overlay") {
  const wrapper = document.createElement("div");
  wrapper.className = className;
  wrapper.innerHTML = html;
  const dom = scene.add.dom(x, y, wrapper).setDepth(95);
  scene.events.once("shutdown", () => dom.destroy());
  return { dom, wrapper };
}
