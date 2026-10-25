import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const root=resolve('web');
const server=createServer((req,res)=>{
 try {
  let path=decodeURIComponent(req.url.split('?')[0]).replace(/^\/caisha-xiaoxiaole-preview/,'');
  path=resolve(root,'.'+path);
  if(path!==root&&!path.startsWith(root+sep))throw new Error('Invalid path');
  if(statSync(path).isDirectory())path=resolve(path,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'})[extname(path)]||'application/octet-stream');
  res.end(readFileSync(path));
 }catch{res.statusCode=404;res.end('not found');}
});await new Promise(r=>server.listen(5175,'127.0.0.1',r));
await mkdir('.qa',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM||undefined,args:['--no-sandbox']});
const results=[];
async function click(page,id) {
 await page.waitForFunction(id=>globalThis.__canvasGame?.buttons.some(b=>b.id===id&&!b.disabled),id);
 const p=await page.evaluate(id=>{const g=globalThis.__canvasGame,b=g.buttons.find(b=>b.id===id),s=g.metrics.uiScale;return{x:(b.x+b.w/2)*s,y:(b.y+b.h/2)*s};},id);
 await page.mouse.click(p.x,p.y);
}
async function screen(page,name){await page.waitForFunction(name=>globalThis.__canvasGame.screen===name && globalThis.__canvasGame.lastScreen===name,name);}
async function exit(page){await click(page,'settings');await click(page,'settings-levels');await click(page,'confirm-accept');await screen(page,'levels');}
async function findLevel(page,n){
 for(let i=0;i<20;i++){
  const visible=await page.evaluate(n=>{const g=globalThis.__canvasGame,b=g.buttons.find(b=>b.id==='level-'+n);return b&&b.h>10;},n);
  if(visible)return;
  const p=await page.evaluate(()=>{const g=globalThis.__canvasGame;return{x:g.metrics.width/2,y:(g.levelListTop+30)*g.metrics.uiScale};});
  await page.mouse.move(p.x,p.y);await page.mouse.wheel(0,180);await page.waitForTimeout(25);
 }throw new Error('Cannot find level '+n);
}
try{
 for(const [width,height] of [[390,844],[320,568],[1440,900]]){
 const errors=[];const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2});
 await page.addInitScript(()=>localStorage.setItem('qicai-modes-progress-v1',JSON.stringify({unlockedLevel:24,levelRecords:{},artworks:[],draft:null})));
 await page.addInitScript(()=>localStorage.setItem('caisha-signin-prompt-v1',new Date(Date.now()+8*3600000).toISOString().slice(0,10)));
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:5175/caisha-xiaoxiaole-preview/?debug=1',{waitUntil:'networkidle'});
 await page.screenshot({path:`.qa/perf-home-${width}.png`});
 const imageRequests=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.initiatorType==='img').map(e=>e.name));
 // Home now deliberately preloads two small sign-in/backpack tiles.
 // Preserve the eight-image budget: full dialog artwork remains lazy.
 const startupImages=imageRequests.filter(p=>p.includes('/images/'));
 assert.equal(startupImages.length,8,'Home must preload only its 8 approved images');
 assert.equal(new Set(startupImages).size,startupImages.length,'Duplicate startup image requests');
 const rewards=startupImages.filter(p=>p.includes('/images/rewards/'));
 assert.equal(rewards.length,2,'Only the two home reward tiles may load before opening dialogs');
 for(const icon of ['home-signin.webp','home-backpack.webp'])
   assert.ok(rewards.some(p=>p.endsWith('/images/rewards/'+icon)),'Missing home reward icon '+icon);
 await click(page,'start');await screen(page,'levels');
 const starts=[];
 for(let id=1;id<=24;id++){
  await findLevel(page,id);
  await click(page,'level-'+id);await screen(page,'playing');
  if(id===1){assert.equal(await page.evaluate(()=>globalThis.__canvasGame.tutorial?.step),'drag');}
  if(id===2){
   const colorProbe=await page.evaluate(()=>{
    const g=globalThis.__canvasGame,p=g.session.fruitManager.spawnProvider;
    const old=g.session.fruitManager.random;
    g.session.fruitManager.random=()=>0;const a=p().color;
    g.session.fruitManager.random=()=>.999;const b=p().color;
    g.session.fruitManager.random=old;return{a,b,palette:g.session.levelData.palette};
   });
   assert.notEqual(colorProbe.a,colorProbe.b,'level 2 should randomly spawn both remaining colors');
   assert.ok(colorProbe.palette.includes(colorProbe.a)&&colorProbe.palette.includes(colorProbe.b));
  }
  const first=await page.evaluate(()=>globalThis.__canvasGame.performance.levelStarts.at(-1));
  assert.equal(first.level,id);assert.ok(first.ms<100);
  starts.push(first);
  // Dismiss actual first-time prop tutorials through the input surface.
  for(let i=0;i<2;i++){
   if(!await page.evaluate(()=>Boolean(globalThis.__canvasGame.propIntro)))break;
   await page.mouse.click(width/2,height/2);await page.waitForTimeout(620);
  }
  if(id===1){
   const p=await page.evaluate(()=>{const g=globalThis.__canvasGame,b=g.metrics.board,s=g.metrics.uiScale;return{x:(b.x+b.width*.5)*s,y:(b.y+b.height*.15)*s};});
   await page.mouse.click(p.x,p.y);
   await page.waitForFunction(()=>globalThis.__canvasGame.session.dropCount>0);
  }
  await exit(page);await findLevel(page,id);await click(page,'level-'+id);await screen(page,'playing');
  starts.push(await page.evaluate(()=>globalThis.__canvasGame.performance.levelStarts.at(-1)));
  await exit(page);
 }
 await page.screenshot({path:`.qa/perf-levels-${width}.png`});
 results.push({width,height,starts,performance:await page.evaluate(()=>globalThis.__canvasGame.performance),web:await page.evaluate(()=>globalThis.__canvasGame.platform.performanceStats)});
 assert.deepEqual(errors,[]);await page.close();
 }
 // New player: locked feedback, drag originating on a card, visible clipped targets.
 const page=await browser.newPage({viewport:{width:320,height:568}});
 await page.addInitScript(()=>localStorage.setItem('caisha-signin-prompt-v1',new Date(Date.now()+8*3600000).toISOString().slice(0,10)));
 await page.goto('http://127.0.0.1:5175/caisha-xiaoxiaole-preview/?debug=1',{waitUntil:'networkidle'});await click(page,'start');await screen(page,'levels');
 await click(page,'level-2');assert.equal(await page.evaluate(()=>globalThis.__canvasGame.toastText),'请先完成上一关');
 assert.equal(await page.evaluate(()=>globalThis.__canvasGame.screen),'levels');
 const drag=await page.evaluate(()=>{const g=globalThis.__canvasGame,b=g.buttons.find(b=>b.id==='level-1'),s=g.metrics.uiScale;return{x:(b.x+b.w/2)*s,y:(b.y+b.h/2)*s};});
 await page.mouse.move(drag.x,drag.y);await page.mouse.down();await page.mouse.move(drag.x,drag.y-120,{steps:5});await page.mouse.up();
 assert.ok(await page.evaluate(()=>globalThis.__canvasGame.levelScroll>0));
 assert.equal(await page.evaluate(()=>globalThis.__canvasGame.screen),'levels');
 const clipped=await page.evaluate(()=>{const g=globalThis.__canvasGame;return g.buttons.filter(b=>b.id.startsWith('level-')).every(b=>b.y>=g.levelListTop-4&&b.y+b.h<=g.levelListBottom+.01);});assert.ok(clipped);
 // Renderer pixel equality against original pipeline, including changes and bulk restores.
 const visual=await page.evaluate(async()=>{
  const g=globalThis.__canvasGame,grid=g.session.grid,current=g.renderer;
  // Force one raster backend for pixel readback; Chrome can otherwise switch
  // the reference to CPU while the retained terrain remains on the GPU.
  const factory=()=>{const c=document.createElement('canvas');c.width=180;c.height=320;c.getContext('2d',{alpha:true,willReadFrequently:true});return c;};
  current.logicalCanvas=factory();current.logicalCtx=current.logicalCanvas.getContext('2d');current.ctx=current.logicalCtx;
  current.terrainCanvas=factory();current.terrainCtx=current.terrainCanvas.getContext('2d');current.terrainCells.fill(0);current.terrainRevision=-1;
  const canvas=factory(),ctx=canvas.getContext('2d'),comparisons=[];
  const palette={1:[255,90,95],2:[255,159,67],3:[255,217,61],4:[107,203,119],5:[78,205,196],6:[77,150,255],7:[155,93,229]};
  const srgb=c=>{const l=Math.max(0,Math.min(255,c))/255;return Math.round(255*(l<=.0031308?l*12.92:1.055*l**(1/2.4)-.055));};
  const old={update(){ctx.clearRect(0,0,180,320);for(let y=0;y<320;y++)for(let x=0;x<180;x++){
   const color=grid.cells[y*180+x];if(!color)continue;
   const hash=((x*73856093)^(y*19349663)^(color*83492791))>>>0;
   const rgb=palette[color].map(c=>srgb(c+(hash%13)-6));ctx.fillStyle=`rgb(${rgb.join(',')})`;ctx.fillRect(x+.05,y+.05,.90,.90);
  }}};
  const compare=()=>{current.update(null,false,false);old.update();const a=current.logicalCtx.getImageData(0,0,180,320).data,b=ctx.getImageData(0,0,180,320).data;let diff=0,max=0;for(let i=0;i<a.length;i++){if(a[i]!==b[i])diff++;max=Math.max(max,Math.abs(a[i]-b[i]));}comparisons.push({diff,max});};
  grid.clear();
  for(let y=180;y<320;y++)for(let x=0;x<180;x++)if((x+y)%5)grid.set(x,y,(x%7)+1);compare();
  grid.set(20,200,0);grid.set(21,200,7);compare();
  grid.cells.fill(3,5000,13000);grid.revision++;compare();grid.clear();compare();
  for(let y=120;y<320;y++)for(let x=0;x<180;x++)grid.set(x,y,(x%7)+1);
  current.update(null,false,false);const time=fn=>{const t=performance.now();for(let i=0;i<30;i++)fn();return(performance.now()-t)/30;};
  return{comparisons,originalMs:time(()=>old.update(null,false,false)),cachedMs:time(()=>current.update(null,false,false)),stats:current.renderStats};
 });
 assert.ok(visual.comparisons.every(c=>c.max===0),'Renderer must preserve exact original grain pixels: '+JSON.stringify(visual));
 results.push({visual});await page.close();
 await writeFile('.qa/performance-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>r.visual??{width:r.width,maxStartMs:Math.max(...r.starts.map(s=>s.ms)),maxFrameMs:r.performance.maxFrameMs,web:r.web}),null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
