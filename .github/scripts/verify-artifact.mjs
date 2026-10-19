import assert from 'node:assert/strict';
import { readdirSync,readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve,relative } from 'node:path';
const root=resolve('web'),manifest=JSON.parse(readFileSync(resolve(root,'artifact-sha256.json'),'utf8'));
const seen=[];
function visit(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){
 const file=resolve(dir,entry.name),path=relative(root,file).replaceAll('\\','/');
 if(entry.isDirectory())visit(file);else if(path!=='artifact-sha256.json' && !/\.md$/i.test(path)){
 assert.doesNotMatch(path,/\.(ts|map)$/);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),manifest.files[path],path+' hash mismatch');seen.push(path);
 }
}}
visit(root);assert.deepEqual(seen.sort(),Object.keys(manifest.files).sort());
console.log('Verified',seen.length,'exact release files');
