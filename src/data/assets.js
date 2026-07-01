export const ASSET_BASE = "/assets_ready/";

export const assets = {
  logos: {
    projectUs: "logos/project-us-logo.png",
    sweetGear: "logos/sweet-gear-logo.png"
  },
  backgrounds: {
    menu: "backgrounds/menu.png",
    map: "backgrounds/map.png",
    battle: "backgrounds/battle.png",
    campamento: "backgrounds/campamento.png",
    baseHubFinal: "backgrounds/base-hub-final.png",
    mission1: "backgrounds/mission-1-pacto.png",
    mission2: "backgrounds/mission-2-oreo.png",
    mission3: "backgrounds/mission-3-pirana.png",
    mission4: "backgrounds/mission-4-mafia.png",
    mission5: "backgrounds/mission-5-sushi.png",
    mission6: "backgrounds/mission-6-razon.png",
    mission7: "backgrounds/mission-7-mundo.png"
  },
  characters: {
    agustina: "characters/agustina.png",
    agustin: "characters/agustin.png",
    tomas: "characters/tomas.png",
    agustinaBattle: "characters/agustina-battle.png",
    agustinBattle: "characters/agustin-battle.png",
    tomasAlert: "characters/tomas-alert.png",
    agustinaSweetGearPose: "characters/agustina-sweet-gear-pose.png",
    duoAttackPose: "characters/duo-attack-pose.png"
  },
  portraits: {
    agustinaDetermined: "portraits/agustina-determined.png",
    agustinaHappy: "portraits/agustina-happy.png",
    agustinSupport: "portraits/agustin-support.png",
    tomasClue: "portraits/tomas-clue.png",
    donRepetinMock: "portraits/don-repetin-mock.png",
    donRepetinAngry: "portraits/don-repetin-angry.png"
  },
  boss: {
    donRepetin: "boss/don-repetin.png",
    donRepetinShadow: "boss/don-repetin-shadow.png",
    donRepetinAngry: "boss/don-repetin-angry.png",
    donRepetinDefeated: "boss/don-repetin-defeated.png"
  },
  relics: {
    aroma: "relics/aroma.png",
    sabor: "relics/sabor.png",
    alegria: "relics/alegria.png",
    hogar: "relics/hogar.png",
    recuerdos: "relics/recuerdos.png",
    complicidad: "relics/complicidad.png",
    amor: "relics/amor.png"
  },
  special: {
    duruDuru: "special/duru-duru-no-mi.png",
    sweetGear: "special/sweet-gear.png"
  },
  effects: {
    duoAttackSlash: "effects/duo-attack-slash.png",
    bossSmoke: "effects/boss-smoke.png",
    sweetGearAura: "effects/sweet-gear-aura.png",
    screenGlitch: "effects/screen-glitch.png",
    relicFusionCircle: "effects/relic-fusion-circle.png",
    impactBurst: "effects/impact-burst.png"
  },
  ui: {
    dialogBox: "ui/dialog-box.png",
    baseFrame: "ui/base-frame.png",
    missionPanel: "ui/mission-panel.png",
    navBar: "ui/nav-bar.png",
    titleBadge: "ui/title-badge.png"
  }
};

export function flattenAssets(group = assets, prefix = "") {
  return Object.entries(group).flatMap(([key, value]) => {
    const assetKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      return [{ key: assetKey, url: `${ASSET_BASE}${value}` }];
    }
    return flattenAssets(value, assetKey);
  });
}
