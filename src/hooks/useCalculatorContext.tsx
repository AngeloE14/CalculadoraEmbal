/**
 * Provider central de la calculadora.
 *
 * Este archivo concentra la "orquestación":
 * 1) Estado del formulario.
 * 2) Validación y cálculo con funciones puras.
 * 3) Estado visual de resultados/feedback.
 *
 * Migrado desde la lógica imperativa del proyecto original en JS.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  COARSE_POINTER_QUERY,
  DEFAULT_CONDITIONS,
  DEFAULT_INPUTS,
  type CalculatorInputs,
  type CaseData,
} from '../utils/constants';
import {
  formatNumber,
  formatVolumeMlAndLiters,
  parseInputNumber,
  roundToOneDecimal,
  sanitizeDecimalText,
} from '../utils/formatters';
import { buildCaseSignature, buildRecommendation, validateCaseData } from '../utils/calculator';
import {
  CalculatorFormContext,
  CalculatorResultsContext,
  type CalculatorFormContextValue,
  type CalculatorResultsContextValue,
} from './calculatorContext';

function buildCaseDataFromInputs(inputs: CalculatorInputs): CaseData {
  return {
    concentrado: parseInputNumber(inputs.concentrado),
    objetivoManual: parseInputNumber(inputs.objetivoManual),
    peso: parseInputNumber(inputs.peso),
    volumenPrepararLitros: parseInputNumber(inputs.volumenPrepararLitros),
    complexion: 'media',
    preservacion: 'normal',
    descomposicion: 'ninguna',
    condiciones: { ...DEFAULT_CONDITIONS },
  };
}

function buildShareSummary(recommendation: NonNullable<CalculatorResultsContextValue['currentRecommendation']>): string {
  if (!recommendation.ok || !recommendation.concentrado || !recommendation.finalTarget || !recommendation.totalSolutionMl) {
    return '';
  }

  const arterialMl = recommendation.arterialMl ?? 0;
  const waterMl = recommendation.waterMl ?? 0;
  const totalSolutionMl = recommendation.totalSolutionMl;

  const lines = [
    'Solucion arterial',
    `C1: ${formatNumber(roundToOneDecimal(recommendation.concentrado), 1)}%`,
    `C2: ${formatNumber(roundToOneDecimal(recommendation.finalTarget), 1)}%`,
    `Volumen final: ${formatVolumeMlAndLiters(totalSolutionMl)}`,
    '',
    `Arterial: ${formatNumber(roundToOneDecimal(arterialMl), 1)} ml`,
    `Agua: ${formatNumber(roundToOneDecimal(waterMl), 1)} ml`,
    '',
    `Volumen total real: ${formatVolumeMlAndLiters(totalSolutionMl)}`,
  ];

  return lines.join('\n');
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = text;
  tempTextArea.setAttribute('readonly', 'readonly');
  tempTextArea.style.position = 'fixed';
  tempTextArea.style.left = '-9999px';
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(tempTextArea);

  if (!copied) {
    throw new Error('copy_failed');
  }
}

function getShareCandidates(title: string, summary: string, url: string) {
  const message = `${summary}\n\nCalculadora: ${url}`;

  return [
    { title, text: summary, url },
    { title, text: message },
    { text: message },
  ];
}

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [selectedChemical, setSelectedChemical] = useState<CalculatorFormContextValue['selectedChemical']>(null);

  const [error, setError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [isResultsUpdating, setIsResultsUpdating] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState<CalculatorResultsContextValue['currentRecommendation']>(
    null,
  );

  const lastCaseSignatureRef = useRef('');
  const lastResultSignatureRef = useRef('');
  const animationFrameRef = useRef<number>(0);
  const animationTimeoutRef = useRef<number>(0);

  // En pantallas táctiles usamos un debounce un poco mayor para evitar recálculos en cada tecla.
  const inputDebounceMs = useMemo(() => {
    if (typeof window === 'undefined') {
      return 50;
    }
    return window.matchMedia(COARSE_POINTER_QUERY).matches ? 90 : 50;
  }, []);

  const shouldAnimateResults = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia(COARSE_POINTER_QUERY).matches;
    return !reducedMotion && !coarsePointer;
  }, []);

  const caseData = useMemo(() => buildCaseDataFromInputs(inputs), [inputs]);

  const clearOutputs = useCallback(() => {
    setCurrentRecommendation(null);
    setShareFeedback('');
    setIsResultsUpdating(false);
    lastResultSignatureRef.current = '';
  }, []);

  const triggerResultAnimation = useCallback(
    (signature: string) => {
      if (signature === lastResultSignatureRef.current) {
        return;
      }

      lastResultSignatureRef.current = signature;

      if (!shouldAnimateResults) {
        setIsResultsUpdating(false);
        return;
      }

      setIsResultsUpdating(false);

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        setIsResultsUpdating(true);
      });

      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }

      animationTimeoutRef.current = window.setTimeout(() => {
        setIsResultsUpdating(false);
      }, 520);
    },
    [shouldAnimateResults],
  );

  const runCalculation = useCallback(
    (nextCaseData: CaseData) => {
      const validationError = validateCaseData(nextCaseData);

      if (validationError) {
        setError(validationError);
        clearOutputs();
        return;
      }

      const recommendation = buildRecommendation(nextCaseData);

      if (!recommendation.ok) {
        setError(recommendation.error ?? 'No se pudo calcular la recomendacion.');
        clearOutputs();
        return;
      }

      setError('');
      setCurrentRecommendation(recommendation);
      setShareFeedback('');

      const signature = [
        recommendation.arterialMl?.toFixed(2),
        recommendation.waterMl?.toFixed(2),
        recommendation.finalTarget?.toFixed(2),
        recommendation.totalSolutionMl?.toFixed(2),
      ].join('|');

      triggerResultAnimation(signature);
    },
    [clearOutputs, triggerResultAnimation],
  );

  useEffect(() => {
    const caseSignature = buildCaseSignature(caseData);

    if (caseSignature === lastCaseSignatureRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastCaseSignatureRef.current = caseSignature;
      runCalculation(caseData);
    }, inputDebounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [caseData, inputDebounceMs, runCalculation]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const resetForm = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setSelectedChemical(null);
    setError('');
    setShareFeedback('');
    setCurrentRecommendation(null);
    setIsResultsUpdating(false);
    lastCaseSignatureRef.current = '';
    lastResultSignatureRef.current = '';
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      resetForm();
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [resetForm]);

  const updateInput = useCallback((field: keyof CalculatorInputs, rawValue: string) => {
    setInputs((previous) => ({
      ...previous,
      [field]: sanitizeDecimalText(rawValue),
    }));
  }, []);

  const selectChemical = useCallback((option: NonNullable<CalculatorFormContextValue['selectedChemical']>) => {
    setSelectedChemical(option);
    setInputs((previous) => ({
      ...previous,
      concentrado: option.value,
    }));
  }, []);

  const clearChemicalSelection = useCallback(() => {
    setSelectedChemical(null);
  }, []);

  const applyPreset = useCallback((value: number) => {
    setInputs((previous) => ({
      ...previous,
      objetivoManual: String(value),
    }));
  }, []);

  const shareResult = useCallback(async () => {
    setError('');

    if (!currentRecommendation || !currentRecommendation.ok) {
      setError('Calcula primero una solucion valida para compartir.');
      return;
    }

    const summary = buildShareSummary(currentRecommendation);
    if (!summary) {
      setError('Calcula primero una solucion valida para compartir.');
      return;
    }

    const payload = {
      title: 'CalcEmbal · Solucion arterial',
      url: window.location.href,
      summary,
    };

    const fallbackText = `${payload.summary}\n\nCalculadora: ${payload.url}`;

    try {
      if (typeof navigator.share === 'function') {
        const candidates = getShareCandidates(payload.title, payload.summary, payload.url);

        for (const candidate of candidates) {
          if (typeof navigator.canShare === 'function' && !navigator.canShare(candidate)) {
            continue;
          }

          await navigator.share(candidate);
          setShareFeedback('Compartido');
          return;
        }
      }

      await copyTextToClipboard(fallbackText);
      if (!window.isSecureContext) {
        setShareFeedback('Resultado copiado. Para compartir nativo, abre la web en HTTPS.');
        return;
      }

      setShareFeedback('Resultado copiado');
    } catch (shareError) {
      if ((shareError as { name?: string })?.name === 'AbortError') {
        return;
      }

      try {
        await copyTextToClipboard(fallbackText);
        if (!window.isSecureContext) {
          setShareFeedback('Resultado copiado. Para compartir nativo, abre la web en HTTPS.');
          return;
        }

        setShareFeedback('Resultado copiado');
      } catch {
        window.prompt('Copia manualmente este resultado:', fallbackText);
        setShareFeedback('Copia manual lista');
      }
    }
  }, [currentRecommendation]);

  // Este valor sólo cambia cuando cambia el formulario.
  const formContextValue = useMemo<CalculatorFormContextValue>(
    () => ({
      inputs,
      selectedChemical,
      isConcentradoLocked: selectedChemical !== null,
      updateInput,
      selectChemical,
      clearChemicalSelection,
      applyPreset,
    }),
    [applyPreset, clearChemicalSelection, inputs, selectedChemical, selectChemical, updateInput],
  );

  // Este valor sólo cambia cuando cambia el resultado/feedback.
  const resultsContextValue = useMemo<CalculatorResultsContextValue>(
    () => ({
      error,
      shareFeedback,
      isResultsUpdating,
      currentRecommendation,
      resetForm,
      shareResult,
    }),
    [currentRecommendation, error, isResultsUpdating, resetForm, shareFeedback, shareResult],
  );

  return (
    <CalculatorFormContext.Provider value={formContextValue}>
      <CalculatorResultsContext.Provider value={resultsContextValue}>{children}</CalculatorResultsContext.Provider>
    </CalculatorFormContext.Provider>
  );
}
