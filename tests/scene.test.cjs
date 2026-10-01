const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../scene.js'), 'utf8');

function setup() {
  const nodes = new Map(), listeners = new Map(), frames = new Map();
  let writes = 0, reads = 0, nextFrame = 0, top = 90, height = 1900;
  function node() {
    return {attrs:{}, style:new Proxy({}, {set(target, key, value) {writes++; target[key] = value; return true;}}),
      setAttribute(name, value) {writes++; this.attrs[name] = String(value);}, textContent:''};
  }
  const drops = Array.from({length:13}, node);
  const sticky = node(); Object.defineProperty(sticky, 'offsetHeight', {get() {reads++; return 900;}});
  nodes.set('.cleaning-story__sticky', sticky);
  const media = {matches:false, addEventListener:(name, fn) => listeners.set('motion', fn), removeEventListener:() => {}};
  const host = {dataset:{}, style:node().style, getBoundingClientRect:() => ({top,bottom:top+height}),
    querySelector(selector) {if (!nodes.has(selector)) nodes.set(selector,node()); return nodes.get(selector);}, querySelectorAll:() => drops};
  Object.defineProperty(host, 'offsetHeight', {get() {reads++; return height;}});
  const ctx = {innerHeight:1000,Math,WeakMap,Map,matchMedia:() => media,
    getComputedStyle:() => {reads++; return {top:'90px'};},
    addEventListener:(name,fn) => listeners.set(name,fn), removeEventListener:name => listeners.delete(name),
    requestAnimationFrame:fn => {frames.set(++nextFrame,fn); return nextFrame;}, cancelAnimationFrame:id => frames.delete(id),
    ResizeObserver:class {constructor(fn) {this.notify=fn;} observe() {} disconnect() {}}};
  ctx.window = ctx; vm.runInNewContext(source, ctx);
  const controller = ctx.initCleaningScene(host);
  const flush = () => {const pending=[...frames.values()]; frames.clear(); pending.forEach(fn=>fn());};
  return {nodes,drops,controller,media,flush,
    scroll(value) {top=value; listeners.get('scroll')(); flush();},
    resize(value) {height=value; listeners.get('resize')(); flush();},
    motion(value) {media.matches=value; listeners.get('motion')(); flush();},
    counters:() => ({writes,reads})};
}

test('unchanged progress does not mutate the illustration; scrolling reuses measured layout', () => {
  const s=setup(), initial=s.counters(); s.scroll(90);
  assert.deepEqual(s.counters(), initial);
  s.scroll(-410); assert.equal(s.counters().reads, initial.reads);
  const changed=s.counters(); s.scroll(-410); assert.deepEqual(s.counters(), changed);
});
test('cleaning completes, reverses, and uses new scroll distance after resizing', () => {
  const s=setup(); s.scroll(-910);
  assert.equal(s.nodes.get('.cleaning-story__dirtclip').attrs.width, '0');
  assert.equal(s.nodes.get('.cleaning-story__number').textContent, '03 / 03');
  s.resize(2900); assert.notEqual(s.nodes.get('.cleaning-story__dirtclip').attrs.width, '0');
  s.scroll(90); assert.equal(s.nodes.get('.cleaning-story__number').textContent, '01 / 03');
  assert.ok(Number(s.nodes.get('.cleaning-story__dirtclip').attrs.width)>600);
});
test('reduced motion shows final clean fabric and hides droplets; motion can resume', () => {
  const s=setup(); s.motion(true);
  assert.equal(s.nodes.get('.cleaning-story__dirtclip').attrs.width, '0');
  assert.ok(s.drops.every(drop=>drop.attrs.opacity==='0'));
  s.motion(false); s.scroll(-410);
  assert.ok(s.drops.some(drop=>Number(drop.attrs.opacity)>0));
  assert.ok(s.drops.every(drop=>drop.attrs.transform.startsWith('translate(')));
});
