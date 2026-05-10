# CalcEmbal Frontend (React + TypeScript + Vite)

Aplicación web para calcular formulación arterial de embalsamamiento, migrada desde un proyecto tradicional HTML/CSS/JS a una arquitectura React moderna, mantenible y pedagógica.

## Objetivos del proyecto

- Mantener la esencia visual y funcional del sistema original.
- Mejorar mantenibilidad con componentes pequeños y tipado estricto.
- Mejorar rendimiento móvil (especialmente cambio de tema y animaciones).
- Servir como base de aprendizaje real para React.

## Stack

- React 19
- TypeScript
- Vite
- CSS personalizado (sin framework)

## Estructura del proyecto

```text
.
├── public/
│   └── assets/                 # Imágenes, audio y scripts públicos usados por la app
├── src/
│   ├── components/             # Bloques visuales reutilizables de React
│   ├── hooks/                  # Estado global y lógica de interacción
│   ├── pages/                  # Composición de pantallas y páginas
│   ├── styles/                 # Estilos globales y de componentes
│   │   ├── components/         # CSS de cada componente en su propia hoja
│   │   └── global.css          # Estilos compartidos, variables y layout global
│   ├── utils/                  # Lógica pura (cálculo, perfiles, formateo)
│   ├── App.tsx                 # Raíz de componentes
│   └── main.tsx                # Punto de entrada React y carga del CSS global
├── docs/                       # Documentación técnica y pedagógica en español
├── index.html                  # Shell HTML mínimo (contiene #root)
└── vite.config.ts              # Configuración de desarrollo/build
```

## Cómo ejecutar

### 1) Instalar dependencias

```bash
npm install
```

### 2) Desarrollo local

```bash
npm run dev
```

### 3) Desarrollo en red local (móvil)

```bash
npm run dev:lan
npm run lan:ip
```

Luego abre en el celular (misma red Wi-Fi):

```text
http://<TU_IP_LOCAL>:4173/
```

## Build de producción

```bash
npm run build
```

## Preview de build

```bash
npm run preview
# o
npm run preview:lan
```

## Scripts disponibles

- `npm run dev`: servidor de desarrollo.
- `npm run dev:lan`: servidor accesible por LAN.
- `npm run build`: compila TypeScript y genera build optimizado.
- `npm run preview`: sirve el build generado.
- `npm run preview:lan`: preview accesible por LAN.
- `npm run lint`: análisis estático de código.
- `npm run lan:ip`: muestra IP local para pruebas en móvil.

## Arquitectura (resumen)

1. `main.tsx` monta React.
2. `App.tsx` envuelve la UI con `CalculatorProvider`.
3. `FormSection` escribe al contexto de formulario.
4. El provider valida y calcula con utilidades puras.
5. `ResultsSection` consume solo estado de resultados.

## Cómo agregar un nuevo componente

1. Crea archivo en `src/components/NuevoComponente.tsx`.
2. Define responsabilidad única y props tipadas.
3. Si consume estado global, usa el hook mínimo necesario (`useCalculatorForm` o `useCalculatorResults`).
5. Crea la hoja de estilos del componente en `src/styles/components/NuevoComponente.css` y mantenla cerca del componente.
5. Integra el componente en la página/sección correspondiente.

## Buenas prácticas del proyecto

- Mantener lógica de negocio en `src/utils` (sin React).
- Mantener contexto dividido por responsabilidad para minimizar re-renderes.
- Evitar animar propiedades costosas (`filter`, `width`, `height`, `box-shadow` durante theme switch).
- Preferir `transform` y `opacity` para animaciones fluidas.
- Escribir comentarios solo cuando agreguen contexto real de decisión.
- Conservar tipado explícito en interfaces y contratos de contexto.

## Documentación detallada

- Arquitectura: [docs/ARCHITECTURE.md](/home/angelo/Documentos/calculadora-emb-react/docs/ARCHITECTURE.md)
- Componentes (responsabilidades, props, hooks): [docs/COMPONENT_MAP.md](/home/angelo/Documentos/calculadora-emb-react/docs/COMPONENT_MAP.md)
- Hooks del proyecto: [docs/HOOKS_GUIDE.md](/home/angelo/Documentos/calculadora-emb-react/docs/HOOKS_GUIDE.md)
- Guía de archivos importantes: [docs/FILE_GUIDE.md](/home/angelo/Documentos/calculadora-emb-react/docs/FILE_GUIDE.md)
- Guía de aprendizaje React: [docs/LEARNING_REACT_FROM_THIS_PROJECT.md](/home/angelo/Documentos/calculadora-emb-react/docs/LEARNING_REACT_FROM_THIS_PROJECT.md)
- Guía de desarrollo: [docs/DEVELOPMENT_GUIDE.md](/home/angelo/Documentos/calculadora-emb-react/docs/DEVELOPMENT_GUIDE.md)

