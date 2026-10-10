const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../drying-scene.js'),'utf8');
function setup(){
 const nodes=new Map(),listeners=new Map(),frames=new Map();let next=0,top=90,height=1850,reads=0,writes=0;
 const node=()=>({attrs:{},style:new Proxy({},{set(o,k,v){writes++;o[k]=v;return true}}),setAttribute(k,v){writes++;this.attrs[k]=String(v)},textContent:''});
 const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)};
 const visual={querySelector:get,querySelectorAll:()=>[get('stream')],innerHTML:''};
 const sticky=node();Object.defineProperty(sticky,'offsetHeight',{get(){reads++;return 900}});
 const offer=node();const media={matches:false,addEventListener:(n,f)=>listeners.set('motion',f),removeEventListener:()=>{}};
 const short={matches:false,addEventListener:(n,f)=>listeners.set('short',f),removeEventListener:()=>{}};
 const host={dataset:{},classList:{add(){},remove(){}},querySelector:s=>s==='.drying-visual'?visual:s==='.drying-sticky'?sticky:offer,getBoundingClientRect:()=>({top,bottom:top+height})};Object.defineProperty(host,'offsetHeight',{get(){reads++;return height}});
 const ctx={innerHeight:1000,Math,matchMedia:s=>s.includes('reduce')?media:short,getComputedStyle:()=>{reads++;return {top:'90px'}},addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),requestAnimationFrame:f=>{frames.set(++next,f);return next},cancelAnimationFrame:i=>frames.delete(i),ResizeObserver:class{observe(){}disconnect(){}}};ctx.window=ctx;vm.runInNewContext(source,ctx);ctx.initDryingScene(host);
 const flush=()=>{const a=[...frames.values()];frames.clear();a.forEach(f=>f())};
 return {nodes,offer,host,scroll(v){top=v;listeners.get('scroll')();flush()},resize(v){height=v;listeners.get('resize')();flush()},motion(v){media.matches=v;listeners.get('motion')();flush()},count:()=>({reads,writes})};
}
test('drying finishes and offers a usable CTA before the sticky section releases; reversing hides it',()=>{const s=setup();s.scroll(90-950*.87);assert.equal(s.offer.style.opacity,'1');assert.equal(s.offer.inert,false);s.scroll(90);assert.equal(s.offer.style.opacity,'0');assert.equal(s.offer.inert,true)});
test('unchanged drying progress does not mutate the scene and resize recalculates its duration',()=>{const s=setup(),a=s.count();s.scroll(90);assert.deepEqual(s.count(),a);s.scroll(-860);assert.equal(s.host.dataset.progress,'1.000');assert.equal(s.count().reads,a.reads);s.resize(2800);assert.equal(s.host.dataset.progress,'0.500');assert.ok(s.count().reads>a.reads)});
test('reduced motion gives a dry mattress and usable price CTA without moving air, then resumes',()=>{const s=setup();s.motion(true);assert.equal(s.offer.style.opacity,'1');assert.equal(s.offer.inert,false);assert.equal(s.nodes.get('.drying-airflow').attrs.opacity,'0');assert.equal(s.nodes.get('.drying-moisture').attrs.opacity,'0');s.motion(false);assert.equal(s.offer.inert,true);s.scroll(-400);assert.ok(Number(s.nodes.get('.drying-airflow').attrs.opacity)>0)});
