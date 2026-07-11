# Current Shaft Catalog Design

## Goal

Extend the equipment database with current, manufacturer-verified shaft models without discarding the broad historical catalog already used by the application.

The application models shafts, not finished arrows. Factory-fletched arrows are therefore out of scope: their vanes and nocks are separate build components and representing them as new shafts would create misleading duplicates.

## Scope

The first current-catalog release will research these active product families across target recurve, target compound, 3D, and hunting:

- Easton: X10, A/C/E, 5.0, 5MM FMJ Classic, and 5MM FMJ MAX
- Victory: VXT, VAP, and RIP TKO
- Gold Tip: Kinetic Pierce Tour, Airstrike, and Hunter XT
- Black Eagle: X Impact and Rampage
- Skylon: Paragon
- FIVICS: FIVE-X
- Pandarus: ELITE CA320

The release may contain both new families and verified replacements for legacy rows. A listed family or size is included only when its required numerical fields can be traced to a current official source.

## Source Policy

Only first-party manufacturer product pages, technical tables, or current catalogs are accepted. The source registry will record a stable ID, manufacturer, title, URL, and publication year or access date.

Initial authoritative collections include:

- Easton 2026 Product Guide: https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf
- Victory 2026 catalogs: https://victoryarchery.com/catalogs/
- Gold Tip current catalog and product pages: https://goldtip.com/
- Black Eagle technical tables: https://blackeaglearrows.com/arrow-spines-weights/
- Skylon product pages: https://www.skylonarchery.com/arrows/
- Fivics 2026 catalog index: https://www.fivics.com/shop/service/catalog
- Pandarus product pages: https://www.pandarusarchery.com/

Retailer data, search-result snippets, inferred values, and copied legacy rows are not valid evidence for the current layer.

## Required Data

Every current shaft row must satisfy the existing `ShaftEntry` contract:

- manufacturer
- model
- size
- use category (`base`, `hunting`, or `target`)
- outside diameter in inches
- stock length in inches
- static spine in inches of deflection
- grains per inch
- included point or insert weight
- included bushing or pin weight
- included nock weight

Spine, GPI, stock length, and outside diameter must be explicitly published and positive. Included component weights are recorded only when the official source identifies an exact weight for that size. A missing, optional, separately sold, or included-but-unpublished component weight is represented as `0`; in this schema, `0` means "do not auto-fill this component", not necessarily "the component is absent". Its weight is never guessed.

## Architecture

The generated 2022 legacy data remains unchanged in `src/data/equipment/shaftDatabase.ts`. Current data and provenance live in separate maintained modules:

```text
src/data/equipment/
  shaftDatabase.ts          generated legacy rows
  currentShaftSources.ts    official source registry
  currentShaftData/         verified rows grouped by manufacturer
  currentShaftDatabase.ts   typed aggregate of current manufacturer modules
  shaftCatalog.ts           deterministic merge and public catalog export
```

`DatabasePanel` will import the merged catalog from `shaftCatalog.ts`. No interface redesign or form-model change is required.

## Identity and Merge Rules

The logical identity of a row is `(manufacturer, model, size)`. Each part is Unicode-normalized, trimmed, whitespace-collapsed, and compared case-insensitively.

Known official renames or punctuation differences, such as `X-Impact` versus `X Impact`, are handled by an explicit alias map. Punctuation is not removed globally because it can be meaningful in product names.

The merge is deterministic:

1. Read legacy rows in their existing order.
2. For an existing legacy key, keep the first row. This preserves the value currently selected by the UI while removing inaccessible duplicates from the merged view.
3. Apply current rows after legacy rows. A current row replaces a legacy row with the same canonical key.
4. Append current rows whose keys are new.

The legacy generated file and CSV are not rewritten by this feature. Regenerating the legacy database therefore cannot erase the maintained current catalog.

## Data Flow

```text
official manufacturer sources
          -> reviewed current rows + source registry
          -> validation tests
legacy generated rows + current rows
          -> deterministic merge
          -> DatabasePanel selectors
          -> existing ArrowSpecs field mapping
```

The UI continues applying spine, GPI, stock length, use category, and positive included component weights exactly as it does today.

## Failure Handling

Validation fails when a current row has:

- an unknown source ID;
- an empty identity field;
- a non-finite number;
- non-positive spine, GPI, stock length, or outside diameter;
- a negative component weight;
- an invalid use category;
- a duplicate canonical key in the current layer; or
- a source that is not first-party.

An incomplete family or size is omitted rather than filled with an estimate. Source unavailability during future maintenance does not break the application because verified rows are stored locally, but it should block claims that the affected family was freshly revalidated.

## Testing

Automated tests will cover:

- the current source registry and first-party URL policy;
- numerical and categorical integrity of every current row;
- uniqueness of current canonical keys;
- deterministic removal of legacy duplicates;
- current-over-legacy precedence;
- uniqueness of the final merged catalog;
- one representative family from each included manufacturer;
- preservation of the existing Victory 3DHV reference case; and
- successful type-check, lint, test, and production build.

A manual smoke test will select one new target shaft and one new hunting shaft in the database panel, apply each selection, and confirm that the expected form fields are populated.

## Out of Scope

- Finished or factory-fletched arrow configurations
- UI filtering or redesign
- Automatic web scraping
- Retail pricing or availability
- Historical catalog cleanup beyond deterministic deduplication in the merged view
- New material fields or changes to the spine-calculation model

## Success Criteria

The feature is complete when the application exposes verified current shaft variants from all seven manufacturers, every displayed row has a unique canonical key, every current-layer row is source-backed, current data overrides stale equivalents predictably, existing behavior remains compatible, and the complete verification suite passes.
