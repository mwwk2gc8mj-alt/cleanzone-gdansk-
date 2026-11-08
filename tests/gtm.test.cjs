const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');

test('GTM uses the existing consent signal and data layer and loads once', () => {
  const window = new EventTarget();
  const scripts = [];
  const consentCommand = ['consent', 'default', {ad_storage: 'denied'}];
  const dataLayer = [consentCommand];
  window.dataLayer = dataLayer;
  const document = {
    createElement: tag => ({tag}),
    head: {append: script => scripts.push(script)}
  };
  vm.runInNewContext(readFileSync(join(__dirname, '../gtm.js'), 'utf8'), {window, document});

  assert.equal(scripts.length, 0);
  window.dispatchEvent(new CustomEvent('cleanzone:measurement-consent', {detail: {allowed: false}}));
  assert.equal(scripts.length, 0);
  assert.equal(dataLayer.length, 1);

  const accept = () => window.dispatchEvent(new CustomEvent('cleanzone:measurement-consent', {detail: {allowed: true}}));
  accept();
  accept();
  assert.equal(window.dataLayer, dataLayer);
  assert.equal(dataLayer[0], consentCommand);
  assert.equal(dataLayer[1].event, 'gtm.js');
  assert.equal(typeof dataLayer[1]['gtm.start'], 'number');
  assert.deepEqual(scripts, [{
    tag: 'script', async: true, src: 'https://www.googletagmanager.com/gtm.js?id=GTM-P4K2LG9P'
  }]);
});
