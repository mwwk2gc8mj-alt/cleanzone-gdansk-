const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../meta.js'),'utf8');
const id='11111111-2222-4333-8444-555555555555',leadKey='cleanzone-confirmed-lead-v1';
function setup({consent=true,pathname='/',store=new Map(),confirmed=null,blocked=false}={}) {
  const calls=[],scripts=[],handlers={};let choice=consent;
  const ctx={Date,JSON,Set,location:{pathname},
    localStorage:{getItem:()=>JSON.stringify({choice:choice?'yes':'no',expires:Date.now()+1e6})},
    sessionStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');store.set(k,v);},removeItem:k=>{if(blocked)throw Error('blocked');store.delete(k);}},
    cleanzoneJourney:{getConfirmedLeadId:()=>confirmed},fbq:(...args)=>calls.push(args),
    addEventListener:(name,fn)=>handlers[name]=fn,
    document:{createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore:el=>scripts.push(el)}}]}};
  ctx.window=ctx;vm.runInNewContext(source,ctx);
  return {ctx,store,calls,scripts,leads:()=>calls.filter(c=>c[0]==='track'&&c[1]==='Lead'),consent:allowed=>{choice=allowed;handlers['cleanzone:measurement-consent']({detail:{allowed}});}};
}
test('direct thank-you, an unconfirmed form and consent refusal never create Meta Lead',()=>{
  assert.equal(setup({pathname:'/dziekujemy/'}).leads().length,0);
  for(const opts of [{},{consent:false,confirmed:id}]){
    const s=setup(opts);s.ctx.cleanzoneMarkConfirmedLead();assert.equal(s.store.size,0);assert.equal(s.leads().length,0);
  }
});
test('server-confirmed marker is consumed once on thank-you; reload, back and repeated grants cannot repeat Lead',()=>{
  const form=setup({confirmed:id});form.ctx.cleanzoneMarkConfirmedLead();form.ctx.cleanzoneMarkConfirmedLead();
  assert.equal(form.store.size,1);assert.equal(form.leads().length,0);
  const thanks=setup({pathname:'/dziekujemy/',store:form.store});
  assert.equal(thanks.leads().length,1);assert.equal(thanks.leads()[0][3].eventID,id);assert.equal(form.store.size,0);
  thanks.consent(true);thanks.consent(false);thanks.consent(true);assert.equal(thanks.leads().length,1);
  assert.equal(setup({pathname:'/dziekujemy/',store:form.store}).leads().length,0);
});
test('expired, future or invalid receipt tokens do not count; blocked storage never affects booking',()=>{
  for(const saved of [{id,createdAt:Date.now()-11*60*1000},{id,createdAt:Date.now()+60000},{id:'arbitrary input',createdAt:Date.now()}]){
    const store=new Map([[leadKey,JSON.stringify(saved)]]);assert.equal(setup({pathname:'/dziekujemy/',store}).leads().length,0);
  }
  const blocked=setup({confirmed:id,blocked:true});assert.doesNotThrow(()=>blocked.ctx.cleanzoneMarkConfirmedLead());
  assert.doesNotThrow(()=>setup({pathname:'/dziekujemy/',blocked:true}));
});
