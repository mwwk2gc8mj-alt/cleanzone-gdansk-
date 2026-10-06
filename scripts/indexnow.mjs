// Notify IndexNow only after the public ownership file matches; never submit private URLs.
import {readFile} from 'node:fs/promises';
const key=(await readFile(new URL('indexnow-key.txt',import.meta.url),'utf8')).trim();
const sitemap=await readFile(new URL('../sitemap.xml',import.meta.url),'utf8');
const urlList=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const host='www.cleanzone-uslugi.pl';
if(!/^[a-zA-Z0-9-]{8,128}$/.test(key) || urlList.some(u=>new URL(u).host!==host))throw new Error('Invalid IndexNow configuration');
const keyLocation=`https://${host}/${key}.txt`;
const ownership=await fetch(keyLocation);
if(!ownership.ok || (await ownership.text()).trim()!==key)throw new Error('Deploy the ownership file before submitting URLs');
const result=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host,key,keyLocation,urlList})});
if(![200,202].includes(result.status))throw new Error(`IndexNow returned ${result.status}: ${await result.text()}`);
console.log(`IndexNow accepted ${urlList.length} public URLs (HTTP ${result.status}). This is not an indexing or ranking guarantee.`);
