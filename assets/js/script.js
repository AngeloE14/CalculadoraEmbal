const ML_PER_OZ = 29.5735;
const ML_PER_GALLON = 3785.41;
const THEME_STORAGE_KEY = "formulador-theme";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";
const DEFAULT_CHEMICAL_LABEL = "Selecciona un químico🧪";
const MIN_SAFE_TARGET = 1.5;
const MAX_SAFE_TARGET = 4.0;
const RECOMMENDED_STANDARD_LOW = 2.0;
const RECOMMENDED_STANDARD_HIGH = 3.0;
const LB_PER_KG = 2.20462;
const GALLONS_PER_KG = LB_PER_KG / 50;

const PRESERVATION_PROFILES = {
  suave: {
    label: "Suave",
    baseTarget: 1.85,
    volumeFactor: 0.96,
    pressure: "20-28 psi",
    flow: "8-10 fl oz/min",
    technique: "Inyeccion cervical simple con drenaje intermitente.",
  },
  normal: {
    label: "Profesional estandar",
    baseTarget: 2.25,
    volumeFactor: 1,
    pressure: "25-35 psi",
    flow: "8-12 fl oz/min",
    technique: "Cervical estandar con drenaje intermitente.",
  },
  firme: {
    label: "Firme",
    baseTarget: 2.8,
    volumeFactor: 1.05,
    pressure: "30-40 psi",
    flow: "8-12 fl oz/min",
    technique: "Cervical con control mas cerrado del drenaje.",
  },
  alta: {
    label: "Alta preservacion",
    baseTarget: 3.25,
    volumeFactor: 1.1,
    pressure: "40-55 psi",
    flow: "8-10 fl oz/min",
    technique: "Trabajo por etapas con reevaluacion frecuente.",
  },
};

const COMPLEXION_PROFILES = {
  delgada: {
    label: "Delgada",
    volumeFactor: 0.95,
    concentrationDelta: 0,
  },
  media: {
    label: "Media",
    volumeFactor: 1,
    concentrationDelta: 0,
  },
  robusta: {
    label: "Robusta",
    volumeFactor: 1.08,
    concentrationDelta: 0.1,
  },
  atletica: {
    label: "Atletica",
    volumeFactor: 1.04,
    concentrationDelta: 0.12,
  },
};

const DECOMPOSITION_PROFILES = {
  ninguna: {
    label: "Sin cambios notorios",
    volumeFactor: 1,
    concentrationDelta: 0,
    pressure: "",
    flow: "",
    technique: "",
  },
  temprana: {
    label: "Temprana",
    volumeFactor: 1.05,
    concentrationDelta: 0.35,
    pressure: "35-45 psi",
    flow: "8-10 fl oz/min",
    technique: "Refuerza la distribucion y vigila cada etapa de inyeccion.",
  },
  moderada: {
    label: "Moderada",
    volumeFactor: 1.1,
    concentrationDelta: 0.65,
    pressure: "40-55 psi",
    flow: "7-9 fl oz/min",
    technique: "Considera cervical restringida o tratamiento por secciones.",
  },
  avanzada: {
    label: "Avanzada",
    volumeFactor: 1.15,
    concentrationDelta: 1,
    pressure: "45-60 psi",
    flow: "6-8 fl oz/min",
    technique: "Apoya con tecnica por etapas y reevaluacion por galon.",
  },
};

const dom = {
  concentradoInput: document.getElementById("concentrado"),
  comboConcentrado: document.getElementById("comboConcentrado"),
  objetivoInput: document.getElementById("objetivo"),
  pesoInput: document.getElementById("peso"),
  volumenPrepararInput: document.getElementById("volumenPreparar"),
  preservationSelect: document.getElementById("preservacion"),
  decompositionSelect: document.getElementById("descomposicion"),
  checkboxes: {
    obesidad: document.getElementById("obesidad"),
    desnutricion: document.getElementById("desnutricion"),
    edema: document.getElementById("edema"),
    deshidratacion: document.getElementById("deshidratacion"),
    ictericia: document.getElementById("ictericia"),
    autopsia: document.getElementById("autopsia"),
    trauma: document.getElementById("trauma"),
    refrigeracion: document.getElementById("refrigeracion"),
  },
  quimicoMl: document.getElementById("quimicoMl"),
  quimicoOz: document.getElementById("quimicoOz"),
  aguaMl: document.getElementById("aguaMl"),
  verificacion: document.getElementById("verificacion"),
  volumenFinal: document.getElementById("volumenFinal"),
  perfilResumen: document.getElementById("perfilResumen"),
  presionSugerida: document.getElementById("presionSugerida"),
  flujoSugerido: document.getElementById("flujoSugerido"),
  tecnicaSugerida: document.getElementById("tecnicaSugerida"),
  formulaVolume: document.getElementById("formulaVolume"),
  formulaConcentration: document.getElementById("formulaConcentration"),
  formulaFinal: document.getElementById("formulaFinal"),
  alertasLista: document.getElementById("alertasLista"),
  error: document.getElementById("error"),
  resultsBox: document.querySelector(".box-results"),
  mixChemicalPct: document.getElementById("mixChemicalPct"),
  mixWaterPct: document.getElementById("mixWaterPct"),
  mixChemicalBar: document.getElementById("mixChemicalBar"),
  mixWaterBar: document.getElementById("mixWaterBar"),
  mixExplain: document.getElementById("mixExplain"),
  shareResultButton: document.getElementById("shareResultButton"),
  shareFeedback: document.getElementById("shareFeedback"),
  shareFeedbackText: document.getElementById("shareFeedbackText"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleText: document.querySelector("#themeToggle .theme-toggle__text"),
  themeToggleIcon: document.querySelector("#themeToggle .theme-toggle__icon"),
  presetButtons: Array.from(document.querySelectorAll(".chip")),
};

const selectSelected = dom.comboConcentrado.querySelector(".select-selected");
const selectItems = dom.comboConcentrado.querySelector(".select-items");
const systemDarkPreference = window.matchMedia(SYSTEM_DARK_QUERY);
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointerPreference = window.matchMedia("(pointer: coarse)");
const INPUT_DEBOUNCE_MS = coarsePointerPreference.matches ? 90 : 50;
const SHOULD_ANIMATE_RESULTS = !reducedMotionPreference.matches && !coarsePointerPreference.matches;

let selectedConcentradoValue = "";
let currentTheme = getInitialTheme();
let resultAnimationTimerId = null;
let resultAnimationFrameId = 0;
let scheduledCalculationFrame = 0;
let scheduledCalculationTimerId = 0;
let lastResultSignature = "";
let lastCaseSignature = "";
let lastStatusSignature = "";
let isResultsCleared = false;
let currentRecommendation = null;
const numberFormatterCache = new Map();

function getNumberFormatter(decimals) {
  if (!numberFormatterCache.has(decimals)) {
    numberFormatterCache.set(
      decimals,
      new Intl.NumberFormat("es-MX", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    );
  }

  return numberFormatterCache.get(decimals);
}

function setNodeText(node, value) {
  if (!node) {
    return;
  }

  if (node.textContent !== value) {
    node.textContent = value;
  }
}

function setNodeScaleX(node, value) {
  if (!node) {
    return;
  }

  const normalizedValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
  const nextTransform = `scaleX(${normalizedValue.toFixed(4)})`;

  if (node.style.transform !== nextTransform) {
    node.style.transform = nextTransform;
  }
}

function formatNumber(value, decimals = 2) {
  return getNumberFormatter(decimals).format(value);
}

function formatMlAndOz(valueMl, mlDecimals = 0, ozDecimals = 1) {
  return `${formatNumber(valueMl, mlDecimals)} ml / ${formatNumber(valueMl / ML_PER_OZ, ozDecimals)} fl oz`;
}

function formatGallons(valueGallons) {
  return `${formatNumber(valueGallons, 2)} gal`;
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function formatVolumeMlAndLiters(valueMl) {
  const valueMlRounded = roundToOneDecimal(valueMl);
  const valueLitersRounded = roundToOneDecimal(valueMl / 1000);
  return `${formatNumber(valueMlRounded, 1)} ml (${formatNumber(valueLitersRounded, 1)} L)`;
}

function getNumberFromInput(input) {
  if (!input) {
    return null;
  }

  const rawValue = input.value.trim();
  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue.replace(",", ".");
  return Number(normalizedValue);
}

function setError(message = "") {
  if (!message) {
    if (dom.error.style.display !== "none") {
      dom.error.style.display = "none";
    }
    setNodeText(dom.error, "");
    return;
  }
  setNodeText(dom.error, message);
  if (dom.error.style.display !== "block") {
    dom.error.style.display = "block";
  }
}

function setStatusMessages(messages) {
  if (!dom.alertasLista) {
    return;
  }

  const signature = messages.join("|");
  if (signature === lastStatusSignature) {
    return;
  }

  lastStatusSignature = signature;
  dom.alertasLista.innerHTML = "";
  messages.forEach((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    dom.alertasLista.appendChild(item);
  });
}

function setShareFeedback(message = "") {
  if (!dom.shareFeedback || !dom.shareFeedbackText) {
    return;
  }

  if (!message) {
    dom.shareFeedback.style.display = "none";
    setNodeText(dom.shareFeedbackText, "");
    return;
  }

  setNodeText(dom.shareFeedbackText, message);
  dom.shareFeedback.style.display = "flex";
}

function clearResults() {
  if (isResultsCleared) {
    return;
  }

  currentRecommendation = null;

  setNodeText(dom.quimicoMl, "Completa el perfil para calcular");
  setNodeText(dom.quimicoOz, "—");
  setNodeText(dom.aguaMl, "—");
  setNodeText(dom.verificacion, "—");
  setNodeText(dom.volumenFinal, "—");
  if (dom.perfilResumen) {
    setNodeText(dom.perfilResumen, "—");
  }
  if (dom.presionSugerida) {
    setNodeText(dom.presionSugerida, "—");
  }
  if (dom.flujoSugerido) {
    setNodeText(dom.flujoSugerido, "—");
  }
  if (dom.tecnicaSugerida) {
    setNodeText(dom.tecnicaSugerida, "—");
  }
  setNodeText(dom.formulaVolume, "—");
  setNodeText(dom.formulaConcentration, "—");
  setNodeText(dom.formulaFinal, "—");
  setNodeText(dom.mixChemicalPct, "Arterial: —");
  setNodeText(dom.mixWaterPct, "Agua: —");
  setNodeScaleX(dom.mixChemicalBar, 0);
  setNodeScaleX(dom.mixWaterBar, 0);
  setNodeText(dom.mixExplain, "Completa los datos para ver la distribucion exacta de la solucion.");
  setStatusMessages([
    "Completa el concentrado y el volumen final para obtener una recomendacion profesional.",
  ]);
  setShareFeedback();
  lastResultSignature = "";
  isResultsCleared = true;
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch (storageError) {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (storageError) {
    return;
  }
}

function getInitialTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }
  return systemDarkPreference.matches ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.setAttribute("data-theme", theme);

  if (!dom.themeToggle) {
    return;
  }

  dom.themeToggle.setAttribute("aria-pressed", String(isDark));
  dom.themeToggle.setAttribute(
    "aria-label",
    isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
  );

  if (dom.themeToggleText) {
    setNodeText(dom.themeToggleText, isDark ? "Modo claro" : "Modo oscuro");
  }

  if (dom.themeToggleIcon) {
    setNodeText(dom.themeToggleIcon, isDark ? "☀️" : "🌙");
  }
}

function parseCssDuration(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return 0;
  }
  if (raw.endsWith("ms")) {
    return Number(raw.slice(0, -2));
  }
  if (raw.endsWith("s")) {
    return Number(raw.slice(0, -1)) * 1000;
  }
  return Number(raw);
}

function runThemeTransition(applyFn) {
  const root = document.documentElement;
  const durationMs = parseCssDuration(
    getComputedStyle(root).getPropertyValue("--theme-switch-duration")
  );

  root.classList.add("theme-switching");

  const finish = () => {
    window.setTimeout(() => {
      root.classList.remove("theme-switching");
    }, Math.max(0, durationMs));
  };

  if (typeof document.startViewTransition === "function" && !reducedMotionPreference.matches) {
    const transition = document.startViewTransition(() => {
      applyFn();
    });
    Promise.resolve(transition.finished).finally(finish);
    return;
  }

  applyFn();
  finish();
}

function resetForm() {
  dom.concentradoInput.value = "";
  dom.objetivoInput.value = "";
  dom.pesoInput.value = "";
  dom.volumenPrepararInput.value = "";
  if (dom.preservationSelect) {
    dom.preservationSelect.value = "normal";
  }
  if (dom.decompositionSelect) {
    dom.decompositionSelect.value = "ninguna";
  }
  Object.values(dom.checkboxes).forEach((checkbox) => {
    if (checkbox) {
      checkbox.checked = false;
    }
  });
  selectedConcentradoValue = "";
  setNodeText(selectSelected, DEFAULT_CHEMICAL_LABEL);
}

function updateResultsDisplay() {
  if (!dom.resultsBox) {
    return;
  }

  if (!SHOULD_ANIMATE_RESULTS) {
    dom.resultsBox.classList.remove("is-updating", "panel-resultados--actualizando");
    return;
  }

  dom.resultsBox.classList.remove("is-updating", "panel-resultados--actualizando");

  if (resultAnimationFrameId) {
    window.cancelAnimationFrame(resultAnimationFrameId);
  }

  resultAnimationFrameId = window.requestAnimationFrame(() => {
    resultAnimationFrameId = 0;
    dom.resultsBox.classList.add("is-updating", "panel-resultados--actualizando");
  });

  if (resultAnimationTimerId) {
    window.clearTimeout(resultAnimationTimerId);
  }

  resultAnimationTimerId = window.setTimeout(() => {
    dom.resultsBox.classList.remove("is-updating", "panel-resultados--actualizando");
  }, 520);
}

function updateMixProgress(arterialMl, waterMl, totalMl) {
  if (!totalMl || totalMl <= 0) {
    setNodeText(dom.mixChemicalPct, "Arterial: 0%");
    setNodeText(dom.mixWaterPct, "Agua: 0%");
    setNodeScaleX(dom.mixChemicalBar, 0);
    setNodeScaleX(dom.mixWaterBar, 0);
    setNodeText(dom.mixExplain, "Ingresa datos validos.");
    return;
  }

  const arterialPct = (arterialMl / totalMl) * 100;
  const waterPct = (waterMl / totalMl) * 100;

  setNodeText(dom.mixChemicalPct, `Arterial: ${formatNumber(arterialPct, 1)}%`);
  setNodeText(dom.mixWaterPct, `Agua: ${formatNumber(waterPct, 1)}%`);
  setNodeScaleX(dom.mixChemicalBar, arterialPct / 100);
  setNodeScaleX(dom.mixWaterBar, waterPct / 100);
  setNodeText(
    dom.mixExplain,
    `${formatNumber(arterialMl, 0)} ml de arterial y ${formatNumber(waterMl, 0)} ml de agua.`
  );
}

function syncPresetButtons() {
  const objetivo = getNumberFromInput(dom.objetivoInput);

  dom.presetButtons.forEach((button) => {
    const minValue = Number(button.dataset.min);
    const hasMax = typeof button.dataset.max === "string" && button.dataset.max.trim() !== "";
    const maxValue = hasMax ? Number(button.dataset.max) : null;

    const isInRange =
      objetivo !== null &&
      !Number.isNaN(objetivo) &&
      !Number.isNaN(minValue) &&
      objetivo >= minValue &&
      (maxValue === null || (!Number.isNaN(maxValue) && objetivo <= maxValue));

    button.classList.toggle("chip--active", Boolean(isInRange));
    button.setAttribute("aria-pressed", String(Boolean(isInRange)));
  });
}

function clearChemicalSelection() {
  selectedConcentradoValue = "";
  setNodeText(selectSelected, DEFAULT_CHEMICAL_LABEL);
  updateConcentradoLock();
}

function updateConcentradoLock() {
  const locked = selectedConcentradoValue !== "";
  dom.concentradoInput.readOnly = locked;
  if (locked) {
    dom.concentradoInput.value = selectedConcentradoValue;
  }
}

function readCaseData() {
  return {
    concentrado: getNumberFromInput(dom.concentradoInput),
    objetivoManual: getNumberFromInput(dom.objetivoInput),
    peso: getNumberFromInput(dom.pesoInput),
    volumenPrepararLitros: getNumberFromInput(dom.volumenPrepararInput),
    complexion: "media",
    preservacion: dom.preservationSelect?.value || "normal",
    descomposicion: dom.decompositionSelect?.value || "ninguna",
    condiciones: {
      obesidad: Boolean(dom.checkboxes.obesidad?.checked),
      desnutricion: Boolean(dom.checkboxes.desnutricion?.checked),
      edema: Boolean(dom.checkboxes.edema?.checked),
      deshidratacion: Boolean(dom.checkboxes.deshidratacion?.checked),
      ictericia: Boolean(dom.checkboxes.ictericia?.checked),
      autopsia: Boolean(dom.checkboxes.autopsia?.checked),
      trauma: Boolean(dom.checkboxes.trauma?.checked),
      refrigeracion: Boolean(dom.checkboxes.refrigeracion?.checked),
    },
  };
}

function buildCaseSignature(caseData) {
  const conditionsSignature = Object.values(caseData.condiciones)
    .map((value) => (value ? "1" : "0"))
    .join("");

  return [
    caseData.concentrado ?? "",
    caseData.objetivoManual ?? "",
    caseData.peso ?? "",
    caseData.volumenPrepararLitros ?? "",
    caseData.complexion,
    caseData.preservacion,
    caseData.descomposicion,
    conditionsSignature,
  ].join("|");
}

function pushAdjustment(adjustments, label, value) {
  adjustments.push({ label, value });
  return value;
}

function buildRecommendation(caseData) {
  const alerts = [];
  const profileTags = [];
  const concentrationAdjustments = [];

  const preservation = PRESERVATION_PROFILES[caseData.preservacion];
  const complexion = COMPLEXION_PROFILES[caseData.complexion];
  const decomposition = DECOMPOSITION_PROFILES[caseData.descomposicion];
  const baseObjective =
    caseData.objetivoManual !== null ? caseData.objetivoManual : preservation.baseTarget;

  let volumeFactor = preservation.volumeFactor * complexion.volumeFactor * decomposition.volumeFactor;
  let targetCandidate = baseObjective + complexion.concentrationDelta + decomposition.concentrationDelta;

  if (complexion.concentrationDelta) {
    pushAdjustment(concentrationAdjustments, complexion.label, complexion.concentrationDelta);
  }
  if (decomposition.concentrationDelta) {
    pushAdjustment(concentrationAdjustments, decomposition.label, decomposition.concentrationDelta);
  }

  if (caseData.condiciones.obesidad) {
    volumeFactor *= 1.08;
    targetCandidate += pushAdjustment(concentrationAdjustments, "obesidad", -0.15);
    profileTags.push("obesidad");
  }

  if (caseData.condiciones.desnutricion) {
    volumeFactor *= 0.97;
    targetCandidate += pushAdjustment(concentrationAdjustments, "demacrado", 0.2);
    profileTags.push("desnutricion");
  }

  if (caseData.condiciones.edema) {
    volumeFactor *= 1.12;
    targetCandidate += pushAdjustment(concentrationAdjustments, "edema", -0.2);
    profileTags.push("edema");
  }

  if (caseData.condiciones.deshidratacion) {
    targetCandidate += pushAdjustment(concentrationAdjustments, "deshidratacion", 0.35);
    profileTags.push("deshidratacion");
  }

  if (caseData.condiciones.autopsia) {
    volumeFactor *= 1.15;
    targetCandidate += pushAdjustment(concentrationAdjustments, "autopsia", 0.25);
    profileTags.push("autopsia");
  }

  if (caseData.condiciones.trauma) {
    volumeFactor *= 1.08;
    targetCandidate += pushAdjustment(concentrationAdjustments, "trauma", 0.25);
    profileTags.push("trauma");
  }

  if (caseData.condiciones.refrigeracion) {
    volumeFactor *= 1.05;
    targetCandidate += pushAdjustment(concentrationAdjustments, "refrigeracion", 0.2);
    profileTags.push("refrigeracion");
  }

  if (caseData.condiciones.ictericia) {
    profileTags.push("ictericia");
    if (caseData.concentrado !== null && caseData.concentrado <= 12) {
      alerts.push("Ictericia: usa arterial especial de bajo indice y controla la respuesta de color.");
    }
  }

  if (caseData.condiciones.obesidad && caseData.condiciones.desnutricion) {
    alerts.push("Obesidad y desnutricion a la vez generan criterios opuestos; revisa el perfil fisico antes de preparar.");
  }

  if (caseData.condiciones.edema && caseData.condiciones.deshidratacion) {
    alerts.push("Edema y deshidratacion simultaneos indican distribucion irregular; reevalua drenaje y respuesta vascular.");
  }

  const hasManualVolume = caseData.volumenPrepararLitros !== null;
  const volumeBaseGallons = hasManualVolume
    ? caseData.volumenPrepararLitros / 3.78541
    : caseData.peso * GALLONS_PER_KG;
  const finalVolumeGallons = hasManualVolume
    ? Math.max(0.1, Math.min(8, volumeBaseGallons))
    : Math.max(0.1, Math.min(8, volumeBaseGallons * volumeFactor));
  const totalSolutionMl = finalVolumeGallons * ML_PER_GALLON;

  let finalTarget = targetCandidate;

  if (caseData.condiciones.ictericia && finalTarget > 2.8) {
    finalTarget = 2.8;
    alerts.push("Ictericia: la fuerza final se modero para proteger color y evitar reaccion indeseable.");
  }

  if (finalTarget < MIN_SAFE_TARGET) {
    finalTarget = MIN_SAFE_TARGET;
    alerts.push("La mezcla calculada era demasiado debil; se elevo al minimo profesional seguro.");
  }

  if (finalTarget > MAX_SAFE_TARGET) {
    finalTarget = MAX_SAFE_TARGET;
    alerts.push("La mezcla calculada excedia el rango profesional seguro; se limito a 4.0% y conviene reforzar con tecnica.");
  }

  if (caseData.condiciones.ictericia && caseData.concentrado > 12) {
    alerts.push("Ictericia: es preferible un arterial especial de bajo indice o sistema dedicado.");
  }

  if (finalTarget < RECOMMENDED_STANDARD_LOW) {
    alerts.push("Fuerza final baja: verifica si el objetivo del caso permite una solucion por debajo del rango bactericida habitual.");
  } else if (finalTarget > RECOMMENDED_STANDARD_HIGH) {
    alerts.push("Fuerza final alta: confirma tolerancia tisular y distribucion para evitar sobresecar.");
  }

  if (caseData.concentrado <= finalTarget) {
    return {
      ok: false,
      error:
        "La concentracion final recomendada no puede ser igual o mayor que la concentracion del arterial en botella.",
      alerts,
    };
  }

  // Mezcla simplificada: solo arterial + agua.
  const arterialMl = (finalTarget * totalSolutionMl) / caseData.concentrado;
  const waterMl = totalSolutionMl - arterialMl;

  if (waterMl < 0) {
    return {
      ok: false,
      error: "El volumen de agua resulto negativo; revisa los datos de entrada.",
      alerts,
    };
  }

  const pressure =
    decomposition.pressure ||
    (caseData.condiciones.autopsia || caseData.condiciones.trauma
      ? "35-50 psi"
      : caseData.condiciones.edema
        ? "30-40 psi"
        : preservation.pressure);
  const flow =
    caseData.condiciones.edema
      ? "6-8 fl oz/min"
      : decomposition.flow ||
        (caseData.condiciones.autopsia ? "7-9 fl oz/min" : preservation.flow);

  const techniqueNotes = [preservation.technique];
  if (decomposition.technique) {
    techniqueNotes.push(decomposition.technique);
  }
  if (caseData.condiciones.edema) {
    techniqueNotes.push("Bajo flujo, drenaje amplio y vigilancia de distension.");
  }
  if (caseData.condiciones.autopsia) {
    techniqueNotes.push("Cervical restringida y tratamiento por secciones/autopsia.");
  }
  if (caseData.condiciones.trauma) {
    techniqueNotes.push("Multipunto o seccional en regiones comprometidas.");
  }
  if (caseData.condiciones.ictericia) {
    techniqueNotes.push("Controla color y prefiere sistema especial para ictericia.");
  }

  const concentrationText =
    concentrationAdjustments.length > 0
      ? concentrationAdjustments
          .map((item) => `${item.value >= 0 ? "+" : ""}${formatNumber(item.value, 2)} ${item.label}`)
          .join(", ")
      : "sin ajustes clinicos extra";

  const profileSummary = [
    `${formatNumber(caseData.peso, 0)} kg`,
    complexion.label.toLowerCase(),
    preservation.label.toLowerCase(),
    decomposition.label.toLowerCase(),
  ];

  profileTags.forEach((tag) => {
    profileSummary.push(tag);
  });

  return {
    ok: true,
    concentrado: caseData.concentrado,
    baseObjective,
    finalTarget,
    volumeBaseGallons,
    finalVolumeGallons,
    totalSolutionMl,
    arterialMl,
    waterMl,
    pressure,
    flow,
    technique: techniqueNotes.join(" "),
    alerts,
    profileSummary: profileSummary.join(" · "),
    formulaVolume: hasManualVolume
      ? `Volumen final indicado: ${formatNumber(caseData.volumenPrepararLitros, 2)} L = ${formatNumber(totalSolutionMl, 0)} ml.`
      : `Volumen base: ${formatNumber(caseData.peso, 0)} kg x ${formatNumber(GALLONS_PER_KG, 4)} = ${formatNumber(volumeBaseGallons, 2)} gal. ` +
        `Volumen ajustado: ${formatNumber(volumeBaseGallons, 2)} x ${formatNumber(volumeFactor, 2)} = ${formatNumber(finalVolumeGallons, 2)} gal.`,
    formulaConcentration:
      `Concentracion final: ${formatNumber(baseObjective, 2)}% base + ${concentrationText} = ${formatNumber(finalTarget, 2)}%.`,
    formulaFinal:
      `Arterial: (${formatNumber(finalTarget, 2)} x ${formatNumber(totalSolutionMl, 0)} ml) / ${formatNumber(caseData.concentrado, 2)} = ` +
      `${formatNumber(arterialMl, 1)} ml. Agua exacta: ${formatNumber(totalSolutionMl, 0)} - ` +
      `${formatNumber(arterialMl, 1)} = ${formatNumber(waterMl, 1)} ml.`,
  };
}

function renderRecommendation(result) {
  isResultsCleared = false;
  currentRecommendation = result;
  setNodeText(dom.quimicoMl, `${formatNumber(result.arterialMl, 1)} ml de fluido arterial concentrado`);
  setNodeText(
    dom.quimicoOz,
    `${formatNumber(result.arterialMl / ML_PER_OZ, 1)} fl oz | Base ${formatNumber(result.baseObjective, 2)}% -> final ${formatNumber(result.finalTarget, 2)}%`
  );
  setNodeText(dom.aguaMl, formatMlAndOz(result.waterMl, 0, 1));
  setNodeText(dom.verificacion, `${formatNumber(result.finalTarget, 2)}%`);
  setNodeText(
    dom.volumenFinal,
    `${formatNumber(result.totalSolutionMl / 1000, 2)} L / ${formatNumber(result.totalSolutionMl, 0)} ml`
  );
  if (dom.perfilResumen) {
    setNodeText(dom.perfilResumen, result.profileSummary);
  }
  if (dom.presionSugerida) {
    setNodeText(dom.presionSugerida, result.pressure);
  }
  if (dom.flujoSugerido) {
    setNodeText(dom.flujoSugerido, result.flow);
  }
  if (dom.tecnicaSugerida) {
    setNodeText(dom.tecnicaSugerida, result.technique);
  }
  setNodeText(dom.formulaVolume, result.formulaVolume);
  setNodeText(dom.formulaConcentration, result.formulaConcentration);
  setNodeText(dom.formulaFinal, result.formulaFinal);

  updateMixProgress(
    result.arterialMl,
    result.waterMl,
    result.totalSolutionMl
  );

  const statusMessages = [
    ...result.alerts,
    "La formulacion es una guia profesional de partida; confirma respuesta vascular, drenaje y distension durante la inyeccion.",
  ];
  setStatusMessages(statusMessages);

  const resultSignature = [
    result.arterialMl.toFixed(2),
    result.waterMl.toFixed(2),
    result.finalTarget.toFixed(2),
    result.totalSolutionMl.toFixed(2),
  ].join("|");

  if (resultSignature !== lastResultSignature) {
    updateResultsDisplay();
    lastResultSignature = resultSignature;
  }

  setShareFeedback();
}

function calcularSolucion() {
  syncPresetButtons();
  setError();

  const caseData = readCaseData();
  const caseSignature = buildCaseSignature(caseData);

  if (caseSignature === lastCaseSignature) {
    return;
  }

  lastCaseSignature = caseSignature;

  if (caseData.concentrado === null || (caseData.peso === null && caseData.volumenPrepararLitros === null)) {
    setError("Ingresa el concentrado y al menos peso o volumen final para calcular.");
    clearResults();
    return;
  }

  if (Number.isNaN(caseData.concentrado) || caseData.concentrado <= 0) {
    setError("Ingresa un concentrado valido mayor a cero.");
    clearResults();
    return;
  }

  if (caseData.peso !== null && (Number.isNaN(caseData.peso) || caseData.peso <= 0)) {
    setError("Ingresa un peso valido mayor a cero.");
    clearResults();
    return;
  }

  if (
    caseData.volumenPrepararLitros !== null &&
    (Number.isNaN(caseData.volumenPrepararLitros) || caseData.volumenPrepararLitros <= 0)
  ) {
    setError("Ingresa un volumen final valido mayor a cero.");
    clearResults();
    return;
  }

  if (caseData.objetivoManual !== null && (Number.isNaN(caseData.objetivoManual) || caseData.objetivoManual <= 0)) {
    setError("La concentracion base manual debe ser mayor a cero.");
    clearResults();
    return;
  }

  if (caseData.peso !== null && caseData.peso > 227) {
    setError("El peso debe estar en un rango razonable para este calculador (hasta 227 kg).");
    clearResults();
    return;
  }

  if (caseData.volumenPrepararLitros !== null && caseData.volumenPrepararLitros > 30.28) {
    setError("El volumen final debe estar en un rango razonable para este calculador (hasta 30.28 L).");
    clearResults();
    return;
  }

  const result = buildRecommendation(caseData);

  if (!result.ok) {
    setError(result.error);
    clearResults();
    if (result.alerts.length) {
      setStatusMessages(result.alerts);
    }
    return;
  }

  renderRecommendation(result);
}

function generarResumen() {
  if (!currentRecommendation || !currentRecommendation.ok) {
    return "";
  }

  const volumeLines = [
    "🧪 Solucion arterial",
    `C1: ${formatNumber(roundToOneDecimal(currentRecommendation.concentrado), 1)}%`,
    `C2: ${formatNumber(roundToOneDecimal(currentRecommendation.finalTarget), 1)}%`,
    `Volumen final: ${formatVolumeMlAndLiters(currentRecommendation.totalSolutionMl)}`,
    "",
    `Arterial: ${formatNumber(roundToOneDecimal(currentRecommendation.arterialMl), 1)} ml`,
    `Agua: ${formatNumber(roundToOneDecimal(currentRecommendation.waterMl), 1)} ml`,
  ];

  volumeLines.push("");
  volumeLines.push(`Volumen total real: ${formatVolumeMlAndLiters(currentRecommendation.totalSolutionMl)}`);

  return volumeLines.join("\n");
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = text;
  tempTextarea.setAttribute("readonly", "readonly");
  tempTextarea.style.position = "fixed";
  tempTextarea.style.left = "-9999px";
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(tempTextarea);
  if (!copied) {
    throw new Error("copy_failed");
  }
}

function fallbackManualCopy(text) {
  window.prompt("Copia manualmente este resultado:", text);
  setShareFeedback("Copia manual lista");
}

function getSharePayload() {
  const resumen = generarResumen();
  return {
    resumen,
    title: "CalcEmbal · Solucion arterial",
    url: window.location.href,
  };
}

function buildShareMessage(resumen, url) {
  return `${resumen}\n\nCalculadora: ${url}`;
}

function getShareCandidates(payload) {
  const message = buildShareMessage(payload.resumen, payload.url);
  return [
    { title: payload.title, text: payload.resumen, url: payload.url },
    { title: payload.title, text: message },
    { text: message },
  ];
}

async function shareWithNativeSheet(payload) {
  if (typeof navigator.share !== "function") {
    return false;
  }

  const candidates = getShareCandidates(payload);
  for (const candidate of candidates) {
    if (typeof navigator.canShare === "function" && !navigator.canShare(candidate)) {
      continue;
    }

    await navigator.share(candidate);
    return true;
  }

  return false;
}

async function compartirResultado() {
  setError();
  const payload = getSharePayload();
  const { resumen } = payload;

  if (!resumen) {
    setError("Calcula primero una solucion valida para compartir.");
    return;
  }

  const fallbackText = buildShareMessage(payload.resumen, payload.url);

  try {
    const didShare = await shareWithNativeSheet(payload);
    if (didShare) {
      setShareFeedback("Compartido");
      return;
    }

    await copyTextToClipboard(fallbackText);
    if (!window.isSecureContext) {
      setShareFeedback("Resultado copiado. Para compartir nativo, abre la web en HTTPS.");
      return;
    }
    setShareFeedback("Resultado copiado");
  } catch (shareError) {
    if (shareError?.name === "AbortError") {
      return;
    }

    try {
      await copyTextToClipboard(fallbackText);
      if (!window.isSecureContext) {
        setShareFeedback("Resultado copiado. Para compartir nativo, abre la web en HTTPS.");
        return;
      }
      setShareFeedback("Resultado copiado");
    } catch (clipboardError) {
      fallbackManualCopy(fallbackText);
    }
  }
}

function scheduleCalculate() {
  if (scheduledCalculationTimerId) {
    window.clearTimeout(scheduledCalculationTimerId);
  }

  if (scheduledCalculationFrame) {
    window.cancelAnimationFrame(scheduledCalculationFrame);
  }

  scheduledCalculationTimerId = window.setTimeout(() => {
    scheduledCalculationTimerId = 0;
    scheduledCalculationFrame = window.requestAnimationFrame(() => {
      scheduledCalculationFrame = 0;
      calcularSolucion();
    });
  }, INPUT_DEBOUNCE_MS);
}

function scheduleCalculateImmediate() {
  if (scheduledCalculationTimerId) {
    window.clearTimeout(scheduledCalculationTimerId);
    scheduledCalculationTimerId = 0;
  }

  if (scheduledCalculationFrame) {
    window.cancelAnimationFrame(scheduledCalculationFrame);
  }

  scheduledCalculationFrame = window.requestAnimationFrame(() => {
    scheduledCalculationFrame = 0;
    calcularSolucion();
  });
}

function applySystemThemeChange(event) {
  if (getStoredTheme()) {
    return;
  }
  currentTheme = event.matches ? "dark" : "light";
  runThemeTransition(() => applyTheme(currentTheme));
}

function setupThemeToggle() {
  applyTheme(currentTheme);

  if (dom.themeToggle) {
    dom.themeToggle.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      runThemeTransition(() => {
        applyTheme(currentTheme);
        setStoredTheme(currentTheme);
      });
    });
  }

  if (typeof systemDarkPreference.addEventListener === "function") {
    systemDarkPreference.addEventListener("change", applySystemThemeChange);
  } else if (typeof systemDarkPreference.addListener === "function") {
    systemDarkPreference.addListener(applySystemThemeChange);
  }
}

function setupCustomSelect() {
  const toggleSelectMenu = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (!selectItems.contains(event.target)) {
      event.preventDefault();
      selectItems.classList.toggle("select-hide");
    }
  };

  dom.comboConcentrado.addEventListener("pointerdown", toggleSelectMenu);

  const handleOptionSelection = (event) => {
    if (event.target === selectItems) {
      return;
    }

    const selectedOption = event.target.closest(".select-item");
    if (!selectedOption) {
      return;
    }

    event.preventDefault();
    selectedConcentradoValue = selectedOption.getAttribute("data-value") || "";
    setNodeText(
      selectSelected,
      selectedOption.querySelector("span")?.textContent.trim() || selectedOption.textContent.trim()
    );
    selectItems.classList.add("select-hide");
    updateConcentradoLock();
    scheduleCalculateImmediate();
  };

  selectItems.addEventListener("pointerdown", handleOptionSelection);

  document.addEventListener("pointerdown", (event) => {
    if (!dom.comboConcentrado.contains(event.target)) {
      selectItems.classList.add("select-hide");
    }
  }, { passive: true });
}

function setupShareButton() {
  if (!dom.shareResultButton) {
    return;
  }

  dom.shareResultButton.addEventListener("click", () => {
    compartirResultado();
  });
}

function setupInputListeners() {
  const reactiveInputs = [
    dom.concentradoInput,
    dom.objetivoInput,
    dom.pesoInput,
    dom.volumenPrepararInput,
    dom.preservationSelect,
    dom.decompositionSelect,
    ...Object.values(dom.checkboxes).filter(Boolean),
  ].filter(Boolean);

  reactiveInputs.forEach((input) => {
    input.addEventListener("input", scheduleCalculate, { passive: true });
    input.addEventListener("change", scheduleCalculateImmediate);
  });

  const decimalInputs = [
    dom.concentradoInput,
    dom.objetivoInput,
    dom.pesoInput,
    dom.volumenPrepararInput,
  ].filter(Boolean);

  decimalInputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (!input.value || !input.value.includes(",")) {
        return;
      }
      input.value = input.value.replace(/,/g, ".");
      scheduleCalculate();
    });
  });

  dom.presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      dom.objetivoInput.value = button.dataset.set || "";
      syncPresetButtons();
      scheduleCalculateImmediate();
    });
  });

  dom.concentradoInput.addEventListener("focus", () => {
    if (dom.concentradoInput.readOnly) {
      clearChemicalSelection();
    }
  });

  dom.concentradoInput.addEventListener("pointerdown", () => {
    if (dom.concentradoInput.readOnly) {
      clearChemicalSelection();
    }
  });
}

function setupAudioCarga() {
  const audio = document.getElementById("audioCarga");
  if (!audio) {
    return;
  }

  // En moviles se percibe mejor con un volumen moderado.
  audio.volume = 0.55;
  audio.load();

  let yaReproducido = false;
  let intentoEnCurso = false;

  const removerEventosDeRespaldo = () => {
    document.removeEventListener("pointerdown", reproducirEnInteraccion);
    document.removeEventListener("touchstart", reproducirEnInteraccion);
    document.removeEventListener("click", reproducirEnInteraccion);
    document.removeEventListener("keydown", reproducirEnInteraccion);
  };

  const intentarReproducir = async (mostrarBloqueo = false) => {
    if (yaReproducido || intentoEnCurso) {
      return;
    }

    intentoEnCurso = true;
    const intento = audio.play();
    if (intento && typeof intento.then === "function") {
      try {
        await intento;
        yaReproducido = true;
        removerEventosDeRespaldo();
      } catch {
        if (mostrarBloqueo) {
          console.log("El navegador bloqueó la reproducción automática.");
        }
      } finally {
        intentoEnCurso = false;
      }
      return;
    }

    // Fallback para navegadores antiguos que no devuelven promesa.
    yaReproducido = true;
    intentoEnCurso = false;
    removerEventosDeRespaldo();
  };

  // Reintenta en interacciones reales del usuario hasta que se reproduzca.
  const reproducirEnInteraccion = () => {
    intentarReproducir(false);
  };

  document.addEventListener("pointerdown", reproducirEnInteraccion, { passive: true });
  document.addEventListener("touchstart", reproducirEnInteraccion, { passive: true });
  document.addEventListener("click", reproducirEnInteraccion, { passive: true });
  document.addEventListener("keydown", reproducirEnInteraccion);

  // Intenta autoplay al cargar y tambien cuando el audio ya puede reproducirse.
  intentarReproducir(true);
  audio.addEventListener("canplay", () => {
    intentarReproducir(true);
  }, { once: true });
}

function initialize() {
  setupThemeToggle();
  setupCustomSelect();
  setupShareButton();
  setupInputListeners();
  resetForm();
  updateConcentradoLock();
  syncPresetButtons();
  clearResults();
  calcularSolucion();

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) {
      return;
    }
    resetForm();
    updateConcentradoLock();
    syncPresetButtons();
    setError();
    clearResults();
    lastCaseSignature = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupAudioCarga();
});

initialize();
