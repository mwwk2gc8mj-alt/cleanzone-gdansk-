const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../drying-price.js'),'utf8'), ctx);
const {quote,selection} = ctx.cleanzoneDryingPrice;
const result = (...args) => JSON.parse(JSON.stringify(quote(...args)));

test('first-order discount respects the minimum and never discounts drying', () => {
  assert.deepEqual(result(selection(['sofa2']),true,true), {cleaning:150,drying:50,total:200});
  assert.deepEqual(result(selection(['sofa3']),true,true), {cleaning:160,drying:50,total:210});
  assert.equal(quote(selection(['stool']),false,true).cleaning,150);
  assert.deepEqual(result(selection(['sofa3']),false), {cleaning:200,drying:0,total:200});
});
test('free drying depends on cleaning AFTER discount, not the pre-discount or combined amount', () => {
  assert.deepEqual(result(400,true,true),{cleaning:320,drying:50,total:370});
  assert.deepEqual(result(499.99,true,true),{cleaning:399.99,drying:50,total:449.99});
  assert.deepEqual(result(500,true,true),{cleaning:400,drying:0,total:400});
  assert.equal(quote(350,true).drying,50);
  assert.equal(quote(400,true).drying,0);
});
test('unknown furniture or carpet area requires a quote, not a made-up discount estimate', () => {
  assert.equal(selection(['rug']),null);
  assert.equal(selection(['sofa2','other']),null);
  assert.equal(selection([]),null);
  for (const value of [-1,NaN,Infinity,'200']) assert.equal(quote(value,true,true),null);
});
