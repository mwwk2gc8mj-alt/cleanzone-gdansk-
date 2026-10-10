const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../journey.js'), 'utf8');
function setup(saved = null) {
  const events = [], handlers = {}, docHandlers = {}, formHandlers = {}, timers = new Map();
  let timerId = 0, observer;
  const form = {id:'bookingForm', matches:()=>false, addEventListener:(name, fn) => formHandlers[name] = fn};
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
  return {ctx,events,formHandlers,error:event=>handlers.error(event),consent:allowed => handlers['cleanzone:measurement-consent']({detail:{allowed}}),
    view:(target=section) => observer([{target,isIntersecting:true,boundingClientRect:{height:3000,width:390},intersectionRect:{height:600,width:390}}]),
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
  assert.deepEqual(s.events.map(e=>e[1]),['form_view','booking_form_start','booking_submit_attempt','booking_submit_error']);
  api.submitAttempt();api.submitSuccess();api.submitSuccess();
  assert.equal(s.events.filter(e=>e[1]==='booking_submit_success').length,1);
});
test('viewport-sized visibility handles tall animation sections and deduplicates views',()=>{
  const s=setup();s.view();s.flush();assert.equal(s.events.length,0);s.consent(true);s.flush();s.view();s.flush();
  assert.equal(s.events.filter(e=>e[1]==='view_pricing').length,1);
  assert.equal(s.events.filter(e=>e[1]==='section_view').length,0);
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
test('an error while recording a site error cannot recursively re-enter telemetry',()=>{
  const s=setup();s.consent(true);let calls=0;
  const error={filename:'https://www.cleanzone-uslugi.pl/journey.js?v=test',lineno:120,colno:8};
  s.ctx.gtag=()=>{calls++;if(calls>10)throw Error('recursive telemetry');s.error(error);};
  assert.doesNotThrow(()=>s.error(error));assert.equal(calls,1);
});
test('error diagnostics allow only known script names and numeric positions, never error contents',()=>{
  const s=setup();s.consent(true);s.events.length=0;
  s.error({filename:'https://www.cleanzone-uslugi.pl/booking-access.js?phone=secret',lineno:20,colno:4,message:'Private error contents'});
  assert.equal(s.events.length,1);const params=s.events[0][2];
  assert.equal(params.script_file,'booking-access.js');assert.equal(params.error_line,20);assert.equal(params.error_column,4);
  assert.ok(!JSON.stringify(s.events).includes('secret'));assert.ok(!JSON.stringify(s.events).includes('Private error'));
  s.ctx.cleanzoneJourney.track('site_error',{script_file:'private.js',error_line:'private',error_column:-1});
  const last=s.events.at(-1)[2];assert.equal(last.script_file,undefined);assert.equal(last.error_line,undefined);assert.equal(last.error_column,undefined);
});
test('modal diagnostics do not count as submissions and respect analytics refusal',()=>{
  const s=setup();
  const names=['booking_form_open','booking_form_scroll','booking_form_close'];
  names.forEach(name=>s.ctx.cleanzoneJourney.track(name));
  assert.equal(s.events.length,0);
  s.consent(true);s.events.length=0;
  names.forEach(name=>s.ctx.cleanzoneJourney.track(name));
  assert.deepEqual(s.events.map(e=>e[1]),[names[0],'form_view',...names.slice(1)]);
  s.ctx.cleanzoneJourney.submitSuccess();
  assert.ok(!s.events.some(e=>e[1]==='booking_submit_success'));
});
test('modal reopen, dwell and immediate input share one form view; anonymous checkbox starts the form',()=>{
  const s=setup();s.consent(true);s.events.length=0;
  s.ctx.cleanzoneJourney.track('booking_form_open');
  s.ctx.cleanzoneJourney.track('booking_form_close');
  s.ctx.cleanzoneJourney.track('booking_form_open');
  s.view(s.ctx.document.getElementById('bookingForm'));s.flush();
  s.formHandlers.input({target:{name:'',id:'firstOrder'}});
  s.formHandlers.input({target:{name:'name'}});
  assert.equal(s.events.filter(e=>e[1]==='form_view').length,1);
  assert.equal(s.events.filter(e=>e[1]==='booking_form_start').length,1);
  assert.ok(s.events.findIndex(e=>e[1]==='form_view')<s.events.findIndex(e=>e[1]==='booking_form_start'));
});
test('only a valid server receipt after an in-flight attempt unlocks a lead; failure and revoke clear it',()=>{
  const s=setup();s.consent(true);const api=s.ctx.cleanzoneJourney;
  const id='11111111-2222-4333-8444-555555555555';
  api.submitSuccess(id);assert.equal(api.getConfirmedLeadId(),null);
  api.submitAttempt();api.submitAttempt();assert.equal(s.events.filter(e=>e[1]==='booking_submit_attempt').length,1);
  api.submitError('http_error',502);api.submitSuccess(id);assert.equal(api.getConfirmedLeadId(),null);
  api.submitAttempt();api.submitSuccess(id);assert.equal(api.getConfirmedLeadId(),id);
  api.submitSuccess('another');assert.equal(api.getConfirmedLeadId(),id);
  api.submitAttempt();assert.equal(api.getConfirmedLeadId(),null);api.submitSuccess('private input');assert.equal(api.getConfirmedLeadId(),null);
  api.submitAttempt();api.submitSuccess(id);s.consent(false);assert.equal(api.getConfirmedLeadId(),null);
  assert.ok(!JSON.stringify(s.events).includes('private input'));
});
