/* Quote helper: the threshold uses cleaning only, never the total with drying. */
(function (root) {
  'use strict';
  const minimumPrices = Object.freeze({sofa2:180,sofa3:200,cornerl:240,corneru:260,pullout:45,stool:30,chair:40,office:45,armchair:65,mattress1:80,mattress2:150,headboard:130});
  function quote(cleaning, selected, firstOrder = false) {
    if (!Number.isFinite(cleaning) || cleaning < 0) return null;
    if (firstOrder) cleaning = Math.max(150, Math.round(cleaning * 80) / 100);
    const drying = selected && cleaning < 400 ? 50 : 0;
    return {cleaning, drying, total:cleaning + drying};
  }
  function selection(ids) {
    if (!ids.length || ids.some(id => !(id in minimumPrices))) return null;
    return Math.max(150, ids.reduce((sum,id) => sum + minimumPrices[id],0));
  }
  root.cleanzoneDryingPrice = Object.freeze({quote, selection});
})(typeof window === 'undefined' ? globalThis : window);
