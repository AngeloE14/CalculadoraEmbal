/**
 * Panel de resultados de la calculadora.
 * Origen: caja de resultados del HTML tradicional.
 */

import { memo, type ReactNode } from 'react';
import { useCalculatorResults } from '../hooks/useCalculator';
import { formatMlAndOz, formatNumber } from '../utils/formatters';
import { MixProgress } from './MixProgress';
import { ShareActions } from './ShareActions';

const FORMULA_TOKEN_REGEX = /(C1·V1|C2·V2|C1|C2|V1|V2|->|=|x|\d+(?:[.,]\d+)?\s?(?:kg|gal|ml|L|fl oz|psi|%))/g;

function renderFormulaRichText(text?: string): ReactNode {
  if (!text) {
    return '—';
  }

  const chunks: ReactNode[] = [];
  let cursor = 0;
  let tokenCount = 0;

  for (const match of text.matchAll(FORMULA_TOKEN_REGEX)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > cursor) {
      chunks.push(text.slice(cursor, start));
    }

    let tokenClassName = 'formula-token formula-token--formula';

    if (/^\d/.test(token)) {
      tokenClassName = 'formula-token formula-token--number';
    } else if (token === '=' || token === '->') {
      tokenClassName = 'formula-token formula-token--operator';
    }

    chunks.push(
      <span key={`${token}-${start}-${tokenCount}`} className={tokenClassName}>
        {token}
      </span>,
    );

    cursor = start + token.length;
    tokenCount += 1;
  }

  if (cursor < text.length) {
    chunks.push(text.slice(cursor));
  }

  return chunks;
}

export const ResultsSection = memo(function ResultsSection() {
  const {
    currentRecommendation,
    error,
    shareFeedback,
    shareResult,
    isResultsUpdating,
  } = useCalculatorResults();

  const hasResult = Boolean(currentRecommendation?.ok);
  const arterialMl = hasResult ? currentRecommendation?.arterialMl ?? 0 : 0;
  const waterMl = hasResult ? currentRecommendation?.waterMl ?? 0 : 0;
  const totalSolutionMl = hasResult ? currentRecommendation?.totalSolutionMl ?? 0 : 0;
  const baseObjective = hasResult ? currentRecommendation?.baseObjective ?? 0 : 0;
  const finalTarget = hasResult ? currentRecommendation?.finalTarget ?? 0 : 0;

  const articleClass = [
    'box',
    'box-results',
    'tarjeta-interactiva',
    'panel-resultados',
    isResultsUpdating ? 'is-updating panel-resultados--actualizando' : '',
  ]
    .join(' ')
    .trim();

  return (
    <article className={articleClass}>
      <h2>Formula arterial recomendada</h2>

      <div className="result-main bloque-resultado">
        <div className="value" id="quimicoMl">
          {hasResult ? `${formatNumber(arterialMl, 1)} ml de fluido arterial concentrado` : 'Completa el perfil para calcular'}
        </div>
        <div className="sub" id="quimicoOz">
          {hasResult
            ? `${formatNumber(arterialMl / 29.5735, 1)} fl oz | Base ${formatNumber(baseObjective, 2)}% -> final ${formatNumber(finalTarget, 2)}%`
            : '—'}
        </div>
      </div>

      {hasResult ? (
        <MixProgress arterialMl={arterialMl} waterMl={waterMl} totalSolutionMl={totalSolutionMl} />
      ) : (
        <div className="mix-progress bloque-mezcla" aria-live="polite">
          <div className="mix-progress__head">
            <span id="mixChemicalPct">Arterial: —</span>
            <span id="mixWaterPct">Agua: —</span>
          </div>
          <div className="mix-progress__track" role="img" aria-label="Proporción visual de arterial y agua en la mezcla">
            <div className="mix-progress__bar mix-progress__bar--chemical" id="mixChemicalBar"></div>
            <div className="mix-progress__bar mix-progress__bar--water" id="mixWaterBar"></div>
          </div>
          <p className="mix-progress__explain" id="mixExplain">
            Completa los datos para ver la distribución exacta de la solución.
          </p>
        </div>
      )}

      <div className="mini-grid resumen-metrico">
        <div className="tile tarjeta-dato">
          <strong>💧 Agua exacta</strong>
          <span id="aguaMl">{hasResult ? formatMlAndOz(waterMl, 0, 1) : '—'}</span>
        </div>

        <div className="tile tarjeta-dato">
          <strong>⚗️ Concentración final</strong>
          <span id="verificacion">{hasResult ? `${formatNumber(finalTarget, 2)}%` : '—'}</span>
        </div>

        <div className="tile tarjeta-dato">
          <strong>📦 Volumen total</strong>
          <span id="volumenFinal">
            {hasResult
              ? `${formatNumber(totalSolutionMl / 1000, 2)} L / ${formatNumber(totalSolutionMl, 0)} ml`
              : '—'}
          </span>
        </div>
      </div>

      <section className="formula-card tarjeta-informativa" aria-live="polite">
        <h3>Fórmula detallada</h3>
        <p id="formulaVolume" className="formula-line formula-line--volume">
          {renderFormulaRichText(hasResult ? currentRecommendation?.formulaVolume : undefined)}
        </p>
        <p id="formulaConcentration" className="formula-line formula-line--concentration">
          {renderFormulaRichText(hasResult ? currentRecommendation?.formulaConcentration : undefined)}
        </p>
        <p id="formulaFinal" className="formula-line formula-line--final">
          {renderFormulaRichText(hasResult ? currentRecommendation?.formulaFinal : undefined)}
        </p>
      </section>

      <div className="alert error" id="error" style={{ display: error ? 'block' : 'none' }}>
        {error}
      </div>

      <ShareActions shareFeedback={shareFeedback} onShare={() => void shareResult()} />

      <p className="notes">
        <b>Rutina práctica:</b> Carga primero agua, incorpora el arterial concentrado, completa volumen y reevalúa drenaje,
        distensión y necesidad de refuerzo en cada etapa.
      </p>
    </article>
  );
});
