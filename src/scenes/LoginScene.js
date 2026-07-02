import Phaser from "phaser";
import { normalizeCode, setRuntimeDevMode } from "../data/missions.js";
import { addCoverBackground, addVeil, addWrappedText, fitImageToBox, layout, createDomOverlay } from "./SceneHelpers.js";
import { progress } from "../state/progress.js";

const FULL_NAME = "AGUSTINA AYELÉN BLASCO VILLARRUEL";

const LOGIN_PROFILES = [
  {
    subtitle: "Decime quién quiere cruzar el portal.",
    waiting: "> Esperando identidad compatible...",
    lines: [
      "Analizando identidad...",
      "No.",
      "Este archivo no es para cualquiera.",
      "La única jugadora compatible es..."
    ]
  },
  {
    subtitle: "Ingresá tu nombre. El mapa huele algo conocido.",
    waiting: "> Fragmento del Aroma detectado. Esperando identidad...",
    lines: [
      "Escaneando señal física...",
      "Fragmento del Aroma reconocido.",
      "Ahora sí: el sistema ya sabe quién sos.",
      "Identidad compatible confirmada manualmente por Tomás:"
    ]
  },
  {
    subtitle: "Ingresá tu nombre. Hay antojo registrado en el sistema.",
    waiting: "> Fragmento del Sabor en inventario. Nivel de antojo: alto.",
    lines: [
      "Escaneando inventario dulce...",
      "Fragmento del Sabor reconocido.",
      "Advertencia: el mapa detecta Milka Oreo en zona emocional.",
      "Acceso habilitado para:"
    ]
  },
  {
    subtitle: "Ingresá tu nombre. La rutina acaba de perder estabilidad.",
    waiting: "> Alegría recuperada. Don Repetín no está contento.",
    lines: [
      "Analizando mordida afectiva...",
      "Fragmento de la Alegría reconocido.",
      "La Piraña del Amazonas dejó huella en el sistema.",
      "Heroína autorizada:"
    ]
  },
  {
    subtitle: "Ingresá tu nombre. La base ya empieza a sentirse como casa.",
    waiting: "> Fragmento del Hogar detectado. Mafia gatuna en silencio.",
    lines: [
      "Revisando evidencia doméstica...",
      "Fragmento del Hogar reconocido.",
      "Vitto y Berta niegan todo. Tomás pide no hacer preguntas.",
      "Acceso seguro para:"
    ]
  },
  {
    subtitle: "Ingresá tu nombre. Hay recuerdos sincronizados.",
    waiting: "> Fragmento de los Recuerdos activo. Sueño acumulado detectado.",
    lines: [
      "Abriendo archivo nocturno...",
      "Fragmento de los Recuerdos reconocido.",
      "El sistema confirma: algunas charlas no cierran sesión a horario.",
      "Mapa reservado para:"
    ]
  },
  {
    subtitle: "Ingresá tu nombre. El 85/15 fue cargado como ley.",
    waiting: "> Fragmento de la Complicidad activo. Cálculo sentimental estable.",
    lines: [
      "Calculando porcentaje de razón...",
      "Resultado: Agustina 85%. Agustín conserva 15% operativo.",
      "El sistema recomienda no discutir esta métrica.",
      "Acceso confirmado para:"
    ]
  },
  {
    subtitle: "Ingresá tu nombre. Las siete señales responden.",
    waiting: "> 7/7 reliquias activas. El castillo ya no puede esconderse.",
    lines: [
      "Sincronizando las siete reliquias...",
      "El mapa reconoce a la heroína completa.",
      "Don Repetín está oficialmente preocupado.",
      "Último acceso confirmado para:"
    ]
  }
];

function getLoginProfile() {
  const count = Phaser.Math.Clamp(progress.relicCount, 0, LOGIN_PROFILES.length - 1);
  return LOGIN_PROFILES[count];
}

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super("LoginScene");
  }

  create() {
    const l = layout(this);
    this.loginProfile = getLoginProfile();
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
    const profile = this.loginProfile || getLoginProfile();
    const html = `
      <form class="rpg-login-card">
        <div class="rpg-kicker">Archivo clasificado del Gobierno Mundial</div>
        <div class="rpg-title">Portal de acceso</div>
        <div class="rpg-subtitle">${profile.subtitle}</div>
        <div class="rpg-terminal" data-terminal>${profile.waiting}</div>
        <div class="rpg-row" data-input-row>
          <input class="rpg-input" autocomplete="off" placeholder="TU NOMBRE" />
          <button class="rpg-btn">Abrir portal</button>
        </div>
        <div class="rpg-row rpg-continue-row" data-continue-row style="display:none;">
          <button class="rpg-btn" type="button" data-continue-button>Continuar</button>
        </div>
      </form>
    `;
    const { dom, wrapper } = createDomOverlay(this, l.W / 2, l.H * 0.535, html);
    this.loginDom = dom;
    this.terminalEl = wrapper.querySelector("[data-terminal]");
    this.inputRow = wrapper.querySelector("[data-input-row]");
    this.continueRow = wrapper.querySelector("[data-continue-row]");
    const input = wrapper.querySelector("input");
    const continueButton = wrapper.querySelector("[data-continue-button]");
    continueButton.addEventListener("click", () => this.scene.start("PrologueScene"));
    wrapper.addEventListener("submit", (event) => {
      event.preventDefault();
      const typedValue = normalizeCode(input.value);
      input.blur();
      this.inputRow.style.display = "none";
      if (typedValue === "DEV") {
        this.runDevConsole();
        return;
      }
      this.runConsole();
    });
  }

  runDevConsole() {
    setRuntimeDevMode(true);
    const lines = [
      "Comando oculto detectado...",
      "Modo dev activado.",
      "Todas las rutas por fecha quedan abiertas para prueba.",
      "Progreso real: intacto. Spoilers finales: bloqueados por criterio del mapa."
    ];
    let fullText = "";
    let lineIndex = 0;
    const writeLine = () => {
      if (lineIndex >= lines.length) {
        this.terminalEl.textContent = fullText;
        progress.setLogin("Agustina");
        this.continueRow.style.display = "flex";
        return;
      }
      const line = `> ${lines[lineIndex]}\n`;
      this.typeLine(line, fullText, (nextText) => {
        fullText = nextText;
        lineIndex += 1;
        this.time.delayedCall(160, writeLine);
      }, 18);
    };
    writeLine();
  }

  runConsole() {
    const profile = this.loginProfile || getLoginProfile();
    let fullText = "";
    let lineIndex = 0;
    const writeLine = () => {
      if (lineIndex >= profile.lines.length) {
        this.typeFinalName(fullText);
        return;
      }
      const line = `> ${profile.lines[lineIndex]}\n`;
      this.typeLine(line, fullText, (nextText) => {
        fullText = nextText;
        lineIndex += 1;
        this.time.delayedCall(220, writeLine);
      });
    };
    writeLine();
  }

  typeFinalName(prefix) {
    const line = `> ${FULL_NAME}\n`;
    this.typeLine(line, prefix, (finalText) => {
      this.terminalEl.textContent = finalText;
      progress.setLogin("Agustina");
      this.continueRow.style.display = "flex";
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
