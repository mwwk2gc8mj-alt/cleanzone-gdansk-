const test=require('node:test');
const assert=require('node:assert/strict');
require('../drying-price.js');
const estimate=globalThis.cleanzoneDryingPrice.estimate;
test('first sofa order respects the visit minimum and separate drying fee',()=>{
  assert.deepEqual(estimate(['sofa2'],true,true),{cleaning:[150,150],drying:'paid',total:[200,200]});
});
test('corner sofa preserves its advertised range after the discount',()=>{
  assert.deepEqual(estimate(['cornerl'],true,true),{cleaning:[192,208],drying:'paid',total:[242,258]});
});
test('unknown rug area and unbounded furniture never produce a fixed total',()=>{
  assert.equal(estimate(['rug'],true,true),null);
  assert.equal(estimate(['sofa2','rug'],false,false),null);
  assert.deepEqual(estimate(['corneru'],true,false),{cleaning:[260,null],drying:'confirm',total:null});
});
test('drying uses the post-discount cleaning subtotal and handles threshold crossings',()=>{
  assert.deepEqual(estimate(['sofa3','cornerl'],true,true),{cleaning:[352,384],drying:'paid',total:[402,434]});
  assert.deepEqual(estimate(['sofa3','cornerl'],true,false),{cleaning:[440,480],drying:'free',total:[440,480]});
  assert.equal(estimate(['cornerl','mattress2'],true,false).drying,'confirm');
  assert.equal(estimate(['cornerl','mattress2'],true,false).total,null);
});
