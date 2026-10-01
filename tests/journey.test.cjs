const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../journey.js'), 'utf8');
function setup(saved = null) {
  const events = [], handlers = {}, docHandlers = {}, formHandlers = {}, timers = new Map();
  let timerId = 0, observer;
  const form = {id:'bookingForm', addEventListener:(name, fn) => formHandlers[name] = fn};
  const section = {id:'cennik', matches:() => false};
  const ctx = {location:{pathname:'/'},innerHeight:844,innerWidth:390,scrollY:0,
    localStorage:{getItem:() => saved}, Set,Map,Date,JSON,
    setTimeout:fn => { timers.set(++timerId, fn); return timerId; },clearTimeout:id => timers.delete(id),
    requestAnimationFrame:fn => {fn(); return 1;},
    addEventListener:(name,fn) => handlers[name] = fn,
    IntersectionObserver: class {constructor(fn) {observer=fn;} observe() {}},
    document:{visibilityState:'visible',documentElement:{scrollHeight:10000},
      getElementById:id => id === 'bookingForm' ? form : null,
      querySelectorAll:selector => selector.startsWith('section') ? [section] : [],
      addEventListener:(name,fn) => docHandlers[name] = fn}};
  ctx.window=ctx;ctx.gtag=(...args) => events.push(args);
  vm.runInNewContext(source,ctx);
  return {ctx,events,formHandlers,consent:allowed => handlers['cleanzone:measurement-consent']({detail:{allowed}}),
    view:() => observer([{target:section,isIntersecting:true,boundingClientRect:{height:3000,width:390},intersectionRect:{height:600,width:390}}]),
    flush:() => {const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());}};
}
test('no events before opt-in, after refusal or with expired consent',()=>{
  for (const saved of [null,JSON.stringify({choice:'yes',expires:1}),JSON.stringify({choice:'no',expires:Date.now()+1e6})]) {
    const s=setup(saved);s.ctx.cleanzoneJourney.track('phone_click');s.view();s.flush();assert.equal(s.events.length,0);
    s.consent(true);s.ctx.cleanzoneJourney.track('phone_click');assert.ok(s.events.length);
    s.consent(false);const count=s.events.length;s.ctx.cleanzoneJourney.track('phone_click');s.view();s.flush();assert.equal(s.events.length,count);
  }
});
test('never forwards arbitrary field values, labels, error text or URLs',()=>{
  const s=setup();s.consent(true);s.events.length=0;
  s.ctx.cleanzoneJourney.track('booking_submit_error',{error_type:'network',phone:'123456789',name:'Private Name',comment:'secret',url:'https://example.com/?phone=123',field_name:'phone',service_id:'private-service',action_location:'private text',error_message:'secret',http_status:503});
  const event=JSON.parse(JSON.stringify(s.events[0]));
  assert.equal(event[2].field_name,'phone');assert.equal(event[2].http_status,503);
  const text=JSON.stringify(event);for(const value of ['123456789','Private Name','secret','example.com','private-service','private text'])assert.ok(!text.includes(value));
  s.ctx.cleanzoneJourney.track('arbitrary_event',{phone:'secret'});assert.equal(s.events.length,1);
});
test('server confirmation is distinct from a submit attempt and success cannot repeat',()=>{
  const s=setup();s.consent(true);s.events.length=0;const api=s.ctx.cleanzoneJourney;
  api.submitSuccess();assert.equal(s.events.length,0);
  api.submitAttempt();api.submitError('network');api.submitSuccess();
  assert.deepEqual(s.events.map(e=>e[1]),['booking_form_start','booking_submit_attempt','booking_submit_error']);
  api.submitAttempt();api.submitSuccess();api.submitSuccess();
  assert.equal(s.events.filter(e=>e[1]==='booking_submit_success').length,1);
});
test('viewport-sized visibility handles tall animation sections and deduplicates views',()=>{
  const s=setup();s.view();s.flush();assert.equal(s.events.length,0);s.consent(true);s.flush();s.view();s.flush();
  assert.equal(s.events.filter(e=>e[1]==='section_view').length,1);
});
test('validation reports only a field name and category',()=>{
  const s=setup();s.consent(true);s.events.length=0;
  const target={name:'phone',value:'secret',validity:{valueMissing:true}};
  s.formHandlers.invalid({target});s.formHandlers.invalid({target});
  assert.equal(s.events.length,1);assert.equal(s.events[0][2].error_type,'required');assert.ok(!JSON.stringify(s.events).includes('secret'));
});
test('analytics failure cannot escape into the booking code',()=>{
  const s=setup();s.consent(true);s.ctx.gtag=()=>{throw Error('blocked');};
  assert.doesNotThrow(()=>{s.ctx.cleanzoneJourney.submitAttempt();s.ctx.cleanzoneJourney.submitSuccess();});
});
