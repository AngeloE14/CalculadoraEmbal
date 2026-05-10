# Guía de Desarrollo y Validación

## Requisitos

- Node.js LTS
- npm

## Instalación

```bash
npm install
```

## Flujo recomendado de trabajo

1. Ejecuta desarrollo:

```bash
npm run dev
```

2. Haz cambios en componentes/hooks/utils.
3. Valida build y lint antes de cerrar fase:

```bash
npm run lint
npm run build
```

## Pruebas en móvil real (Android/iOS)

1. Levanta servidor en LAN:

```bash
npm run dev:lan
```

2. Obtén IP local:

```bash
npm run lan:ip
```

3. Abre en el teléfono (misma red):

```text
http://<TU_IP_LOCAL>:4173/
```

## Checklist de rendimiento móvil

- Cambio de tema fluido (sin congelamientos perceptibles).
- Sin `transition: all` en elementos interactivos.
- Animaciones principales con `transform`/`opacity`.
- Evitar `filter/blur` durante transiciones críticas.
- Verificar respuesta táctil de botones y chips.

## Checklist de calidad de código

- Sin código muerto ni duplicado.
- Componentes con responsabilidad única.
- Hooks custom con contrato claro.
- Lógica de negocio aislada en `src/utils`.
- Comentarios pedagógicos útiles, no ruido.

