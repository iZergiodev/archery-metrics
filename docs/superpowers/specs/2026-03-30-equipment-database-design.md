# Equipment Database Panel

Auto-fill arrow build fields from SFAX shaft, fletching, and nock databases via a modal panel with cascading selectors.

## Problem

When users leave arrow component fields empty (insert weight, fletch, nock, bushing), the spine calculation produces inaccurate results because the SFAX formula compares actual weights against reference values (75gr front mass, 30gr fletch, 12gr rear mass). Missing data shifts the intermediate value significantly, causing spine discrepancies of 10-15% vs FSAX.

## Data Sources

Three CSVs extracted from SFAX in `scripts/sfax-databases/`:

### Shaft (`dec-ShaftData.csv` ~3,900 rows, 49 manufacturers)

Columns: MFG, MDL, SIZE, USE, OD, STKLEN, SPINE, GPI, PI, BPC, STDN

```ts
type ShaftEntry = {
  manufacturer: string    // "Victory Archery"
  model: string           // "3DHV Elite"
  size: string            // "400-FB"
  useCategory: string     // BC/BCd -> 'base', HC/HCd -> 'hunting', TC/TCd -> 'target'
  od: number              // outer diameter in inches
  stockLength: number     // stock length in inches
  spine: number           // static spine deflection
  gpi: number             // grains per inch
  pointInsert: number     // point insert weight in grains (0 = no data)
  bushingPin: number      // bushing/pin/collar weight in grains
  nockWeight: number      // standard nock weight in grains
}
```

### Fletching (`dec-FletchData.csv` ~360 rows)

Columns: MFG, MDL, GRS, LEN, HGT, FTYPE

```ts
type FletchEntry = {
  manufacturer: string    // "AAE"
  model: string           // "Hybrid-20 Shield"
  weight: number          // grains per vane
  length: number          // inches
  height: number          // inches
  type: string            // "Vane" | "Feather"
}
```

### Nock (`dec-NockData.csv` ~470 rows)

Columns: MFG, MDL, GRS, GRSBP

```ts
type NockEntry = {
  manufacturer: string    // "Easton"
  model: string           // "G Pin"
  weight: number          // grains
  bushingPin: number      // extra bushing/pin weight in grains
}
```

## Architecture

### File Structure

```
src/data/equipment/
  types.ts              -- ShaftEntry, FletchEntry, NockEntry type definitions
  shaftDatabase.ts      -- ~3,900 entries, generated from CSV
  fletchDatabase.ts     -- ~360 entries, generated from CSV
  nockDatabase.ts       -- ~470 entries, generated from CSV

scripts/
  generateDatabases.ts  -- Node script: parse CSVs -> generate .ts files

src/components/
  DatabasePanel.tsx     -- Modal panel component
```

### Generation Script

`scripts/generateDatabases.ts` reads the 3 CSVs and outputs typed TypeScript arrays. Run once manually (`node scripts/generateDatabases.ts`), commit the generated files. The CSVs are SFAX 2022 static data.

CSV format uses special line prefixes:
- `*,` lines: file header (e.g., `*,2022 Shafts`) -- skip
- `=,` lines: column header (e.g., `=,MFG,MDL,...`) -- skip
- `-,Name` lines: manufacturer section header -- use as current manufacturer name
- `--` lines: comments (e.g., tolerances) -- skip
- All other lines: data rows, fields are comma-separated, manufacturer comes from the most recent `-,` line

USE category codes map as: B=base, H=hunting, T=target. The suffix letter indicates bow type: C=compound, nothing=universal. The `d` suffix (e.g., BCd, HCd, TCd) indicates a dual-component shaft (shaft+outsert/bushing variant). All map to the same base category for our purposes (BCd->'base', HCd->'hunting', TCd->'target', BC->'base', HC->'hunting', TC->'target').

### Lazy Loading

Databases load on-demand when the user opens the panel:

```ts
const loadDatabases = () => Promise.all([
  import('../data/equipment/shaftDatabase'),
  import('../data/equipment/fletchDatabase'),
  import('../data/equipment/nockDatabase'),
])
```

Vite code-splits these into separate chunks automatically. They stay cached after first load.

## UI Design

### Entry Point

A button in the Arrow tab, at the top of the form section: "Search database" / "Buscar en base de datos" with a search icon. Opens the modal panel.

### Panel Layout

Full-screen overlay modal with three collapsible sections:

```
+----------------------------------+
|  x                               |  <- close button
|  EQUIPMENT DATABASE              |
|                                  |
|  v SHAFT                         |  <- open by default
|  +-----------------------------+ |
|  | Manufacturer  [v dropdown ] | |  <- step 1
|  | Model         [v dropdown ] | |  <- step 2 (filtered by mfg)
|  | Variant       [v dropdown ] | |  <- step 3 (filtered by model)
|  |                             | |
|  | Preview:                    | |  <- shown after variant selected
|  | Spine: 0.400  GPI: 5.9     | |
|  | Length: 30.5"  Nock: 6gr   | |
|  +-----------------------------+ |
|                                  |
|  > FLETCHING                     |  <- collapsed by default
|  +-----------------------------+ |
|  | Manufacturer  [v dropdown ] | |
|  | Model         [v dropdown ] | |
|  |                             | |
|  | Preview: 3.9gr 1.95" H:0.33| |
|  +-----------------------------+ |
|                                  |
|  > NOCK                          |  <- collapsed by default
|  +-----------------------------+ |
|  | Manufacturer  [v dropdown ] | |
|  | Model         [v dropdown ] | |
|  |                             | |
|  | Preview: 7gr               | |
|  +-----------------------------+ |
|                                  |
|  +-----------------------------+ |
|  |     [ Apply selection ]     | |  <- gold primary button
|  +-----------------------------+ |
+----------------------------------+
```

### Interaction

- Shaft selectors cascade: Manufacturer -> Model -> Variant. Each step filters the next.
- Model and Variant dropdowns are disabled until the previous step is selected.
- Fletching selector: Manufacturer -> Model (2 steps).
- Nock selector: Manufacturer -> Model (2 steps).
- Fletching and Nock sections are independent of the shaft selection.
- "Apply" button activates only when at least one selection is made.
- On Apply: if any target form fields already have data, show confirmation dialog: "This will replace your current arrow data. Continue?" / "Esto reemplazara tus datos actuales de flecha. Continuar?"
- On confirm: close panel, populate form fields, panel selection state is discarded.

## Field Mapping

### Shaft -> Arrow form fields

| DB field | Form field | Notes |
|----------|-----------|-------|
| spine | staticSpine | |
| gpi | shaftGpi | |
| stockLength | shaftLength | User likely trims after |
| nockWeight | nockWeight | Only if > 0 |
| bushingPin | bushingPin | Only if > 0 |
| pointInsert | insertWeight | Only if > 0 |
| useCategory | shaftUseCategory | BC/BCd->'base', HC/HCd->'hunting', TC/TCd->'target' |

### Fletching -> Arrow form fields

| DB field | Form field | Notes |
|----------|-----------|-------|
| weight | weightEach | Grains per vane |
| length | fletchLength | Inches |
| height | fletchHeight | Inches |
| -- | fletchQuantity | Set to "3" if currently empty |

### Nock -> Arrow/String form fields

| DB field | Form field | Notes |
|----------|-----------|-------|
| weight | nockWeight | Overrides shaft nock if user picks a specific nock |
| bushingPin | bushingPin | Only if > 0, overrides shaft value |

### Fields NOT touched

pointWeight, measuredArrowTotalWeight, wrapWeight, fletchOffset, insertType. These remain manual input.

### Unit handling

CSV data is in imperial (grains, inches). Internal form state stores imperial values as strings. No conversion needed; values insert directly.

## i18n

New keys in `src/i18n.tsx`:

- Panel title: "Equipment database" / "Base de datos de equipamiento"
- Section headers: "Shaft", "Fletching", "Nock" (kept in English, universal archery terms)
- Dropdown placeholders: "Select manufacturer" / "Selecciona fabricante", "Select model" / "Selecciona modelo", "Select variant" / "Selecciona variante"
- Preview: "Preview" / "Vista previa"
- Buttons: "Apply selection" / "Aplicar seleccion", "Cancel" / "Cancelar"
- Confirmation: "This will replace your current arrow data. Continue?" / "Esto reemplazara tus datos actuales de flecha. Continuar?"
- Entry button: "Search database" / "Buscar en base de datos"
- Empty state: "No results" / "Sin resultados"
- Loading: "Loading database..." / "Cargando base de datos..."

## Testing

- `src/data/equipment/shaftDatabase.test.ts` -- Integrity: all entries have required fields, spine > 0, gpi > 0, no empty manufacturers, useCategory is valid code
- `src/data/equipment/fletchDatabase.test.ts` -- Same integrity checks
- `src/data/equipment/nockDatabase.test.ts` -- Same integrity checks
- Reference case: 3DHV Elite 400-FB exists with spine=0.400, gpi=5.9 (user's validated case)

## Styling

Follows existing design system:
- card-surface backgrounds, border-[var(--border)]
- Gold accents for active/selected states
- ChevronDown icons for dropdowns (lucide-react)
- animate-fade-in for panel entry
- press-scale on buttons
- Backdrop overlay with blur
