# Componentes React (Mapa Completo)

## Árbol de componentes

```text
App
└── CalculatorProvider
    └── HomePage
        ├── ThemeToggle
        ├── Calculator
        │   ├── Header
        │   │   ├── LogoSection
        │   │   └── HeroSection
        │   ├── FormSection
        │   ├── ResultsSection
        │   │   ├── MixProgress
        │   │   └── ShareActions
        │   └── Footer
        │       └── SocialSection
        └── AudioPlayer (lazy)
```

## Ficha de cada componente

### `HomePage`

- **Responsabilidad**: componer la pantalla principal.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `lazy`, `Suspense`.
- **Renderiza**: fondo ambiental, toggle de tema, panel calculadora y audio en carga diferida.
- **Interacción**: conecta layout global con `Calculator`.

### `ThemeToggle`

- **Responsabilidad**: alternar modo claro/oscuro.
- **Props**: no recibe.
- **Estado local**: no maneja (consume hook).
- **Hooks usados**: `useTheme` (custom).
- **Renderiza**: botón flotante con icono/etiqueta dinámica.
- **Interacción**: actualiza `data-theme` del documento mediante `useTheme`.

### `Calculator`

- **Responsabilidad**: ensamblar secciones funcionales de la calculadora.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: `Header`, `FormSection`, `ResultsSection`, `Footer`.
- **Interacción**: actúa como contenedor visual del flujo principal.

### `Header`

- **Responsabilidad**: agrupar cabecera visual.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: `LogoSection` y `HeroSection`.
- **Interacción**: organiza identidad + contexto textual.

### `LogoSection`

- **Responsabilidad**: mostrar logotipo y efecto visual de temporada.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: imagen principal y pétalos decorativos.
- **Interacción**: solo visual (sin eventos de estado).

### `HeroSection`

- **Responsabilidad**: mostrar título/subtexto principal.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: encabezado semántico de la calculadora.
- **Interacción**: informativa.

### `FormSection`

- **Responsabilidad**: capturar entradas del usuario.
- **Props**: no recibe.
- **Estado local**:
  - `isSelectOpen` (abre/cierra combo de químicos).
- **Hooks usados**:
  - React: `memo`, `useState`, `useMemo`, `useEffect`, `useRef`.
  - Custom: `useCalculatorForm`.
- **Renderiza**:
  - campos numéricos,
  - selector de químico,
  - botones preset,
  - notas de ayuda.
- **Interacción**:
  - escribe en el contexto de formulario,
  - dispara recalculo indirecto en el provider,
  - cierra combo al hacer clic fuera o presionar `Escape`.

### `ResultsSection`

- **Responsabilidad**: presentar resultado calculado y feedback.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**:
  - React: `memo`.
  - Custom: `useCalculatorResults`.
- **Renderiza**:
  - bloque principal de fórmula,
  - barra de proporción (`MixProgress`),
  - métricas resumidas,
  - fórmulas detalladas,
  - errores,
  - botón compartir (`ShareActions`).
- **Interacción**:
  - responde a cambios del estado de resultados,
  - ejecuta compartir vía `shareResult`.

### `MixProgress`

- **Responsabilidad**: mostrar distribución arterial/agua.
- **Props**:
  - `arterialMl: number`
  - `waterMl: number`
  - `totalSolutionMl: number`
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: barras escaladas con `transform: scaleX(...)` y texto de porcentajes.
- **Interacción**: visualiza datos derivados de `ResultsSection`.

### `ShareActions`

- **Responsabilidad**: ejecutar acción de compartir y mostrar resultado de la acción.
- **Props**:
  - `shareFeedback: string`
  - `onShare: () => void`
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: botón de compartir y etiqueta de feedback.
- **Interacción**: delega la lógica de compartir al provider.

### `Footer`

- **Responsabilidad**: encapsular bloque inferior.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: `SocialSection`.
- **Interacción**: estructural.

### `SocialSection`

- **Responsabilidad**: enlaces de redes/contacto.
- **Props**: no recibe.
- **Estado local**: no maneja.
- **Hooks usados**: `memo`.
- **Renderiza**: tarjetas para Instagram, TikTok y correo.
- **Interacción**: navegación externa.

### `AudioPlayer`

- **Responsabilidad**: reproducir audio de bienvenida una sola vez.
- **Props**: no recibe.
- **Estado local**: no maneja estado React; usa variables internas del efecto.
- **Hooks usados**: `useRef`, `useEffect`.
- **Renderiza**: etiqueta `<audio>` oculta en flujo.
- **Interacción**:
  - intenta autoplay,
  - si el navegador lo bloquea, reintenta al primer gesto del usuario.
