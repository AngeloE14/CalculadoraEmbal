/**
 * Perfiles clínicos y opciones seleccionables del dominio.
 * Fuente original: script.js del proyecto tradicional.
 */

import type {
  ChemicalOption,
  ComplexionProfile,
  DecompositionProfile,
  PreservationProfile,
  PresetButton,
  ComplexionKey,
  DecompositionKey,
  PreservationKey,
} from './constants';

export const PRESERVATION_PROFILES: Record<PreservationKey, PreservationProfile> = {
  suave: {
    label: 'Suave',
    baseTarget: 1.85,
    volumeFactor: 0.96,
    pressure: '20-28 psi',
    flow: '8-10 fl oz/min',
    technique: 'Inyeccion cervical simple con drenaje intermitente.',
  },
  normal: {
    label: 'Profesional estandar',
    baseTarget: 2.25,
    volumeFactor: 1,
    pressure: '25-35 psi',
    flow: '8-12 fl oz/min',
    technique: 'Cervical estandar con drenaje intermitente.',
  },
  firme: {
    label: 'Firme',
    baseTarget: 2.8,
    volumeFactor: 1.05,
    pressure: '30-40 psi',
    flow: '8-12 fl oz/min',
    technique: 'Cervical con control mas cerrado del drenaje.',
  },
  alta: {
    label: 'Alta preservacion',
    baseTarget: 3.25,
    volumeFactor: 1.1,
    pressure: '40-55 psi',
    flow: '8-10 fl oz/min',
    technique: 'Trabajo por etapas con reevaluacion frecuente.',
  },
};

export const COMPLEXION_PROFILES: Record<ComplexionKey, ComplexionProfile> = {
  delgada: {
    label: 'Delgada',
    volumeFactor: 0.95,
    concentrationDelta: 0,
  },
  media: {
    label: 'Media',
    volumeFactor: 1,
    concentrationDelta: 0,
  },
  robusta: {
    label: 'Robusta',
    volumeFactor: 1.08,
    concentrationDelta: 0.1,
  },
  atletica: {
    label: 'Atletica',
    volumeFactor: 1.04,
    concentrationDelta: 0.12,
  },
};

export const DECOMPOSITION_PROFILES: Record<DecompositionKey, DecompositionProfile> = {
  ninguna: {
    label: 'Sin cambios notorios',
    volumeFactor: 1,
    concentrationDelta: 0,
    pressure: '',
    flow: '',
    technique: '',
  },
  temprana: {
    label: 'Temprana',
    volumeFactor: 1.05,
    concentrationDelta: 0.35,
    pressure: '35-45 psi',
    flow: '8-10 fl oz/min',
    technique: 'Refuerza la distribucion y vigila cada etapa de inyeccion.',
  },
  moderada: {
    label: 'Moderada',
    volumeFactor: 1.1,
    concentrationDelta: 0.65,
    pressure: '40-55 psi',
    flow: '7-9 fl oz/min',
    technique: 'Considera cervical restringida o tratamiento por secciones.',
  },
  avanzada: {
    label: 'Avanzada',
    volumeFactor: 1.15,
    concentrationDelta: 1,
    pressure: '45-60 psi',
    flow: '6-8 fl oz/min',
    technique: 'Apoya con tecnica por etapas y reevaluacion por galon.',
  },
};

export const CHEMICAL_OPTIONS: ChemicalOption[] = [
  {
    value: '26',
    label: 'Hydrasil Arterial 26',
    image: '/assets/images/Hydrasil_Arterial_26_thumb.jpeg',
  },
  {
    value: '31',
    label: 'Hydrasill Arterial 31',
    image: '/assets/images/Hydrasil_Arterial_31_thumb.jpeg',
  },
  {
    value: '8',
    label: 'Jaundice Hydrasil Arterial',
    image: '/assets/images/Jaundice_Hydrasil_Arterial_thumb.jpeg',
  },
];

export const PRESET_BUTTONS: PresetButton[] = [
  {
    key: 'baja',
    label: '🟢 Baja 0.1~1.99%',
    min: 0.1,
    max: 1.99,
    set: 0.1,
  },
  {
    key: 'media',
    label: '🟡 Media 2.0~3.99%',
    min: 2,
    max: 3.99,
    set: 2,
  },
  {
    key: 'fuerte',
    label: '🔴 Fuerte +4.0%',
    min: 4,
    set: 4,
  },
];
