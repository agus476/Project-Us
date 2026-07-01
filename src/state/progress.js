import { isAvailable, missions } from "../data/missions.js";

const STORAGE_KEY = "project-us-sweet-week-progress-phaser-v1";

const fallback = {
  player: "",
  loginComplete: false,
  unlockedMissions: [],
  relics: [],
  relicFoundAt: {},
  achievements: [],
  bossDefeated: false,
  epilogueSeen: false
};

let state = load();

function findMission(missionId) {
  return missions.find((mission) => mission.id === missionId);
}

function isVisibleMission(missionId) {
  const mission = findMission(missionId);
  return !mission || isAvailable(mission);
}

function visibleRelics() {
  return state.relics.filter((missionId) => isVisibleMission(missionId));
}

function load() {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...fallback };
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const progress = {
  get data() {
    return state;
  },
  get relics() {
    return visibleRelics();
  },
  get relicCount() {
    return visibleRelics().length;
  },
  save,
  setLogin(player = "Agustina") {
    state.player = player;
    state.loginComplete = true;
    save();
  },
  isCleared(missionId) {
    return state.unlockedMissions.includes(missionId) && isVisibleMission(missionId);
  },
  hasRelic(missionId) {
    return state.relics.includes(missionId) && isVisibleMission(missionId);
  },
  unlockMission(mission) {
    if (!state.unlockedMissions.includes(mission.id)) state.unlockedMissions.push(mission.id);
    if (!state.relics.includes(mission.id)) state.relics.push(mission.id);
    state.relicFoundAt = state.relicFoundAt || {};
    if (!state.relicFoundAt[mission.id]) state.relicFoundAt[mission.id] = new Date().toISOString();
    if (!state.achievements.includes(mission.achievement)) state.achievements.push(mission.achievement);
    save();
  },
  hasAchievement(id) {
    const mission = missions.find((item) => item.achievement === id);
    if (mission && !isAvailable(mission)) return false;
    return state.achievements.includes(id);
  },
  completeBoss() {
    state.bossDefeated = true;
    if (!state.achievements.includes("boss")) state.achievements.push("boss");
    save();
  },
  markEpilogueSeen() {
    state.epilogueSeen = true;
    save();
  }
};
