/**
 * Barra visual de proporciones arterial/agua.
 * Usa transformaciones (`scaleX`) para animar con costo bajo en GPU.
 */

import { memo } from 'react';
import { formatNumber } from '../utils/formatters';

interface MixProgressProps {
  arterialMl: number;
  waterMl: number;
  totalSolutionMl: number;
}

export const MixProgress = memo(function MixProgress({ arterialMl, waterMl, totalSolutionMl }: MixProgressProps) {
  const arterialPct = totalSolutionMl > 0 ? (arterialMl / totalSolutionMl) * 100 : 0;
  const waterPct = totalSolutionMl > 0 ? (waterMl / totalSolutionMl) * 100 : 0;

  // La UI siempre trabaja en porcentajes para mantener la lectura rápida.
  return (
    <div className="mix-progress bloque-mezcla" aria-live="polite">
      <div className="mix-progress__head">
        <span id="mixChemicalPct">Arterial: {formatNumber(arterialPct, 1)}%</span>
        <span id="mixWaterPct">Agua: {formatNumber(waterPct, 1)}%</span>
      </div>

      <div className="mix-progress__track" role="img" aria-label="Proporción visual de arterial y agua en la mezcla">
        <div
          className="mix-progress__bar mix-progress__bar--chemical"
          id="mixChemicalBar"
          style={{ transform: `scaleX(${(arterialPct / 100).toFixed(4)})` }}
        ></div>
        <div
          className="mix-progress__bar mix-progress__bar--water"
          id="mixWaterBar"
          style={{ transform: `scaleX(${(waterPct / 100).toFixed(4)})` }}
        ></div>
      </div>

      <p className="mix-progress__explain" id="mixExplain">
        {formatNumber(arterialMl, 0)} ml de arterial y {formatNumber(waterMl, 0)} ml de agua.
      </p>
    </div>
  );
});
