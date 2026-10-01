const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../clarity.js'),'utf8');
function setup(saved, key='cleanzone-measurement-consent-v5') {
  const handlers={}, scripts=[], masked=[];
  const ctx={Date,JSON,Set,location:{pathname:'/'},
    localStorage:{getItem:k=>k===key ? saved : null},
    addEventListener:(name,fn)=>handlers[name]=fn,
    document:{body:{classList:{contains:()=>false}},querySelectorAll:()=>[{setAttribute:(...args)=>masked.push(args)}],createElement:()=>({}),head:{append:script=>scripts.push(script)}}};
  ctx.window=ctx;vm.runInNewContext(source,ctx);
  return {ctx,scripts,masked,consent:allowed=>handlers['cleanzone:measurement-consent']({detail:{allowed}}),calls:()=>Array.from(ctx.clarity?.q||[],args=>Array.from(args))};
}
test('no SDK before new opt-in, refusal, expired consent or previous consent version',()=>{
  const yes=JSON.stringify({choice:'yes',expires:Date.now()+100000});
  for(const s of [setup(null),setup(JSON.stringify({choice:'no',expires:Date.now()+100000})),setup(JSON.stringify({choice:'yes',expires:1})),setup(yes,'cleanzone-measurement-consent-v4')]) {
    assert.equal(s.scripts.length,0);s.ctx.cleanzoneClarityEvent('phone_click');assert.equal(s.calls().length,0);
    assert.deepEqual(s.masked,[['data-clarity-mask','true']]);
  }
});
test('load only the correct project once, revoke recording and restart without duplicating SDK',()=>{
  const s=setup(null);s.consent(true);s.consent(true);
  assert.equal(s.scripts.length,1);assert.equal(s.scripts[0].src,'https://www.clarity.ms/tag/yr0iqsk14t');
  assert.equal(s.calls()[0][1].ad_Storage,'denied');
  s.consent(false);assert.equal(s.calls().at(-1)[0],'stop');
  const count=s.calls().length;s.ctx.cleanzoneClarityEvent('phone_click');assert.equal(s.calls().length,count);
  s.consent(true);assert.equal(s.scripts.length,1);assert.ok(s.calls().some(c=>c[0]==='start'));
});
test('only approved event names; visitor input is never passed as parameters or identifiers',()=>{
  const s=setup(JSON.stringify({choice:'yes',expires:Date.now()+100000}));
  s.ctx.cleanzoneClarityEvent('booking_submit_error',{phone:'secret'});s.ctx.cleanzoneClarityEvent('secret');
  const events=s.calls().filter(c=>c[0]==='event');assert.deepEqual(events,[['event','booking_submit_error']]);
  assert.ok(!JSON.stringify(s.calls()).includes('secret'));assert.ok(!s.calls().some(c=>c[0]==='identify'));
  s.ctx.clarity=()=>{throw Error('blocked');};assert.doesNotThrow(()=>s.ctx.cleanzoneClarityEvent('phone_click'));
});
