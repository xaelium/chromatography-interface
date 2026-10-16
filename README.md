# Column Lab

A browser-based protein chromatography teaching tool. Native JavaScript modules, no production dependencies or build step. Sequences remain in the browser.

## Run and update

Requires Python 3 to serve files and Node.js 22.8+ for development checks.

```sh
git pull
npm run dev
npm run check
npm test
```

On Windows, in the project folder use `py -m http.server 5174` and open the corresponding local server in your browser. Keep the terminal running. Refresh after `git pull` (Ctrl+F5 if older files remain cached).

Static deployment must include `index.html`, `style.css`, `app.js`, `flow.js`, and `model.js` together. No secrets, external fonts, APIs, database or bundling are required.

## Protocol and playback

Choose ion exchange, SEC, or His-tag IMAC. Switching methods loads a corresponding preset. Each editable protocol has exactly one sample **Load** step plus optional equilibration, washing, gradient and hold steps. Every row specifies volume, flow, B start/end percentage, and waste/collection routing. B varies linearly within each step; adjacent values may differ for a step change. There is no modeled tubing delay. Per-row flow determines time; the preset flow control only affects the next loaded preset.

Edit, add, remove and reorder up to 20 steps. Limits: 0.1–100 mL/step, 0.1–5 mL/min and 240 mL total. SEC uses 0% B throughout. These are model limits, not hardware specifications. The Save/Open protocol buttons round-trip method settings, UV parameters, fraction volume and rows as a JSON file; sequences are not included. Files are validated before use. Protocols are not automatically saved on reload.

Run, pause/resume, restart, adjust speed (1× is real time), seek by time, jump to a step, or jump to the inspection cursor. Seeking produces the deterministic model state at that time, including fraction completion status. Method changes reset the run. Dashed chromatogram traces are forecasts; the solid UV trace is the elapsed simulation. Forecasts are not experimental data.

The instrument shows live numbers and active tubing only while running. Idle, paused and completed states show stopped pumps. The simplified valve configuration stays in inject/column-online position; manual loading and bypass are drawn but not interactive. The original drawing follows a user-supplied Cytiva screenshot, not a verified model-specific operating diagram.

## Cursor, concentration and fractions

Drag across the chromatogram or use its keyboard-accessible inspection slider. The sidebar reports time, pumped volume, step, B, flow, outlet, fraction and UV. The shaded region is the inspected fraction. Cursor position is independent of playback position. Click a gel lane to inspect and add/remove it from a predicted pool.

Collect every 0.25–10 mL. Contiguous collection steps fill the same sequence of tubes; switching to waste ends the current tube, and resumed collection starts a new tube. Partial final fractions retain their actual volumes. Fractions are integrated from the same protein profiles as the UV curve. Forecast gel lanes are faded; completed lanes are full intensity. Gel intensity represents relative concentration (equal aliquot volume), not total tube mass. Pool purity, recovery and target concentration are **predicted** full-fraction values even when playback has not reached them. Very large sets of gel lanes scroll horizontally.

Target UV uses Beer–Lambert: `A280 = epsilon * c(mol/L) * path(cm)`. Input target mass (kDa), loaded target (mg), epsilon (M⁻¹cm⁻¹), and path length (default 0.2 cm). The initial epsilon of 50,000 is an editable assumption. Applying a sequence estimates mass, pI and epsilon (Trp/Tyr, reduced cysteines) and updates the target parameters. Editing sequence text alone does not apply it. No structure is predicted.

The UV-based concentration estimate assumes **all** absorbance comes from the target. Contaminants have an assumed mass extinction of 0.8 mL mg⁻¹ cm⁻¹ and can inflate this estimate. The sidebar separately shows the simulation's actual target concentration and integrated fraction-average concentration. Zero epsilon yields an unavailable UV-based estimate. CSV export includes forecast/elapsed labels, concentration and fraction assignments.

## Scientific boundaries

This is a qualitative teaching model, not experimental retention prediction. The sample contains target plus two fixed contaminants at 0.65 and 0.5 times the loaded target mass. Elution peaks are Gaussian. IEX uses pH/pI to approximate binding and a heuristic salt threshold; IMAC uses an accessible-tag flag and an illustrative imidazole threshold. The first threshold crossing after sample injection determines retention. A higher endpoint can elute retained species; lowering the endpoint can leave species on the column. SEC uses a logarithmic globular-mass calibration between 5–300 kDa, with void/included limits of 8/20 mL after injection. Equilibration before Load shifts injection time. Loading volume affects protocol duration, not injection-width modeling. Higher flow adds illustrative broadening.

Capacity, displacement, adsorption kinetics, pressure, conductivity signals, gradient delay, folding, complexes, and real resin-specific selectivity are not modeled. Sequence pI is an independent-site pKa approximation with unmodified termini. Shape, oligomerization, surface-charge patches and buffer/resin chemistry can change real SEC/IEX retention. Gel bands show monomer mass and relative staining, not activity. Future extensions include calibrated resins, adjustable mixtures and HIC.

## Validation and references

`npm run check` checks JavaScript syntax. Model tests cover SEC order, IEX polarity, IMAC tag/gradient response, insufficient elution, mass conservation, sequence properties, custom timing, collection boundaries, partial fractions, equilibration delays, Beer–Lambert units and protocol validation. Browser smoke checks during development exercise pointer/keyboard inspection, dynamic fractions, panel animation, playback and seeking, save/import, sequence-derived coefficients, pooling and narrow-screen layout.

Reviewed Gelbox commit `1f11ec9227df77d65db4e778add6e0d130a7ddad` (README, web README, `src/GelSim.cpp`, sample/simulation/rendering organization). No source or assets were copied.

- https://douglaslab.org/gelbox/
- https://github.com/douglaslab/gelbox/
- https://www.cytivalifesciences.com/

Gelbox/Cytiva web pages returned access-denied responses during initial development. The user supplied the later schematic reference. Exact system plumbing and resin constants still require manufacturer-manual and subject-matter verification before use as course material.
