export const bossActions = [
  { id: "attack", label: "Atacar" },
  { id: "talk", label: "Hablar" },
  { id: "defend", label: "Defender" },
  { id: "ask_tomas", label: "Consultar a Tomas" },
  { id: "use_relics", label: "Usar Reliquias" },
  { id: "eat_fruit", label: "Consumir Duru Duru no Mi" },
  { id: "activate_sweet_gear", label: "Activar Sweet Gear" },
  { id: "duo_attack", label: "Modo Dos Jugadores" }
];

export default class BossBattleSystem {
  constructor() {
    this.state = {
      phase: "intro",
      bossHp: 100,
      focus: 100,
      fruitCreated: false,
      sweetGear: false,
      duoUnlocked: false,
      defeated: false
    };
  }

  available(action) {
    const phase = this.state.phase;
    if (this.state.defeated) return action === "continue";
    if (["attack", "talk", "defend"].includes(action)) return ["intro", "failed"].includes(phase);
    if (action === "ask_tomas") return phase === "failed";
    if (action === "use_relics") return phase === "hinted";
    if (action === "eat_fruit") return phase === "fruit";
    if (action === "activate_sweet_gear") return phase === "gear";
    if (action === "duo_attack") return this.state.duoUnlocked && phase === "duo";
    return false;
  }

  getActions() {
    if (this.state.defeated) return [{ id: "continue", label: "Ir al epilogo", disabled: false }];
    return bossActions.map((action) => ({ ...action, disabled: !this.available(action.id) }));
  }

  act(action) {
    const s = this.state;
    if (!this.available(action)) return { kind: "locked", text: "Todavia no es el momento." };
    if (action === "attack") {
      s.phase = "failed";
      s.focus -= 8;
      return { kind: "shake", speaker: "Don Repetin", portrait: "portraits.donRepetinMock", text: "Otra vez lo mismo. La rutina absorbe ese golpe." };
    }
    if (action === "talk") {
      s.phase = "failed";
      return { kind: "glitch", speaker: "Don Repetin", portrait: "portraits.donRepetinMock", text: "Despues. Mas tarde. Cuando haya tiempo. Asi gano siempre." };
    }
    if (action === "defend") {
      s.phase = "failed";
      s.focus = Math.min(100, s.focus + 12);
      return { kind: "guard", speaker: "Agustin", portrait: "portraits.agustinSupport", text: "Yo cubro este turno. Pero esto no se gana repitiendo golpes." };
    }
    if (action === "ask_tomas") {
      s.phase = "hinted";
      return { kind: "hint", speaker: "Tomas", portrait: "portraits.tomasClue", text: "Miau. Traduccion: no se lo vence a golpes. Usen lo que juntaron." };
    }
    if (action === "use_relics") {
      s.phase = "fruit";
      s.fruitCreated = true;
      return { kind: "fusion", speaker: "Narrador", portrait: "relics.amor", text: "Las siete reliquias giran juntas. Algo imposible aparece en el centro del campo." };
    }
    if (action === "eat_fruit") {
      s.phase = "gear";
      return { kind: "fruit", speaker: "Agustina", portrait: "portraits.agustinaDetermined", text: "Ok. Esto sabe a aventura y a azucar peligrosa." };
    }
    if (action === "activate_sweet_gear") {
      s.phase = "duo";
      s.sweetGear = true;
      s.duoUnlocked = true;
      return { kind: "gear", speaker: "Narrador", portrait: "special.sweetGear", text: "Sweet Gear activado. El final pide dos jugadores." };
    }
    if (action === "duo_attack") {
      s.phase = "victory";
      s.bossHp = 0;
      s.defeated = true;
      return { kind: "victory", speaker: "Agustina + Agustin", portrait: "portraits.agustinaHappy", text: "Modo Dos Jugadores. Critical Hit. 999999." };
    }
    return { kind: "idle", text: "" };
  }
}
