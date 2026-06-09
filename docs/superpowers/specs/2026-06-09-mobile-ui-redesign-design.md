# Mobile UI Redesign: Archery Metrics

## Goal

Rediseñar la UI con un patrón de app móvil nativa (app shell con navegación inferior), manteniendo la identidad visual actual (tema oscuro + dorado/colores de diana) y sin tocar la lógica de cálculo ni el modelo de datos.

El usuario delegó las decisiones de diseño ("te dejo a tu elección"). Este documento registra las decisiones tomadas y su justificación.

## Problemas de la UI actual en móvil

1. **Header pesado**: título + dos grupos de toggles (idioma/unidades) + menú ocupan ~140px sticky permanentes.
2. **Tabs arriba**: la navegación principal está fuera del alcance del pulgar.
3. **Resultados bajo el formulario**: la lectura principal (match index) exige scroll; se parchea con una barra sticky + IntersectionObserver.
4. **Patrones de escritorio**: menú dropdown para guardar/cargar, modal centrado para la base de datos.
5. **Tipografía rota en móvil**: la pila `Bahnschrift / Aptos / Segoe UI` solo existe en Windows; en Android/iOS cae a la sans genérica y la app pierde identidad.

## Enfoques considerados

- **A. Pulido conservador** — refinar espaciados/colores sin tocar estructura. Bajo riesgo, pero no resuelve los problemas 1–4.
- **B. App shell móvil (elegido)** — navegación inferior con 4 vistas, header compacto, bottom sheets, tira de estado persistente, tipografía empaquetada. Resuelve todos los problemas manteniendo la lógica intacta.
- **C. Wizard por pasos** — flujo guiado arco→flecha→cuerda→resultado. Bueno para primer uso, pero el caso de uso real es iterativo (ajustar valores y ver el match en vivo); añadiría clics en cada iteración.

## Diseño

### 1. App shell y navegación

- **`BottomNav` (nuevo)**: barra fija inferior con 4 destinos — Arco, Flecha, Cuerda, Resultados — con iconos lucide y etiqueta corta. Altura ~64px + `safe-area-inset-bottom`. Activo: dorado con indicador superior.
  - Los ítems de formulario muestran un punto de progreso (completo = dorado).
  - El ítem Resultados muestra un punto con el color del estado del match (rojo/dorado/azul) cuando hay `matchIndex`.
- **`ActiveTab`** pasa a `'bow' | 'arrow' | 'string' | 'results'`. La vista Resultados agrupa: `ResultsSummary`, `TuningAssistant`, alertas y `SetupComparator` (hoy apilados bajo el formulario).
- **`StatusStrip` (nuevo)**: tira fina dockeada sobre la BottomNav, visible solo en vistas de formulario cuando hay `matchIndex`. Muestra estado + índice; al tocarla navega a Resultados. Sustituye a la barra sticky + IntersectionObserver actuales (se eliminan).

### 2. Header compacto

- Una sola fila (~56px): kicker + título a la izquierda; botón de ajustes (engranaje) a la derecha que abre `SettingsSheet`.
- `Toolbar.tsx` desaparece del header; su contenido migra al sheet.

### 3. Bottom sheets

- **`BottomSheet` (nuevo, reutilizable)**: backdrop con blur, panel deslizante desde abajo con esquinas superiores redondeadas, asa de arrastre visual, cierre por backdrop/botón, `safe-area`, respeta `prefers-reduced-motion`.
- **`SettingsSheet` (nuevo)**: idioma (ES/EN), unidades (imperial/métrico), slots guardar/cargar 1–3 con resumen (reutiliza la lógica de `readSlotSummary`), y "borrar todo".
- **`DatabasePanel`**: se refactoriza para renderizarse dentro de `BottomSheet` en vez del modal centrado; el contenido (selects en cascada, preview, confirmación) se conserva.

### 4. Tipografía y tokens

- Añadir fuentes empaquetadas (sin red, vía pnpm): **Archivo Variable** (`@fontsource-variable/archivo`) para UI/display y **JetBrains Mono** (`@fontsource/jetbrains-mono`, pesos 400/600) para lecturas numéricas. La pila actual queda como fallback.
- Refinar tokens en `index.css`: mantener paleta (dorado #D4A017, rojo/azul de diana, fondos oscuros), ajustar jerarquía: el uppercase+tracking ancho queda solo para micro-etiquetas; títulos pasan a peso/tamaño en vez de mayúsculas.
- Vista Resultados con jerarquía de héroe: estado del match más grande, gauge refinado conservando el motivo de anillos de diana.

### 5. Escritorio (lg ≥1024px)

- Layout de dos columnas (máx ~1100px): formularios a la izquierda con un control segmentado de 3 secciones bajo el header (`SectionTabs`, componente pequeño nuevo, visible solo en lg+); panel de resultados sticky a la derecha (siempre visible, sin pestaña Resultados).
- `BottomNav` y `StatusStrip` ocultos en lg+.

### 6. Meta móvil

- `index.html`: `viewport-fit=cover`, `theme-color`, título "Archery Metrics". Sin manifest ni service worker (fuera de alcance).

## Sin cambios (explícitamente)

- Lógica de cálculo (`archeryCalculator`, `tuningAssistant`, `setupComparison`, `unitSystem`).
- Modelo de estado de `App.tsx` (specs/weights/unit system) y claves de `localStorage`.
- i18n: mismo mecanismo; se añaden claves nuevas (nav, sheet) en ES y EN.
- `InputField`/`SelectField`/`FieldGroup`/`FormSection`: se conservan con ajustes visuales menores (alturas ≥48px, espaciado).

## Manejo de errores y accesibilidad

- Touch targets ≥44px en toda la navegación y sheets.
- `aria-current` en BottomNav; los sheets cierran con Escape y devuelven el foco al disparador.
- `role="status"`/`aria-live` se conservan en resultados.
- Animaciones solo con transform/opacity y desactivadas con `prefers-reduced-motion` (mecanismo ya existente).

## Testing y verificación

- Los tests existentes (vitest, lógica de cálculo) deben seguir en verde: `npm test`.
- `npm run lint` y `npm run build` sin errores.
- Verificación manual con `npm run dev` en viewport móvil (375×812) y escritorio (1280+): navegación entre las 4 vistas, sheets, status strip, guardado/carga, base de datos, cambio de idioma/unidades.

## Archivos afectados

- Nuevos: `src/components/BottomNav.tsx`, `src/components/StatusStrip.tsx`, `src/components/BottomSheet.tsx`, `src/components/SettingsSheet.tsx`, `src/components/SectionTabs.tsx`.
- Modificados: `src/App.tsx`, `src/index.css`, `src/i18n.tsx`, `src/components/DatabasePanel.tsx`, `index.html`, `package.json` (fuentes), ajustes menores en `InputField`/`FormSection`/`ResultsSummary`.
- Eliminados: `src/components/Toolbar.tsx`, `src/components/TabNavigation.tsx` (sustituidos por SettingsSheet y BottomNav/SectionTabs).
