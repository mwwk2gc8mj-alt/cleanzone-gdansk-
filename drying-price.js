/* Quote helper: the threshold uses cleaning only, never the total with drying. */
(function (root) {
  'use strict';
  const minimumPrices = Object.freeze({sofa2:160,sofa3:180,cornerl:220,corneru:240,pullout:40,stool:25,chair:35,office:40,armchair:60,mattress1:70,mattress2:140,headboard:120});
  function quote(cleaning, selected) {
    if (!Number.isFinite(cleaning) || cleaning < 0) return null;
    const drying = selected && cleaning < 400 ? 50 : 0;
    return {cleaning, drying, total:cleaning + drying};
  }
  function selection(ids) {
    if (!ids.length || ids.some(id => !(id in minimumPrices))) return null;
    return Math.max(150, ids.reduce((sum,id) => sum + minimumPrices[id],0));
  }
  root.cleanzoneDryingPrice = Object.freeze({quote, selection});
})(typeof window === 'undefined' ? globalThis : window);
