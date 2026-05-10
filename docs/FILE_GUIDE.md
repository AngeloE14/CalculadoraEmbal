# Guía de Archivos Importantes

Esta guía responde explícitamente cuatro preguntas por archivo:

1. **Qué hace**
2. **Por qué existe**
3. **Cómo se conecta con otros archivos**
4. **Qué parte proviene del proyecto original**

## Núcleo de arranque

### `index.html`

- **Qué hace**: define el documento base y el contenedor `#root`.
- **Por qué existe**: React necesita un punto de montaje en el DOM real.
- **Conexiones**: carga `src/main.tsx` y `public/assets/js/theme-init.js`.
- **Origen original**: hereda metadatos, favicons y base del HTML tradicional.

### `public/assets/js/theme-init.js`

- **Qué hace**: aplica tema guardado antes de que React renderice.
- **Por qué existe**: evitar “flash” de tema incorrecto al cargar.
- **Conexiones**: `index.html` lo ejecuta antes de `main.tsx`; `useTheme` usa misma clave de storage.
- **Origen original**: corresponde al mecanismo de tema previo en JS tradicional.

### `src/main.tsx`

- **Qué hace**: monta React en `#root`.
- **Por qué existe**: es el entrypoint del bundle en Vite.
- **Conexiones**: importa `App.tsx` y `style.css`.
- **Origen original**: reemplaza la inicialización manual del script clásico.

### `src/App.tsx`

- **Qué hace**: define la raíz de componentes y providers.
- **Por qué existe**: centraliza el estado global de la calculadora.
- **Conexiones**: envuelve `HomePage` con `CalculatorProvider`.
- **Origen original**: equivalente estructural al “contenedor principal” del HTML antiguo.

## Página y composición

### `src/pages/HomePage.tsx`

- **Qué hace**: compone la pantalla principal.
- **Por qué existe**: separa “pantalla” de componentes internos.
- **Conexiones**: usa `ThemeToggle`, `Calculator` y `AudioPlayer` (lazy).
- **Origen original**: refleja la distribución de bloques de la página única original.

### `src/components/Calculator.tsx`

- **Qué hace**: une header, formulario, resultados y footer.
- **Por qué existe**: encapsular la región funcional de cálculo.
- **Conexiones**: `Header`, `FormSection`, `ResultsSection`, `Footer`.
- **Origen original**: representa el contenido central de cálculo del HTML legacy.

### `src/components/Header.tsx`

- **Qué hace**: agrupa cabecera visual.
- **Por qué existe**: mantener UI en bloques simples y reutilizables.
- **Conexiones**: `LogoSection` + `HeroSection`.
- **Origen original**: conserva cabecera original con identidad visual.

### `src/components/Footer.tsx`

- **Qué hace**: encapsula la parte inferior.
- **Por qué existe**: mantener composición limpia y escalable.
- **Conexiones**: renderiza `SocialSection`.
- **Origen original**: corresponde al bloque de redes del proyecto anterior.

## Componentes UI de contenido

### `src/components/LogoSection.tsx`

- **Qué hace**: muestra logo e ilustración animada.
- **Por qué existe**: aislar un bloque visual con estilos complejos.
- **Conexiones**: se monta dentro de `Header`.
- **Origen original**: migración directa del bloque de logo del HTML.

### `src/components/HeroSection.tsx`

- **Qué hace**: presenta título y descripción.
- **Por qué existe**: separar copy de otras piezas visuales.
- **Conexiones**: se monta dentro de `Header`.
- **Origen original**: mantiene texto principal original.

### `src/components/FormSection.tsx`

- **Qué hace**: captura inputs y presets de cálculo.
- **Por qué existe**: controlar entradas con estado React declarado.
- **Conexiones**: consume `useCalculatorForm`, usa `profiles.ts` y `formatters.ts`.
- **Origen original**: migra formulario y selector que antes se manipulaba con DOM API.

### `src/components/ResultsSection.tsx`

- **Qué hace**: muestra fórmula, métricas, alertas y compartir.
- **Por qué existe**: separar claramente visualización de resultados.
- **Conexiones**: consume `useCalculatorResults`; integra `MixProgress` y `ShareActions`.
- **Origen original**: deriva del panel de resultados y mensajes del script legado.

### `src/components/MixProgress.tsx`

- **Qué hace**: visualiza proporción arterial/agua.
- **Por qué existe**: aislar la representación gráfica de mezcla.
- **Conexiones**: recibe props desde `ResultsSection`.
- **Origen original**: reemplaza actualización manual de barras por render declarativo.

### `src/components/ShareActions.tsx`

- **Qué hace**: botón compartir + feedback.
- **Por qué existe**: encapsular acción y estado visual de compartido.
- **Conexiones**: recibe callback desde `ResultsSection`.
- **Origen original**: migra CTA de compartir del script clásico.

### `src/components/SocialSection.tsx`

- **Qué hace**: muestra redes sociales y correo.
- **Por qué existe**: desacoplar enlaces de contacto del resto de la UI.
- **Conexiones**: se usa en `Footer`.
- **Origen original**: conserva la sección social del footer tradicional.

### `src/components/ThemeToggle.tsx`

- **Qué hace**: cambia tema.
- **Por qué existe**: componente de interacción global.
- **Conexiones**: consume `useTheme`.
- **Origen original**: reemplaza botón flotante y listeners manuales previos.

### `src/components/AudioPlayer.tsx`

- **Qué hace**: reproduce audio de bienvenida una sola vez.
- **Por qué existe**: mantener comportamiento heredado respetando políticas modernas de autoplay.
- **Conexiones**: cargado por `HomePage` con `lazy`.
- **Origen original**: migración del comportamiento de audio del JS antiguo.

## Hooks de estado y comportamiento

### `src/hooks/useCalculatorContext.tsx`

- **Qué hace**: provider global con validación, cálculo, animación y compartir.
- **Por qué existe**: centralizar reglas de estado fuera de componentes visuales.
- **Conexiones**: usa `calculator.ts`, `formatters.ts`, `constants.ts` y expone contextos.
- **Origen original**: migra la lógica principal de `script.js`.

### `src/hooks/calculatorContext.ts`

- **Qué hace**: define contratos TypeScript y contextos React (`form` y `results`).
- **Por qué existe**: tipado claro y separación de suscripciones para rendimiento.
- **Conexiones**: consumido por `useCalculator.ts` y `useCalculatorContext.tsx`.
- **Origen original**: evolución arquitectónica de la migración React.

### `src/hooks/useCalculator.ts`

- **Qué hace**: expone hooks consumidores del contexto.
- **Por qué existe**: evitar repetir `useContext` y validaciones en componentes.
- **Conexiones**: usado por `FormSection` y `ResultsSection`.
- **Origen original**: reemplaza acceso global implícito del JS tradicional.

### `src/hooks/useTheme.ts`

- **Qué hace**: maneja tema, persistencia y transición.
- **Por qué existe**: encapsular lógica global de apariencia.
- **Conexiones**: usado por `ThemeToggle`; sincronizado con `theme-init.js`.
- **Origen original**: migra lógica de tema de `script.js`/`theme-init.js`.

### `src/hooks/useEmbalmingCalculator.ts`

- **Qué hace**: alias de compatibilidad (`useCalculator`).
- **Por qué existe**: evitar ruptura de imports históricos.
- **Conexiones**: reexporta desde `useCalculator.ts`.
- **Origen original**: soporte de migración gradual.

## Lógica pura y utilidades

### `src/utils/constants.ts`

- **Qué hace**: concentra constantes de cálculo y contratos TypeScript.
- **Por qué existe**: evitar valores mágicos y duplicación.
- **Conexiones**: usado en hooks y utilidades.
- **Origen original**: valores del dominio extraídos de `script.js`.

### `src/utils/profiles.ts`

- **Qué hace**: define perfiles clínicos, químicos y presets.
- **Por qué existe**: aislar catálogo/configuración del motor de cálculo.
- **Conexiones**: usado por `calculator.ts` y `FormSection.tsx`.
- **Origen original**: estructuras de perfiles del proyecto tradicional.

### `src/utils/formatters.ts`

- **Qué hace**: parseo/formato numérico y conversiones.
- **Por qué existe**: estandarizar presentación y entrada de números.
- **Conexiones**: usado por UI y provider.
- **Origen original**: helpers equivalentes del JS anterior.

### `src/utils/calculator.ts`

- **Qué hace**: valida entradas y produce recomendación final.
- **Por qué existe**: separar negocio de React (funciones puras).
- **Conexiones**: llamado desde `useCalculatorContext.tsx`.
- **Origen original**: núcleo matemático migrado de `script.js`.

## Estilos

### `src/styles/global.css`

- **Qué hace**: define tema, layout, animaciones, estados y responsividad global.
- **Por qué existe**: preservar estética original y modernizar rendimiento móvil.
- **Conexiones**: importado por `main.tsx`, usado por todas las clases globales.
- **Origen original**: evolución del CSS tradicional con optimizaciones para React/móvil.

### `src/styles/components/`

- **Qué hace**: guarda estilos específicos para cada componente.
- **Por qué existe**: separar visuales por responsabilidad y mejorar mantenimiento.
- **Conexiones**: cada componente importa su propio CSS desde `../styles/components/...`.
- **Origen original**: refactor de estilos del archivo global único hacia hojas por componente.

