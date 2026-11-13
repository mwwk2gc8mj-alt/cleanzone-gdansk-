const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../drying-price.js'),'utf8'), ctx);
const {quote,selection} = ctx.cleanzoneDryingPrice;
const result = (...args) => JSON.parse(JSON.stringify(quote(...args)));

test('the visit minimum and regular cleaning prices apply before drying', () => {
  assert.deepEqual(result(selection(['sofa2']),true), {cleaning:180,drying:50,total:230});
  assert.deepEqual(result(selection(['sofa3']),true), {cleaning:200,drying:50,total:250});
  assert.equal(quote(selection(['stool']),false).cleaning,150);
  assert.deepEqual(result(selection(['sofa3']),false), {cleaning:200,drying:0,total:200});
});
test('free drying starts at a cleaning subtotal of 400 zł', () => {
  assert.deepEqual(result(399.99,true),{cleaning:399.99,drying:50,total:449.99});
  assert.deepEqual(result(400,true),{cleaning:400,drying:0,total:400});
  assert.equal(quote(350,true).drying,50);
  assert.equal(quote(400,true).drying,0);
});
test('unknown furniture or carpet area requires a quote', () => {
  assert.equal(selection(['rug']),null);
  assert.equal(selection(['sofa2','other']),null);
  assert.equal(selection([]),null);
  for (const value of [-1,NaN,Infinity,'200']) assert.equal(quote(value,true),null);
});
