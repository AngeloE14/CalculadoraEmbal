/**
 * Formulario principal controlado por React.
 * Origen: bloque de formulario del index.html original.
 */

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useCalculatorForm } from '../hooks/useCalculator';
import { DEFAULT_CHEMICAL_LABEL } from '../utils/constants';
import { parseInputNumber } from '../utils/formatters';
import { CHEMICAL_OPTIONS, PRESET_BUTTONS } from '../utils/profiles';

export const FormSection = memo(function FormSection() {
  const {
    inputs,
    selectedChemical,
    isConcentradoLocked,
    updateInput,
    selectChemical,
    clearChemicalSelection,
    applyPreset,
  } = useCalculatorForm();

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRootRef = useRef<HTMLDivElement | null>(null);
  const chemicalListId = 'comboConcentradoList';
  const selectedChemicalLabel = selectedChemical?.label ?? DEFAULT_CHEMICAL_LABEL;
  const objectiveValue = useMemo(() => parseInputNumber(inputs.objetivoManual), [inputs.objetivoManual]);

  // Cierra el combo cuando se pulsa fuera, para mantener UX táctil clara.
  useEffect(() => {
    const handleDocumentPointerDown = (event: globalThis.PointerEvent) => {
      if (!selectRootRef.current?.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handleDocumentPointerDown);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSelectOpen(false);
      }
    };

    if (isSelectOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isSelectOpen]);

  const isPresetButtonActive = (min?: number, max?: number) => {
    if (objectiveValue === null) {
      return false;
    }
    if (min !== undefined && objectiveValue < min) {
      return false;
    }
    if (max !== undefined && objectiveValue > max) {
      return false;
    }
    return min !== undefined || max !== undefined;
  };

  return (
    <article className="box tarjeta-interactiva">
      <div className="field">
        <label htmlFor="concentrado">Concentración del químico arterial en botella (%)</label>
        <input
          id="concentrado"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Ej. 30"
          autoComplete="off"
          inputMode="decimal"
          value={inputs.concentrado}
          readOnly={isConcentradoLocked}
          onChange={(event) => updateInput('concentrado', event.target.value)}
          onFocus={() => {
            if (isConcentradoLocked) {
              clearChemicalSelection();
            }
          }}
          onPointerDown={() => {
            if (isConcentradoLocked) {
              clearChemicalSelection();
            }
          }}
        />

        <label htmlFor="comboConcentrado" className="combo-label">
          Selecciona un químico arterial
        </label>

        <div
          className="custom-select"
          id="comboConcentrado"
          ref={selectRootRef}
        >
          <button
            className="select-selected"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isSelectOpen}
            aria-controls={chemicalListId}
            onClick={() => setIsSelectOpen((previous) => !previous)}
          >
            {selectedChemicalLabel}
          </button>
          <div className={`select-items ${isSelectOpen ? '' : 'select-hide'}`} id={chemicalListId} role="listbox">
            {CHEMICAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                className="select-item"
                type="button"
                role="option"
                aria-selected={selectedChemical?.value === option.value}
                data-value={option.value}
                onClick={() => {
                  selectChemical(option);
                  setIsSelectOpen(false);
                }}
              >
                <img src={option.image} alt={option.label} width={48} height={48} loading="lazy" decoding="async" />{' '}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="peso">Peso estimado (kg)</label>
          <input
            id="peso"
            type="number"
            min="1"
            step="1"
            placeholder="Opcional. Ej. 80"
            autoComplete="off"
            inputMode="decimal"
            value={inputs.peso}
            onChange={(event) => updateInput('peso', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="volumenPreparar">Volumen final a preparar (litros)</label>
          <input
            id="volumenPreparar"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Ej. 2"
            autoComplete="off"
            inputMode="decimal"
            value={inputs.volumenPrepararLitros}
            onChange={(event) => updateInput('volumenPrepararLitros', event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="objetivo">Concentración deseada en el tanque (%)</label>
        <input
          id="objetivo"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Si lo dejas vacío, se calcula automáticamente"
          autoComplete="off"
          inputMode="decimal"
          value={inputs.objetivoManual}
          onChange={(event) => updateInput('objetivoManual', event.target.value)}
        />
      </div>

      <div className="presets" aria-label="Ajustes rápidos de concentración">
        {PRESET_BUTTONS.map((preset) => (
          <button
            key={preset.key}
            className={`chip ${isPresetButtonActive(preset.min, preset.max) ? 'chip--active' : ''}`}
            type="button"
            data-preset={preset.key}
            data-min={preset.min}
            data-max={preset.max}
            data-set={preset.set}
            aria-pressed={isPresetButtonActive(preset.min, preset.max)}
            onClick={() => applyPreset(preset.set)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p className="auto-hint" role="status">
        Calculo en tiempo real.
      </p>
      <p className="notes">
        <b>Base del cálculo:</b> Si escribes volumen final, se usa ese total exacto. Si lo dejas vacío, se estima por peso.
        Dilución <code>C1·V1 = C2·V2</code>.
      </p>
    </article>
  );
});
