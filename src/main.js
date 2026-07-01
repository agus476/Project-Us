import Phaser from "phaser";
import "./style.css";
import "./mobile-browser-fixes.css";
import BootScene from "./scenes/BootScene.js";
import SplashScene from "./scenes/SplashScene.js";
import LoginScene from "./scenes/LoginScene.js";
import PrologueScene from "./scenes/PrologueScene.js";
import BaseScene from "./scenes/BaseScene.js";
import MapScene from "./scenes/MapScene.js";
import MissionScene from "./scenes/MissionScene.js";
import InventoryScene from "./scenes/InventoryScene.js";
import AchievementsScene from "./scenes/AchievementsScene.js";
import BossScene from "./scenes/BossScene.js";
import EpilogueScene from "./scenes/EpilogueScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#12071f",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 430,
    height: 932
  },
  dom: {
    createContainer: true
  },
  pixelArt: true,
  roundPixels: true,
  scene: [
    BootScene,
    SplashScene,
    LoginScene,
    PrologueScene,
    BaseScene,
    MapScene,
    MissionScene,
    InventoryScene,
    AchievementsScene,
    BossScene,
    EpilogueScene
  ]
};

new Phaser.Game(config);
