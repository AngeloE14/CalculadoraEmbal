/**
 * Motor puro de recomendaciones.
 * Fuente original: script.js del proyecto tradicional.
 *
 * Nota pedagógica:
 * este archivo no depende de React; solo recibe datos y devuelve resultados.
 */

import {
  GALLONS_PER_KG,
  MAX_SAFE_TARGET,
  MIN_SAFE_TARGET,
  ML_PER_GALLON,
  RECOMMENDED_STANDARD_HIGH,
  RECOMMENDED_STANDARD_LOW,
  type CaseData,
  type RecommendationResult,
} from './constants';
import {
  COMPLEXION_PROFILES,
  DECOMPOSITION_PROFILES,
  PRESERVATION_PROFILES,
} from './profiles';
import { formatNumber } from './formatters';

interface Adjustment {
  label: string;
  value: number;
}

function pushAdjustment(adjustments: Adjustment[], label: string, value: number): number {
  adjustments.push({ label, value });
  return value;
}

export function buildCaseSignature(caseData: CaseData): string {
  const conditionBits = Object.values(caseData.condiciones)
    .map((value) => (value ? '1' : '0'))
    .join('');

  return [
    caseData.concentrado ?? '',
    caseData.objetivoManual ?? '',
    caseData.peso ?? '',
    caseData.volumenPrepararLitros ?? '',
    caseData.complexion,
    caseData.preservacion,
    caseData.descomposicion,
    conditionBits,
  ].join('|');
}

export function validateCaseData(caseData: CaseData): string {
  if (caseData.concentrado === null || (caseData.peso === null && caseData.volumenPrepararLitros === null)) {
    return 'Ingresa el concentrado y al menos peso o volumen final para calcular.';
  }

  if (Number.isNaN(caseData.concentrado) || caseData.concentrado <= 0) {
    return 'Ingresa un concentrado valido mayor a cero.';
  }

  if (caseData.peso !== null && (Number.isNaN(caseData.peso) || caseData.peso <= 0)) {
    return 'Ingresa un peso valido mayor a cero.';
  }

  if (
    caseData.volumenPrepararLitros !== null &&
    (Number.isNaN(caseData.volumenPrepararLitros) || caseData.volumenPrepararLitros <= 0)
  ) {
    return 'Ingresa un volumen final valido mayor a cero.';
  }

  if (caseData.objetivoManual !== null && (Number.isNaN(caseData.objetivoManual) || caseData.objetivoManual <= 0)) {
    return 'La concentracion base manual debe ser mayor a cero.';
  }

  if (caseData.peso !== null && caseData.peso > 227) {
    return 'El peso debe estar en un rango razonable para este calculador (hasta 227 kg).';
  }

  if (caseData.volumenPrepararLitros !== null && caseData.volumenPrepararLitros > 30.28) {
    return 'El volumen final debe estar en un rango razonable para este calculador (hasta 30.28 L).';
  }

  return '';
}

export function buildRecommendation(caseData: CaseData): RecommendationResult {
  const alerts: string[] = [];
  const profileTags: string[] = [];
  const concentrationAdjustments: Adjustment[] = [];

  const preservation = PRESERVATION_PROFILES[caseData.preservacion];
  const complexion = COMPLEXION_PROFILES[caseData.complexion];
  const decomposition = DECOMPOSITION_PROFILES[caseData.descomposicion];
  const baseObjective = caseData.objetivoManual !== null ? caseData.objetivoManual : preservation.baseTarget;

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
    targetCandidate += pushAdjustment(concentrationAdjustments, 'obesidad', -0.15);
    profileTags.push('obesidad');
  }

  if (caseData.condiciones.desnutricion) {
    volumeFactor *= 0.97;
    targetCandidate += pushAdjustment(concentrationAdjustments, 'demacrado', 0.2);
    profileTags.push('desnutricion');
  }

  if (caseData.condiciones.edema) {
    volumeFactor *= 1.12;
    targetCandidate += pushAdjustment(concentrationAdjustments, 'edema', -0.2);
    profileTags.push('edema');
  }

  if (caseData.condiciones.deshidratacion) {
    targetCandidate += pushAdjustment(concentrationAdjustments, 'deshidratacion', 0.35);
    profileTags.push('deshidratacion');
  }

  if (caseData.condiciones.autopsia) {
    volumeFactor *= 1.15;
    targetCandidate += pushAdjustment(concentrationAdjustments, 'autopsia', 0.25);
    profileTags.push('autopsia');
  }

  if (caseData.condiciones.trauma) {
    volumeFactor *= 1.08;
    targetCandidate += pushAdjustment(concentrationAdjustments, 'trauma', 0.25);
    profileTags.push('trauma');
  }

  if (caseData.condiciones.refrigeracion) {
    volumeFactor *= 1.05;
    targetCandidate += pushAdjustment(concentrationAdjustments, 'refrigeracion', 0.2);
    profileTags.push('refrigeracion');
  }

  if (caseData.condiciones.ictericia) {
    profileTags.push('ictericia');
    if (caseData.concentrado !== null && caseData.concentrado <= 12) {
      alerts.push('Ictericia: usa arterial especial de bajo indice y controla la respuesta de color.');
    }
  }

  if (caseData.condiciones.obesidad && caseData.condiciones.desnutricion) {
    alerts.push('Obesidad y desnutricion a la vez generan criterios opuestos; revisa el perfil fisico antes de preparar.');
  }

  if (caseData.condiciones.edema && caseData.condiciones.deshidratacion) {
    alerts.push('Edema y deshidratacion simultaneos indican distribucion irregular; reevalua drenaje y respuesta vascular.');
  }

  const hasManualVolume = caseData.volumenPrepararLitros !== null;
  const volumeBaseGallons = hasManualVolume
    ? (caseData.volumenPrepararLitros as number) / 3.78541
    : (caseData.peso as number) * GALLONS_PER_KG;
  const finalVolumeGallons = hasManualVolume
    ? Math.max(0.1, Math.min(8, volumeBaseGallons))
    : Math.max(0.1, Math.min(8, volumeBaseGallons * volumeFactor));
  const totalSolutionMl = finalVolumeGallons * ML_PER_GALLON;

  let finalTarget = targetCandidate;

  if (caseData.condiciones.ictericia && finalTarget > 2.8) {
    finalTarget = 2.8;
    alerts.push('Ictericia: la fuerza final se modero para proteger color y evitar reaccion indeseable.');
  }

  if (finalTarget < MIN_SAFE_TARGET) {
    finalTarget = MIN_SAFE_TARGET;
    alerts.push('La mezcla calculada era demasiado debil; se elevo al minimo profesional seguro.');
  }

  if (finalTarget > MAX_SAFE_TARGET) {
    finalTarget = MAX_SAFE_TARGET;
    alerts.push('La mezcla calculada excedia el rango profesional seguro; se limito a 4.0% y conviene reforzar con tecnica.');
  }

  if (caseData.condiciones.ictericia && (caseData.concentrado as number) > 12) {
    alerts.push('Ictericia: es preferible un arterial especial de bajo indice o sistema dedicado.');
  }

  if (finalTarget < RECOMMENDED_STANDARD_LOW) {
    alerts.push('Fuerza final baja: verifica si el objetivo del caso permite una solucion por debajo del rango bactericida habitual.');
  } else if (finalTarget > RECOMMENDED_STANDARD_HIGH) {
    alerts.push('Fuerza final alta: confirma tolerancia tisular y distribucion para evitar sobresecar.');
  }

  if ((caseData.concentrado as number) <= finalTarget) {
    return {
      ok: false,
      error: 'La concentracion final recomendada no puede ser igual o mayor que la concentracion del arterial en botella.',
      alerts,
    };
  }

  const arterialMl = (finalTarget * totalSolutionMl) / (caseData.concentrado as number);
  const waterMl = totalSolutionMl - arterialMl;

  if (waterMl < 0) {
    return {
      ok: false,
      error: 'El volumen de agua resulto negativo; revisa los datos de entrada.',
      alerts,
    };
  }

  const pressure =
    decomposition.pressure ||
    (caseData.condiciones.autopsia || caseData.condiciones.trauma
      ? '35-50 psi'
      : caseData.condiciones.edema
        ? '30-40 psi'
        : preservation.pressure);

  const flow =
    caseData.condiciones.edema
      ? '6-8 fl oz/min'
      : decomposition.flow || (caseData.condiciones.autopsia ? '7-9 fl oz/min' : preservation.flow);

  const techniqueNotes = [preservation.technique];
  if (decomposition.technique) {
    techniqueNotes.push(decomposition.technique);
  }
  if (caseData.condiciones.edema) {
    techniqueNotes.push('Bajo flujo, drenaje amplio y vigilancia de distension.');
  }
  if (caseData.condiciones.autopsia) {
    techniqueNotes.push('Cervical restringida y tratamiento por secciones/autopsia.');
  }
  if (caseData.condiciones.trauma) {
    techniqueNotes.push('Multipunto o seccional en regiones comprometidas.');
  }
  if (caseData.condiciones.ictericia) {
    techniqueNotes.push('Controla color y prefiere sistema especial para ictericia.');
  }

  const concentrationText =
    concentrationAdjustments.length > 0
      ? concentrationAdjustments
          .map((item) => `${item.value >= 0 ? '+' : ''}${formatNumber(item.value, 2)} ${item.label}`)
          .join(', ')
      : 'sin ajustes clinicos extra';

  const profileSummary = [
    `${formatNumber(caseData.peso as number, 0)} kg`,
    complexion.label.toLowerCase(),
    preservation.label.toLowerCase(),
    decomposition.label.toLowerCase(),
    ...profileTags,
  ].join(' · ');

  return {
    ok: true,
    concentrado: caseData.concentrado as number,
    baseObjective,
    finalTarget,
    volumeBaseGallons,
    finalVolumeGallons,
    totalSolutionMl,
    arterialMl,
    waterMl,
    pressure,
    flow,
    technique: techniqueNotes.join(' '),
    alerts,
    profileSummary,
    formulaVolume: hasManualVolume
      ? `Volumen final indicado: ${formatNumber(caseData.volumenPrepararLitros as number, 2)} L = ${formatNumber(totalSolutionMl, 0)} ml.`
      : `Volumen base: ${formatNumber(caseData.peso as number, 0)} kg x ${formatNumber(GALLONS_PER_KG, 4)} = ${formatNumber(volumeBaseGallons, 2)} gal. Volumen ajustado: ${formatNumber(volumeBaseGallons, 2)} x ${formatNumber(volumeFactor, 2)} = ${formatNumber(finalVolumeGallons, 2)} gal.`,
    formulaConcentration: `Concentracion final: ${formatNumber(baseObjective, 2)}% base + ${concentrationText} = ${formatNumber(finalTarget, 2)}%.`,
    formulaFinal: `Arterial: (${formatNumber(finalTarget, 2)} x ${formatNumber(totalSolutionMl, 0)} ml) / ${formatNumber(caseData.concentrado as number, 2)} = ${formatNumber(arterialMl, 1)} ml. Agua exacta: ${formatNumber(totalSolutionMl, 0)} - ${formatNumber(arterialMl, 1)} = ${formatNumber(waterMl, 1)} ml.`,
  };
}
