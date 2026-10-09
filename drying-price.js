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
  const priceRanges = Object.freeze({sofa2:[180,180],sofa3:[200,220],cornerl:[240,260],corneru:[260,null],pullout:[45,null],stool:[30,30],chair:[40,40],office:[45,55],armchair:[65,null],mattress1:[80,150],mattress2:[150,230],headboard:[130,130]});
  function estimate(ids, selected, firstOrder = false) {
    if (!ids.length || ids.some(id => !(id in priceRanges))) return null;
    const ranges = ids.map(id => priceRanges[id]);
    const lower = Math.max(150, ranges.reduce((sum,r) => sum+r[0],0));
    const upper = ranges.some(r => r[1] === null) ? null : Math.max(150, ranges.reduce((sum,r) => sum+r[1],0));
    const cleaning = [quote(lower,false,firstOrder).cleaning, upper === null ? null : quote(upper,false,firstOrder).cleaning];
    const drying = !selected ? 'none' : cleaning[0] >= 400 ? 'free' : cleaning[1] !== null && cleaning[1] < 400 ? 'paid' : 'confirm';
    // Crossing the free-drying threshold makes the total non-monotonic. Confirm it rather than invent a range.
    const total = drying === 'confirm' ? null : cleaning.map(value => value === null ? null : value+(drying === 'paid' ? 50 : 0));
    return {cleaning,drying,total};
  }
  root.cleanzoneDryingPrice = Object.freeze({quote, selection, estimate});
})(typeof window === 'undefined' ? globalThis : window);
