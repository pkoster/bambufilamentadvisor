'use strict';
// Converts Bambu Studio's filaments_color_codes.json into our catalog shape.
// Works in the browser (global buildCatalog) and in Node (module.exports).
const CATALOG_SOURCE = 'https://raw.githubusercontent.com/bambulab/BambuStudio/master/resources/profiles/BBL/filament/filaments_color_codes.json';

// Material families, in the order shown in the app. First match wins.
const MATERIALS = [
  ['PLA', /^PLA/],
  ['PETG', /^PETG/],
  ['ABS', /^ABS/],
  ['ASA', /^ASA/],
  ['PC', /^PC/],
  ['TPU', /^TPU/],
  ['PA / PET / PPS', /^(PA|PPA|PAHT|PET|PPS)/],
  ['Support', /^(Support|PVA)/],
];
const materialOf = type => (MATERIALS.find(([, re]) => re.test(type)) || ['Other'])[0];

function buildCatalog(json) {
  const seriesOrder = [];
  const out = json.data
    .filter(x => x.fila_color?.length)
    .map(x => ({
      material: materialOf(x.fila_type),
      series: x.fila_type,
      code: x.fila_color_code,                               // Bambu color number, e.g. 10300
      sku: x.fila_id.replace(/^GF/, '') + '-' + x.color_code, // e.g. A00-A0
      name: x.fila_color_name.en,
      nl: x.fila_color_name.nl || x.fila_color_name.en,
      hex: x.fila_color.map(h => h.slice(1, 7).toUpperCase()), // 1 color, or several for gradient/multi
    }));
  for (const c of out) if (!seriesOrder.includes(c.series)) seriesOrder.push(c.series);
  const matRank = m => { const i = MATERIALS.findIndex(([n]) => n === m); return i < 0 ? MATERIALS.length : i; };
  return out.sort((a, b) => matRank(a.material) - matRank(b.material)
    || seriesOrder.indexOf(a.series) - seriesOrder.indexOf(b.series) || a.code.localeCompare(b.code));
}

if (typeof module !== 'undefined') module.exports = { buildCatalog, CATALOG_SOURCE };
