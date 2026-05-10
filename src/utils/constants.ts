/**
 * Constantes y tipos de dominio.
 * Fuente original: script.js del proyecto tradicional (vanilla JS).
 */

export const ML_PER_OZ = 29.5735;
export const ML_PER_GALLON = 3785.41;
export const LB_PER_KG = 2.20462;
export const GALLONS_PER_KG = LB_PER_KG / 50;

export const MIN_SAFE_TARGET = 1.5;
export const MAX_SAFE_TARGET = 4.0;
export const RECOMMENDED_STANDARD_LOW = 2.0;
export const RECOMMENDED_STANDARD_HIGH = 3.0;

export const THEME_STORAGE_KEY = 'formulador-theme';
export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const COARSE_POINTER_QUERY = '(pointer: coarse)';

export const DEFAULT_CHEMICAL_LABEL = 'Selecciona un químico🧪';

export type PreservationKey = 'suave' | 'normal' | 'firme' | 'alta';
export type ComplexionKey = 'delgada' | 'media' | 'robusta' | 'atletica';
export type DecompositionKey = 'ninguna' | 'temprana' | 'moderada' | 'avanzada';

export interface CaseConditions {
  obesidad: boolean;
  desnutricion: boolean;
  edema: boolean;
  deshidratacion: boolean;
  ictericia: boolean;
  autopsia: boolean;
  trauma: boolean;
  refrigeracion: boolean;
}

export interface CaseData {
  concentrado: number | null;
  objetivoManual: number | null;
  peso: number | null;
  volumenPrepararLitros: number | null;
  complexion: ComplexionKey;
  preservacion: PreservationKey;
  descomposicion: DecompositionKey;
  condiciones: CaseConditions;
}

export interface PreservationProfile {
  label: string;
  baseTarget: number;
  volumeFactor: number;
  pressure: string;
  flow: string;
  technique: string;
}

export interface ComplexionProfile {
  label: string;
  volumeFactor: number;
  concentrationDelta: number;
}

export interface DecompositionProfile {
  label: string;
  volumeFactor: number;
  concentrationDelta: number;
  pressure: string;
  flow: string;
  technique: string;
}

export interface ChemicalOption {
  value: string;
  label: string;
  image: string;
}

export interface PresetButton {
  key: string;
  label: string;
  min?: number;
  max?: number;
  set: number;
}

export interface RecommendationResult {
  ok: boolean;
  error?: string;
  concentrado?: number;
  baseObjective?: number;
  finalTarget?: number;
  volumeBaseGallons?: number;
  finalVolumeGallons?: number;
  totalSolutionMl?: number;
  arterialMl?: number;
  waterMl?: number;
  pressure?: string;
  flow?: string;
  technique?: string;
  alerts: string[];
  profileSummary?: string;
  formulaVolume?: string;
  formulaConcentration?: string;
  formulaFinal?: string;
}

export interface CalculatorInputs {
  concentrado: string;
  objetivoManual: string;
  peso: string;
  volumenPrepararLitros: string;
}

export const DEFAULT_CONDITIONS: CaseConditions = {
  obesidad: false,
  desnutricion: false,
  edema: false,
  deshidratacion: false,
  ictericia: false,
  autopsia: false,
  trauma: false,
  refrigeracion: false,
};

export const DEFAULT_INPUTS: CalculatorInputs = {
  concentrado: '',
  objetivoManual: '',
  peso: '',
  volumenPrepararLitros: '',
};
