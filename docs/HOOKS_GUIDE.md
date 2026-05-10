# Hooks del Proyecto (Explicación Pedagógica)

## 1. `useCalculatorForm`

- **Para qué sirve**: leer/escribir solo el estado del formulario.
- **Cómo funciona internamente**: consume `CalculatorFormContext` con `useContext`.
- **Por qué se usa ahí**: `FormSection` necesita alta frecuencia de actualizaciones (tecleo).
- **Qué problema resuelve**: evita que componentes de resultados se suscriban a cambios de cada tecla.

## 2. `useCalculatorResults`

- **Para qué sirve**: leer estado de resultados, errores, animación y compartir.
- **Cómo funciona internamente**: consume `CalculatorResultsContext`.
- **Por qué se usa ahí**: `ResultsSection` necesita datos derivados del cálculo, no campos crudos del formulario.
- **Qué problema resuelve**: reduce re-renderes innecesarios del panel de resultados durante edición.

## 3. `useCalculator` (compatibilidad)

- **Para qué sirve**: API antigua que une formulario + resultados.
- **Cómo funciona internamente**: combina `useCalculatorForm` y `useCalculatorResults` con `useMemo`.
- **Por qué se usa ahí**: mantener retrocompatibilidad con nombres previos.
- **Qué problema resuelve**: permite migrar sin romper imports heredados.

## 4. `useTheme`

- **Para qué sirve**: controlar tema claro/oscuro.
- **Cómo funciona internamente**:
  1. Lee preferencia guardada (`localStorage`).
  2. Si no hay preferencia, usa `prefers-color-scheme`.
  3. Escribe `data-theme` en `document.documentElement`.
  4. Ejecuta transición visual ligera.
  5. Escucha cambios del sistema.
- **Por qué se usa ahí**: el tema es transversal y debe vivir fuera de componentes visuales específicos.
- **Qué problema resuelve**: persistencia de tema + transición fluida + compatibilidad móvil.

## 5. `useEmbalmingCalculator`

- **Para qué sirve**: alias de compatibilidad histórica.
- **Cómo funciona internamente**: reexporta `useCalculator`.
- **Por qué se usa ahí**: preservar nombres usados en fases previas del proyecto.
- **Qué problema resuelve**: continuidad durante la migración.

## 6. Hooks React usados en este proyecto

### `useState`

- **Uso en proyecto**: inputs, toggle de tema, feedback, errores y banderas de animación.
- **Problema que resuelve**: almacenamiento local de estado reactivo sin manipulación DOM manual.

### `useEffect`

- **Uso en proyecto**: listeners (`pageshow`, teclado, puntero, media queries), autoplay, sincronización de tema.
- **Problema que resuelve**: ejecutar efectos secundarios después del render de React.

### `useMemo`

- **Uso en proyecto**: derivaciones (`caseData`, valores de contexto, parseos específicos).
- **Problema que resuelve**: evitar cálculos/referencias recreadas sin necesidad.

### `useCallback`

- **Uso en proyecto**: acciones del contexto (`updateInput`, `shareResult`, `applyPreset`, etc.).
- **Problema que resuelve**: estabilidad de referencias para reducir renders y dependencias inestables.

### `useRef`

- **Uso en proyecto**: referencias DOM (`audio`, combo custom) y flags sin render (`lastSignature`).
- **Problema que resuelve**: guardar valores mutables sin disparar render.

### `lazy` y `Suspense`

- **Uso en proyecto**: carga diferida de `AudioPlayer`.
- **Problema que resuelve**: reducir trabajo inicial de render y mejorar tiempo de interacción.

