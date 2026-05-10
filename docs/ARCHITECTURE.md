# Arquitectura Técnica (Guía Pedagógica)

## Objetivo de la arquitectura

El proyecto está diseñado para separar responsabilidades en capas claras:

1. **Presentación (UI)**: componentes React en `src/components`.
2. **Orquestación de estado**: hooks de contexto en `src/hooks`.
3. **Lógica pura de negocio**: funciones en `src/utils`.
4. **Estilos globales y sistema visual**: `src/styles/style.css`.

La meta es que puedas cambiar la interfaz sin tocar fórmulas, o ajustar fórmulas sin romper la interfaz.

## Flujo general de datos (de arriba hacia abajo)

1. `main.tsx` monta React en el `div#root` de `index.html`.
2. `App.tsx` envuelve la app con `CalculatorProvider`.
3. `HomePage.tsx` compone el layout principal (`ThemeToggle`, `Calculator`, `AudioPlayer`).
4. `FormSection` actualiza el estado del formulario vía `useCalculatorForm`.
5. `CalculatorProvider` valida y recalcula con `utils/calculator.ts`.
6. `ResultsSection` consume el estado de resultados vía `useCalculatorResults`.
7. React reconcilia y actualiza el DOM real con cambios mínimos.

## Capas y dependencias

- `components` puede depender de `hooks` y `utils` de formato.
- `hooks` depende de `utils` (cálculo, constantes, formateo).
- `utils` **no depende** de React (es lógica pura y reutilizable).

## Decisiones técnicas clave

1. **Contexto dividido en formulario/resultados**: reduce re-renderes innecesarios mientras se escribe.
2. **Cálculo desacoplado en utilidades puras**: facilita pruebas y mantenimiento.
3. **Tema con transición liviana**: evita efectos caros en móviles modestos.
4. **Carga diferida de audio**: prioriza render inicial.
5. **Componentes pequeños y especializados**: cada componente tiene una responsabilidad clara.

## Relación con el proyecto original

- El comportamiento de cálculo viene del `script.js` original y fue migrado a `utils/calculator.ts` + `useCalculatorContext.tsx`.
- La estructura visual del `index.html` original se convirtió en componentes React.
- El cambio de tema de `theme-init.js` + script original se migró a `useTheme.ts`.
- Los assets se mantienen en `public/assets` para conservar rutas compatibles (`/assets/...`).
