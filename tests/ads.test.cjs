const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../ads.js'), 'utf8');
function setup(consent = true) {
  const timers = new Map(); let id = 0;
  const element = () => ({setAttribute(){},append(){},addEventListener(){}});
  const ctx = {Date,JSON,Promise,crypto:{randomUUID:()=>'confirmed-test-id'},
    localStorage:{getItem:()=>JSON.stringify({choice:consent?'yes':'no',expires:Date.now()+1e6})},
    CustomEvent:class {constructor(type, options){this.type=type;this.detail=options.detail;}},
    dispatchEvent(){},setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id),
    document:{createElement:element,querySelectorAll:()=>[],querySelector:selector=>selector==='#privacyDialog'?null:element(),
      head:element(),body:{append(){},classList:{contains:()=>false}}}};
  ctx.window=ctx;vm.runInNewContext(source,ctx);
  return {ctx,events:()=>ctx.dataLayer.filter(e=>e[0]==='event'),flush:()=>{for(const fn of [...timers.values()])fn();}};
}
test('GA callback alone cannot redirect before the Ads conversion callback',async()=>{
  const s=setup();let finished=false;
  const pending=s.ctx.cleanzoneConfirmedConversion().then(()=>{finished=true;});
  const events=s.events();assert.deepEqual(Array.from(events,e=>e[1]),['generate_lead','conversion']);
  events[0][2].event_callback();await Promise.resolve();await Promise.resolve();
  assert.equal(finished,false);
  assert.equal(typeof events[1][2].event_callback,'function');
  events[1][2].event_callback();await pending;assert.equal(finished,true);
  assert.equal(events[1][2].transaction_id,'confirmed-test-id');
});
test('blocked analytics has a bounded timeout and cannot strand confirmed booking',async()=>{
  const s=setup();const pending=s.ctx.cleanzoneConfirmedConversion();
  assert.ok(s.events().every(e=>e[2].event_timeout===800));
  s.flush();await pending;
});
test('consent refusal dispatches neither GA nor Ads conversion',()=>{
  const s=setup(false);assert.equal(s.ctx.cleanzoneConfirmedConversion(),undefined);assert.equal(s.events().length,0);
});
test('measurement queue failure cannot reject confirmed booking',async()=>{
  const s=setup();s.ctx.dataLayer.push=()=>{throw Error('measurement unavailable');};
  await assert.doesNotReject(async()=>s.ctx.cleanzoneConfirmedConversion());
});
