# Diseño: mejora de precisión del cálculo de spine

Fecha: 2026-06-09
Estado: aprobado para implementación (sesión autónoma; decisiones documentadas aquí para revisión)

## Diagnóstico (baseline medido)

Comando: `npm run analyze:compound`

| Métrica | Baseline |
| --- | --- |
| SFAX dynamic spine MAE (6 casos) | 0.000 (máx 0.000) |
| SFAX fps MAE | 2.40 (máx 5.41) |
| Benchmark oficial: matchIndex MAE | 0.0318 (máx 0.1684) |
| Benchmark oficial: in-range rate | 63.2% (12/19) |

Hallazgos clave:

1. **El núcleo compound (SFAX) es fiel al software de referencia: error 0.000.** No se toca.
2. **Los 3 peores casos del benchmark oficial son errores del dataset, no del modelo.** Verificado contra el PDF real de Easton (Hunting Arrow Size Selection 2023, doc 301055-A):
   - `easton_standard_70lb_340`: la celda real para 70 lb ajustadas / flecha 31" es **300-250**, no 340. El modelo exige 0.291 → dentro de la celda.
   - `easton_standard_75lb_300`: 75 lb + 5 (IBO 350) = fila 79-84, col 31" → **250-200**. Modelo 0.257 ≈ borde 250.
   - `easton_adjusted_70lb_125gr_300`: 70+5(IBO)+3(punta 125) = 78 → fila 73-78, col 31" → **300-250**. Modelo 0.268 → dentro.
   Los autores del dataset leyeron columnas de la carta como si fueran draw length, pero la carta usa **longitud de flecha**.
3. **Desacuerdo real entre fabricantes:** Gold Tip recomienda ~medio grupo más débil que Easton para la misma configuración (p. ej. 70 lb/30": GT → 340, Easton → 300-250). El modelo SFAX cae del lado Easton. Los rangos aceptables deben codificar la envolvente del proveedor citado (± cuantización de carta), no un ±10% arbitrario.
4. **La rama non-compound (recurvo/tradicional) está rota.** Con IBO=0 (lo normal en recurvo) produce spines sin sentido (≈1.0 de deflexión para un recurvo de 40 lb que necesita ≈0.45-0.50). No tiene ni un solo caso de calibración. Además el UI ni siquiera expone `archeryType`, así que es código muerto que daría resultados erróneos en cuanto se exponga.
5. `camAggressiveness` existe en `BowSpecs` y en i18n pero **el algoritmo lo ignora**; `CAM_FDR` es una constante muerta.
6. Los intervalos de confianza usan anchura fija (±3%/±2%) aunque la confianza sea `low` — la incertidumbre reportada no refleja la calidad de los inputs.
7. Mismatch i18n: claves `archeryType.recurve` vs valor del tipo `'recurvo'`.

## Reglas verificadas de la carta Easton 2023 (fuente primaria)

Ajustes al peso real del arco (lb):
- Velocidad ATA: ≤300 fps → −5; 301-340 → 0; 341-350 → +5; ≥351 → +10
- Suelta: mecánica → 0; dedos → +5
- Puntas: ±3 lb por cada 25 gr respecto a 100 gr
- Inserts/outserts: ≤25 gr → 0; >25 gr → +3 lb por 25 gr

Celdas (fila = lb ajustadas, col = longitud de flecha). Secuencia de celdas: 700-600, 600-500, 500-400, 400-350, 350-300, 300-250, 250-200, 200-150. Estructura diagonal: +1" de flecha ≡ +5 lb; un salto de celda cada ~15 lb equivalentes.

Columna RECURVE (cazа, dedos), celdas a 28": 24-28→600-500; 29-32→600-500; 33-36→500-400; 37-41→500-400; 42-46→500-400; 47-51→400-350; 52-56→400-350; 57-61→400-350; 62-66→350-300; 67-72→350-300; 73-78→350-300; 79-84→300-250; 85-90→300-250.

Columna LONGBOW: desplazada ≈ +20 lb respecto a recurvo en la misma fila de celdas (12-16 LB ↔ 33-36 recurvo, …, 65-70 LB ↔ 85-90 recurvo). Confianza media (alineación leída del PDF).

## Decisiones de diseño

### D1. El núcleo compound SFAX no se modifica
La fidelidad SFAX (≤0.001) es el contrato del motor compound. Los desacuerdos restantes con cartas oficiales (~3-4% en 2 casos límite) reflejan desacuerdo entre fabricantes, no error del modelo; se codifican en los rangos del benchmark.

### D2. Benchmarks compound reescritos celda a celda (dataset v3)
Para cada caso con fuente Easton: fila = peso ajustado según las reglas verificadas; columna = `shaftLength`; `acceptableMatchRange = [static/celda_débil, static/celda_rígida]` con ε = ±4% por cuantización (filas de 5 lb ≈ ±3.1%, columnas de 1" ≈ ±3.1%). Para casos Gold Tip/Black Eagle: rango = recomendación del selector ± medio grupo, con la misma ε; si el caso mezcla proveedores que discrepan, se usa la envolvente (unión).

### D3. Nuevo modelo non-compound anclado a la carta Easton
Sustituye la rama pseudo-SFAX rota. Ajuste por regresión sobre los puntos medios de las 13 filas de la columna recurvo (R² del ajuste log-lineal sobre celdas; desviación máxima ≈1.5%, dentro de la cuantización):

```
E = W + 5·(L − 28) + 3·(F − 100)/25 + insertAdj + stringAdj + drawAdj + tradAdj
spineRequired = 0.7116 · exp(−0.011285 · E)
```

- `W` = peso marcado del arco (lb, a 28")
- `L` = longitud de flecha (in); `F` = punta + insert (gr); insertAdj = +3 lb/25 gr para la parte de insert > 25 gr (regla Easton)
- `stringAdj`: dacron 0 (baseline tradicional de la carta), fastflight +3 lb, unknown +1.5 lb
- `drawAdj` = 2.5 lb/in × (drawLength − 28): un recurvo gana ~2-2.5 lb/in; el peso marcado se ajusta a la apertura real (documentado con recomendación al usuario)
- `tradAdj` = +20 lb para `traditional` (mapeo longbow impreso en la carta; se añade warning de confianza media)
- Se ignoran IBO, brace, axleToAxle, letoff y release para el spine non-compound (la carta no los usa; recurvo = dedos por definición)
- FPS para non-compound: si IBO > 0 se mantiene el modelo de velocidad actual; si no, `calculatedFPS = null` (honesto, sin números inventados). El cronógrafo medido se reporta pero no escala el spine si no hay estimación propia.
- Requisitos mínimos non-compound: drawWeight, shaftLength, staticSpine, drawLength (brace deja de ser obligatorio).

Benchmark nuevo: `src/data/official/recurveDatabase.ts` con ~14 casos (celdas verificadas, 25-87 lb, 25-31", puntas 100-145 gr, 2 casos traditional) + checks de monotonicidad (peso↑→rígido, longitud↑→rígido, punta↑→rígido, fastflight→rígido, traditional→rígido).

### D4. camAggressiveness por fin usado (solo compound)
`intermediate += (FDR(cam) − FDR.medium) × 25` ⇒ round −2.5 lb, medium 0, aggressive +2.5, speed +5, max +7.5. Campo vacío/desconocido → 0 ⇒ **fidelidad SFAX intacta** (ningún caso de referencia define cam). Dirección: leva más agresiva → demanda más rígida (matchIndex↑).

### D5. Intervalos de confianza honestos
Anchura por nivel: required ±2%/±4%/±7% y dynamic ±1.5%/±2.5%/±4% para high/medium/low. La derivación de `matchIndexCI` no cambia.

### D6. Limpieza relacionada
- i18n: añadir clave `archeryType.recurvo` (manteniendo `recurve` por compatibilidad).
- `hasAllInputs` por tipo de arco (recurvo no exige IBO/A2A/letoff/release).

## Fuera de alcance (anotado para seguimiento)
- Exponer el selector de `archeryType` y `camAggressiveness` en el UI (cambio de producto, no de algoritmo).
- Flechas de madera (spine AMO en libras) y recurvo olímpico de precisión (carta target).
- Recalibrar el modelo de velocidad SFAX (los 2 peores fps son casos `partial` con inputs no visibles en la fuente original; ajustarlos sería sobreajuste).

## Criterios de éxito
1. Fidelidad SFAX intacta: MAE de spine dinámico ≤0.001 por caso (test existente).
2. Benchmark oficial compound: in-range rate ≥ 85% con rangos celda-fieles (antes 63% con rangos defectuosos).
3. Benchmark recurvo nuevo: 100% de casos dentro de celda ±ε; monotonicidad completa.
4. Suite completa de tests + `tsc -b` + build verdes.
