const test=require('node:test');
const assert=require('node:assert/strict');
require('../drying-price.js');
const estimate=globalThis.cleanzoneDryingPrice.estimate;
test('a sofa uses the regular price and a separate drying fee',()=>{
  assert.deepEqual(estimate(['sofa2'],true),{cleaning:[180,180],drying:'paid',total:[230,230]});
});
test('corner sofa preserves its advertised range',()=>{
  assert.deepEqual(estimate(['cornerl'],true),{cleaning:[240,260],drying:'paid',total:[290,310]});
});
test('unknown rug area and unbounded furniture never produce a fixed total',()=>{
  assert.equal(estimate(['rug'],true),null);
  assert.equal(estimate(['sofa2','rug'],false),null);
  assert.deepEqual(estimate(['corneru'],true),{cleaning:[260,null],drying:'confirm',total:null});
});
test('drying uses the cleaning subtotal and handles threshold crossings',()=>{
  assert.deepEqual(estimate(['sofa3','cornerl'],true),{cleaning:[440,480],drying:'free',total:[440,480]});
  assert.equal(estimate(['cornerl','mattress2'],true).drying,'confirm');
  assert.equal(estimate(['cornerl','mattress2'],true).total,null);
});
