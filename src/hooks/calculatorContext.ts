/**
 * Contratos de estado global de la calculadora.
 *
 * Nota de rendimiento:
 * separamos "formulario" y "resultados" en contextos distintos para
 * evitar re-renderes innecesarios en móviles mientras la persona escribe.
 */

import { createContext } from 'react';
import type { CalculatorInputs, ChemicalOption, RecommendationResult } from '../utils/constants';

export interface CalculatorFormContextValue {
  inputs: CalculatorInputs;
  selectedChemical: ChemicalOption | null;
  isConcentradoLocked: boolean;
  updateInput: (field: keyof CalculatorInputs, rawValue: string) => void;
  selectChemical: (option: ChemicalOption) => void;
  clearChemicalSelection: () => void;
  applyPreset: (value: number) => void;
}

export interface CalculatorResultsContextValue {
  error: string;
  shareFeedback: string;
  isResultsUpdating: boolean;
  currentRecommendation: RecommendationResult | null;
  resetForm: () => void;
  shareResult: () => Promise<void>;
}

/**
 * Tipo de compatibilidad para partes antiguas que aún consumen todo junto.
 */
export type CalculatorContextValue = CalculatorFormContextValue & CalculatorResultsContextValue;

export const CalculatorFormContext = createContext<CalculatorFormContextValue | null>(null);
export const CalculatorResultsContext = createContext<CalculatorResultsContextValue | null>(null);
