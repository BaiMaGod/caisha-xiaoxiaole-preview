import assert from 'node:assert/strict';
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/src/main.js', async route => {
      const response = await route.fetch();
      const code = await response.text();
      await route.fulfill({response, body: code + '\n globalThis.__colorQA = {restartGame, fruitManager, grid, getLevelData: () => levelData};\n'});
    });
    await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => Boolean(window.__colorQA), null, {timeout:30000});
    const result = await page.evaluate(() => {
      const qa = window.__colorQA;
      const check = (condition, message) => {if(!condition) throw new Error(message);};
      const results = [];
      for(let id=1; id<=12; id++) {
        qa.restartGame('level',id);
        const data = qa.getLevelData();
        const manager = qa.fruitManager;
        check(manager.current.color === data.solution[0].color, 'guided color '+id);
        check(manager.current.template.id === data.solution[0].templateId, 'guided shape '+id);
        check(manager.current.x === Math.round(data.solution[0].centerX - manager.current.template.width / 2), 'guided position '+id);
        if(id<3) {
          for(const action of data.solution.slice(1)) {
            manager.spawnRandomFruit();
            check(manager.current.color===action.color, 'early queue color '+id);
            check(manager.current.template.id===action.templateId, 'early queue shape '+id);
          }
          manager.spawnRandomFruit();
          check(manager.current.color===data.palette.at(-1), 'early fallback '+id);
          results.push({id,policy:'guided queue preserved'});
          continue;
        }
        qa.grid.clear();
        const counts = Object.fromEntries(data.palette.map(color=>[color,0]));
        for(let i=0; i<3000; i++) {
          manager.random=()=>(i+0.5)/3000;
          manager.spawnRandomFruit();
          const color=manager.current.color;
          check(data.palette.includes(color),'palette-only '+id);
          counts[color]++;
        }
        check(Object.values(counts).every(n=>n===3000/data.palette.length),'equal probability '+id);
        manager.random=()=>0.999;
        for(let i=0;i<5;i++) {
          manager.spawnRandomFruit();
          check(manager.current.color===data.palette.at(-1),'repeats allowed '+id);
        }
        results.push({id,palette:data.palette,counts,policy:'independent uniform draws after guide'});
      }
      return results;
    });
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({pageErrors:errors,results:result},null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
