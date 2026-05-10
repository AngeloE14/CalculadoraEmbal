/**
 * Hooks consumidores de los contextos de calculadora.
 * Se exponen en tres sabores:
 * - useCalculatorForm: solo datos/acciones del formulario.
 * - useCalculatorResults: solo datos/acciones de resultados.
 * - useCalculator: unión de ambos para compatibilidad.
 */

import { useContext, useMemo } from 'react';
import { CalculatorFormContext, CalculatorResultsContext, type CalculatorContextValue } from './calculatorContext';

export function useCalculatorForm() {
  const context = useContext(CalculatorFormContext);
  if (!context) {
    throw new Error('useCalculatorForm debe usarse dentro de CalculatorProvider.');
  }
  return context;
}

export function useCalculatorResults() {
  const context = useContext(CalculatorResultsContext);
  if (!context) {
    throw new Error('useCalculatorResults debe usarse dentro de CalculatorProvider.');
  }
  return context;
}

/**
 * Hook legacy: mantiene compatibilidad con código que esperaba un solo contexto.
 */
export function useCalculator(): CalculatorContextValue {
  const form = useCalculatorForm();
  const results = useCalculatorResults();

  return useMemo(
    () => ({
      ...form,
      ...results,
    }),
    [form, results],
  );
}
