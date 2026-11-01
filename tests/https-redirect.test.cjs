const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../https-redirect.js'),'utf8');
function run(protocol,hostname){const calls=[];vm.runInNewContext(source,{location:{protocol,hostname,pathname:'/partnerzy/',search:'?utm_source=ig&x=1',hash:'#bookingForm',replace:u=>calls.push(u)}});return calls;}
test('legacy HTTP links upgrade to the trusted HTTPS origin without losing attribution or anchors',()=>{
  for(const host of ['cleanzone-uslugi.pl','www.cleanzone-uslugi.pl']) assert.deepEqual(run('http:',host),['https://www.cleanzone-uslugi.pl/partnerzy/?utm_source=ig&x=1#bookingForm']);
});
test('HTTPS, local development and unrelated hosts are not redirected',()=>{
  for(const [scheme,host] of [['https:','www.cleanzone-uslugi.pl'],['http:','localhost'],['file:',''],['http:','www.cleanzone-uslugi.pl.evil.example']])assert.deepEqual(run(scheme,host),[]);
});
