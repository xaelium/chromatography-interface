# Column Lab

An interactive protein chromatography teaching sandbox for graduate students and trainees. Browser-native JavaScript with no production dependencies or build step.

## Develop

Requires Node.js 22+ for checks and Python 3 for the local server.

```sh
npm run dev
# separate terminal
npm run check
npm test
```

The server listens on port 5173. Serve the repository through HTTP (ES modules do not run from file URLs). Deploy the static `index.html`, `style.css`, `app.js`, and `model.js` together. No API keys, external fonts, tracking, database, or external service is required. Sequences remain in the browser.

## Prototype capabilities

- Ion exchange: anion/cation resin, pH/pI, illustrative salt gradient.
- SEC: logarithmic globular mass calibration, void and included limits.
- His-tag IMAC: tag-dependent retention and illustrative imidazole gradient.
- Toggleable flow schematic, UV chromatogram, fraction gel, pooled mass purity and target recovery.
- Animated method progression, waste/collection routing, CSV trace export.
- FASTA or plain-sequence mass, approximate pI and reduced ε280 estimates.

Controls update the full-run preview; Run animates that same deterministic model at accelerated speed. Each fraction spans 1 mL. Pool recovery is relative to target loaded, so target retained beyond the method is not counted as recovered. The sample is target plus two fixed contaminants. No editable sample mixture or structure viewer is implemented yet.

## Scientific boundaries

This is a qualitative teaching model, not experimental retention prediction. Gaussian peaks and binding thresholds are illustrative. UV has an equal mass response across proteins; the sequence-derived extinction coefficient is displayed but not applied to the UV model. Sequence pI uses independent residue pKa values and unmodified termini. IMAC accessibility is supplied by the user. There is no folding, surface-charge, capacity, conductivity, pressure, flow-path dead volume, or gradient-delay model. Gels show relative amounts of monomer species, not calibrated staining or activity. SEC mass calibration assumes globular monomers and cannot infer oligomerization or hydrodynamic radius from sequence alone.

The reduced flow diagram shows A/B pumps → mixer → injection valve → column → UV → outlet valve → waste or collector. It is not an exact ÄKTA schematic or equipment operating procedure. pH affects IEX only in this prototype; flow changes time and illustrative peak broadening.

## References and follow-up

Reviewed the Gelbox repository at commit `1f11ec9227df77d65db4e778add6e0d130a7ddad`: README, web README, `src/GelSim.cpp`, and simulation/rendering organization. Its sample → simulation → visual-output architecture informed this independent implementation. No source/assets were copied.

- https://douglaslab.org/gelbox/
- https://github.com/douglaslab/gelbox/
- https://www.cytivalifesciences.com/

The Gelbox website and Cytiva web pages returned access-denied responses in the development environment. Exact manufacturer representations and resin-specific parameters have therefore **not been verified**. Before using this as course material, validate the schematic and teaching constants against selected Cytiva system manuals and resin instructions with a chromatography specialist.

Suggested extensions: adjustable sample mixtures and oligomerization; calibrated resin-specific SEC curves; column volumes and gradient delay; conductivity and pressure; HIC; accessible guided exercises; import experimentally determined or externally predicted structures. A 3D model alone cannot produce reliable IEX retention predictions.
