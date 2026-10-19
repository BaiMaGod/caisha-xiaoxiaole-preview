import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=resolve('web');
const server=createServer(async(req,res)=>{try{let pathname=new URL(req.url,'http://localhost').pathname;if(pathname.endsWith('/'))pathname+='index.html';const p=resolve(root,'.'+pathname);if(!p.startsWith(root+sep)){res.writeHead(403);return res.end()}res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.wav':'audio/wav'})[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM||undefined,args:['--no-sandbox']}),results=[];
try{
 for(const [width,height] of [[390,844],[320,568],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?debug=1');await page.waitForFunction(()=>globalThis.__canvasGame?.buttons.length);
  const timing=await page.evaluate(()=>{const g=__canvasGame;g.hidden=true;const out=[];for(const hz of [30,60,90,120]){g.startGame('sandArt');const original=g.session.simulation.update;let ticks=0;g.session.simulation.update=()=>ticks++;for(let i=0;i<hz*10;i++)g.session.update(1000/hz);g.session.simulation.update=original;out.push({hz,ticks})}g.goHome();g.screen='levels';let calls=0;const original=g.session.homeDemo.update;g.session.homeDemo.update=()=>calls++;g.draw(g.lastTime);g.needsDraw=false;const request=g.platform.requestFrame;g.platform.requestFrame=()=>{};g.hidden=false;for(let i=0;i<60;i++)g.frame(i*16.667);g.hidden=true;g.platform.requestFrame=request;g.session.homeDemo.update=original;return {out,calls}});
  assert.ok(timing.out.every(v=>v.ticks===300));assert.equal(timing.calls,0);
  const idle=await page.evaluate(()=>{const g=__canvasGame;g.startGame('sandArt');g.draw(g.lastTime);g.needsDraw=false;g.hidden=false;const request=g.platform.requestFrame;g.platform.requestFrame=()=>{};const before=g.profiler.snapshot().draw.count;for(let i=0;i<120;i++)g.frame(1000+i*16.667);g.hidden=true;g.platform.requestFrame=request;return g.profiler.snapshot().draw.count-before});assert.equal(idle,0);
  const clear=await page.evaluate(()=>{const g=__canvasGame;g.startGame('level',1);g.ruleIntro=false;g.propIntro=null;g.session.blockPropsPaused=false;g.draw(g.lastTime);g.session.grid.clear();for(let i=0;i<12000;i++)g.session.grid.set(i%180,140+Math.floor(i/180),1);const t=performance.now();g.session.clearSystem.resolve();g.draw(g.lastTime);const setupMs=performance.now()-t;for(let i=1;i<42;i++)g.draw(g.effect.startedAt+i*40);return {setupMs,clear:g.profiler.snapshot().clear}});assert.ok(clear.clear.p95Ms<16.7);assert.ok(clear.setupMs<50);
  results.push({width,height,timing,idle,clear});assert.deepEqual(errors,[]);await page.close();
 }
 await mkdir('.qa',{recursive:true});await writeFile('.qa/runtime-compiled.json',JSON.stringify(results,null,2));console.log('Compiled runtime gates passed',JSON.stringify(results));
}finally{await browser.close();await new Promise(r=>server.close(r))}
