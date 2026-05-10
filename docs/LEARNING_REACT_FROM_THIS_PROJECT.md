# Guía de Aprendizaje: de HTML/CSS/JS Tradicional a React

## 1. ¿Qué reemplaza React en un proyecto tradicional?

### Antes (tradicional)

- `index.html` contenía casi toda la estructura.
- `script.js` buscaba nodos con `getElementById`, escuchaba eventos y modificaba el DOM manualmente.
- El estado estaba implícito en variables sueltas y/o en el propio DOM.

### Ahora (React)

- `index.html` solo contiene el contenedor raíz (`#root`) y metadatos globales.
- `main.tsx` monta React en ese contenedor.
- La estructura de UI vive en componentes (`Header`, `FormSection`, `ResultsSection`, etc.).
- El estado vive en hooks/contexto, no en mutaciones directas del DOM.

## 2. ¿Qué reemplaza al `script.js`?

En este proyecto, el trabajo que antes hacía `script.js` se reparte en capas:

1. `src/hooks/useCalculatorContext.tsx`: orquesta estado, validación, cálculo, compartir y animación.
2. `src/utils/calculator.ts`: motor matemático puro (sin React).
3. `src/utils/formatters.ts`: parseo y formato de números.
4. `src/hooks/useTheme.ts`: control completo de tema.

## 3. ¿Qué reemplaza al `index.html` original grande?

Lo reemplaza la combinación:

- `index.html` mínimo (solo shell del documento).
- `App.tsx` + `HomePage.tsx` + componentes de `src/components` para construir la UI declarativamente.

Piensa en esto así: **HTML grande -> árbol de componentes React**.

## 4. Flujo completo de React en este proyecto

1. `index.html` carga `main.tsx`.
2. `main.tsx` hace `createRoot(...).render(<App />)`.
3. `App.tsx` coloca `CalculatorProvider` alrededor de la app.
4. `HomePage.tsx` compone la pantalla principal.
5. `FormSection` actualiza estado del formulario.
6. El provider ejecuta validación/cálculo (con debounce).
7. `ResultsSection` reacciona al nuevo estado y renderiza resultados.
8. React compara árbol anterior/nuevo (reconciliación) y actualiza solo lo necesario en el DOM real.

## 5. ¿Cómo fluye el estado entre componentes?

- El estado global vive en `CalculatorProvider`.
- `FormSection` usa `useCalculatorForm` para escribir datos de entrada.
- `ResultsSection` usa `useCalculatorResults` para leer resultados.
- Esta separación reduce re-renderes cuando el usuario teclea.

## 6. ¿Cómo React reemplaza manipulación manual del DOM?

### Tradicional

- “Si cambia X, entonces busca elemento Y y cámbiale texto/clase/estilo”.

### React

- “Si cambia X (estado), React vuelve a ejecutar el render y describe cómo debe verse la UI”.
- React decide qué nodos reales tocar (diff/reconciliación).

Resultado: menos errores de sincronización y más mantenibilidad.

## 7. Renderizado reactivo explicado simple

Renderizado reactivo significa:

- **Tu UI es una función del estado actual**.
- Si el estado cambia, la UI se recalcula automáticamente.
- No tienes que recordar “actualizar manualmente cada etiqueta afectada”.

## 8. ¿Por qué separar lógica pura y UI?

Porque te permite:

1. Cambiar diseño sin romper fórmulas.
2. Probar fórmulas sin montar React.
3. Escalar el proyecto con menos acoplamiento.

## 9. Diferencias mentales clave para aprender React

1. De “manipular nodos” a “declarar interfaces”.
2. De “scripts globales” a “componentes con responsabilidad única”.
3. De “estado oculto en DOM” a “estado explícito en hooks”.

## 10. Resumen rápido del mapeo mental

- `index.html` grande -> componentes React.
- `script.js` global -> hooks + utilidades puras.
- Mutación manual DOM -> render declarativo.
- Estado disperso -> contexto tipado y centralizado.

