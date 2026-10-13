import{$ as e,A as t,C as n,D as r,G as i,H as a,J as o,K as s,L as c,M as l,O as u,Q as d,S as f,T as p,U as m,V as h,W as g,X as _,Y as v,Z as y,_ as b,a as ee,b as te,c as ne,d as re,f as ie,h as x,i as ae,k as oe,l as se,m as S,n as C,o as ce,p as le,q as ue,r as w,s as de,t as T,u as fe,v as E,w as pe,x as me,y as he}from"./BlockPropVisuals-WVTN-2V3.js";var ge=class{constructor(e){this.simulation=e,this.fps=0,this.lastTime=performance.now(),this.frames=0}update(){this.frames++;let e=performance.now();e-this.lastTime>=1e3&&(this.fps=this.frames,this.frames=0,this.lastTime=e,console.log(`FPS:${this.fps} moved:${this.simulation.movedCount}`))}},_e=class{constructor(t=document.body){m(),this.score=0,this.combo=0,this.restartHandler=null,this.homeHandler=null,this.container=t,this.dropHintCount=0,this.gameVisible=!0,this.root=document.createElement(`div`),this.root.style.position=`absolute`,this.root.style.left=`14px`,this.root.style.top=`14px`,this.root.style.zIndex=`10`,this.root.style.minWidth=`74px`,this.root.style.padding=`9px 12px`,this.root.style.borderRadius=`14px`,this.root.style.background=`rgba(255,255,255,0.9)`,this.root.style.boxShadow=`0 5px 16px rgba(91, 65, 42, 0.09)`,this.root.style.backdropFilter=`blur(8px)`,this.root.style.font=`700 13px/1.35 system-ui, sans-serif`,this.root.style.color=`#5d4632`,this.root.style.pointerEvents=`none`,this.root.style.userSelect=`none`,this.tip=document.createElement(`div`),this.tip.textContent=`左右拖动 · 松手下落 · 下滑×2`,this.tip.style.position=`absolute`,this.tip.style.left=`50%`,this.tip.style.top=`calc(${(e.DEATH_LINE_Y+6)/e.HEIGHT*100}% + 4px)`,this.tip.style.transform=`translateX(-50%)`,this.tip.style.zIndex=`12`,this.tip.style.padding=`6px 10px`,this.tip.style.borderRadius=`999px`,this.tip.style.background=`rgba(255,255,255,0.84)`,this.tip.style.boxShadow=`0 4px 14px rgba(91,65,42,0.08)`,this.tip.style.backdropFilter=`blur(7px)`,this.tip.style.color=`rgba(92,73,57,0.76)`,this.tip.style.font=`700 11px/1 system-ui, sans-serif`,this.tip.style.whiteSpace=`nowrap`,this.tip.style.pointerEvents=`none`,this.tip.style.userSelect=`none`,this.tip.style.transition=`opacity 180ms ease, transform 180ms ease`,this.overlay=document.createElement(`div`),this.overlay.style.position=`absolute`,this.overlay.style.inset=`0`,this.overlay.style.zIndex=`20`,this.overlay.style.display=`none`,this.overlay.style.alignItems=`center`,this.overlay.style.justifyContent=`center`,this.overlay.style.padding=`24px`,this.overlay.style.background=`rgba(54, 38, 26, 0.32)`,this.overlay.style.backdropFilter=`blur(3px)`,this.panel=document.createElement(`div`),this.panel.style.width=`min(100%, 270px)`,this.panel.style.padding=`26px 24px 24px`,this.panel.style.borderRadius=`24px`,this.panel.style.background=`rgba(255,255,255,0.97)`,this.panel.style.boxShadow=`0 18px 50px rgba(75, 45, 20, 0.2)`,this.panel.style.textAlign=`center`,this.panel.style.color=`#5d4632`,this.panel.style.fontFamily=`system-ui, sans-serif`,this.title=document.createElement(`div`),this.title.textContent=`游戏结束`,this.title.style.fontSize=`28px`,this.title.style.fontWeight=`850`,this.finalScore=document.createElement(`div`),this.finalScore.style.marginTop=`9px`,this.finalScore.style.fontSize=`15px`,this.finalScore.style.fontWeight=`650`,this.restartButton=document.createElement(`button`),this.restartButton.textContent=`再来一局`,this.restartButton.style.marginTop=`20px`,this.restartButton.style.border=`0`,this.restartButton.style.borderRadius=`999px`,this.restartButton.style.padding=`12px 30px`,this.restartButton.style.fontSize=`16px`,this.restartButton.style.fontWeight=`750`,this.restartButton.style.color=`#fff`,this.restartButton.style.background=`#ff8057`,this.restartButton.style.boxShadow=`0 8px 18px rgba(255, 128, 87, 0.28)`,this.restartButton.style.cursor=`pointer`,this.restartButton.addEventListener(`click`,()=>{this.restartHandler?.()}),this.restartButton.style.marginTop=`0`,this.homeButton=document.createElement(`button`),this.homeButton.textContent=`返回首页`,this.homeButton.style.border=`1px solid rgba(114,81,58,0.14)`,this.homeButton.style.borderRadius=`999px`,this.homeButton.style.padding=`12px 22px`,this.homeButton.style.fontSize=`15px`,this.homeButton.style.fontWeight=`750`,this.homeButton.style.color=`#72513a`,this.homeButton.style.background=`#f6ede3`,this.homeButton.style.cursor=`pointer`,this.homeButton.addEventListener(`click`,()=>{this.homeHandler?.()}),this.actions=document.createElement(`div`),this.actions.style.marginTop=`20px`,this.actions.style.display=`flex`,this.actions.style.justifyContent=`center`,this.actions.style.gap=`9px`,this.actions.append(this.homeButton,this.restartButton),this.panel.append(this.title,this.finalScore,this.actions),this.overlay.appendChild(this.panel),this.container.append(this.root,this.tip,this.overlay),this.render()}notifyDropReleased(){this.dropHintCount+=1,this.dropHintCount>=3&&(this.tip.style.opacity=`0`,this.tip.style.transform=`translate(-50%, -4px)`,clearTimeout(this.tipHideTimer),this.tipHideTimer=setTimeout(()=>{this.tip.style.display=`none`},190))}setGameVisible(e){if(this.gameVisible=!!e,this.root.style.display=this.gameVisible?`block`:`none`,!this.gameVisible){this.tip.style.display=`none`;return}this.dropHintCount<3&&(this.tip.style.display=`block`,this.tip.style.opacity=`1`,this.tip.style.transform=`translateX(-50%)`)}resetHint(){clearTimeout(this.tipHideTimer),this.dropHintCount=0,this.tip.style.opacity=`1`,this.tip.style.transform=`translateX(-50%)`,this.tip.style.display=this.gameVisible?`block`:`none`}setScore(e){this.score=e,this.render()}showCombo(e){this.combo=e,this.render(),clearTimeout(this.comboTimer),this.comboTimer=setTimeout(()=>{this.combo=0,this.render()},900)}setRestartHandler(e){this.restartHandler=e}setHomeHandler(e){this.homeHandler=e}showGameOver(e){clearTimeout(this.comboTimer),this.combo=0,this.finalScore.replaceChildren(document.createTextNode(`最终得分：`),Object.assign(document.createElement(`span`),{className:`caisha-rainbow-score`,textContent:String(e)})),this.overlay.style.display=`flex`,this.render()}hideGameOver(){this.overlay.style.display=`none`}reset(){clearTimeout(this.comboTimer),this.score=0,this.combo=0,this.hideGameOver(),this.resetHint(),this.render()}render(){let e=this.combo>1?`<div style="margin-top:3px;color:#ff6f45;font-size:14px">Combo × ${this.combo}</div>`:``;this.root.innerHTML=`<div style="font-size:10px;opacity:.58;font-weight:700">SCORE</div><div style="font-size:18px;line-height:1.1;margin-top:1px"><span class="caisha-rainbow-score">${this.score}</span></div>`+e}},ve=class{constructor(e,t,n=null,{getEffectId:r=()=>u.DEFAULT}={}){this.getEffectId=r,this.activeEffectId=null,this.effects=new Map([[u.DEFAULT,new c(e,t,n)],[u.WIND,new l(e,t,n)]])}resolveEffectId(){return t(this.getEffectId?.()).id}play(e,t=null){let n=this.resolveEffectId(),r=this.effects.get(n)??this.effects.get(u.DEFAULT);for(let[e,t]of this.effects)e!==n&&t.clear();this.activeEffectId=n,r.play(e,t)}isBusy(){return this.activeEffectId?!!this.effects.get(this.activeEffectId)?.isBusy():!1}clear(){for(let e of this.effects.values())e.clear();this.activeEffectId=null}},ye={GOOD:{notes:[659.25,783.99,987.77],gaps:[0,.075,.155],voiceRate:1.02,detune:40,sparkle:1400},GREAT:{notes:[659.25,830.61,987.77,1244.51],gaps:[0,.065,.135,.215],voiceRate:1.035,detune:65,sparkle:1580},AMAZING:{notes:[698.46,830.61,987.77,1174.66,1318.51],gaps:[0,.062,.13,.2,.265],voiceRate:1.042,detune:78,sparkle:1700},PERFECT:{notes:[698.46,880,1046.5,1244.51,1396.91],gaps:[0,.06,.125,.195,.275],voiceRate:1.05,detune:90,sparkle:1820},UNBELIEVABLE:{notes:[783.99,987.77,1174.66,1396.91,1661.22,1975.53],gaps:[0,.055,.115,.18,.255,.345],voiceRate:1.065,detune:115,sparkle:2100}};function be(e){return ye[e]??ye.GOOD}var xe=class{constructor(e,{context:t=null,destination:n=null,autoUnlock:r=!0}={}){if(this.context=t,this.destination=n,this.voiceBuffers=new Map,this.voiceLoadPromises=new Map,this.activeVoiceSources=new Set,this.activeOscillators=new Set,this.ensureContext(),this.preloadVoices(),r&&e){let t=()=>this.unlock();e.addEventListener(`pointerdown`,t,{passive:!0}),e.addEventListener(`touchstart`,t,{passive:!0})}}ensureContext(){if(this.context)return this.context;if(typeof window>`u`)return null;let e=window.AudioContext||window.webkitAudioContext;return e?(this.context=new e,this.context):null}getDestination(){let e=this.ensureContext();return this.destination??e?.destination??null}unlock(){this.ensureContext()?.resume?.(),this.preloadVoices()}loadVoice(e,t){let n=this.ensureContext();if(!n)return Promise.resolve(null);if(this.voiceBuffers.has(e))return Promise.resolve(this.voiceBuffers.get(e));if(this.voiceLoadPromises.has(e))return this.voiceLoadPromises.get(e);let r=(async()=>{let r=`./${t}`,i=await fetch(r);if(!i.ok)throw Error(`Failed to load reward voice: ${r}`);let a=await i.arrayBuffer(),o=await n.decodeAudioData(a.slice(0));return this.voiceBuffers.set(e,o),o})().catch(t=>(console.warn(`Reward voice preload failed`,e,t),null)).finally(()=>{this.voiceLoadPromises.delete(e)});return this.voiceLoadPromises.set(e,r),r}preloadVoices(){return Promise.allSettled(Object.entries(p).map(([e,t])=>this.loadVoice(e,t)))}play(e,t=1){let n=this.ensureContext();if(!n)return Promise.resolve();n.resume?.();let r=this.playCuteArcadeFx(e,t),i=this.playCuteVoice(e);return Promise.all([r,i])}stop(){for(let e of this.activeVoiceSources)try{e.stop()}catch{}for(let e of this.activeOscillators)try{e.stop()}catch{}this.activeVoiceSources.clear(),this.activeOscillators.clear()}playCuteVoice(e){let t=this.ensureContext(),n=this.getDestination();if(!t||!n)return Promise.resolve();let r=this.voiceBuffers.get(e)??this.voiceBuffers.get(`GOOD`);if(!r)return this.preloadVoices(),Promise.resolve();let i=be(e);return new Promise(e=>{let a=t.createBufferSource(),o=t.createGain(),s=t.createBiquadFilter();a.buffer=r,a.playbackRate.value=i.voiceRate,`detune`in a&&(a.detune.value=i.detune),s.type=`highshelf`,s.frequency.value=3200,s.gain.value=-3,o.gain.value=.48,a.connect(s),s.connect(o),o.connect(n),this.activeVoiceSources.add(a),a.onended=()=>{this.activeVoiceSources.delete(a),e()},a.start(0)})}playCuteArcadeFx(e,t){let n=this.ensureContext();if(!n)return Promise.resolve();let r=be(e),i=n.currentTime,a=Math.min(1.08,.7+t*.07);this.scheduleTone({start:i,frequency:320,endFrequency:470,duration:.1,peak:.07*a,type:`sine`}),r.notes.forEach((e,t)=>{this.scheduleTone({start:i+r.gaps[t],frequency:e,endFrequency:Math.min(2200,e*1.035),duration:.18,peak:(.052+t*.005)*a,type:t%2==0?`sine`:`triangle`})});let o=i+r.gaps[r.gaps.length-1]+.085;this.scheduleTone({start:o,frequency:r.sparkle,endFrequency:Math.min(2350,r.sparkle*1.1),duration:.15,peak:.044*a,type:`sine`}),this.scheduleTone({start:o+.045,frequency:Math.min(2250,r.sparkle*1.18),endFrequency:Math.min(2400,r.sparkle*1.24),duration:.11,peak:.026*a,type:`sine`});let s=Math.ceil((r.gaps[r.gaps.length-1]+.3)*1e3);return new Promise(e=>{setTimeout(e,s)})}scheduleTone({start:e,frequency:t,endFrequency:n,duration:r,peak:i,type:a}){let o=this.ensureContext(),s=this.getDestination();if(!o||!s)return;let c=o.createOscillator(),l=o.createGain();c.type=a,c.frequency.setValueAtTime(t,e),c.frequency.exponentialRampToValueAtTime(Math.max(20,n),e+r),l.gain.setValueAtTime(1e-4,e),l.gain.exponentialRampToValueAtTime(Math.max(2e-4,i),e+.012),l.gain.exponentialRampToValueAtTime(1e-4,e+r),c.connect(l),l.connect(s),this.activeOscillators.add(c),c.onended=()=>{this.activeOscillators.delete(c)},c.start(e),c.stop(e+r+.01)}},Se=`caisha.audio.muted.v1`,D=`caisha.audio.musicVolume.v1`,O=`caisha.audio.sfxVolume.v1`,Ce=`audio/clear-roulette-fast-v2.mp3`,k=.7,A=.8,we=.9,Te=.9,Ee=.62,De=.72,j=.82;function M(e,t,n){return Math.max(t,Math.min(n,e))}function Oe(e){let t=Math.max(0,Number(e)||0);return t<2?0:M(Math.sqrt(t/900),0,1)}function ke(e,t=1){let n=Math.max(1,Number(e)||1),r=Math.max(1,Number(t)||1);return M(.46+Math.log10(n)*.18+(r-1)*.055,.55,1.28)}function Ae(e){try{return e?.getItem?.(Se)===`1`}catch{return!1}}function je(e,t){try{e?.setItem?.(Se,t?`1`:`0`)}catch{}}function N(e,t){try{let n=e?.getItem?.(t);if(n==null||n===``)return null;let r=Number(n);return Number.isFinite(r)?M(r,0,1):null}catch{return null}}function P(e,t,n){try{e?.setItem?.(t,String(M(Number(n)||0,0,1)))}catch{}}function F(e,t,n){return t<=0?0:t/n*e}var Me=class{constructor(e,{storage:t=globalThis.localStorage}={}){this.element=e,this.storage=t;let n=Ae(t),r=N(t,D),i=N(t,O);this.musicVolume=r??(n?0:.7),this.sfxVolume=i??(n?0:.8),this.lastNonZeroMusicVolume=this.musicVolume>0?this.musicVolume:k,this.lastNonZeroSfxVolume=this.sfxVolume>0?this.sfxVolume:A,this.context=null,this.masterGain=null,this.sfxGain=null,this.uiGain=null,this.ambienceGain=null,this.rewardGain=null,this.compressor=null,this.rewardAudio=null,this.muted=this.musicVolume<=0&&this.sfxVolume<=0,this.userUnlocked=!1,this.suspendedByVisibility=!1,this.activeSources=new Set,this.activeOscillators=new Set,this.noiseBuffer=null,this.sandSource=null,this.sandFilter=null,this.sandGain=null,this.clearSweepIntensity=0,this.clearSweepLastBucket=-1,this.clearSweepCombo=1,this.clearSweepBuffer=null,this.clearSweepLoadPromise=null,this.clearSweepSource=null,this.clearSweepGain=null,this.lastUiSoundAt=-1/0,this.muteButton=null,this.ensureContext();let a=()=>this.unlock();e?.addEventListener?.(`pointerdown`,a,{passive:!0}),e?.addEventListener?.(`touchstart`,a,{passive:!0}),e?.addEventListener?.(`click`,e=>{let t=e.target?.closest?.(`button`);t&&!t.disabled&&t.dataset.audioSkipClick!==`true`&&this.playUiClick()})}ensureContext(){if(this.context)return this.context;if(typeof window>`u`)return null;let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;let t=new e;return this.context=t,this.masterGain=t.createGain(),this.sfxGain=t.createGain(),this.uiGain=t.createGain(),this.ambienceGain=t.createGain(),this.rewardGain=t.createGain(),this.masterGain.gain.value=we,this.sfxGain.gain.value=F(Te,this.sfxVolume,A),this.uiGain.gain.value=F(Ee,this.sfxVolume,A),this.ambienceGain.gain.value=F(De,this.musicVolume,k),this.rewardGain.gain.value=F(j,this.sfxVolume,A),this.compressor=t.createDynamicsCompressor?.()??null,this.compressor?(this.compressor.threshold.value=-13,this.compressor.knee.value=16,this.compressor.ratio.value=4,this.compressor.attack.value=.006,this.compressor.release.value=.16,this.masterGain.connect(this.compressor),this.compressor.connect(t.destination)):this.masterGain.connect(t.destination),this.sfxGain.connect(this.masterGain),this.uiGain.connect(this.masterGain),this.ambienceGain.connect(this.masterGain),this.rewardGain.connect(this.masterGain),this.rewardAudio=new xe(null,{context:t,destination:this.rewardGain,autoUnlock:!1}),this.rewardAudio.preloadVoices(),this.preloadClearSweep(),t}unlock(){let e=this.ensureContext();e&&(this.userUnlocked=!0,this.suspendedByVisibility=!1,e.resume?.(),this.ensureSandLoop(),this.rewardAudio?.preloadVoices())}suspendForVisibility(){this.context&&(this.suspendedByVisibility=!0,this.setSandFlow(0),this.endClearSweep({immediate:!0}),this.context.suspend?.())}resumeFromVisibility(){this.context&&this.userUnlocked&&(this.suspendedByVisibility=!1,this.context.resume?.(),this.ensureSandLoop())}isMuted(){return this.muted}getMusicVolume(){return this.musicVolume}getSfxVolume(){return this.sfxVolume}syncMutedState(){return this.muted=this.musicVolume<=0&&this.sfxVolume<=0,je(this.storage,this.muted),this.refreshMuteButton(),this.muted}applyVolumeGains({immediate:e=!1}={}){let t=this.ensureContext();if(!t)return;let n=t.currentTime,r=e?0:.045,i=[[this.sfxGain,F(Te,this.sfxVolume,A)],[this.uiGain,F(Ee,this.sfxVolume,A)],[this.ambienceGain,F(De,this.musicVolume,k)],[this.rewardGain,F(j,this.sfxVolume,A)]];for(let[e,t]of i)if(e?.gain){if(e.gain.cancelScheduledValues(n),r<=0){e.gain.setValueAtTime(t,n);continue}e.gain.setValueAtTime(e.gain.value,n),e.gain.linearRampToValueAtTime(t,n+r)}}setMusicVolume(e){return this.musicVolume=M(Number(e)||0,0,1),this.musicVolume>0&&(this.lastNonZeroMusicVolume=this.musicVolume),P(this.storage,D,this.musicVolume),this.syncMutedState(),this.applyVolumeGains(),this.musicVolume}setSfxVolume(e){return this.sfxVolume=M(Number(e)||0,0,1),this.sfxVolume>0&&(this.lastNonZeroSfxVolume=this.sfxVolume),P(this.storage,O,this.sfxVolume),this.syncMutedState(),this.applyVolumeGains(),this.sfxVolume}setMuted(e){return e?(this.musicVolume>0&&(this.lastNonZeroMusicVolume=this.musicVolume),this.sfxVolume>0&&(this.lastNonZeroSfxVolume=this.sfxVolume),this.musicVolume=0,this.sfxVolume=0):this.musicVolume<=0&&this.sfxVolume<=0&&(this.musicVolume=this.lastNonZeroMusicVolume||.7,this.sfxVolume=this.lastNonZeroSfxVolume||.8),P(this.storage,D,this.musicVolume),P(this.storage,O,this.sfxVolume),this.syncMutedState(),this.applyVolumeGains(),this.muted}toggleMuted(){return this.setMuted(!this.isMuted())}mountMuteButton(e){if(!e||this.muteButton||typeof document>`u`)return this.muteButton;let t=document.createElement(`button`);return t.type=`button`,t.dataset.audioSkipClick=`true`,t.setAttribute(`aria-label`,`声音开关`),t.style.position=`absolute`,t.style.right=`12px`,t.style.bottom=`max(12px, env(safe-area-inset-bottom))`,t.style.zIndex=`35`,t.style.width=`38px`,t.style.height=`38px`,t.style.display=`grid`,t.style.placeItems=`center`,t.style.padding=`0`,t.style.border=`1px solid rgba(111,82,57,.10)`,t.style.borderRadius=`50%`,t.style.background=`rgba(255,255,255,.82)`,t.style.boxShadow=`0 5px 16px rgba(91,65,42,.10)`,t.style.backdropFilter=`blur(8px)`,t.style.font=`700 18px/1 system-ui, sans-serif`,t.style.cursor=`pointer`,t.style.touchAction=`manipulation`,t.style.opacity=`.88`,t.addEventListener(`click`,e=>{e.stopPropagation(),this.toggleMuted()||(this.unlock(),this.playUiClick({force:!0}))}),this.muteButton=t,e.appendChild(t),this.refreshMuteButton(),t}refreshMuteButton(){this.muteButton&&(this.muteButton.textContent=this.isMuted()?`🔇`:`🔊`,this.muteButton.title=this.isMuted()?`开启声音`:`关闭声音`)}playUiClick({force:e=!1}={}){if(this.muted&&!e)return;let t=typeof performance<`u`?performance.now():Date.now();if(!e&&t-this.lastUiSoundAt<55)return;this.lastUiSoundAt=t;let n=this.ensureContext();if(!n||n.state===`suspended`)return;let r=n.currentTime;this.scheduleTone({destination:this.uiGain,start:r,frequency:720,endFrequency:900,duration:.045,peak:.045,type:`sine`})}playRelease(){if(this.muted)return;let e=this.ensureContext();if(!e||e.state===`suspended`)return;let t=e.currentTime;this.scheduleTone({destination:this.sfxGain,start:t,frequency:880,endFrequency:932,duration:.055,peak:.032,type:`sine`}),this.scheduleTone({destination:this.sfxGain,start:t+.045,frequency:1046.5,endFrequency:1174.7,duration:.075,peak:.035,type:`triangle`})}playFallStart(){if(this.muted)return;let e=this.ensureContext();if(!e||e.state===`suspended`)return;let t=e.currentTime;this.scheduleTone({destination:this.sfxGain,start:t,frequency:659.25,endFrequency:587.33,duration:.085,peak:.026,type:`triangle`}),this.scheduleTone({destination:this.sfxGain,start:t+.065,frequency:783.99,endFrequency:698.46,duration:.09,peak:.022,type:`sine`})}playFastDrop(){if(this.muted)return;let e=this.ensureContext();if(!e||e.state===`suspended`)return;let t=e.currentTime;[1046.5,1318.5,1568].forEach((e,n)=>{this.scheduleTone({destination:this.sfxGain,start:t+n*.045,frequency:e,endFrequency:e*1.035,duration:.075,peak:.029+n*.003,type:n===1?`triangle`:`sine`})})}playImpact(e=1){if(this.muted)return;let t=this.ensureContext();if(!t||t.state===`suspended`)return;let n=M(Number(e)||1,.7,1.3),r=t.currentTime;this.playNoiseBurst({destination:this.sfxGain,duration:.13,peak:.07*n,filterType:`lowpass`,startFrequency:720,endFrequency:340,q:.65}),this.scheduleTone({destination:this.sfxGain,start:r,frequency:120,endFrequency:72,duration:.14,peak:.045*n,type:`sine`})}playCrumble(){if(this.muted)return;let e=this.ensureContext();e&&e.state!==`suspended`&&this.playNoiseBurst({destination:this.sfxGain,duration:.3,peak:.052,filterType:`bandpass`,startFrequency:1350,endFrequency:760,q:.7})}loadClearSweep(){let e=this.ensureContext();if(!e)return Promise.resolve(null);if(this.clearSweepBuffer)return Promise.resolve(this.clearSweepBuffer);if(this.clearSweepLoadPromise)return this.clearSweepLoadPromise;let t=(async()=>{let t=`./${Ce}`,n=await fetch(t);if(!n.ok)throw Error(`Failed to load clear sweep audio: ${t}`);let r=await n.arrayBuffer(),i=await e.decodeAudioData(r.slice(0));return this.clearSweepBuffer=i,i})().catch(e=>(console.warn(`Clear sweep audio preload failed`,e),null)).finally(()=>{this.clearSweepLoadPromise=null});return this.clearSweepLoadPromise=t,t}preloadClearSweep(){return this.loadClearSweep()}stopClearSweepSource({immediate:e=!1}={}){let t=this.context,n=this.clearSweepSource,r=this.clearSweepGain;if(this.clearSweepSource=null,this.clearSweepGain=null,n)try{if(!e&&t&&r){let e=t.currentTime;r.gain.cancelScheduledValues(e),r.gain.setValueAtTime(Math.max(1e-4,r.gain.value),e),r.gain.exponentialRampToValueAtTime(1e-4,e+.02),n.stop(e+.025)}else n.stop()}catch{}}beginClearSweep({cleared:e=0,combo:t=1}={}){if(this.muted)return;let n=this.ensureContext();if(!n||n.state===`suspended`)return;this.stopClearSweepSource({immediate:!0}),this.clearSweepIntensity=ke(e,t),this.clearSweepLastBucket=-1,this.clearSweepCombo=Math.max(1,Number(t)||1);let r=this.clearSweepBuffer;if(!r){this.preloadClearSweep();return}let i=n.createBufferSource(),a=n.createGain(),o=M(this.clearSweepIntensity,.55,1.08);i.buffer=r,a.gain.value=.34*o,i.connect(a),a.connect(this.sfxGain),this.clearSweepSource=i,this.clearSweepGain=a,i.onended=()=>{this.clearSweepSource===i&&(this.clearSweepSource=null,this.clearSweepGain=null)},i.start(n.currentTime)}updateClearSweep(){}endClearSweep({immediate:e=!1}={}){e&&this.stopClearSweepSource({immediate:!0}),this.clearSweepIntensity=0,this.clearSweepLastBucket=-1,this.clearSweepCombo=1}playReward(e,t=1){if(this.muted)return Promise.resolve();let n=this.ensureContext();return!n||n.state===`suspended`?Promise.resolve():this.rewardAudio?.play(e,t)??Promise.resolve()}playGameOver(){if(this.muted)return;let e=this.ensureContext();if(!e||e.state===`suspended`)return;this.setSandFlow(0);let t=e.currentTime;this.playNoiseBurst({destination:this.sfxGain,duration:.42,peak:.065,filterType:`lowpass`,startFrequency:840,endFrequency:260,q:.55}),this.scheduleTone({destination:this.sfxGain,start:t,frequency:235,endFrequency:92,duration:.42,peak:.055,type:`sine`})}updateSandFlow(e){if(this.muted||!this.userUnlocked||this.suspendedByVisibility){this.setSandFlow(0);return}let t=Oe(e);this.setSandFlow(t)}setSandFlow(e){let t=this.ensureContext();if(!t||(this.ensureSandLoop(),!this.sandGain||!this.sandFilter))return;let n=M(Number(e)||0,0,1),r=t.currentTime;this.sandGain.gain.cancelScheduledValues(r),this.sandGain.gain.setTargetAtTime(n*.055,r,n>0?.035:.09),this.sandFilter.frequency.cancelScheduledValues(r),this.sandFilter.frequency.setTargetAtTime(650+n*1050,r,.055)}ensureSandLoop(){let e=this.ensureContext();if(!e||this.sandSource)return;let t=e.createBufferSource(),n=e.createBiquadFilter(),r=e.createGain();t.buffer=this.getNoiseBuffer(),t.loop=!0,n.type=`bandpass`,n.frequency.value=850,n.Q.value=.55,r.gain.value=0,t.connect(n),n.connect(r),r.connect(this.ambienceGain),t.start(),this.sandSource=t,this.sandFilter=n,this.sandGain=r,t.onended=()=>{this.sandSource===t&&(this.sandSource=null,this.sandFilter=null,this.sandGain=null)}}getNoiseBuffer(){if(this.noiseBuffer)return this.noiseBuffer;let e=this.ensureContext();if(!e)return null;let t=Math.max(1,Math.floor(e.sampleRate*1.2)),n=e.createBuffer(1,t,e.sampleRate),r=n.getChannelData(0),i=0;for(let e=0;e<r.length;e++){let t=Math.random()*2-1;i=i*.32+t*.68,r[e]=i*.72}return this.noiseBuffer=n,n}playNoiseBurst({destination:e,duration:t,peak:n,filterType:r,startFrequency:i,endFrequency:a,q:o=.7}){let s=this.ensureContext();if(!s||!e)return;let c=s.createBufferSource(),l=s.createBiquadFilter(),u=s.createGain(),d=s.currentTime,f=d+Math.max(.03,t);c.buffer=this.getNoiseBuffer(),c.loop=!0,l.type=r,l.Q.value=o,l.frequency.setValueAtTime(Math.max(40,i),d),l.frequency.exponentialRampToValueAtTime(Math.max(40,a),f),u.gain.setValueAtTime(1e-4,d),u.gain.exponentialRampToValueAtTime(Math.max(2e-4,n),d+Math.min(.025,t*.2)),u.gain.exponentialRampToValueAtTime(1e-4,f),c.connect(l),l.connect(u),u.connect(e),this.trackSource(c),c.start(d),c.stop(f+.01)}scheduleTone({destination:e,start:t,frequency:n,endFrequency:r,duration:i,peak:a,type:o=`sine`,pan:s=0}){let c=this.ensureContext();if(!c||!e)return;let l=c.createOscillator(),u=c.createGain();l.type=o,l.frequency.setValueAtTime(Math.max(20,n),t),l.frequency.exponentialRampToValueAtTime(Math.max(20,r),t+i),u.gain.setValueAtTime(1e-4,t),u.gain.exponentialRampToValueAtTime(Math.max(2e-4,a),t+Math.min(.012,i*.25)),u.gain.exponentialRampToValueAtTime(1e-4,t+i);let d=c.createStereoPanner?.()??null;l.connect(u),d?(d.pan.value=M(Number(s)||0,-1,1),u.connect(d),d.connect(e)):u.connect(e),this.activeOscillators.add(l),l.onended=()=>{this.activeOscillators.delete(l)},l.start(t),l.stop(t+i+.01)}trackSource(e){this.activeSources.add(e),e.onended=()=>{this.activeSources.delete(e)}}stopTransient(){for(let e of this.activeSources)try{e.stop()}catch{}for(let e of this.activeOscillators)try{e.stop()}catch{}this.activeSources.clear(),this.activeOscillators.clear(),this.rewardAudio?.stop(),this.setSandFlow(0),this.endClearSweep({immediate:!0})}},Ne=class{constructor(e,t,n,{onRelease:r=null,onFastDrop:i=null,canInteract:a=()=>!0}={}){this.element=e,this.fruitManager=t,this.grid=n,this.onRelease=r,this.onFastDrop=i,this.canInteract=a,this.dragging=!1,this.dragStartX=0,this.dragStartY=0,this.fastDropActive=!1,e.addEventListener(`pointerdown`,t=>{this.canInteract()&&(this.dragging=!0,this.dragStartX=t.clientX,this.dragStartY=t.clientY,this.fastDropActive=!1,e.setPointerCapture?.(t.pointerId),this.updatePointer(t))}),e.addEventListener(`pointermove`,e=>{this.dragging&&this.canInteract()&&(this.updatePointer(e),this.updateFastDropGesture(e))});let o=e=>{if(this.dragging){if(!this.canInteract()){this.dragging=!1;return}this.updatePointer(e),this.dragging=!1,this.fastDropActive=!1,this.fruitManager.releaseCurrent()&&this.onRelease?.()}};e.addEventListener(`pointerup`,o),e.addEventListener(`pointercancel`,o)}updateFastDropGesture(e){if(this.fastDropActive)return;let t=this.element.getBoundingClientRect(),n=e.clientX-this.dragStartX,r=e.clientY-this.dragStartY;if(r<Math.max(18,Math.min(32,t.height*.035))||r<Math.abs(n)*.6)return;let i=this.fruitManager.startFastDrop();i.active&&(this.fastDropActive=!0,i.released&&this.onRelease?.(),this.onFastDrop?.())}updatePointer(e){let t=this.element.getBoundingClientRect(),n=Math.max(0,Math.min(1,(e.clientX-t.left)/t.width))*this.grid.width;this.fruitManager.setPointerX(n)}};function I(e){let t=document.createElement(`button`);return t.textContent=e,t.style.border=`0`,t.style.borderRadius=`999px`,t.style.padding=`9px 13px`,t.style.font=`800 12px/1 system-ui, sans-serif`,t.style.cursor=`pointer`,t.style.touchAction=`manipulation`,t}function Pe(e,t){let n=e.unlock??{};return n.type==="default"?`默认拥有`:n.type===`ad`?`观看 ${n.value} 次激励广告`:n.type===`score`?`最高分达到 ${n.value.toLocaleString()}`:n.type===`total_clear`?`累计消除 ${n.value.toLocaleString()} 粒`:n.type===`single_clear`?`单次消除 ${n.value.toLocaleString()} 粒`:`达成特殊成就`}function Fe(e,t){let n=e.unlock??{};if(n.type===`score`)return`${Math.min(t.stats.bestScore,n.value).toLocaleString()} / ${n.value.toLocaleString()}`;if(n.type===`total_clear`)return`${Math.min(t.stats.totalClearedParticles,n.value).toLocaleString()} / ${n.value.toLocaleString()}`;if(n.type===`ad`){let r=t.adUnlockProgress[e.id]??0;return`${Math.min(r,n.value)} / ${n.value}`}return``}var Ie=class{constructor(e,{progress:t,unlockManager:n,enabled:r=!1}={}){this.container=e,this.progress=t,this.unlockManager=n,this.enabled=!!r,this.opened=!1,this.entryButton=I(`✨ 特效`),this.entryButton.style.display=this.enabled?`inline-block`:`none`,this.entryButton.style.position=`absolute`,this.entryButton.style.top=`14px`,this.entryButton.style.right=`14px`,this.entryButton.style.zIndex=`13`,this.entryButton.style.color=`#72513a`,this.entryButton.style.background=`rgba(255,255,255,0.9)`,this.entryButton.style.boxShadow=`0 5px 16px rgba(91,65,42,0.10)`,this.entryButton.style.backdropFilter=`blur(8px)`,this.overlay=document.createElement(`div`),this.overlay.style.position=`absolute`,this.overlay.style.inset=`0`,this.overlay.style.zIndex=`40`,this.overlay.style.display=`none`,this.overlay.style.padding=`18px 14px`,this.overlay.style.background=`rgba(55,40,28,0.34)`,this.overlay.style.backdropFilter=`blur(5px)`,this.overlay.style.overflow=`hidden`,this.overlay.style.touchAction=`pan-y`,this.sheet=document.createElement(`div`),this.sheet.style.height=`100%`,this.sheet.style.display=`flex`,this.sheet.style.flexDirection=`column`,this.sheet.style.borderRadius=`24px`,this.sheet.style.padding=`18px`,this.sheet.style.background=`rgba(255,251,244,0.98)`,this.sheet.style.boxShadow=`0 22px 60px rgba(70,43,20,0.24)`,this.sheet.style.color=`#5d4632`,this.sheet.style.fontFamily=`system-ui, sans-serif`;let i=document.createElement(`div`);i.style.display=`flex`,i.style.alignItems=`center`,i.style.justifyContent=`space-between`,i.style.gap=`12px`,this.title=document.createElement(`div`),this.title.style.font=`900 23px/1.1 system-ui, sans-serif`,this.title.textContent=`消除特效`,this.closeButton=I(`关闭`),this.closeButton.style.color=`#72513a`,this.closeButton.style.background=`#f2e8dc`,this.summary=document.createElement(`div`),this.summary.style.marginTop=`8px`,this.summary.style.font=`700 11px/1.45 system-ui, sans-serif`,this.summary.style.color=`rgba(93,70,50,0.66)`,this.list=document.createElement(`div`),this.list.style.marginTop=`14px`,this.list.style.display=`grid`,this.list.style.gap=`10px`,this.list.style.overflowY=`auto`,this.list.style.paddingRight=`2px`,this.list.style.paddingBottom=`12px`,i.append(this.title,this.closeButton),this.sheet.append(i,this.summary,this.list),this.overlay.appendChild(this.sheet),this.container.append(this.entryButton,this.overlay),this.entryButton.addEventListener(`click`,()=>this.open()),this.closeButton.addEventListener(`click`,()=>this.close()),this.unsubscribe=this.progress?.subscribe(()=>this.render()),this.render()}isOpen(){return this.opened}open(){this.enabled&&(this.opened=!0,this.overlay.style.display=`block`,this.render())}close(){this.opened=!1,this.overlay.style.display=`none`}render(){if(!this.progress)return;let e=this.progress.getSnapshot(),t=oe(e.selectedClearEffect);this.summary.textContent=`当前：${t.name} · 最高分 ${e.stats.bestScore.toLocaleString()} · 累计消除 ${e.stats.totalClearedParticles.toLocaleString()} 粒`,this.list.replaceChildren();for(let t of r){let n=e.unlockedClearEffects.includes(t.id),r=e.selectedClearEffect===t.id,i=e.newClearEffects.includes(t.id),a=document.createElement(`div`);a.style.padding=`14px`,a.style.borderRadius=`18px`,a.style.border=r?`2px solid rgba(255,128,87,0.62)`:`1px solid rgba(122,92,65,0.12)`,a.style.background=r?`linear-gradient(135deg, rgba(255,239,223,.95), rgba(255,255,255,.96))`:`#fff`,a.style.boxShadow=`0 7px 18px rgba(91,65,42,0.07)`;let o=document.createElement(`div`);o.style.display=`flex`,o.style.alignItems=`center`,o.style.gap=`10px`;let s=document.createElement(`div`);s.textContent=t.icon,s.style.width=`42px`,s.style.height=`42px`,s.style.display=`grid`,s.style.placeItems=`center`,s.style.flex=`0 0 auto`,s.style.borderRadius=`14px`,s.style.fontSize=`22px`,s.style.background=t.id===`wind_dissolve`?`linear-gradient(135deg,#dff7ff,#effff7)`:`linear-gradient(135deg,#fff0dc,#fff9ec)`;let c=document.createElement(`div`);c.style.minWidth=`0`,c.style.flex=`1`;let l=document.createElement(`div`);l.style.font=`900 15px/1.25 system-ui, sans-serif`,l.textContent=t.name+(i?` · NEW`:``)+(t.implemented?``:` · 敬请期待`);let u=document.createElement(`div`);u.style.marginTop=`2px`,u.style.font=`800 10px/1.2 system-ui, sans-serif`,u.style.color=`#b07149`,u.textContent=t.rarity,c.append(l,u),o.append(s,c);let d=document.createElement(`div`);d.style.marginTop=`9px`,d.style.font=`650 11px/1.5 system-ui, sans-serif`,d.style.color=`rgba(93,70,50,0.72)`,d.textContent=t.description;let f=document.createElement(`div`);f.style.marginTop=`8px`,f.style.font=`750 10px/1.4 system-ui, sans-serif`,f.style.color=n?`#4e9b70`:`#9a7254`,f.textContent=n?`✓ 已解锁`:`${Pe(t,e)} ${Fe(t,e)}`;let p=document.createElement(`div`);if(p.style.marginTop=`10px`,p.style.display=`flex`,p.style.gap=`8px`,p.style.flexWrap=`wrap`,r){let e=I(`已装备`);e.disabled=!0,e.style.color=`#fff`,e.style.background=`#ff8057`,p.appendChild(e)}else if(n&&t.implemented){let e=I(`装备`);e.style.color=`#fff`,e.style.background=`#ff8057`,e.addEventListener(`click`,()=>{this.progress.selectEffect(t.id),this.render()}),p.appendChild(e)}if(n&&i){let e=I(`标记已查看`);e.style.color=`#72513a`,e.style.background=`#f2e8dc`,e.addEventListener(`click`,()=>{this.progress.markSeen(t.id),this.render()}),p.appendChild(e)}a.append(o,d,f,p),this.list.appendChild(a)}}};function Le(){return`
    .caisha-home {
      position: absolute;
      inset: 0;
      z-index: 30;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding:
        max(18px, env(safe-area-inset-top))
        16px
        max(16px, env(safe-area-inset-bottom));
      color: #5d4632;
      font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      user-select: none;
      touch-action: manipulation;
      isolation: isolate;
      background: transparent;
    }

    .caisha-home::before,
    .caisha-home::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      z-index: -1;
      pointer-events: none;
    }

    .caisha-home::before {
      top: 0;
      height: 31%;
      background: linear-gradient(
        180deg,
        rgba(255,248,234,.97) 0%,
        rgba(255,248,234,.78) 54%,
        rgba(255,248,234,0) 100%
      );
    }

    .caisha-home::after {
      display: none;
    }

    .caisha-home__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
    }

    .caisha-home__best,
    .caisha-home__effects {
      min-height: 37px;
      border: 1px solid rgba(105,78,55,.10);
      border-radius: 999px;
      color: #664c37;
      background: rgba(255,255,255,.83);
      box-shadow:
        0 7px 20px rgba(91,61,36,.08),
        inset 0 1px 0 rgba(255,255,255,.9);
      backdrop-filter: blur(10px);
    }

    .caisha-home__best {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 11px;
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .03em;
    }

    .caisha-home__best strong {
      color: #7d55ab;
      font-size: 14px;
      letter-spacing: 0;
    }

    .caisha-home__effects {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 11px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      font: 850 11px/1 system-ui, sans-serif;
      transition: transform 120ms ease;
    }

    .caisha-home__effects:active {
      transform: scale(.96);
    }

    .caisha-home__effects-badge {
      display: none;
      min-width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border-radius: 999px;
      color: #fff;
      background: #ef7657;
      font-size: 9px;
      font-weight: 950;
    }

    .caisha-home__brand {
      margin-top: clamp(15px, 3.2vh, 28px);
      text-align: center;
      pointer-events: none;
    }

    .caisha-home__title-image {
      display: block;
      width: min(86vw, 340px);
      max-width: 100%;
      height: auto;
      margin: 0 auto;
      filter: drop-shadow(0 5px 12px rgba(89,58,34,.08));
      pointer-events: none;
      user-select: none;
    }

    .caisha-home__title {
      margin: 6px 0 0;
      font-size: clamp(38px, 10.6vw, 52px);
      line-height: .98;
      font-weight: 1000;
      letter-spacing: -.075em;
      white-space: nowrap;
      filter: drop-shadow(0 5px 12px rgba(89,58,34,.08));
    }

    .caisha-home__title-dark {
      color: #694b35;
    }

    .caisha-home__title-rainbow {
      display: inline-block;
      color: transparent;
      background: linear-gradient(
        112deg,
        #ef665e 0%,
        #ef9e3c 22%,
        #ddc342 40%,
        #61b97a 59%,
        #58a7d6 77%,
        #8d75ca 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
    }

    .caisha-home__subtitle {
      margin-top: 8px;
      color: rgba(95,70,49,.66);
      font-size: 11px;
      font-weight: 780;
      letter-spacing: .06em;
    }

    .caisha-home__demo-tip {
      align-self: center;
      margin-top: 9px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 29px;
      padding: 6px 11px;
      border: 1px solid rgba(108,79,54,.09);
      border-radius: 999px;
      color: rgba(87,66,48,.72);
      background: rgba(255,255,255,.74);
      box-shadow: 0 5px 16px rgba(88,58,34,.05);
      backdrop-filter: blur(8px);
      font-size: 9px;
      font-weight: 820;
      pointer-events: none;
    }

    .caisha-home__demo-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #6fca83;
      box-shadow: 0 0 0 4px rgba(111,202,131,.12);
      animation: caisha-demo-pulse 1.45s ease-in-out infinite;
    }

    .caisha-home__spacer {
      flex: 1 1 auto;
      min-height: 40px;
      pointer-events: none;
    }

    .caisha-home__actions {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 2;
      width: min(calc(100% - 32px), 280px);
      margin: 0;
      transform: translate(-50%, -50%);
    }

    .caisha-home__play {
      position: relative;
      display: block;
      width: 100%;
      height: 88px;
      min-height: 88px;
      overflow: hidden;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 120ms ease, filter 120ms ease;
    }

    .caisha-home__play:active {
      transform: scale(.97);
      filter: brightness(.97);
    }

    .caisha-home__play::after {
      display: none;
    }

    .caisha-home__play-image {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      max-width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
    }

    .caisha-home__play-copy {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
    }

    .caisha-home__play-title {
      font-size: 17px;
      line-height: 1;
      font-weight: 1000;
      letter-spacing: .04em;
    }

    .caisha-home__play-subtitle {
      color: rgba(255,255,255,.78);
      font-size: 9px;
      line-height: 1;
      font-weight: 820;
      letter-spacing: .08em;
    }

    .caisha-home__footer {
      flex: 0 0 auto;
      margin-top: 15px;
      color: rgba(91,68,49,.52);
      text-align: center;
      font-size: 9px;
      font-weight: 760;
      letter-spacing: .08em;
    }

    @keyframes caisha-home-shine {
      0%, 62% { transform: translateX(-130%) skewX(-22deg); }
      82%, 100% { transform: translateX(135%) skewX(-22deg); }
    }

    @keyframes caisha-demo-pulse {
      0%, 100% { transform: scale(.84); opacity: .62; }
      50% { transform: scale(1.08); opacity: 1; }
    }


    /* Play-mode picker: light candy panel with distinct, tappable modes. */
    .caisha-mode-menu {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: none;
      align-items: center;
      justify-content: center;
      padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
      background: rgba(34, 26, 51, .56);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .caisha-mode-menu.is-open { display: flex; }
    .caisha-mode-menu__card {
      position: relative;
      width: min(100%, 362px);
      max-height: min(650px, 91%);
      overflow-y: auto;
      padding: 31px 19px 19px;
      border: 2px solid rgba(255, 255, 255, .94);
      border-radius: 29px;
      background:
        radial-gradient(circle at 16% 0%, rgba(255, 216, 142, .43), transparent 40%),
        radial-gradient(circle at 100% 68%, rgba(211, 194, 255, .28), transparent 45%),
        linear-gradient(162deg, #fffcf8 0%, #fff5ee 100%);
      box-shadow: 0 22px 62px rgba(45, 27, 46, .32), inset 0 1px 0 #fff;
      text-align: center;
      overscroll-behavior: contain;
      animation: caisha-dialog-pop 180ms cubic-bezier(.2,.8,.2,1) both;
    }
    .caisha-mode-menu__card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 7px;
      border-radius: 27px 27px 0 0;
      background: linear-gradient(90deg,#ff8c91,#ffc66f,#f5e07f,#89dcb4,#8bc8ff,#c2a3f6);
    }
    .caisha-mode-menu__head-icon {
      display: grid; place-items: center;
      width: 51px; height: 51px;
      margin: 0 auto 8px;
      border-radius: 18px;
      background: linear-gradient(142deg,#fff3c4,#ffdeeb 55%,#e6dbff);
      box-shadow: 0 5px 14px rgba(232,165,117,.18), inset 0 1px 0 #fff;
      font-size: 28px;
    }
    .caisha-mode-menu__title {
      margin: 0;
      font-size: 24px;
      line-height: 1.24;
      letter-spacing: .02em;
      font-weight: 950;
      color: #6f4559;
    }
    .caisha-mode-menu__subtitle {
      margin: 6px 0 19px;
      color: #ab8f91;
      font-size: 12px;
      font-weight: 650;
    }
    .caisha-mode-menu__item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 91px;
      margin: 0 0 11px;
      padding: 12px 37px 12px 12px;
      border: 1.5px solid var(--mode-border, #f8d5d6);
      border-radius: 20px;
      background: linear-gradient(112deg, #fff, var(--mode-bg, #fff0ef));
      box-shadow: 0 6px 15px rgba(119, 78, 93, .055), inset 0 1px 0 rgba(255,255,255,.95);
      color: #734c60;
      text-align: left;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 125ms ease, box-shadow 125ms ease;
    }
    .caisha-mode-menu__item:active { transform: scale(.975); }
    .caisha-mode-menu__item:focus-visible, .caisha-mode-menu__back:focus-visible,
    .caisha-mode-menu__levels button:focus-visible {
      outline: 3px solid #a594f5;
      outline-offset: 2px;
    }
    .caisha-mode-menu__item:nth-child(1) {
      --mode-bg: #fff0e9; --mode-border: #f9d8c8; --mode-icon: #ffe6dd;
    }
    .caisha-mode-menu__item:nth-child(2) {
      --mode-bg: #ebf9fa; --mode-border: #d1edf0; --mode-icon: #daf4f6;
    }
    .caisha-mode-menu__item:nth-child(3) {
      --mode-bg: #f1edff; --mode-border: #e2d9fa; --mode-icon: #e9e2ff;
    }
    .caisha-mode-menu__mode-icon {
      display: grid; place-items: center; flex: 0 0 57px;
      height: 57px;
      border-radius: 17px;
      background: var(--mode-icon, #ffe9db);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.98);
      font-size: 29px;
    }
    .caisha-mode-menu__copy { display: block; min-width: 0; }
    .caisha-mode-menu__item strong {
      display: block; margin-bottom: 5px;
      color: #69475a; font-size: 17px; line-height: 1.1; font-weight: 900;
    }
    .caisha-mode-menu__item small {
      display: block;
      font-size: 11px; line-height: 1.45; color: #a38c94; font-weight: 650;
    }
    .caisha-mode-menu__item::after {
      content: "›"; position: absolute; right: 16px; top: 50%;
      transform: translateY(-53%);
      color: #c8a8b3; font: 900 27px/1 system-ui, sans-serif;
    }
    .caisha-mode-menu__back {
      width: 100%; min-height: 47px; margin-top: 7px;
      border: 1px solid #eedcdf; border-radius: 16px;
      background: rgba(255,255,255,.76); color: #9c737e;
      font: 850 13px/1 system-ui, sans-serif;
      cursor: pointer;
    }
    .caisha-mode-menu__levels {
      display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px;
      margin-bottom: 11px;
    }
    .caisha-mode-menu__levels button {
      min-height: 75px; padding: 8px 4px;
      border: 1.5px solid #dfd1f6; border-radius: 17px;
      background: linear-gradient(145deg,#fff,#f1eaff);
      color: #78639d; font: 850 14px system-ui,sans-serif;
      box-shadow: 0 5px 12px rgba(119,78,93,.06);
      cursor: pointer;
    }
    .caisha-mode-menu__levels button:disabled {
      color: #beaebc; background: #f4edf0; border-color: #eee6e9;
      box-shadow: none; cursor: not-allowed;
    }
    .caisha-mode-menu__level-number {
      display: block; font-size: 15px; font-weight: 900; line-height: 1.4;
    }
    .caisha-mode-menu__level-name {
      display: block; margin-top: 2px; font-size: 10px;
      line-height: 1.3; font-weight: 700; color: #a793a8;
    }
    @keyframes caisha-dialog-pop {
      from { opacity: .6; transform: translateY(8px) scale(.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-height: 590px) {
      .caisha-mode-menu__card { padding: 20px 14px 14px; }
      .caisha-mode-menu__head-icon { width: 42px; height: 42px; font-size: 23px; margin-bottom: 5px; }
      .caisha-mode-menu__subtitle { margin-bottom: 12px; }
      .caisha-mode-menu__item { min-height: 73px; padding-top: 7px; padding-bottom: 7px; margin-bottom: 8px; }
      .caisha-mode-menu__mode-icon { flex-basis: 46px; height: 46px; font-size: 24px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .caisha-mode-menu__card { animation: none; }
    }

    @media (max-height: 700px) {
      .caisha-home {
        padding-top: max(12px, env(safe-area-inset-top));
        padding-bottom: max(10px, env(safe-area-inset-bottom));
      }

      .caisha-home__brand {
        margin-top: 10px;
      }

      .caisha-home__title {
        font-size: clamp(34px, 9.7vw, 45px);
      }

      .caisha-home__subtitle {
        margin-top: 5px;
      }

      .caisha-home__demo-tip {
        margin-top: 6px;
      }

      .caisha-home__spacer {
        min-height: 34px;
      }

      .caisha-home__play {
        height: 88px;
        min-height: 88px;
      }

      .caisha-home__footer {
        margin-top: 10px;
      }
    }

    @media (max-height: 590px) {
      .caisha-home__subtitle,
      .caisha-home__footer {
        display: none;
      }

      .caisha-home__title {
        margin-top: 3px;
      }

      .caisha-home__spacer {
        min-height: 28px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .caisha-home__play::after,
      .caisha-home__demo-dot {
        animation: none;
      }
    }
  `}function Re({img:e}){return`
  .caisha-mode-menu.approved-art-v1 {
    display:none;position:absolute;inset:0;z-index:30;
    padding:0 !important;overflow:hidden !important;
    background:#fff9ec url('${e(`background-mode.webp`)}') center/100% 100% no-repeat !important;
    color:#79513f;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;
    touch-action:pan-y;
  }
  .caisha-mode-menu.approved-art-v1.is-level {
    background-image:url('${e(`background-level.webp`)}') !important;
  }
  /* Let the level picker use the screen while gameplay retains its portrait layout. */
  #game-shell:has(.caisha-mode-menu.approved-art-v1.is-level.is-open) {
    width:min(calc(100vw - 36px),1100px);height:calc(100dvh - 36px);
    aspect-ratio:auto;max-height:calc(100dvh - 36px);
  }
  @media(max-width:520px) {
    #game-shell:has(.caisha-mode-menu.approved-art-v1.is-level.is-open) {
      width:100vw;height:100dvh;max-height:100dvh;
    }
  }
  .caisha-mode-menu.approved-art-v1.is-main {touch-action:none;}
  .caisha-mode-menu.approved-art-v1.is-open {display:flex !important;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card {
    box-sizing:border-box;position:relative !important;display:flex !important;
    flex-direction:column !important;align-items:center !important;
    justify-content:flex-start !important;gap:0;
    width:min(100%,440px) !important;max-width:440px !important;
    height:100% !important;max-height:100% !important;min-height:0 !important;
    margin:0 auto !important;
    padding:max(14px,env(safe-area-inset-top)) 17px max(14px,env(safe-area-inset-bottom)) !important;
    overflow-y:auto !important;overflow-x:hidden !important;
    border:0 !important;border-radius:0 !important;
    background:transparent !important;box-shadow:none !important;
    scrollbar-width:none;overscroll-behavior:contain;animation:none !important;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card::-webkit-scrollbar{display:none;}
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__card {overflow:hidden !important;}
  .caisha-mode-menu.approved-art-v1.is-level .caisha-mode-menu__card {
    width:100% !important;max-width:none !important;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card::before{display:none !important;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__head-icon,
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__illustrated-head,
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__brand,
  .caisha-mode-menu.approved-art-v1 .soft-sand__scenery{display:none !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__topbar {
    width:100%;min-height:51px;display:flex;align-items:center;justify-content:center;
    flex:0 0 auto;position:relative;margin-bottom:clamp(6px,1.3vh,17px);
  }
  .caisha-mode-menu.approved-art-v1.is-main .approved-art__topbar,
  .caisha-mode-menu.approved-art-v1.is-level .approved-art__topbar {
    position:absolute;top:max(14px,env(safe-area-inset-top));left:17px;right:17px;
    width:auto;min-height:46px;margin:0;z-index:3;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__topbar {
    top:max(12px,env(safe-area-inset-top)) !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__back,
  .caisha-mode-menu.approved-art-v1.is-level .caisha-mode-menu__back {top:4px;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back,
  .caisha-mode-menu.approved-art-v1 .approved-art__gear {
    display:flex !important;align-items:center;justify-content:center;
    box-sizing:border-box;position:absolute !important;top:2px;
    width:46px !important;height:46px !important;min-height:46px !important;
    aspect-ratio:1 !important;margin:0 !important;padding:0 !important;
    border:1px solid #eee6dc !important;border-radius:50% !important;
    background:#fffdfaeb !important;box-shadow:0 3px 14px #8a67441b !important;
    color:#775a47 !important;-webkit-text-fill-color:#775a47 !important;
    font:800 27px/1 ui-rounded,system-ui,sans-serif !important;
    text-shadow:none !important;cursor:pointer;z-index:3;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back {left:0;font-size:0 !important;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back::after {
    content:' ';width:13px;height:13px;border-left:4px solid #795c48;
    border-bottom:4px solid #795c48;border-radius:2px;
    transform:translateX(3px) rotate(45deg);
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back {
    width:46px !important;height:46px !important;min-height:46px !important;
    border:0 !important;border-radius:12px !important;background:transparent !important;
    box-shadow:none !important;transition:transform 120ms ease,background 120ms ease;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back::after {
    width:36px;height:36px;border:0;border-radius:0;transform:none;
    background:center / contain no-repeat url('${e(`back-arrow-pastel-sand.webp`)}');
    filter:drop-shadow(0 1px 1px #9a67452b);
  }  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back:active {
    transform:translateX(-2px) scale(.95);background:#bd92671a !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__gear {right:0;font-size:26px !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__record {
    min-height:43px;max-width:calc(100% - 110px);padding:7px 16px;
    box-sizing:border-box;display:flex;justify-content:center;align-items:center;gap:7px;
    border:1px solid #eee6dc;border-radius:999px;background:#fffcf8e8;
    box-shadow:0 3px 14px #82664e13;
    color:#6f513f;font:800 13px/1.25 ui-rounded,system-ui,sans-serif;white-space:nowrap;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__record strong {
    color:#b57760;font-size:clamp(15px,4.2vw,20px);font-weight:950;
    background:linear-gradient(90deg,#d37b57,#d8aa51,#78b6a3,#759fc6);
    color:transparent;-webkit-background-clip:text;background-clip:text;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__title {
    position:absolute !important;width:1px !important;height:1px !important;
    opacity:0 !important;overflow:hidden !important;padding:0 !important;margin:0 !important;
    border:0 !important;box-shadow:none !important;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__subtitle {display:none !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__heading {display:contents;}
  .caisha-mode-menu.approved-art-v1.is-level .approved-art__heading {
    flex:0 0 auto;display:block;width:min(100%,314px);aspect-ratio:5/2;
    margin:0 auto;overflow:hidden;
  }
  .caisha-mode-menu.approved-art-v1.is-level .caisha-mode-menu__subtitle {
    display:block !important;position:static;width:auto;height:auto;
    flex:0 0 auto;margin:5px 0 clamp(10px,1.8svh,16px);padding:0;
    color:#997657;font:800 clamp(12px,3.4vw,15px)/1.5 ui-rounded,system-ui,sans-serif;
    text-align:center;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__headline {
    flex:0 0 auto;display:block;max-width:100%;height:auto;object-fit:contain;
    pointer-events:none;user-select:none;-webkit-user-drag:none;
  }
  .caisha-mode-menu.approved-art-v1.is-main .approved-art__headline {
    width:min(calc(100% - 94px),308px);max-height:clamp(55px,11.8svh,91px);
    margin:6px auto clamp(7px,1.9svh,20px);
  }
  .caisha-mode-menu.approved-art-v1.is-level .approved-art__headline {
    width:100%;max-height:none;margin:0;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__items {
    box-sizing:border-box !important;display:flex !important;align-items:stretch !important;
    flex-direction:column !important;flex:0 0 auto !important;
    width:100% !important;height:auto !important;min-height:0 !important;
    max-height:none !important;aspect-ratio:auto !important;
    position:relative !important;padding:0 !important;margin:0 !important;
    border:0 !important;border-radius:0 !important;
    background:transparent !important;box-shadow:none !important;overflow:visible !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__items {
    display:grid !important;grid-template-rows:repeat(3,minmax(0,1fr));
    flex:1 1 0 !important;width:min(100%,330px) !important;margin:0 auto !important;
    gap:clamp(6px,1.4svh,15px);padding-bottom:clamp(6px,3svh,24px) !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item {
    box-sizing:border-box !important;position:relative !important;display:block !important;
    flex:0 0 auto !important;width:100% !important;height:100% !important;
    min-height:0 !important;max-height:none !important;aspect-ratio:auto !important;
    overflow:visible !important;margin:0 !important;padding:0 !important;
    border:0 !important;border-radius:0 !important;
    background:none !important;box-shadow:none !important;
    transform:none;filter:none;cursor:pointer;touch-action:manipulation;container-type:size;
    -webkit-tap-highlight-color:transparent;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item::before,
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item::after {display:none !important;content:none !important;}
  .caisha-mode-menu.approved-art-v1.is-main .approved-art__mode-frame {
    display:block;position:absolute;left:50%;top:50%;
    width:min(100cqw,177.683315cqh);aspect-ratio:1672/941;transform:translate(-50%,-50%);
    container-type:inline-size;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1.is-main .approved-art__mode-picture {
    display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
    border:0;border-radius:0;pointer-events:none;user-select:none;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__mode-icon,
  .caisha-mode-menu.approved-art-v1.is-main .soft-sand__mode-art {
    position:absolute !important;width:1px !important;height:1px !important;
    left:0 !important;top:0 !important;overflow:hidden !important;
    opacity:0 !important;pointer-events:none !important;
  }
  /* Titles and descriptions are real HTML text, layered over clean card art. */
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__copy {
    box-sizing:border-box !important;position:absolute !important;z-index:2 !important;
    display:flex !important;flex-direction:column !important;align-items:flex-start !important;
    justify-content:center !important;gap:clamp(4px,2cqw,7px) !important;
    top:22% !important;left:10.5% !important;width:52% !important;height:auto !important;
    min-width:0 !important;overflow:visible !important;opacity:1 !important;
    text-align:left !important;pointer-events:none !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item[data-mode="level"] .caisha-mode-menu__copy {
    top:22% !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item[data-mode="endless"] .caisha-mode-menu__copy {
    top:22% !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item .caisha-mode-menu__copy strong {
    display:block !important;margin:0 !important;
    font:950 clamp(17px,8cqw,26px)/1.15 ui-rounded,"Microsoft YaHei",system-ui,sans-serif !important;
    letter-spacing:.015em !important;white-space:nowrap !important;
    color:#815034 !important;-webkit-text-fill-color:#815034 !important;
    -webkit-text-stroke:.3px #fef2df !important;
    text-shadow:0 1px 0 #fff8e7,0 2px 2px #73503d3b !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item .caisha-mode-menu__copy small {
    display:block !important;max-width:100% !important;margin:0 !important;
    color:#98775b !important;-webkit-text-fill-color:#98775b !important;
    font:700 clamp(9px,3.4cqw,12px)/1.25 ui-rounded,"Microsoft YaHei",system-ui,sans-serif !important;
    white-space:nowrap !important;letter-spacing:0 !important;
    text-shadow:0 1px #fff4e1 !important;
  }
  @media(max-width:350px) {
    .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__copy {
      left:10.5% !important;width:52% !important;
      gap:clamp(3px,2cqw,7px) !important;
    }
    .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item .caisha-mode-menu__copy small {
      font-size:9px !important;
    }
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item:active {
    transform:scale(.977) !important;filter:brightness(.985) !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-grid {
    --level-card-gap:10px;
    display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,90px),1fr));
    justify-content:center;gap:12px var(--level-card-gap);margin:0 auto;
    width:min(100%,960px);
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card {
    position:relative;box-sizing:border-box;display:block !important;
    width:100%;max-width:140px;min-width:0;height:auto;min-height:0;aspect-ratio:1;justify-self:center;
    container-type:inline-size;
    padding:0 !important;margin:0 !important;overflow:hidden;
    border:0 !important;border-radius:10px !important;
    background:#fff4e2 center / contain no-repeat !important;
    box-shadow:0 5px 12px #92694b20 !important;
    cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
    color:#805846 !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card.is-current {
    outline:2px solid #eba996 !important;outline-offset:1px;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card:disabled {
    cursor:not-allowed !important;filter:saturate(.58) brightness(.975) !important;
    opacity:.84 !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__number {
    position:absolute;top:14%;left:0;right:0;
    color:#805845 !important;-webkit-text-fill-color:#805845 !important;
    text-align:center;font:950 26cqw/1 ui-rounded,system-ui,sans-serif;
    text-shadow:0 1px #fff9ee;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__stars {
    display:flex;align-items:center;justify-content:center;gap:1px;
    position:absolute;top:45%;left:0;right:0;height:26%;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__stars img {
    width:17cqw;height:auto;aspect-ratio:1;object-fit:contain;
    display:block;user-select:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__lock {
    position:absolute;z-index:2;top:16%;left:50%;width:22cqw;
    height:auto;transform:translateX(-50%);pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card:disabled .approved-art__number {
    top:44%;color:#947c6c !important;-webkit-text-fill-color:#947c6c !important;
    font-size:18cqw;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card:disabled .approved-art__stars {top:68%;opacity:.56;}
  .caisha-mode-menu.approved-art-v1.is-level .caisha-mode-menu__items {padding-bottom:15svh !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__page-dots {
    display:flex;align-items:center;justify-content:center;gap:11px;
    width:100%;margin-top:clamp(8px,1.8svh,16px);
    font-size:0;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__page-dots span {
    width:8px;height:8px;border-radius:50%;background:#dec5a8;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__page-dots span:first-child{background:#a7846e;}
  .caisha-mode-menu.approved-art-v1 button:focus-visible {
    outline:3px solid #c28e76 !important;outline-offset:3px !important;
  }
  @media(max-height:740px){
    .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card {padding-top:max(7px,env(safe-area-inset-top)) !important;}
    .caisha-mode-menu.approved-art-v1 .approved-art__topbar{margin-bottom:4px;min-height:44px;}
    .caisha-mode-menu.approved-art-v1.is-main .approved-art__topbar,
    .caisha-mode-menu.approved-art-v1.is-level .approved-art__topbar{top:max(7px,env(safe-area-inset-top));margin:0;}
    .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back,
    .caisha-mode-menu.approved-art-v1 .approved-art__gear{width:40px !important;height:40px !important;min-height:40px !important;}
    .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__back,
    .caisha-mode-menu.approved-art-v1.is-level .caisha-mode-menu__back {top:7px;}
    .caisha-mode-menu.approved-art-v1.is-main .approved-art__headline {max-height:70px;margin:1px auto 4px;}
    .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__items {gap:6px;}
    .caisha-mode-menu.approved-art-v1.is-level .approved-art__heading {width:min(100%,226px);}
    .caisha-mode-menu.approved-art-v1 .approved-art__level-grid{--level-card-gap:7px;gap:10px var(--level-card-gap);}
  }
  @media(max-width:350px){
    .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card {padding-left:10px !important;padding-right:10px !important;}
    .caisha-mode-menu.approved-art-v1.is-main .approved-art__topbar {left:10px;right:10px;}
    .caisha-mode-menu.approved-art-v1 .approved-art__record {padding:7px 10px;font-size:11px;}
    .caisha-mode-menu.approved-art-v1 .approved-art__level-grid{--level-card-gap:8px;gap:10px var(--level-card-gap);}
  }
  @media(prefers-reduced-motion:reduce){
    .caisha-mode-menu.approved-art-v1 * {transition:none !important;animation:none !important;}
  }
  `}var ze=`caisha-approved-assets-20261011`,Be=()=>`./images/approved-ui/`,L=e=>Be()+e+(/^mode-(challenge|endless|art)\.webp$/.test(e)?`?v=20261012-transparent`:/^level-card-\d{2}\.webp$/.test(e)?`?v=20261013-crop140`:``);function Ve(){if(document.getElementById(ze))return;let e=document.createElement(`style`);e.id=ze,e.textContent=Re({img:L}),document.head.appendChild(e)}function R(e){return L(e)}function He({levelNames:e,unlockedLevel:t,getStars:n,onSelect:r}){let i=document.createElement(`div`);i.className=`approved-art__level-grid`,i.setAttribute(`aria-label`,`关卡列表`);for(let a=0;a<e.length;a++){let o=a+1,s=o>t,c=s?0:Math.max(0,Math.min(3,Number(n(o))||0)),l=document.createElement(`button`);l.type=`button`,l.className=`approved-art__level-card`,l.dataset.level=String(o),l.disabled=s,l.style.setProperty(`background-image`,`url("${L(`level-card-${String(o).padStart(2,`0`)}.webp`)}")`,`important`),o===t&&l.classList.add(`is-current`),l.setAttribute(`aria-label`,`第${o}关 ${e[a]}${s?`，未解锁`:`，${c}星`}`);let u=document.createElement(`span`);u.className=`approved-art__number`,u.textContent=String(o);let d=document.createElement(`span`);d.className=`approved-art__stars`,d.setAttribute(`aria-hidden`,`true`);for(let e=0;e<3;e++){let t=document.createElement(`img`);t.src=L(e<c?`star-filled.png`:`star-empty.png`),t.alt=``,t.draggable=!1,d.append(t)}if(l.append(u,d),s){let e=document.createElement(`img`);e.className=`approved-art__lock`,e.src=L(`lock.png`),e.alt=``,e.draggable=!1,e.setAttribute(`aria-hidden`,`true`),l.append(e)}l.addEventListener(`click`,()=>{s||r(o)}),i.append(l)}return i}function Ue({img:e}){return`
    /* Full-depth dreamy world behind the actual accessible mode dialog. */
    .caisha-mode-menu {
      background: url('${e(`dreamy-world.webp`)}') center / cover no-repeat !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__card {
      width: min(100%, 368px);
      max-height: 98%;
      padding: 0 13px 15px;
      border-radius: 30px;
      border: 1.5px solid rgba(255,255,255,.95);
      background: linear-gradient(165deg,#fff3df,#fff8f0 63%,#fff0e1) !important;
      box-shadow: 0 17px 34px rgba(107,71,80,.23),inset 0 2px 0 rgba(255,255,255,.94) !important;
      overflow: hidden auto;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__card::before {display:none !important;}
    .caisha-mode-menu__illustrated-head {
      display: block;
      width: calc(100% + 26px);
      height: auto;
      max-width: none;
      margin: -1px -13px 4px;
      border-radius: 29px 29px 0 0;
      pointer-events: none;
      user-select: none;
    }
    /* The header's title is reproduced by the approved illustrated asset;
       the matching DOM text remains in the accessible document. */
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__head-icon,
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__title,
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__subtitle {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item {
      position: relative;
      width: 100%;
      height: auto;
      min-height: unset;
      aspect-ratio: 773 / 232;
      padding: 0 !important;
      margin: 0 0 6px;
      border: 0 !important;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: none !important;
      background: url('${e(`card-endless.webp`)}') center/100% 100% no-repeat !important;
      -webkit-tap-highlight-color: transparent;
      transition: transform .13s ease, filter .13s ease;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item:nth-child(2) {
      background-image: url('${e(`card-level.webp`)}') !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item:nth-child(3) {
      background-image: url('${e(`card-art.webp`)}') !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item::after {display:none !important;}
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__mode-icon {display:none !important;}
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__copy {
      position: absolute;
      left: 28%;
      right: 11%;
      top: 24%;
      display: block;
      z-index: 2;
      text-align: left;
      pointer-events: none;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item strong {
      margin: 0 0 5px;
      color: #734451;
      font: 950 clamp(16px,4.6vw,19px)/1.18 ui-rounded,system-ui,sans-serif;
      text-shadow: 0 2px 0 rgba(255,255,255,.65);
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item small {
      color: #a9848a;
      font: 750 clamp(9px,2.45vw,11px)/1.35 ui-rounded,system-ui,sans-serif;
      letter-spacing: -.01em;
      white-space: nowrap;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__back {
      display: block;
      position: relative;
      width: 100%;
      min-height: unset;
      aspect-ratio: 765 / 138;
      height: auto;
      padding: 0;
      margin: 6px 0 0;
      border: 0 !important;
      border-radius: 999px;
      color: #8b5c5e;
      background: url('${e(`back-button.webp`)}') center / 100% 100% no-repeat !important;
      box-shadow: none !important;
      font: 950 clamp(14px,4vw,18px)/1.2 ui-rounded,system-ui,sans-serif;
      text-shadow: 0 1px #fff;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__back:active,
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item:active {
      transform: scale(.977);
      filter: brightness(.98);
    }
    .caisha-mode-menu.is-level .caisha-mode-menu__illustrated-head {display:none;}
    .caisha-mode-menu.is-level .caisha-mode-menu__card {
      background: linear-gradient(165deg,#fffaf0,#fff0ef) !important;
      border:2px solid white;
    }
    .caisha-mode-menu.is-level .caisha-mode-menu__card::before {
      background:linear-gradient(90deg,#ffa8ae,#ffd082,#9bdcc9,#8bbff6,#b7a0e9);
    }
    /* The full composition is a scenic layer; the player's canvas is real,
       drawn above the mockup's example artwork and kept inside the wood frame. */
    .caisha-result.is-premium-art {
      background: #ffe8dd url('${e(`dreamy-world.webp`)}') center / cover no-repeat !important;
      padding:0 !important;
      overflow:hidden !important;
    }
    .caisha-result.is-premium-art::before {display:none !important;}
    .caisha-result.is-premium-art .caisha-result__card {
      position:relative;
      width:100%;
      height:100%;
      min-height:0;
      display:block;
      overflow:hidden;
      background: url('${e(`art-result-world.webp`)}') center / 100% 100% no-repeat;
    }
    .caisha-result.is-premium-art .caisha-result__eyebrow {
      position:absolute !important;
      width:1px !important;height:1px !important;overflow:hidden !important;
      opacity:0 !important;pointer-events:none;
    }
    /* The DOM headline must remain visible to automated QA and assistive
       semantics. The illustrated page already paints it, so its letters are
       transparent without hiding or collapsing the live element. */
    .caisha-result.is-premium-art .caisha-result__copy {
      position:absolute !important;
      left:15%;top:56%;width:70%;height:10%;
      padding:0;margin:0;
      opacity:1 !important;
      overflow:visible !important;
      pointer-events:none;
      background:none !important;
    }
    .caisha-result.is-premium-art .caisha-result__headline,
    .caisha-result.is-premium-art .caisha-result__subline {
      color:transparent !important;
      text-shadow:none !important;
    }
    .caisha-result.is-premium-art .caisha-result__frame-wrap {
      position:absolute;
      left:28.9%;top:14.65%;
      width:42.1%;height:36.8%;
      margin:0;
      aspect-ratio:auto;
      perspective:none;
      z-index:1;
    }
    .caisha-result.is-premium-art .caisha-result__frame-shadow {display:none;}
    .caisha-result.is-premium-art .caisha-result__frame,
    .caisha-result.is-premium-art.is-visible .caisha-result__frame {
      inset:0;
      padding:0;
      border:0;
      border-radius:0;
      background:none;
      box-shadow:none;
      opacity:1;
      transform:none;
      animation:none;
    }
    .caisha-result.is-premium-art .caisha-result__frame::after {display:none;}
    .caisha-result.is-premium-art .caisha-result__mat {
      width:100%;height:100%;
      padding:0;
      border-radius:0;
      background:#fff8e8;
      box-shadow:none;
    }
    .caisha-result.is-premium-art .caisha-result__art {
      display:block;
      width:100%;height:100%;max-height:none;
      aspect-ratio:auto;
      object-fit:contain;
      border-radius:0;
      background:#fff9ed;
      box-shadow:none;
      image-rendering:auto;
      filter:none;
    }
    /* These native buttons coincide with the labels printed on the polished
       image; they remain clickable, tabbable, and accessible by their text. */
    .caisha-result.is-premium-art .caisha-result__share-row {
      position:absolute;
      left:9.3%;top:66.65%;
      width:81.5%;height:7.1%;
      margin:0;padding:0;
      display:grid;grid-template-columns:1fr 1fr;gap:2%;
      opacity:1;transform:none;
      z-index:3;
    }
    .caisha-result.is-premium-art .caisha-result__secondary,
    .caisha-result.is-premium-art .caisha-result__restart,
    .caisha-result.is-premium-art .caisha-result__home {
      opacity:1;
      padding:0;
      border:0 !important;
      color:transparent !important;
      background:transparent !important;
      box-shadow:none !important;
      text-shadow:none !important;
      cursor:pointer;
      transition:none;
      -webkit-tap-highlight-color:transparent;
    }
    .caisha-result.is-premium-art .caisha-result__secondary {
      width:100%;height:100%;min-height:0;border-radius:999px;
    }
    .caisha-result.is-premium-art .caisha-result__restart {
      position:absolute;
      left:13.5%;top:74.9%;width:73%;height:8.2%;
      margin:0;min-height:0;
      z-index:3;
    }
    .caisha-result.is-premium-art .caisha-result__home {
      position:absolute;
      left:32%;top:84%;width:36%;height:5.7%;
      margin:0;min-height:0;z-index:3;
    }
    .caisha-result.is-premium-art button:focus-visible {
      opacity:.62 !important;
      outline:3px solid #8f73ca;
      outline-offset:-3px;
    }
    .caisha-result.is-premium-art .caisha-result__toast {
      position:absolute;
      bottom:2.5%;left:50%;width:max-content;max-width:85%;
      z-index:5;margin:0;
      transform:translate(-50%,6px);
    }
    .caisha-result.is-premium-art .caisha-result__toast.is-visible {
      transform:translate(-50%,0);
    }
    @media (max-height:590px) {
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__card {padding-bottom:9px;}
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item {margin-bottom:3px;}
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__copy {top:21%;}
    }
    @media (prefers-reduced-motion:reduce) {
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item {transition:none;}
    }
  `}var We=`caisha-premium-illustrated-ui-v2`;function Ge(e){return`./images/ui-premium/${e}`}function z(){if(document.getElementById(We))return;let e=Ge,t=document.createElement(`style`);t.id=We,t.textContent=Ue({img:e}),document.head.appendChild(t)}function Ke({asset:e}){return`
    /* One consistent warm cream / rainbow sand material system. */
    .caisha-mode-menu {
      background:
        linear-gradient(180deg, rgba(255,248,236,.15), rgba(255,231,216,.19)),
        url("${e(`sand-dream-bg.svg`)}") center / cover no-repeat !important;
      backdrop-filter: blur(7px);
      -webkit-backdrop-filter: blur(7px);
    }
    .caisha-mode-menu__card {
      width: min(100%, 362px);
      padding: 23px 18px 17px;
      border: 2px solid rgba(255,255,255,.94);
      border-radius: 29px;
      background:
        radial-gradient(circle at 84% 16%, rgba(255,222,223,.4), transparent 28%),
        radial-gradient(circle at 3% 56%, rgba(255,216,143,.28), transparent 32%),
        linear-gradient(160deg, rgba(255,251,240,.96), rgba(255,242,234,.98)) !important;
      box-shadow:
        0 17px 36px rgba(122,77,65,.20),
        0 1px 0 rgba(255,255,255,.7) inset !important;
    }
    .caisha-mode-menu__card::before {
      height: 6px;
      background: linear-gradient(90deg,#ff9295,#ffc776,#e8df8f,#a8e3c6,#9acbff,#d7b9ff);
    }
    .caisha-mode-menu__head-icon {
      width: 65px;
      height: 65px;
      margin-bottom: 7px;
      border-radius: 23px;
      background: url("${e(`mode-rainbow.svg`)}") center/86% no-repeat,
        linear-gradient(145deg,#fff9eb,#ffe3ee 60%,#efeeff) !important;
      box-shadow: 0 9px 17px rgba(174,112,101,.12),inset 0 2px 0 white !important;
      color: transparent;
      font-size: 0;
    }
    .caisha-mode-menu.is-level .caisha-mode-menu__head-icon {
      background: url("${e(`mode-flag.svg`)}") center/86% no-repeat,
        linear-gradient(145deg,#fff9ee,#dff9fb) !important;
    }
    .caisha-mode-menu__title {
      color: #7b4351;
      font-size: clamp(22px,6vw,26px);
      font-weight: 950;
      text-shadow: 0 2px 0 rgba(255,255,255,.93);
    }
    .caisha-mode-menu__subtitle {
      color: #aa7e80;
      font-size: 12px;
      margin-bottom: 18px;
    }
    .caisha-mode-menu__item {
      min-height: 89px;
      gap: 12px;
      margin-bottom: 11px;
      padding: 12px 37px 12px 11px;
      overflow: hidden;
      border-width: 2px;
      border-radius: 21px;
      background:
        url("${e(`sand-wave.svg`)}") bottom right/100% 34px no-repeat,
        linear-gradient(112deg,rgba(255,255,255,.98),var(--mode-bg,#fff0ef)) !important;
      box-shadow:
        inset 0 2px 0 rgba(255,255,255,.98),
        0 7px 16px rgba(119,78,93,.11),
        0 1px 0 rgba(255,255,255,.8) !important;
    }
    .caisha-mode-menu__item:nth-child(1) {
      --mode-bg:#ffe8e2;--mode-border:#ffd7cb;--mode-icon:#ffe5df;
    }
    .caisha-mode-menu__item:nth-child(2) {
      --mode-bg:#e2f8f8;--mode-border:#cceaf0;--mode-icon:#d9f4f6;
    }
    .caisha-mode-menu__item:nth-child(3) {
      --mode-bg:#eee7ff;--mode-border:#e0d5ff;--mode-icon:#eae1ff;
    }
    .caisha-mode-menu__mode-icon {
      flex-basis: 58px;
      height: 58px;
      border-radius: 18px;
      font-size: 0;
      background: url("${e(`mode-rainbow.svg`)}") center / 86% no-repeat,
        var(--mode-icon) !important;
      box-shadow: inset 0 1px 0 white,0 2px 8px rgba(117,65,84,.06);
    }
    .caisha-mode-menu__item:nth-child(2) .caisha-mode-menu__mode-icon {
      background: url("${e(`mode-flag.svg`)}") center / 86% no-repeat,
        var(--mode-icon) !important;
    }
    .caisha-mode-menu__item:nth-child(3) .caisha-mode-menu__mode-icon {
      background: url("${e(`mode-palette.svg`)}") center / 86% no-repeat,
        var(--mode-icon) !important;
    }
    .caisha-mode-menu__item strong {
      font-size: 17px;
      color: #704451;
      text-shadow: 0 1px rgba(255,255,255,.7);
    }
    .caisha-mode-menu__item small {
      color: #ad8b8f;
      font-size: 11px;
    }
    .caisha-mode-menu__item::after {
      color: #df898d;
      font-size: 30px;
      right: 16px;
    }
    .caisha-mode-menu__back {
      min-height: 47px;
      margin-top: 7px;
      border: 2px solid #f3e0dc;
      border-radius: 999px;
      background: linear-gradient(165deg,rgba(255,255,255,.98),rgba(255,249,242,.96));
      color: #a06c6f;
      box-shadow: inset 0 2px 0 white,0 5px 14px rgba(116,77,65,.07);
    }
    .caisha-mode-menu__levels {
      gap: 9px;
    }
    .caisha-mode-menu__levels button {
      min-height: 73px;
      border-color: #e8d9f5;
      background:
        linear-gradient(145deg,rgba(255,255,255,.98),rgba(248,231,251,.85));
      color: #84629b;
      box-shadow: inset 0 2px 0 white,0 4px 12px rgba(118,77,93,.09);
    }
    .caisha-mode-menu__levels button:disabled {
      background: #f6f0ef;
      border-color: #eee4e9;
    }

    /* Frame contents remain the exact saved screenshot, never AI artwork. */
    .caisha-result {
      background:
        linear-gradient(180deg,rgba(255,251,244,.38),rgba(255,250,241,.45)),
        url("${e(`sand-dream-bg.svg`)}") center/cover no-repeat !important;
      color:#76524a;
    }
    .caisha-result::before {
      opacity: .12;
      z-index: -1;
    }
    .caisha-result__card {
      position: relative;
      isolation: isolate;
    }
    .caisha-result__eyebrow {
      color: #ac786e;
      font-size: 11px;
      letter-spacing: .12em;
      text-shadow: 0 1px white;
    }
    .caisha-result__frame-wrap {
      height: clamp(228px,42vh,337px);
      margin-top: 11px;
    }
    .caisha-result__frame {
      border: 2px solid rgba(255,250,232,.95);
      border-radius: 14px;
      box-shadow:
        0 0 0 2px rgba(167,104,59,.36),
        0 15px 30px rgba(117,66,45,.17),
        inset 0 2px 3px rgba(255,255,255,.55);
    }
    .caisha-result__mat {
      border-radius: 6px;
      box-shadow: inset 0 0 0 1px rgba(124,71,43,.14);
    }
    .caisha-result__copy {
      position: relative;
      margin-top: 16px;
      padding: 9px 6px 4px;
      border-radius: 25px;
      background: radial-gradient(ellipse at center,rgba(255,249,235,.94),rgba(255,249,235,0) 74%);
    }
    .caisha-result__headline {
      color: #82464f;
      font-size: clamp(20px,5.5vw,25px);
      font-weight: 950;
      text-shadow: 0 2px #fff;
    }
    .caisha-result__subline {
      color: #ad7f72;
      font-size: 12px;
    }
    .caisha-result__share-row {
      width: min(100%,320px);
      gap: 10px;
      margin-top: 14px;
    }
    .caisha-result__secondary {
      min-height: 46px;
      border: 2px solid rgba(255,255,255,.97) !important;
      border-radius: 999px;
      color: #854d57;
      background:
        url("${e(`sand-wave.svg`)}") bottom/100% 20px no-repeat,
        linear-gradient(145deg,#fffefe,#fff2ed);
      box-shadow: 0 8px 15px rgba(123,82,70,.1),inset 0 2px 0 white;
      font-size: 12px;
    }
    .caisha-result__restart {
      width: min(100%,320px);
      min-height: 51px;
      border: 2px solid rgba(255,246,226,.96) !important;
      border-radius: 999px;
      background:
        url("${e(`sand-wave.svg`)}") bottom/100% 33px no-repeat,
        linear-gradient(115deg,#ffb08c,#ff806d 58%,#f57571) !important;
      box-shadow: 0 12px 21px rgba(223,120,91,.25),inset 0 2px 0 rgba(255,255,255,.5);
      font-size: 17px;
      text-shadow: 0 1px 2px rgba(155,72,55,.2);
    }
    .caisha-result__home {
      margin-top: 6px;
      min-height: 36px;
      color:#966b69;
      font-size: 12px;
    }
    .caisha-result__score {
      color:#9b6870;
      background:rgba(255,255,255,.79);
    }

    /* Level victory, failure and the retained artwork gallery. */
    .caisha-mode-panel {
      background:
        linear-gradient(180deg,rgba(255,250,242,.2),rgba(255,248,240,.34)),
        url("${e(`sand-dream-bg.svg`)}") center/cover no-repeat !important;
      color:#794c56 !important;
    }
    .caisha-mode-panel__card {
      border: 2px solid #fff !important;
      border-radius: 27px !important;
      padding: 25px 18px !important;
      background: linear-gradient(160deg,#fffaf2,#ffedf0) !important;
      box-shadow:0 16px 32px rgba(124,77,66,.18),inset 0 3px 0 #fff !important;
    }
    .caisha-mode-panel__card h2 {
      margin:6px 0 10px;
      color:#854e5d !important;
      font-size:clamp(19px,5.2vw,24px) !important;
      line-height:1.3;
    }
    .caisha-mode-panel__card p { color:#a27670 !important; }
    .caisha-mode-panel__button {
      min-height: 43px;
      border: 2px solid #fff !important;
      border-radius:999px !important;
      background:linear-gradient(125deg,#ffac8f,#f88577) !important;
      box-shadow:0 6px 14px rgba(213,113,103,.18),inset 0 2px rgba(255,255,255,.4);
    }
    .caisha-mode-panel__card > button:last-child {
      background:linear-gradient(145deg,#fff,#fff1e9) !important;
      color:#985e68 !important;
    }
    .caisha-mode-panel__card > button:not(.caisha-mode-panel__button) {
      border:1px solid #f5deda !important;
      border-radius:18px !important;
      background:linear-gradient(140deg,#fff,#fff8ef) !important;
    }
    @media (max-height: 700px) {
      .caisha-mode-menu__card {padding: 17px 15px 13px;}
      .caisha-mode-menu__head-icon {width:52px;height:52px;margin-bottom:5px;}
      .caisha-mode-menu__subtitle {margin-bottom:12px;}
      .caisha-mode-menu__item {min-height:76px;margin-bottom:8px;padding-top:8px;padding-bottom:8px;}
      .caisha-mode-menu__mode-icon {flex-basis:50px;height:50px;}
      .caisha-result__frame-wrap {height:clamp(200px,38vh,270px);}
      .caisha-result__copy {margin-top:8px;}
      .caisha-result__share-row {margin-top:8px;}
    }
    @media (max-height: 590px) {
      .caisha-mode-menu__card {padding:11px 13px;}
      .caisha-mode-menu__item {min-height:65px;}
      .caisha-mode-menu__mode-icon {flex-basis:43px;height:43px;}
      .caisha-result__frame-wrap {height:190px;}
      .caisha-result__copy {padding:3px 0 0;}
    }
    @media (prefers-reduced-motion:reduce) {
      .caisha-mode-menu *, .caisha-result *, .caisha-mode-panel * {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }
  `}var B=`caisha-rainbow-sand-theme-v1`;function V(){if(document.getElementById(B))return;let e=e=>`./images/ui-theme/${e}`,t=document.createElement(`style`);t.id=B,t.textContent=Ke({asset:e}),document.head.appendChild(t)}var H=`dream-sand-home-screen-styles`;function U(e){return`./images/${e}`}function W(e,t,n=``){let r=document.createElement(e);return t&&(r.className=t),n&&(r.textContent=n),r}function qe(){if(document.getElementById(H))return;let e=document.createElement(`style`);e.id=H,e.textContent=Le(),document.head.appendChild(e)}var Je=class{constructor(e,{progress:t,onStart:n,onEffects:r,onGallery:i,getUnlockedLevel:a,getLevelStars:o,showEffectsButton:s=!1}={}){qe(),V(),z(),m(),Ve(),this.container=e,this.progress=t,this.onStart=n,this.onEffects=r,this.onGallery=i,this.getUnlockedLevel=a??(()=>1),this.getLevelStars=o??(()=>0),this.showEffectsButton=!!s,this.opened=!0,this.root=W(`section`,`caisha-home`),this.root.setAttribute(`aria-label`,`七彩沙画消除首页`);let c=W(`div`,`caisha-home__top`);this.best=W(`div`,`caisha-home__best`),this.effectsButton=W(`button`,`caisha-home__effects`),this.effectsButton.type=`button`,this.effectsButton.style.display=this.showEffectsButton?`inline-flex`:`none`,this.effectsBadge=W(`span`,`caisha-home__effects-badge`),this.effectsButton.append(W(`span`,``,`✨`),W(`span`,``,`消除特效`),this.effectsBadge),c.append(this.best,this.effectsButton);let l=W(`div`,`caisha-home__brand`),u=W(`img`,`caisha-home__title-image`);u.src=U(`qicai_title_mobile.png`),u.alt=`七彩沙画消除`,u.draggable=!1,l.append(u);let d=W(`div`,`caisha-home__actions`);this.playButton=W(`button`,`caisha-home__play`),this.playButton.type=`button`;let f=W(`img`,`caisha-home__play-image`);f.src=U(`start_game_button_v3.png`),f.alt=`开始游戏`,f.width=520,f.height=88,f.draggable=!1,this.playButton.setAttribute(`aria-label`,`开始游戏`),this.playButton.append(f),d.append(this.playButton),this.modeMenu=W(`div`,`caisha-mode-menu`),this.modeMenu.setAttribute(`role`,`dialog`),this.modeMenu.setAttribute(`aria-modal`,`true`),this.modeMenu.setAttribute(`aria-label`,`选择玩法`);let p=W(`div`,`caisha-mode-menu__card`),h=W(`img`,`caisha-mode-menu__illustrated-head`);h.src=U(`mode-hd/logo.webp`),h.alt=``,h.draggable=!1,h.setAttribute(`aria-hidden`,`true`);let g=W(`div`,`caisha-mode-menu__brand`);g.setAttribute(`aria-label`,`七彩沙画消除`),g.setAttribute(`role`,`heading`),g.setAttribute(`aria-level`,`1`);let _=[`#f15185`,`#f49a31`,`#4cae7a`,`#269bc3`,`#4c76d1`,`#9e58cd`];for(let[e,t]of[...`七彩沙画消除`].entries()){let n=W(`span`,``,t);n.setAttribute(`aria-hidden`,`true`),n.style.setProperty(`color`,_[e],`important`),n.style.setProperty(`-webkit-text-fill-color`,_[e],`important`),g.append(n)}this.modeHeadIcon=W(`div`,`caisha-mode-menu__head-icon`,`🌈`),this.modeTitle=W(`div`,`caisha-mode-menu__title`,`模式选择`),this.modeSubtitle=W(`div`,`caisha-mode-menu__subtitle`,`开启一场缤纷的沙粒冒险`),this.modeItems=W(`div`,`caisha-mode-menu__items`),this.modeBack=W(`button`,`caisha-mode-menu__back`,`← 返回首页`),this.modeBack.type=`button`,this.modeBack.addEventListener(`click`,()=>{this.modeMenu.classList.contains(`is-level`)?this.openModeMenu():this.closeModeMenu()}),this.modeMenu.addEventListener(`pointerdown`,e=>{e.target===this.modeMenu&&this.closeModeMenu()}),this.modeMenu.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.closeModeMenu()}),this.menuTopbar=W(`div`,`approved-art__topbar`),this.menuTopbar.append(this.modeBack),this.approvedHead=W(`img`,`approved-art__headline`),this.approvedHead.src=R(`mode-title.webp`),this.approvedHead.alt=`选择模式`,this.approvedHead.draggable=!1;let v=W(`div`,`approved-art__heading`);v.append(this.approvedHead),p.append(this.menuTopbar,v,h,g,this.modeHeadIcon,this.modeTitle,this.modeSubtitle,this.modeItems),this.modeMenu.append(p),this.root.append(c,l,d,this.modeMenu),this.container.appendChild(this.root),this.playButton.addEventListener(`click`,()=>this.openModeMenu()),this.openModeMenu=()=>{this.modeMenu.classList.remove(`is-level`,`sandworld-v1`),this.modeMenu.classList.add(`is-main`,`approved-art-v1`),this.container.classList.add(`caisha-mode-picker-open`),this.menuTopbar.replaceChildren(this.modeBack),this.approvedHead.src=R(`mode-title.webp`),this.approvedHead.alt=`选择模式`,this.modeTitle.textContent=`选择模式`,this.modeItems.replaceChildren(),this.modeHeadIcon.textContent=`🌈`,this.modeSubtitle.textContent=`开启一场缤纷的沙粒冒险`;let e=(e,t,n,r,i)=>{let a=W(`button`,`caisha-mode-menu__item`);a.type=`button`,a.dataset.mode=e;let o=W(`span`,`caisha-mode-menu__mode-icon`,t);o.setAttribute(`aria-hidden`,`true`);let s=W(`span`,`caisha-mode-menu__copy`),c=W(`strong`,``,n);s.append(c,W(`small`,``,r));let l=W(`img`,`approved-art__mode-picture`);l.src=R(e===`endless`?`mode-endless.webp`:e===`sandArt`?`mode-art.webp`:`mode-challenge.webp`),l.alt=``,l.draggable=!1,l.setAttribute(`aria-hidden`,`true`);let u=W(`span`,`approved-art__mode-frame`);u.append(l,s),a.append(u,o),a.addEventListener(`click`,i),this.modeItems.appendChild(a)};e(`level`,`🏁`,`挑战模式`,`特殊形状，更高难度`,()=>this.openLevelMenu()),e(`endless`,`∞`,`无尽模式`,`不断挑战更高的分数`,()=>this.selectMode(`endless`)),e(`sandArt`,`🎨`,`沙画模式`,`完成关卡，解锁精美沙画`,()=>this.selectMode(`sandArt`)),this.modeBack.textContent=`⌂ 返回首页`,this.modeMenu.classList.add(`is-open`),this.modeItems.querySelector(`button`)?.focus({preventScroll:!0})},this.openLevelMenu=()=>{this.modeMenu.classList.remove(`is-main`),this.modeMenu.classList.add(`is-level`,`approved-art-v1`),this.container.classList.remove(`caisha-mode-picker-open`),this.menuTopbar.replaceChildren(this.modeBack),this.approvedHead.src=R(`level-title-transparent.png`),this.approvedHead.alt=`沙画关卡`,this.modeTitle.textContent=`沙画关卡`,this.modeHeadIcon.textContent=`🏁`,this.modeSubtitle.textContent=`将沙粒完全消除，即可通关`,this.modeItems.replaceChildren();let e=He({levelNames:re,unlockedLevel:this.getUnlockedLevel(),getStars:e=>this.getLevelStars(e),onSelect:e=>this.selectMode(`level`,e)});this.modeItems.appendChild(e),this.modeBack.textContent=`‹ 返回模式选择`},this.closeModeMenu=()=>{this.container.classList.remove(`caisha-mode-picker-open`),this.modeMenu.classList.remove(`is-open`,`is-level`,`is-main`,`sandworld-v1`,`soft-sand-v2`,`approved-art-v1`),this.modeBack.textContent=`⌂ 返回首页`},this.selectMode=(e,t=1)=>{this.onStart?.(e,t),this.closeModeMenu(),this.hide()},this.effectsButton.addEventListener(`click`,()=>{this.showEffectsButton&&this.onEffects?.()}),this.unsubscribe=this.progress?.subscribe(e=>{this.renderProgress(e)}),this.progress?this.renderProgress(this.progress.getSnapshot()):this.renderProgress({stats:{bestScore:0},newClearEffects:[]})}renderProgress(e){let t=e?.stats?.bestScore??0,n=e?.newClearEffects?.length??0;this.best.replaceChildren(W(`span`,``,`🏆 最高`),W(`strong`,`caisha-rainbow-score`,Number(t).toLocaleString())),this.showEffectsButton&&n>0?(this.effectsBadge.style.display=`inline-flex`,this.effectsBadge.textContent=String(n)):(this.effectsBadge.style.display=`none`,this.effectsBadge.textContent=``)}show(){this.opened=!0,this.root.style.display=`flex`,this.closeModeMenu?.(),this.progress&&this.renderProgress(this.progress.getSnapshot())}hide(){this.opened=!1,this.root.style.display=`none`}isOpen(){return this.opened}};function Ye(){return`
    .caisha-result {
      position: absolute;
      inset: 0;
      z-index: 60;
      display: none;
      overflow: hidden auto;
      padding:
        max(15px, env(safe-area-inset-top))
        18px
        max(16px, env(safe-area-inset-bottom));
      color: #5d4632;
      background:
        radial-gradient(circle at 18% 9%, rgba(255,255,255,.92) 0 6%, transparent 25%),
        radial-gradient(circle at 82% 31%, rgba(244,198,139,.24) 0 8%, transparent 29%),
        linear-gradient(180deg, rgba(255,250,241,.97), rgba(247,234,218,.98));
      backdrop-filter: blur(9px);
      font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      user-select: none;
      touch-action: manipulation;
      isolation: isolate;
    }

    .caisha-result::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      opacity: .23;
      pointer-events: none;
      background-image:
        radial-gradient(circle, rgba(105,76,50,.2) 0 .5px, transparent .7px),
        radial-gradient(circle, rgba(255,255,255,.9) 0 .65px, transparent .82px);
      background-size: 7px 7px, 11px 11px;
      background-position: 0 0, 3px 5px;
    }

    .caisha-result__card {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
    }

    .caisha-result__eyebrow {
      margin-top: 2px;
      color: rgba(105,76,51,.54);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .18em;
      opacity: 1;
      transform: translateY(0);
      transition: transform 280ms ease;
    }

    .caisha-result__frame-wrap {
      position: relative;
      height: clamp(238px, 43vh, 338px);
      aspect-ratio: 9 / 16;
      margin-top: 9px;
      perspective: 900px;
    }

    .caisha-result__frame-shadow {
      position: absolute;
      left: 9%;
      right: 9%;
      bottom: -9px;
      height: 22px;
      border-radius: 50%;
      background: rgba(72,45,24,.2);
      filter: blur(12px);
      opacity: .4;
      transform: scale(.95);
      transition: opacity 340ms ease, transform 400ms ease;
    }

    .caisha-result__frame {
      position: absolute;
      inset: 0;
      padding: clamp(8px, 1.6vh, 12px);
      overflow: hidden;
      border: 1px solid rgba(91,55,29,.25);
      border-radius: 10px;
      background:
        linear-gradient(90deg, rgba(78,45,20,.11), transparent 16%, rgba(255,255,255,.22) 43%, transparent 72%, rgba(80,44,18,.1)),
        repeating-linear-gradient(7deg, rgba(104,62,28,.08) 0 1px, transparent 1px 7px),
        linear-gradient(135deg, #c9955d 0%, #e8bd84 35%, #bd814c 67%, #e0ae72 100%);
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,.58),
        inset 0 -2px 4px rgba(91,54,26,.18),
        0 11px 24px rgba(78,46,25,.15);
      opacity: 1;
      transform: translateY(0) scale(.96) rotateX(0);
      transform-origin: 50% 55%;
    }

    .caisha-result__frame::after {
      content: "";
      position: absolute;
      inset: 3px;
      border: 1px solid rgba(255,255,255,.25);
      border-radius: 7px;
      pointer-events: none;
    }

    .caisha-result__mat {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(6px, 1.2vh, 9px);
      border-radius: 4px;
      background:
        radial-gradient(circle at 28% 18%, rgba(255,255,255,.75), transparent 30%),
        linear-gradient(135deg, #fbf4e7, #efe3ce);
      box-shadow:
        inset 0 0 0 1px rgba(104,76,50,.11),
        inset 0 3px 8px rgba(102,72,43,.09);
    }

    .caisha-result__art {
      width: 100%;
      height: auto;
      max-height: 100%;
      aspect-ratio: 9 / 16;
      display: block;
      border-radius: 2px;
      background: #fff8ea;
      box-shadow:
        inset 0 0 12px rgba(79,54,35,.12),
        0 1px 1px rgba(255,255,255,.8);
      filter: saturate(1.05) contrast(1.02);
    }

    .caisha-result__copy {
      width: min(100%, 320px);
      margin-top: 15px;
      opacity: 1;
      transform: translateY(0);
      transition: transform 300ms ease;
    }

    .caisha-result__headline {
      color: #664832;
      font-size: clamp(17px, 4.7vw, 20px);
      line-height: 1.25;
      font-weight: 950;
      letter-spacing: -.02em;
    }

    .caisha-result__subline {
      margin-top: 5px;
      color: rgba(93,70,50,.62);
      font-size: 11px;
      line-height: 1.4;
      font-weight: 720;
    }

    .caisha-result__score {
      margin-top: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      padding: 6px 11px;
      border: 1px solid rgba(117,82,52,.1);
      border-radius: 999px;
      color: #78543a;
      background: rgba(255,255,255,.64);
      box-shadow: 0 5px 16px rgba(91,61,36,.06);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .03em;
    }

    .caisha-result__share-row {
      width: min(100%, 310px);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-top: 13px;
      opacity: 1;
      transform: translateY(0);
      transition: transform 280ms ease;
    }

    .caisha-result button {
      border: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      font-family: inherit;
      transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
    }

    .caisha-result button:active {
      transform: scale(.975);
    }

    .caisha-result__secondary {
      min-height: 42px;
      border: 1px solid rgba(108,76,51,.1) !important;
      border-radius: 15px;
      color: #715039;
      background: rgba(255,255,255,.72);
      box-shadow: 0 6px 15px rgba(87,58,33,.06);
      font-size: 12px;
      font-weight: 850;
    }

    .caisha-result__restart {
      width: min(100%, 310px);
      min-height: 50px;
      margin-top: 9px;
      overflow: hidden;
      border-radius: 18px;
      color: #fff;
      background:
        radial-gradient(circle at 17% 35%, rgba(255,255,255,.3) 0 1px, transparent 1.6px),
        radial-gradient(circle at 73% 68%, rgba(255,255,255,.2) 0 1px, transparent 1.5px),
        linear-gradient(135deg, #ff9168, #ed6f4f);
      background-size: 9px 9px, 13px 13px, auto;
      box-shadow:
        0 11px 21px rgba(219,99,66,.22),
        inset 0 1px 0 rgba(255,255,255,.32);
      font-size: 16px;
      font-weight: 950;
      letter-spacing: .04em;
      opacity: 1;
      transform: translateY(0);
      transition: transform 280ms ease, box-shadow 120ms ease;
    }

    .caisha-result__home {
      margin-top: 5px;
      padding: 8px 15px;
      color: rgba(99,72,50,.61);
      background: transparent;
      font-size: 11px;
      font-weight: 850;
      opacity: 1;
      transition: opacity 280ms ease;
    }

    .caisha-result__toast {
      position: sticky;
      left: 50%;
      bottom: 6px;
      z-index: 3;
      min-height: 30px;
      margin: 7px auto 0;
      padding: 7px 12px;
      border-radius: 999px;
      color: #fff;
      background: rgba(74,53,38,.88);
      box-shadow: 0 7px 18px rgba(54,35,22,.16);
      font-size: 10px;
      font-weight: 800;
      opacity: 0;
      transform: translateY(7px);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .caisha-result__toast.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .caisha-result.is-visible .caisha-result__eyebrow,
    .caisha-result.is-visible .caisha-result__copy,
    .caisha-result.is-visible .caisha-result__share-row,
    .caisha-result.is-visible .caisha-result__restart,
    .caisha-result.is-visible .caisha-result__home {
      opacity: 1;
      transform: translateY(0);
    }

    .caisha-result.is-visible .caisha-result__frame-shadow {
      opacity: .72;
      transform: scale(1);
    }

    .caisha-result.is-visible .caisha-result__frame {
      animation: caisha-frame-in 450ms cubic-bezier(.18,.85,.24,1.08) forwards;
    }

    @keyframes caisha-frame-in {
      0% {
        opacity: 1;
        transform: translateY(0) scale(.96) rotateX(0);
      }
      64% {
        opacity: 1;
        transform: translateY(0) scale(1.035) rotateX(0);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotateX(0);
      }
    }

    @media (max-height: 680px) {
      .caisha-result {
        padding-top: 11px;
        padding-bottom: 10px;
      }
      .caisha-result__frame-wrap {
        height: 244px;
        margin-top: 6px;
      }
      .caisha-result__copy {
        margin-top: 11px;
      }
      .caisha-result__share-row {
        margin-top: 9px;
      }
      .caisha-result__restart {
        min-height: 45px;
      }
    }

    @media (max-height: 590px) {
      .caisha-result__frame-wrap {
        height: 205px;
      }
      .caisha-result__subline {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .caisha-result *,
      .caisha-result *::before,
      .caisha-result *::after {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
        transition-delay: 0ms !important;
      }
    }
  `}var Xe=`caisha-game-over-artwork-styles`;function G(e,t,n=``){let r=document.createElement(e);return t&&(r.className=t),n&&(r.textContent=n),r}function Ze(e){return new Promise((t,n)=>{e.toBlob(e=>{e?t(e):n(Error(`Unable to export artwork canvas`))},`image/png`)})}function Qe(){if(document.getElementById(Xe))return;let e=document.createElement(`style`);e.id=Xe,e.textContent=Ye(),document.head.appendChild(e)}var $e=class{constructor(e,{onRestart:t,onHome:n}={}){Qe(),V(),z(),m(),this.container=e,this.onRestart=t,this.onHome=n,this.score=0,this.rating=`GOOD`,this.opened=!1,this.showTimer=null,this.toastTimer=null,this.root=G(`section`,`caisha-result`),this.root.setAttribute(`aria-label`,`本局沙画作品`);let r=G(`div`,`caisha-result__card`),i=G(`div`,`caisha-result__eyebrow`,`本局沙画完成`);this.eyebrow=i;let a=G(`div`,`caisha-result__frame-wrap`),o=G(`div`,`caisha-result__frame-shadow`),s=G(`div`,`caisha-result__frame`),c=G(`div`,`caisha-result__mat`);this.previewCanvas=G(`canvas`,`caisha-result__art`),c.appendChild(this.previewCanvas),s.appendChild(c),a.append(o,s);let l=G(`div`,`caisha-result__copy`),u=G(`div`,`caisha-result__headline`,`这一局，拼出了一幅不错的沙画`);this.headline=u;let d=G(`div`,`caisha-result__subline`,`分享给好友看看你的作品`);this.subline=d,this.scoreLine=G(`div`,`caisha-result__score`),l.append(u,d,this.scoreLine);let f=G(`div`,`caisha-result__share-row`);this.shareButton=G(`button`,`caisha-result__secondary`,`↗ 分享好友`),this.saveButton=G(`button`,`caisha-result__secondary`,`▣ 保存相册`),this.shareButton.type=`button`,this.saveButton.type=`button`,f.append(this.shareButton,this.saveButton),this.restartButton=G(`button`,`caisha-result__restart`,`再来一局`),this.restartButton.type=`button`,this.homeButton=G(`button`,`caisha-result__home`,`返回首页`),this.homeButton.type=`button`,this.toast=G(`div`,`caisha-result__toast`),r.append(i,a,l,f,this.restartButton,this.homeButton,this.toast),this.root.appendChild(r),this.container.appendChild(this.root),this.restartButton.addEventListener(`click`,()=>{this.hide(),this.onRestart?.()}),this.homeButton.addEventListener(`click`,()=>{this.hide(),this.onHome?.()}),this.saveButton.addEventListener(`click`,()=>{this.savePoster()}),this.shareButton.addEventListener(`click`,()=>{this.sharePoster()})}isOpen(){return this.opened}show({score:e=0,rating:t=`GOOD`,artworkCanvas:n,mode:r=`endless`}={}){clearTimeout(this.showTimer),clearTimeout(this.toastTimer),this.score=Number(e)||0,this.rating=String(t||`GOOD`).toUpperCase(),this.mode=r,this.root.classList.toggle(`is-premium-art`,r===`sandArt`),this.eyebrow.textContent=r===`sandArt`?`七彩流沙 · 原创沙画`:`本局沙画完成`,this.headline.textContent=r===`sandArt`?`你的沙画完成啦！`:`这一局，拼出了一幅不错的沙画`,this.subline.textContent=r===`sandArt`?`把独一无二的作品送给好友`:`分享给好友看看你的作品`,this.restartButton.textContent=r===`sandArt`?`再画一幅`:`再来一局`,this.scoreLine.style.display=r===`sandArt`?`none`:`inline-flex`,this.scoreLine.replaceChildren(G(`span`,`caisha-rainbow-score`,this.score.toLocaleString()),document.createTextNode(` 分 · ${this.rating}`)),n&&this.setArtwork(n),this.opened=!0,this.root.style.display=`block`,this.root.scrollTop=0,this.root.classList.add(`is-visible`)}hide(){clearTimeout(this.showTimer),clearTimeout(this.toastTimer),this.opened=!1,this.root.classList.remove(`is-visible`),this.root.style.display=`none`,this.toast.classList.remove(`is-visible`)}setArtwork(e){let t=Math.max(1,e.width||1),n=Math.max(1,e.height||1);this.previewCanvas.width=t,this.previewCanvas.height=n;let r=this.previewCanvas.getContext(`2d`);r&&(r.imageSmoothingEnabled=!1,r.clearRect(0,0,t,n),r.drawImage(e,0,0,t,n))}showToast(e){clearTimeout(this.toastTimer),this.toast.textContent=e,this.toast.classList.add(`is-visible`),this.toastTimer=setTimeout(()=>{this.toast.classList.remove(`is-visible`)},1800)}renderPoster(){return se({createCanvas:()=>document.createElement(`canvas`),artworkCanvas:this.previewCanvas,score:this.score,rating:this.rating,mode:this.mode})}async savePoster({fallbackMessage:e=`沙画作品已生成`}={}){try{let e=await Ze(this.renderPoster()),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`七彩沙画消除-${Date.now()}.png`,n.rel=`noopener`,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(t),1200),this.showToast(`已生成沙画图片，可保存到相册`)}catch(t){console.error(t),this.showToast(e)}}async sharePoster(){try{let e=await Ze(this.renderPoster()),t={title:`七彩沙画消除`,text:`这一局，拼出了一幅不错的沙画`,files:[new File([e],`七彩沙画消除-${Date.now()}.png`,{type:`image/png`})]};if(navigator.share&&(!navigator.canShare||navigator.canShare(t))){await navigator.share(t);return}await this.savePoster({fallbackMessage:`当前浏览器暂不支持直接分享`}),this.showToast(`当前浏览器不支持直分享，已生成分享图`)}catch(e){if(e?.name===`AbortError`)return;console.error(e),this.showToast(`分享未完成，可先保存图片再发送给好友`)}}},K={gearButton:{position:`absolute`,right:`max(12px, env(safe-area-inset-right))`,top:`max(12px, env(safe-area-inset-top))`,zIndex:`45`,display:`grid`,placeItems:`center`,width:`52px`,height:`54px`,padding:`0`,border:`0`,background:`transparent`,cursor:`pointer`,touchAction:`manipulation`,WebkitTapHighlightColor:`transparent`},gearImage:{width:`50%`,height:`50%`,display:`block`,objectFit:`contain`,pointerEvents:`none`},overlay:{position:`absolute`,inset:`0`,zIndex:`70`,display:`none`,alignItems:`center`,justifyContent:`center`,padding:`20px 14px`,boxSizing:`border-box`,background:`rgba(55, 43, 34, .30)`,backdropFilter:`blur(5px)`,WebkitBackdropFilter:`blur(5px)`,touchAction:`none`},panel:{position:`relative`,width:`min(92vw, 356px)`,aspectRatio:`406 / 316`,color:`#71351f`,fontFamily:`system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", sans-serif`,userSelect:`none`,WebkitUserSelect:`none`},panelBackground:{position:`absolute`,inset:`0`,width:`100%`,height:`100%`,display:`block`,objectFit:`fill`,pointerEvents:`none`,filter:`drop-shadow(0 13px 18px rgba(74, 48, 29, .19))`},closeButton:{position:`absolute`,right:`-5px`,top:`-5px`,zIndex:`4`,width:`49px`,height:`50px`,padding:`0`,border:`0`,background:`transparent`,cursor:`pointer`,touchAction:`manipulation`,WebkitTapHighlightColor:`transparent`},closeImage:{width:`100%`,height:`100%`,display:`block`,objectFit:`contain`,pointerEvents:`none`},controls:{position:`absolute`,left:`9%`,right:`7.5%`,top:`31%`,bottom:`23%`,zIndex:`2`,display:`grid`,gridTemplateRows:`1fr 1fr`,rowGap:`7%`},navigation:{position:`absolute`,top:`calc(100% + 10px)`,left:`0`,right:`0`,display:`none`,justifyContent:`center`,alignItems:`center`,gap:`8px`,zIndex:`3`},homeButton:{display:`none`,flex:`0 1 155px`,minWidth:`0`,height:`44px`,padding:`5px 8px`,borderRadius:`999px`,border:`2px solid #ffd5a5`,background:`linear-gradient(180deg, #fffaf2, #ffe4be)`,color:`#865039`,boxShadow:`0 6px 15px rgba(88, 56, 34, .14)`,font:`850 14px system-ui, sans-serif`,whiteSpace:`nowrap`,cursor:`pointer`,touchAction:`manipulation`},modeButton:{display:`none`,flex:`0 1 155px`,minWidth:`0`,height:`44px`,padding:`5px 8px`,borderRadius:`999px`,border:`2px solid #b9dcd6`,background:`linear-gradient(180deg, #fffdfa, #dff3eb)`,color:`#4d786b`,boxShadow:`0 6px 15px rgba(61, 91, 79, .12)`,font:`850 14px system-ui, sans-serif`,whiteSpace:`nowrap`,cursor:`pointer`,touchAction:`manipulation`},confirmOverlay:{position:`absolute`,inset:`0`,zIndex:`8`,display:`none`,alignItems:`center`,justifyContent:`center`,padding:`16px`,boxSizing:`border-box`,background:`rgba(45, 34, 30, .49)`,borderRadius:`20px`,touchAction:`manipulation`},confirmCard:{width:`min(100%, 310px)`,padding:`24px 18px 20px`,border:`2px solid #f1d6bb`,borderRadius:`22px`,background:`linear-gradient(180deg, #fffdf8, #fff1dd)`,boxShadow:`0 16px 32px rgba(70, 43, 33, .23)`,textAlign:`center`},confirmTitle:{color:`#81523a`,font:`900 18px/1.4 system-ui, sans-serif`},confirmMessage:{margin:`12px 0 20px`,color:`#8c715d`,font:`600 13px/1.7 system-ui, sans-serif`},confirmActions:{display:`flex`,gap:`10px`},confirmCancelButton:{flex:`1 1 0`,minWidth:`0`,minHeight:`44px`,border:`1px solid #e1d0bf`,borderRadius:`14px`,background:`#fffdf6`,color:`#846f61`,font:`850 14px system-ui, sans-serif`,cursor:`pointer`},confirmAcceptButton:{flex:`1 1 0`,minWidth:`0`,minHeight:`44px`,border:`0`,borderRadius:`14px`,background:`linear-gradient(180deg, #ee9872, #d8795c)`,color:`white`,font:`850 14px system-ui, sans-serif`,cursor:`pointer`},row:{display:`grid`,gridTemplateColumns:`47px minmax(0, 1fr) 52px`,gridTemplateRows:`23px 34px`,columnGap:`8px`,alignItems:`center`,alignContent:`center`,minWidth:`0`},labelElement:{gridColumn:`2 / span 2`,gridRow:`1`,alignSelf:`end`,margin:`0 0 3px 2px`,fontSize:`14px`,lineHeight:`1`,fontWeight:`800`,color:`#71351f`,letterSpacing:`.01em`},track:{gridColumn:`2`,gridRow:`2`,position:`relative`,height:`32px`,minWidth:`0`,touchAction:`none`},trackImage:{position:`absolute`,left:`0`,right:`0`,top:`50%`,width:`100%`,height:`16px`,transform:`translateY(-50%)`,objectFit:`fill`,pointerEvents:`none`},fillImage:{position:`absolute`,left:`0`,top:`0`,width:`100%`,height:`100%`,objectFit:`fill`,pointerEvents:`none`},knobImage:{position:`absolute`,left:`0%`,top:`50%`,width:`32px`,height:`32px`,transform:`translate(-50%, -50%)`,objectFit:`contain`,pointerEvents:`none`},input:{position:`absolute`,inset:`-7px -12px`,width:`calc(100% + 24px)`,height:`46px`,margin:`0`,opacity:`0`,cursor:`pointer`,zIndex:`5`,touchAction:`none`}};function et(e){return{gridColumn:`1`,gridRow:`1 / span 2`,justifySelf:`center`,width:e===`music`?`39px`:`43px`,height:`43px`,objectFit:`contain`,pointerEvents:`none`}}function tt(e){return{position:`absolute`,left:`0`,top:`50%`,width:`0%`,height:`16px`,transform:`translateY(-50%)`,overflow:`hidden`,borderRadius:`999px`,pointerEvents:`none`,background:e===`music`?`linear-gradient(180deg, #ffe58c, #ffa233)`:`linear-gradient(180deg, #83d9ff, #288bed)`}}function nt(e){return{gridColumn:`3`,gridRow:`2`,display:`grid`,placeItems:`center`,width:`52px`,height:`30px`,backgroundImage:`url("${e(`percent_badge_bg.png`)}")`,backgroundRepeat:`no-repeat`,backgroundPosition:`center`,backgroundSize:`contain`,color:`#71351f`,fontSize:`13px`,fontWeight:`850`,lineHeight:`1`,fontVariantNumeric:`tabular-nums`}}var rt=`images/settings-ui/`;function q(e,t,n){return Math.max(t,Math.min(n,e))}function it(e){return`./${rt}${e}`}function J(e,t=``){let n=document.createElement(`img`);return n.src=it(e),n.alt=t,n.draggable=!1,n.decoding=`async`,n}var at=class{constructor(e=document.body,{audio:t,onHome:n=null,canGoHome:r=()=>!1,onModeSelect:i=null,canGoModeSelect:a=()=>!1}={}){this.onHome=n,this.canGoHome=r,this.onModeSelect=i,this.canGoModeSelect=a,this.pendingExit=null,this.container=e,this.audio=t,this.opened=!1,this.rows=new Map,this.gearButton=document.createElement(`button`),this.gearButton.type=`button`,this.gearButton.dataset.audioSkipClick=`true`,this.gearButton.setAttribute(`aria-label`,`打开设置`),Object.assign(this.gearButton.style,K.gearButton);let o=J(`setting_gear_pastel_sand_v2.png`,``);Object.assign(o.style,K.gearImage),this.gearButton.appendChild(o),this.overlay=document.createElement(`div`),this.overlay.setAttribute(`role`,`dialog`),this.overlay.setAttribute(`aria-modal`,`true`),this.overlay.setAttribute(`aria-label`,`设置`),Object.assign(this.overlay.style,K.overlay),this.panel=document.createElement(`div`),Object.assign(this.panel.style,K.panel);let s=J(`panel_background.png`,``);Object.assign(s.style,K.panelBackground),this.closeButton=document.createElement(`button`),this.closeButton.type=`button`,this.closeButton.dataset.audioSkipClick=`true`,this.closeButton.setAttribute(`aria-label`,`关闭设置`),Object.assign(this.closeButton.style,K.closeButton);let c=J(`close_button.png`,``);Object.assign(c.style,K.closeImage),this.closeButton.appendChild(c),this.controls=document.createElement(`div`),Object.assign(this.controls.style,K.controls),this.controls.append(this.createVolumeRow({key:`music`,label:`音乐音量`,icon:`music_icon.png`,fill:`slider_fill_orange.png`,knob:`slider_knob_orange.png`}),this.createVolumeRow({key:`sfx`,label:`音效音量`,icon:`sfx_icon.png`,fill:`slider_fill_blue.png`,knob:`slider_knob_blue.png`})),this.navigation=document.createElement(`div`),Object.assign(this.navigation.style,K.navigation),this.homeButton=document.createElement(`button`),this.homeButton.type=`button`,this.homeButton.dataset.audioSkipClick=`true`,this.homeButton.textContent=`⌂ 返回主页`,this.homeButton.setAttribute(`aria-label`,`返回主页`),Object.assign(this.homeButton.style,K.homeButton),this.homeButton.addEventListener(`click`,e=>{e.stopPropagation(),this.requestExit(`home`)}),this.modeButton=document.createElement(`button`),this.modeButton.type=`button`,this.modeButton.dataset.audioSkipClick=`true`,this.modeButton.textContent=`模式选择`,this.modeButton.setAttribute(`aria-label`,`模式选择`),Object.assign(this.modeButton.style,K.modeButton),this.modeButton.addEventListener(`click`,e=>{e.stopPropagation(),this.requestExit(`modes`)}),this.navigation.append(this.homeButton,this.modeButton),this.confirmOverlay=document.createElement(`div`),this.confirmOverlay.setAttribute(`role`,`alertdialog`),this.confirmOverlay.setAttribute(`aria-modal`,`true`),this.confirmOverlay.setAttribute(`aria-label`,`确认结束本局`),Object.assign(this.confirmOverlay.style,K.confirmOverlay);let l=document.createElement(`div`);Object.assign(l.style,K.confirmCard);let u=document.createElement(`div`);u.textContent=`确定结束本局游戏？`,Object.assign(u.style,K.confirmTitle),this.confirmMessage=document.createElement(`p`),Object.assign(this.confirmMessage.style,K.confirmMessage);let d=document.createElement(`div`);Object.assign(d.style,K.confirmActions),this.confirmCancelButton=document.createElement(`button`),this.confirmCancelButton.type=`button`,this.confirmCancelButton.textContent=`取消`,Object.assign(this.confirmCancelButton.style,K.confirmCancelButton),this.confirmCancelButton.addEventListener(`click`,e=>{e.stopPropagation(),this.cancelExit()}),this.confirmAcceptButton=document.createElement(`button`),this.confirmAcceptButton.type=`button`,this.confirmAcceptButton.textContent=`确定返回`,Object.assign(this.confirmAcceptButton.style,K.confirmAcceptButton),this.confirmAcceptButton.addEventListener(`click`,e=>{e.stopPropagation(),this.confirmExit()}),d.append(this.confirmCancelButton,this.confirmAcceptButton),l.append(u,this.confirmMessage,d),this.confirmOverlay.appendChild(l),this.panel.append(s,this.controls,this.closeButton,this.navigation),this.overlay.append(this.panel,this.confirmOverlay),this.container.append(this.gearButton,this.overlay),this.gearButton.addEventListener(`click`,e=>{e.stopPropagation(),this.audio?.unlock?.(),this.audio?.playUiClick?.(),this.open()}),this.closeButton.addEventListener(`click`,e=>{e.stopPropagation(),this.close()}),this.overlay.addEventListener(`pointerdown`,e=>{e.target===this.overlay&&!this.pendingExit&&this.close()}),this.onKeyDown=e=>{e.key===`Escape`&&this.opened&&(this.pendingExit?this.cancelExit():this.close())},document.addEventListener(`keydown`,this.onKeyDown),this.refresh()}requestExit(e){if(!this.opened||this.pendingExit||!(e===`home`?this.onHome&&this.canGoHome?.():this.onModeSelect&&this.canGoModeSelect?.()))return;this.pendingExit=e;let t=e===`home`?`主页`:`模式选择`;this.confirmMessage.textContent=`返回${t}将结束本局游戏，当前进度不会保留。确定返回吗？`,this.confirmOverlay.style.display=`flex`,this.audio?.playUiClick?.(),this.confirmCancelButton.focus?.({preventScroll:!0})}cancelExit({silent:e=!1}={}){if(!this.pendingExit)return;let t=this.pendingExit;this.pendingExit=null,this.confirmOverlay.style.display=`none`,e||this.audio?.playUiClick?.(),(t===`home`?this.homeButton:this.modeButton).focus?.({preventScroll:!0})}confirmExit(){let e=this.pendingExit;if(!e||!this.opened)return;let t=e===`home`?this.onHome:this.onModeSelect,n=e===`home`?this.canGoHome?.():this.canGoModeSelect?.();if(!t||!n){this.cancelExit();return}this.cancelExit({silent:!0}),this.close({silent:!0}),this.audio?.playUiClick?.(),t()}createVolumeRow({key:e,label:t,icon:n,fill:r,knob:i}){let a=document.createElement(`div`);Object.assign(a.style,K.row);let o=J(n,``);Object.assign(o.style,et(e));let s=document.createElement(`div`);s.textContent=t,Object.assign(s.style,K.labelElement);let c=document.createElement(`div`);Object.assign(c.style,K.track);let l=J(`slider_track_empty.png`,``);Object.assign(l.style,K.trackImage);let u=document.createElement(`div`);Object.assign(u.style,tt(e));let d=J(r,``);d.addEventListener(`error`,()=>{d.style.display=`none`}),Object.assign(d.style,K.fillImage),u.appendChild(d);let f=J(i,``);Object.assign(f.style,K.knobImage);let p=document.createElement(`input`);p.type=`range`,p.min=`0`,p.max=`100`,p.step=`1`,p.setAttribute(`aria-label`,t),Object.assign(p.style,K.input),c.append(l,u,f,p);let m=document.createElement(`div`);return Object.assign(m.style,nt(it)),p.addEventListener(`input`,()=>{this.audio?.unlock?.();let t=q(Number(p.value)/100,0,1);e===`music`?this.audio?.setMusicVolume?.(t):this.audio?.setSfxVolume?.(t),this.renderRow(e)}),p.addEventListener(`change`,()=>{e===`sfx`&&this.audio?.getSfxVolume?.()>0&&this.audio.playUiClick?.({force:!0})}),this.rows.set(e,{input:p,fillMask:u,knobImage:f,badge:m}),a.append(o,s,c,m),a}getVolume(e){return q(e===`music`?this.audio?.getMusicVolume?.()??.7:this.audio?.getSfxVolume?.()??.8,0,1)}renderRow(e){let t=this.rows.get(e);if(!t)return;let n=this.getVolume(e),r=Math.round(n*100),i=q(r,2,98);t.input.value=String(r),t.fillMask.style.width=`${r}%`,t.knobImage.style.left=`${i}%`,t.badge.textContent=`${r}%`}refresh(){this.renderRow(`music`),this.renderRow(`sfx`)}isOpen(){return this.opened}open(){if(this.opened)return;this.opened=!0,this.refresh();let e=!!(this.onHome&&this.canGoHome?.()),t=!!(this.onModeSelect&&this.canGoModeSelect?.());this.homeButton.style.display=e?`block`:`none`,this.modeButton.style.display=t?`block`:`none`,this.navigation.style.display=e||t?`flex`:`none`,this.overlay.style.display=`flex`,requestAnimationFrame(()=>{this.rows.get(`music`)?.input?.focus?.({preventScroll:!0})})}close({silent:e=!1}={}){this.opened&&(this.cancelExit({silent:!0}),this.opened=!1,this.overlay.style.display=`none`,e||this.audio?.playUiClick?.(),this.gearButton.focus?.({preventScroll:!0}))}};function ot(){return`
.caisha-art-mode{background:
  radial-gradient(circle at 14% 13%,#fff5d8,transparent 40%),
  radial-gradient(circle at 93% 73%,#d7c4ff,transparent 38%),
  linear-gradient(155deg,#eec2bd,#ffdfad 46%,#e3c4f6) !important;}
.caisha-art-mode #game-root{
  box-sizing:border-box !important;
  width:var(--art-board-width,auto) !important;
  height:var(--art-board-height,calc(100% - 270px)) !important;
  top:var(--art-board-top,76px) !important;
  transform:translateX(-50%) !important;
  overflow:hidden;border:4px ridge #e1aa73;border-radius:10px;
  box-shadow:0 0 0 4px #fff8e5,0 0 0 7px #c68d58,0 10px 24px #8f65495c;
}
.caisha-art-studio{
  position:absolute;inset:0;z-index:14;pointer-events:none;
  color:#574e58;font:600 13px/1.2 ui-rounded,"Microsoft YaHei",system-ui,sans-serif;
}
.caisha-art-studio *{box-sizing:border-box;}
.caisha-art-studio__top{
  position:absolute;top:max(17px,calc(env(safe-area-inset-top) + 5px));
  left:max(12px,env(safe-area-inset-left));right:max(76px,calc(env(safe-area-inset-right) + 64px));
  display:flex;align-items:center;justify-content:space-between;gap:8px;pointer-events:auto;
}
.caisha-art-studio__button{
  --art-sand-color:#e4edf3;--art-sand-shade:#bfccd5;--art-sand-ink:#556878;
  position:relative;isolation:isolate;overflow:hidden;display:flex;
  align-items:center;justify-content:center;gap:5px;
  min-height:44px;min-width:0;padding:8px 12px;
  border:1px solid var(--art-sand-shade);border-radius:12px;
  background:var(--art-sand-color);color:var(--art-sand-ink);
  box-shadow:inset 0 1px 0 #ffffff70,0 3px 0 var(--art-sand-shade),0 5px 9px #6a596512;
  font:inherit;cursor:pointer;touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;transition:transform .12s,box-shadow .12s;
}
.caisha-art-studio__button::before{
  content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:var(--art-sand-grain) repeat;background-size:96px 96px;opacity:.72;
}
.caisha-art-studio__button:active{
  transform:translateY(2px);box-shadow:inset 0 1px 2px #66546b18,0 1px 0 var(--art-sand-shade);
}
.caisha-art-studio__button svg{display:block;width:18px;height:18px;flex:none;}
.caisha-art-studio__label{white-space:nowrap;}
.caisha-art-studio__home{
  padding:0 2px;border:0;background:transparent;color:#695d66;box-shadow:none;
}
.caisha-art-studio__home::before{display:none;}
.caisha-art-studio__home img{width:32px;height:32px;object-fit:contain;}
.caisha-art-studio__home:active{box-shadow:none;}
.caisha-art-studio__caption{display:grid;gap:4px;text-align:center;color:#695d66;}
.caisha-art-studio__caption strong{font-size:14px;font-weight:700;letter-spacing:.06em;}
.caisha-art-studio__caption span{font-size:11px;color:#877785;}
.caisha-art-studio__size{padding:8px 10px;}
.caisha-art-studio__bottom{
  position:absolute;bottom:max(12px,env(safe-area-inset-bottom));left:10px;right:10px;
  display:grid;gap:12px;padding:12px 10px 10px;pointer-events:auto;
  border:1px solid #eee2d5;border-radius:20px;background:#fff9ef;box-shadow:0 4px 14px #725c6b20;
}
.caisha-art-studio__tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;}
.caisha-art-studio__tool{min-height:64px;padding:10px 3px 8px;flex-direction:column;gap:7px;}
.caisha-art-studio__tool svg{width:22px;height:22px;}
.caisha-art-studio__tool.is-active{
  transform:translateY(-2px);
  box-shadow:0 0 0 2px #fff9ef,0 0 0 3px var(--art-sand-ink),0 4px 0 var(--art-sand-shade);
}
.caisha-art-studio__tool.is-active::after{
  content:"✓";position:absolute;top:4px;right:5px;font-size:11px;pointer-events:none;
}
.caisha-art-studio__tool.is-active:active{transform:translateY(0);}
.caisha-art-studio__palette{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0;}
.caisha-art-studio__color{
  position:relative;display:flex;align-items:center;justify-content:center;
  min-width:0;min-height:44px;padding:4px;border:0;background:transparent;
  cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
}
.caisha-art-studio__swatch{
  position:relative;display:block;width:31px;height:31px;border-radius:50%;
  background:var(--art-sand-grain) repeat,var(--art-sand-color);background-size:96px 96px;
  box-shadow:inset 0 1px 0 #ffffff40,0 2px 0 var(--art-sand-shade);
}
.caisha-art-studio__color.is-active .caisha-art-studio__swatch{
  box-shadow:0 0 0 2px #fff9ef,0 0 0 3px #776078,0 3px 4px #75647318;
}
.caisha-art-studio__color.is-active .caisha-art-studio__swatch::after{
  content:"✓";position:absolute;inset:0;display:grid;place-items:center;
  font:600 14px/1 system-ui;color:#514355;
}
.caisha-art-studio__color:active .caisha-art-studio__swatch{transform:translateY(1px);}
.caisha-art-studio__actions{
  display:flex;align-items:center;gap:7px;border-top:1px solid #ece0d5;padding-top:10px;
}
.caisha-art-studio__clear{margin-left:auto;}
.caisha-art-studio button:focus-visible{outline:3px solid #4e76bd;outline-offset:3px;}
@media(max-width:360px){
  .caisha-art-studio__top{left:max(9px,env(safe-area-inset-left));gap:5px;}
  .caisha-art-studio__bottom{left:8px;right:8px;padding-inline:8px;}
  .caisha-art-studio__tools{gap:7px;}
  .caisha-art-studio__actions .caisha-art-studio__button{padding-inline:9px;}
}
@media(max-height:620px){
  .caisha-art-studio__bottom{bottom:max(8px,env(safe-area-inset-bottom));padding-block:9px 7px;gap:8px;}
  .caisha-art-studio__tool{min-height:56px;padding-block:7px 5px;gap:5px;}
  .caisha-art-studio__actions{padding-top:7px;}
}
@media(prefers-reduced-motion:reduce){.caisha-art-studio__button{transition:none;}}
`}var Y=`caisha-art-studio-visuals-v1`;function st(){if(document.getElementById(Y))return;let e=document.createElement(`style`);e.id=Y,e.textContent=ot(),document.head.appendChild(e)}var ct={brush:`<path d="m13 3 8 8-9 9-4-4Z"/><path d="m13 3 2-2 8 8-2 2M8 16c-5-1-6 2-6 6 4 0 7-1 6-6Z"/>`,pen:`<path d="m12 3 8 6-4 10-8 2-5-6 2-8Z"/><path d="m12 3-1 9M8 21l3-9"/><circle cx="11" cy="12" r="2"/>`,shapes:`<path d="m6 3 5 8H1Z"/><circle cx="17" cy="7" r="4"/><rect x="3" y="15" width="7" height="7" rx="1"/><path d="m17 14 5 4-5 4-5-4Z"/>`,eraser:`<path d="m15 3 7 7-11 11H7l-5-5Z"/><path d="m8 10 7 7M11 21h11"/>`,undo:`<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14"/>`,redo:`<path d="m16 4 5 5-5 5M21 9H10a7 7 0 0 0 0 14"/>`,trash:`<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>`};function lt(e){let t=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);return t.setAttribute(`viewBox`,`0 0 24 24`),t.setAttribute(`fill`,`none`),t.setAttribute(`stroke`,`currentColor`),t.setAttribute(`stroke-width`,`1.6`),t.setAttribute(`stroke-linecap`,`round`),t.setAttribute(`stroke-linejoin`,`round`),t.setAttribute(`aria-hidden`,`true`),t.innerHTML=ct[e]||``,t}var X;function ut(){if(X)return X;let e=document.createElement(`canvas`);e.width=e.height=96;let t=e.getContext(`2d`);for(let e=0;e<96;e++)for(let n=0;n<96;n++)t.fillStyle=((n*73856093^e*19349663)>>>0)%2?`rgba(255,255,255,.22)`:`rgba(72,55,83,.13)`,t.fillRect(n,e,1,1);return X=e.toDataURL(),X}function Z(e,t){let n=o(t);e.style.setProperty(`--art-sand-color`,_(n)),e.style.setProperty(`--art-sand-shade`,_(n.map(e=>Math.round(e*.82)))),e.style.setProperty(`--art-sand-ink`,_(n.map(e=>Math.round(e*.38))))}var dt=[`红`,`橙`,`黄`,`绿`,`青`,`蓝`,`紫`],ft=[[`flow`,`流沙笔`,`brush`,6],[`fixed`,`固沙笔`,`pen`,4],[`shape`,`形状`,`shapes`,7],[`erase`,`橡皮擦`,`eraser`,3]],pt=class{constructor(e,{onHome:t,onTool:n,onColor:r,onSize:i,onUndo:a,onRedo:o,onClear:s}={}){st(),this.container=e,this.root=document.createElement(`section`),this.root.className=`caisha-art-studio`,this.root.setAttribute(`aria-label`,`沙画创作工具栏`),this.root.style.display=`none`,this.root.style.setProperty(`--art-sand-grain`,`url("`+ut()+`")`);let c=(e,t)=>{let n=document.createElement(`div`);return n.className=`caisha-art-studio__`+e,t&&(n.setAttribute(`role`,`group`),n.setAttribute(`aria-label`,t)),n},l=(e,t,n,r=``,i)=>{let a=document.createElement(`button`);a.type=`button`,a.className=(`caisha-art-studio__button `+r).trim(),i&&a.appendChild(lt(i));let o=document.createElement(`span`);return o.className=`caisha-art-studio__label`,o.textContent=t,a.appendChild(o),a.addEventListener(`click`,n),e.appendChild(a),a};this.top=c(`top`);let u=l(this.top,`首页`,t,`caisha-art-studio__home`),d=document.createElement(`img`);d.src=`./images/approved-ui/back-arrow-pastel-sand.webp`,d.alt=``,d.draggable=!1,u.prepend(d);let f=c(`caption`),p=document.createElement(`strong`);p.textContent=`沙画工坊`;let m=document.createElement(`span`);m.textContent=`堆到完成线`,f.append(p,m),this.top.appendChild(f);let h=1,g=[1,2,4],_=l(this.top,`笔刷·中`,()=>{h=(h+1)%g.length,_.querySelector(`.caisha-art-studio__label`).textContent=`笔刷·`+[`细`,`中`,`粗`][h],i?.(g[h])},`caisha-art-studio__size`);Z(_,2),this.bottom=c(`bottom`);let v=c(`tools`,`绘画工具`);this.toolButtons=[];for(let[e,t,r,i]of ft){let a=l(v,t,()=>{this.setTool(e),n?.(e)},`caisha-art-studio__tool`,r);a.dataset.tool=e,Z(a,i),this.toolButtons.push({tool:e,button:a})}let y=c(`palette`,`彩沙颜色`);this.colorButtons=[];for(let e=0;e<S.length;e++){let t=S[e],n=document.createElement(`button`);n.type=`button`,n.className=`caisha-art-studio__color`,n.setAttribute(`aria-label`,dt[e]+`色沙粒`),n.dataset.color=String(t),Z(n,t);let i=document.createElement(`span`);i.className=`caisha-art-studio__swatch`,i.setAttribute(`aria-hidden`,`true`),n.appendChild(i),n.addEventListener(`click`,()=>{this.setColor(t),r?.(t)}),y.appendChild(n),this.colorButtons.push({color:t,button:n})}let b=c(`actions`,`编辑操作`);l(b,`撤销`,a,``,`undo`),l(b,`重做`,o,``,`redo`),Z(l(b,`清空`,()=>{confirm(`确定清空当前沙画吗？`)&&s?.()},`caisha-art-studio__clear`,`trash`),1),this.bottom.append(v,y,b),this.root.append(this.top,this.bottom),e.appendChild(this.root),this.setTool(`flow`),this.setColor(1),this.resizeObserver=new ResizeObserver(()=>this.updateLayout());for(let t of[e,this.top,this.bottom])this.resizeObserver.observe(t)}setTool(e){for(let t of this.toolButtons){let n=t.tool===e;t.button.classList.toggle(`is-active`,n),t.button.setAttribute(`aria-pressed`,String(n))}}setColor(e){for(let t of this.colorButtons){let n=t.color===e;t.button.classList.toggle(`is-active`,n),t.button.setAttribute(`aria-pressed`,String(n))}}updateLayout(){if(this.root.style.display===`none`)return;let e=this.container.getBoundingClientRect(),t=this.top.getBoundingClientRect().bottom-e.top+12,n=e.bottom-this.bottom.getBoundingClientRect().top+16,r=Math.max(0,e.height-t-n),i=Math.max(0,Math.min(e.width-28,r*9/16)),a=i*16/9;this.container.style.setProperty(`--art-board-width`,i+`px`),this.container.style.setProperty(`--art-board-height`,a+`px`),this.container.style.setProperty(`--art-board-top`,t+(r-a)/2+`px`)}show(e){this.root.style.display=e?`block`:`none`,e&&this.updateLayout()}};function Q(e,t){let n=document.createElement(`button`);return n.textContent=e,n.type=`button`,n.className=`caisha-mode-panel__button`,n.style.cssText=`border:0;background:linear-gradient(120deg,#ffad7d,#f17f61);color:white;border-radius:15px;padding:13px 17px;margin:5px;font:900 15px system-ui;`,n.addEventListener(`click`,t),n}var mt=class{constructor(e){V(),this.root=document.createElement(`div`),this.root.style.cssText=`position:absolute;inset:0;z-index:51;background:rgba(40,28,33,.69);padding:max(28px,env(safe-area-inset-top)) 20px;overflow:auto;font:800 14px system-ui,sans-serif;color:#664832;display:none;align-items:center;justify-content:center;`,this.root.classList.add(`caisha-mode-panel`),this.card=document.createElement(`div`),this.card.classList.add(`caisha-mode-panel__card`),this.card.style.cssText=`width:min(100%,380px);margin:auto;padding:22px 16px;text-align:center;background:#fff9ec;border-radius:24px;box-shadow:0 16px 44px #35232380;`,this.root.appendChild(this.card),e.appendChild(this.root)}hide(){this.root.style.display=`none`}showWin({level:e,stars:t,drops:n,next:r,retry:i,home:a}){this.card.replaceChildren();let o=document.createElement(`h2`);o.textContent=`🎉 第 `+e+` 关挑战成功！`,this.card.append(o);let s=document.createElement(`p`);s.textContent=`⭐`.repeat(t)+` · 使用 `+n+` 个沙块 · 全部清空`,this.card.append(s),r&&this.card.appendChild(Q(`下一关`,()=>{this.hide(),r()})),this.card.appendChild(Q(`再玩一次`,()=>{this.hide(),i()})),this.card.appendChild(Q(`返回首页`,()=>{this.hide(),a()})),this.root.style.display=`flex`}showLose({level:e,remaining:t,retry:n,home:r}){this.card.replaceChildren();let i=document.createElement(`h2`);i.textContent=`第 `+e+` 关挑战失败`,i.style.cssText=`font-size:25px;margin:6px 0 12px;color:#a55342;`;let a=document.createElement(`p`);a.textContent=`沙堆触碰了失败线 · 尚余 `+Number(t).toLocaleString()+` 粒`,a.style.cssText=`font-size:13px;line-height:1.8;color:#96745e;`;let o=document.createElement(`p`);o.textContent=`调整下一块沙子的落点，再试一次吧！`,o.style.cssText=`font-size:12px;color:#9b8874;`,this.card.append(i,a,o),this.card.appendChild(Q(`重试本关`,()=>{this.hide(),n()})),this.card.appendChild(Q(`返回首页`,()=>{this.hide(),r()})),this.root.style.display=`flex`}showGallery(e,{onClose:t,onView:n}){this.card.replaceChildren();let r=document.createElement(`h2`);if(r.textContent=`🖼 我的沙画`,this.card.append(r),!e.length){let e=document.createElement(`p`);e.textContent=`还没有作品。到沙画模式完成一幅吧！`,this.card.append(e)}for(let t of e.slice(0,10))try{let{cells:e}=he(t.runs,t.width*t.height),r=document.createElement(`canvas`);r.width=t.width,r.height=t.height,r.style.cssText=`width:82px;height:146px;object-fit:contain;border:5px solid #dfb888;border-radius:5px;background:#fff8ea;`;let i=r.getContext(`2d`);for(let n=0;n<e.length;n++){if(!e[n])continue;let r=n%t.width,a=Math.floor(n/t.width);i.fillStyle=`rgb(`+v(r,a,e[n]).join(`,`)+`)`,i.fillRect(r+s,a+s,ue,ue)}let a=document.createElement(`button`);a.type=`button`,a.style.cssText=`display:flex;align-items:center;gap:16px;width:100%;margin:8px 0;padding:8px;border:1px solid #eedac7;border-radius:16px;background:white;color:#76563d;text-align:left;`,a.append(r,document.createTextNode(new Date(t.date).toLocaleString()+` · 查看作品`)),a.addEventListener(`click`,()=>{this.hide(),n?.(r,t)}),this.card.append(a)}catch{}this.card.appendChild(Q(`关闭`,()=>{this.hide(),t?.()})),this.root.style.display=`flex`}};function ht(e){e.setArtTool=function(t){return e.artFinishing||!e.art.active||e.fruitManager.current&&![`CONTROL`,`SAND`].includes(e.fruitManager.current.state)?!1:(e.art.setTool(t),t===`shape`?(e.fruitManager.setSpawnProvider(()=>({color:e.art.color})),e.fruitManager.reset()):(e.fruitManager.setEnabled(!1),e.fruitManager.current=null),e.renderGameCanvas(!0),!0)},e.getArtPos=function(t){let n=e.sandRenderer.canvas.getBoundingClientRect();return{x:(t.clientX-n.left)/Math.max(1,n.width)*e.grid.width,y:(t.clientY-n.top)/Math.max(1,n.height)*e.grid.height}},e.captureArtPointer=function(t){if(!(e.currentMode!==x.ART||e.art.tool===`shape`||!e.art.active||e.artFinishing||e.homeScreen.isOpen()||e.gameOver||e.gameOverArtwork.isOpen())){if(t.type===`pointerdown`){t.preventDefault(),t.stopImmediatePropagation(),e.drawingArt=!0;let n=e.getArtPos(t);e.art.beginStroke(n.x,n.y),e.sandRenderer.canvas.setPointerCapture?.(t.pointerId)}else if(e.drawingArt&&t.type===`pointermove`){t.preventDefault(),t.stopImmediatePropagation();let n=e.getArtPos(t);e.art.strokeTo(n.x,n.y)}else e.drawingArt&&(t.type===`pointerup`||t.type===`pointercancel`)&&(t.preventDefault(),t.stopImmediatePropagation(),e.drawingArt=!1,e.art.endStroke())}},e.openArtworkGallery=function(){e.modePanels.showGallery(e.modeProgress.artworks,{onClose:()=>{},onView:t=>{e.currentMode=x.ART,e.homeDemo.hide(),e.gameOver=!0,e.gameOverArtwork.show({mode:`sandArt`,artworkCanvas:t})}})}}function gt(t){t.triggerGameOver=function(){if(t.gameOver)return;if(t.gameOver=!0,t.blockPropPanel.hide(),t.fruitManager.setEnabled(!1),t.audio.playGameOver(),t.currentMode===x.LEVEL){t.levelStatus.style.display=`none`,t.clearEffects.clear(),t.modePanels.showLose({level:t.currentLevel,remaining:E(t.grid),retry:()=>t.restartGame(x.LEVEL,t.currentLevel),home:()=>t.returnHome()});return}t.currentMode===x.ENDLESS&&(t.progress.recordGameOver(t.clearSystem.score),t.unlockManager.checkAll());let e=t.sandRenderer.createArtworkCanvas({scale:3});t.gameOverArtwork.show({score:t.clearSystem.score,rating:h(t.clearSystem.score),artworkCanvas:e})},t.resetHomeDemoWorld=function(e=null){t.art.stop(),t.art.fixed.fill(0),t.clearEffects.clear(),t.audio.stopTransient(),t.grid.clear(),e&&(t.grid.cells.set(e),t.grid.revision+=1),t.simulation.reset(),t.clearSystem.reset(),t.rules.reset(),t.settlementGate.reset(),t.fruitManager.reset(),t.gameOver=!1,t.lastFruitState=t.fruitManager.current?.state??null;let n=performance.now();t.lastSimulation=n,t.lastFrame=n,t.renderGameCanvas(!0)},t.prepareFirstDropGuide=function(){if(t.fruitManager.setSpawnProvider(null),!e.FIRST_DROP_GUIDE_ENABLED)return;let n=te(t.grid),r=!0;t.fruitManager.setSpawnProvider(()=>r?(r=!1,t.fruitManager.setSpawnProvider(null),{templateId:n.templateId,color:n.color,centerX:n.centerX}):null)},t.restartGame=function(e=t.currentMode,n=t.currentLevel){if(t.blockPropPanel.hide(),t.currentMode=e,t.currentLevel=n,t.levelData=null,t.levelVictoryPending=!1,t.lastDraftSaveTime=0,t.artFinishing=!1,t.artFinishElapsed=0,t.artFinishStableTicks=0,t.art.stop(),t.art.fixed.fill(0),t.modePanels.hide(),t.gameShell.classList.toggle(`caisha-art-mode`,e===x.ART),t.artToolbar.show(e===x.ART),t.levelStatus.style.display=e===x.LEVEL?`block`:`none`,t.lastLevelStatusRevision=-1,t.sandRenderer.lineMode=e===x.ART?`finish`:`failure`,t.settingsPanel.close({silent:!0}),t.gameOverArtwork.hide(),t.hud.setGameVisible(!1),t.grid.clear(),e===x.ENDLESS)t.prepareFirstDropGuide();else if(e===x.LEVEL)t.levelData=le(n),t.grid.cells.set(t.levelData.cells),t.grid.revision++,t.fruitManager.setSpawnProvider(de(t.levelData,()=>t.fruitManager.random())),t.simulation.setRandom(ie(t.levelData.runtimeSeed));else{t.fruitManager.setSpawnProvider(null),t.art.reset();let e=t.modeProgress.readDraft(t.grid.width,t.grid.height);e&&t.art.restore(e)}t.simulation.reset(),t.clearSystem.reset(),t.rules.reset(),t.fruitManager.reset(),e===x.ART&&t.setArtTool(`flow`),t.hud.reset(),t.clearEffects.clear(),t.audio.stopTransient(),t.settlementGate.reset(),t.hud.setGameVisible(e===x.ENDLESS),t.gameOver=!1,t.lastFruitState=t.fruitManager.current?.state??null;let r=performance.now();t.lastSimulation=r,t.lastFrame=r,t.blockProps.begin(e===x.LEVEL?t.levelData:null),e===x.LEVEL&&t.blockPropPanel.start(),t.renderGameCanvas(!0)},t.returnHome=function(){t.blockPropPanel.hide(),t.blockProps.begin(null),t.currentMode===x.ART&&!t.gameOver&&(E(t.grid)>0?t.modeProgress.saveDraft(t.grid,t.art.fixed):t.modeProgress.clearDraft()),t.drawingArt=!1,t.artFinishing=!1,t.art.stop(),t.art.fixed.fill(0),t.fruitManager.setSpawnProvider(null),t.artToolbar.show(!1),t.gameShell.classList.remove(`caisha-art-mode`),t.levelStatus.style.display=`none`,t.modePanels.hide(),t.sandRenderer.lineMode=`failure`,t.hud.setGameVisible(!1),t.audio.stopTransient(),t.clearEffects.clear(),t.effectPanel.close(),t.settingsPanel.close({silent:!0}),t.gameOverArtwork.hide(),t.homeScreen.show(),t.homeDemo.show()},t.returnModeSelect=function(){t.returnHome(),t.homeScreen.openModeMenu()},t.triggerArtComplete=function(){if(t.gameOver||t.currentMode!==x.ART)return;t.artFinishing=!1,t.gameOver=!0,t.drawingArt=!1,t.art.stop(),t.fruitManager.setEnabled(!1),t.artToolbar.show(!1),t.audio.stopTransient(),t.modeProgress.saveArtwork(t.grid,t.art.fixed),t.modeProgress.clearDraft();let e=t.sandRenderer.createArtworkCanvas({scale:3});t.gameOverArtwork.show({mode:`sandArt`,artworkCanvas:e})},t.triggerLevelComplete=function(){if(t.gameOver||t.currentMode!==x.LEVEL)return;t.gameOver=!0,t.blockPropPanel.hide(),t.fruitManager.setEnabled(!1),t.levelStatus.style.display=`none`;let e=t.modeProgress.winLevel(t.currentLevel,t.hud.dropHintCount,t.levelData?.referenceDrops||1);t.modePanels.showWin({level:t.currentLevel,stars:e,drops:t.hud.dropHintCount,next:t.currentLevel<12?()=>t.restartGame(x.LEVEL,t.currentLevel+1):null,retry:()=>t.restartGame(x.LEVEL,t.currentLevel),home:()=>t.returnHome()})}}function _t(t){t.getFruitRenderKey=function(e){return e?[e.state,e.x,e.y,e.color,Math.round(e.impactTimer??0),Math.round(e.breakTimer??0),e.dissolvedCount??0].join(`:`):``},t.renderGameCanvas=function(e=!1){let n=t.fruitManager.current,r=t.getFruitRenderKey(n);(e||t.grid.revision!==t.lastRenderedGridRevision||n!==t.lastRenderedFruit||r!==t.lastRenderedFruitKey)&&(t.sandRenderer.update(n),t.lastRenderedGridRevision=t.grid.revision,t.lastRenderedFruit=n,t.lastRenderedFruitKey=r)},t.canResolveConnectivity=function(e){return e!==`IMPACT`&&e!==`BREAKING`},t.loop=function(n){requestAnimationFrame(t.loop);let r=Math.min(50,n-t.lastFrame);t.lastFrame=n;let i=t.homeDemo.isRunning(),a=!t.homeScreen.isOpen()||i;if(!t.gameOver&&!t.effectPanel.isOpen()&&!t.settingsPanel.isOpen()&&!t.blockPropPanel.isBlocking()&&a){if(t.clearEffects.isBusy())t.audio.updateSandFlow(0),t.lastSimulation=n;else{let a=t.lastFruitState;i&&t.homeDemo.update(n),!i&&t.currentMode===x.ART&&(t.art.update(r),t.lastDraftSaveTime===0&&(t.lastDraftSaveTime=n),n-t.lastDraftSaveTime>7e3&&E(t.grid)>0&&(t.modeProgress.saveDraft(t.grid,t.art.fixed),t.lastDraftSaveTime=n)),t.fruitManager.update(r);let o=t.fruitManager.current?.state??null;if(o!==a&&o===`FALLING`&&(t.clearSystem.resetCombo(),i||t.audio.playFallStart()),!i&&a===`FALLING`&&o===`IMPACT`&&t.audio.playImpact(),!i&&a===`IMPACT`&&o===`BREAKING`&&t.audio.playCrumble(),a===`BREAKING`&&o===null&&t.settlementGate.begin(),t.lastFruitState=o,!i&&t.currentMode!==x.ART&&t.rules.checkDeathLine()&&t.triggerGameOver(),!t.gameOver&&n-t.lastSimulation>=e.UPDATE_INTERVAL){if(t.simulation.update(()=>!i&&t.currentMode!==x.ART&&t.rules.checkDeathLine()?(t.triggerGameOver(),!1):!t.gameOver),t.audio.updateSandFlow(!i&&!t.gameOver?t.simulation.movedCount:0),!t.gameOver&&t.currentMode===x.ART){if(!t.artFinishing&&t.art.isComplete()){t.artFinishing=!0,t.artFinishElapsed=0,t.artFinishStableTicks=0,t.drawingArt=!1,t.art.stop();let e=t.fruitManager.current?.state;(!e||e===`CONTROL`||e===`SAND`)&&t.fruitManager.setEnabled(!1)}if(t.artFinishing){t.fruitManager.current||t.fruitManager.setEnabled(!1),t.artFinishElapsed+=r;let e=t.fruitManager.current&&![`SAND`,`CONTROL`].includes(t.fruitManager.current.state);t.simulation.movedCount===0&&!e?t.artFinishStableTicks++:t.artFinishStableTicks=0,(t.artFinishStableTicks>=4||t.artFinishElapsed>=2e3&&!e||t.artFinishElapsed>=5e3)&&t.triggerArtComplete()}}!t.gameOver&&t.currentMode!==x.ART&&t.settlementGate.isBlocking()&&t.settlementGate.observe(t.simulation.movedCount)&&t.canResolveConnectivity(o)&&t.clearSystem.resolve({maxGroups:i?1:1/0})>0&&t.settlementGate.begin(),!i&&!t.gameOver&&t.currentMode===x.LEVEL&&t.levelVictoryPending&&!t.settlementGate.isBlocking()&&!t.clearEffects.isBusy()&&E(t.grid)===0&&t.triggerLevelComplete(),t.lastSimulation=n}}}else t.audio.updateSandFlow(0);!t.gameOver&&!t.homeScreen.isOpen()&&t.currentMode===x.LEVEL&&t.lastLevelStatusRevision!==t.grid.revision&&(t.levelStatus.textContent=`第 `+t.currentLevel+` 关
剩余 `+E(t.grid).toLocaleString()+` 粒`,t.lastLevelStatusRevision=t.grid.revision),t.stats.update(),t.blockPropPanel.update(n),t.renderGameCanvas()}}var vt=`
.caisha-props[hidden],.caisha-prop-overlay[hidden]{display:none!important}
.caisha-props{position:absolute;right:max(9px,env(safe-area-inset-right));z-index:16;display:flex;flex-direction:column;gap:10px;transition:top .16s ease-out;touch-action:none}
.caisha-prop-button{position:relative;width:48px;height:54px;padding:0;border:0;background:none;cursor:pointer;touch-action:none}
.caisha-prop-button canvas{display:block;width:44px;height:44px;margin:0 auto}
.caisha-props.is-compact{gap:0}
.caisha-props.is-compact .caisha-prop-button{height:48px}
.caisha-props.is-compact canvas{width:38px;height:38px}
.caisha-props.is-top-row{flex-direction:row;gap:4px;right:max(76px,calc(env(safe-area-inset-right) + 76px))}
.caisha-prop-button:disabled{cursor:default;filter:saturate(.45);opacity:.5}
.caisha-prop-button:focus-visible{outline:2px solid #ad96d7;outline-offset:2px;border-radius:50%}
.caisha-prop-dots{height:6px;display:flex;justify-content:center;gap:4px}
.caisha-prop-dot{width:5px;height:5px;border-radius:50%;background:#a9a6e7;box-shadow:0 1px 1px #7a5d7926}
.caisha-prop-dot.is-empty{background:#d6cdbd;opacity:.55}
.caisha-prop-overlay{position:absolute;inset:0;z-index:45;display:flex;align-items:center;justify-content:center;background:#36294280;touch-action:none;color:#6c5362;font-family:ui-rounded,"Microsoft YaHei",system-ui,sans-serif}
.caisha-prop-intro{flex-direction:column;cursor:pointer;background:radial-gradient(circle at center,#fff5dc33,#392c4e99)}
.caisha-prop-intro canvas{width:138px;height:138px;filter:drop-shadow(0 8px 14px #392c4e50)}
.caisha-prop-intro h2{font-size:22px;margin:22px 0 10px;color:#fff9eb;text-shadow:0 2px 6px #49394a90}
.caisha-prop-intro p{font-size:14px;color:#fff9eb;text-align:center;margin:0 12px 22px}
.caisha-prop-intro small{font-size:13px;color:#fff0d6;animation:caisha-prop-hint 1.5s ease-in-out infinite}
@keyframes caisha-prop-hint{50%{opacity:.55}}
.caisha-prop-intro.is-flying h2,.caisha-prop-intro.is-flying p,.caisha-prop-intro.is-flying small{opacity:0;transition:opacity .15s}
.caisha-prop-intro.is-flying{background:transparent;transition:background .25s}
.caisha-prop-picker{width:min(326px,calc(100% - 36px));max-height:calc(100% - 44px);overflow:auto;padding:20px;border:2px solid #fff7e3;border-radius:24px;background:linear-gradient(145deg,#fff9ec,#f5e6da);box-shadow:0 14px 35px #392c4e50}
.caisha-prop-picker h2{font-size:20px;margin:0;text-align:center}
.caisha-prop-preview{display:block;width:128px;height:82px;margin:10px auto;background:#fffef8;border-radius:14px}
.caisha-prop-picker p{font-size:12px;margin:12px 0 7px;color:#967d84}
.caisha-prop-colors{display:flex;gap:9px;flex-wrap:wrap}
.caisha-prop-color{width:33px;height:33px;border-radius:50%;border:3px solid #fffaf0;background:var(--sand-color);box-shadow:0 2px 4px #9c7b6120;cursor:pointer}
.caisha-prop-color[aria-pressed=true]{outline:2px solid #9f87bd;outline-offset:2px}
.caisha-prop-shapes{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.caisha-prop-shape{border:2px solid transparent;border-radius:12px;background:#fffdf580;padding:2px;cursor:pointer}
.caisha-prop-shape canvas{display:block;width:100%;height:44px}
.caisha-prop-shape[aria-pressed=true]{border-color:#b59ad2;background:#fffdf5}
.caisha-prop-actions{display:flex;gap:10px;margin-top:17px}
.caisha-prop-actions button{flex:1;min-height:42px;border:0;border-radius:14px;background:#e4d4ef;color:#6b5275;font-weight:700;font-size:14px;cursor:pointer}
.caisha-prop-actions button:first-child{background:#eee2d1;color:#8b7461}
.caisha-prop-actions button:disabled{opacity:.4;cursor:default}
`,yt={1:`红`,2:`橙`,3:`黄`,4:`绿`,5:`青`,6:`蓝`,7:`紫`};function $(e,t,n){let r=document.createElement(`canvas`),i=Math.min(3,devicePixelRatio||1);r.width=e*i,r.height=t*i;let a=r.getContext(`2d`);return a.scale(i,i),n?.(a),r.setAttribute(`aria-hidden`,`true`),r}var bt=class{constructor(e,t){this.game=e,this.props=t,this.epoch=0,this.introId=null,this.flying=!1,this.picking=!1;let n=document.createElement(`style`);n.textContent=vt,e.gameShell.appendChild(n),this.dock=document.createElement(`div`),this.dock.className=`caisha-props`,this.dock.hidden=!0,this.buttons={};for(let[e,n]of Object.entries(w)){let r=document.createElement(`button`);r.type=`button`,r.className=`caisha-prop-button`,r.dataset.prop=e;let i=$(44,44,t=>C(t,e,0,0,44)),a=document.createElement(`span`);a.className=`caisha-prop-dots`,a.setAttribute(`aria-hidden`,`true`);for(let e=0;e<n.count;e++){let e=document.createElement(`i`);e.className=`caisha-prop-dot`,a.appendChild(e)}r.append(i,a),r.addEventListener(`click`,n=>{n.stopPropagation(),!this.isBlocking()&&(e===`regenerate`?t.regenerate()&&this.changed():this.openPicker())}),this.dock.appendChild(r),this.buttons[e]=r}this.intro=document.createElement(`div`),this.intro.className=`caisha-prop-overlay caisha-prop-intro`,this.intro.hidden=!0,this.intro.tabIndex=0,this.intro.setAttribute(`role`,`dialog`),this.intro.setAttribute(`aria-modal`,`true`),this.intro.addEventListener(`click`,e=>{e.stopPropagation(),this.flyIntro()}),this.intro.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.flyIntro())}),this.picker=document.createElement(`div`),this.picker.className=`caisha-prop-overlay`,this.picker.hidden=!0,this.picker.setAttribute(`role`,`dialog`),this.picker.setAttribute(`aria-modal`,`true`),this.picker.setAttribute(`aria-label`,`指定生成沙块`),this.picker.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.closePicker()});for(let e of[this.dock,this.intro,this.picker])for(let t of[`pointerdown`,`pointermove`,`pointerup`,`pointercancel`])e.addEventListener(t,e=>e.stopPropagation());e.gameShell.append(this.dock,this.intro,this.picker)}isBlocking(){return!!(this.introId||this.picking)}start(){this.hide(),this.dock.hidden=!this.props.available().length;for(let[e,t]of Object.entries(this.buttons))t.hidden=!this.props.available().includes(e);this.top=null,this.layoutKey=``,this.update(performance.now(),!0),this.introQueue=this.props.pendingIntroductions(),this.showNextIntro()}hide(){this.epoch++,this.flight?.cancel(),this.flight=null,this.introId=null,this.flying=!1,this.picking=!1,this.intro.hidden=!0,this.picker.hidden=!0,this.dock.hidden=!0;for(let e of Object.values(this.buttons))e.style.visibility=``}showNextIntro(){let e=this.introQueue.shift();if(!e){this.game.lastFrame=this.game.lastSimulation=performance.now();return}this.introId=e,this.flying=!1,this.intro.classList.remove(`is-flying`);let t=w[e];this.intro.replaceChildren($(138,138,t=>C(t,e,0,0,138)));for(let[e,n]of[[`h2`,t.name],[`p`,t.description],[`small`,`点击屏幕继续`]]){let t=document.createElement(e);t.textContent=n,this.intro.appendChild(t)}this.intro.setAttribute(`aria-label`,t.name+`：`+t.description),this.buttons[e].style.visibility=`hidden`,this.intro.hidden=!1,this.intro.focus(),this.update(performance.now())}async flyIntro(){if(!this.introId||this.flying)return;this.flying=!0;let e=this.introId,t=this.epoch;this.intro.classList.add(`is-flying`);let n=this.intro.querySelector(`canvas`),r=n.getBoundingClientRect(),i=this.buttons[e].querySelector(`canvas`).getBoundingClientRect();this.flight=n.animate([{transform:`translate(0,0) scale(1)`},{transform:`translate(`+(i.x+i.width/2-r.x-r.width/2)+`px,`+(i.y+i.height/2-r.y-r.height/2)+`px) scale(`+i.width/r.width+`)`}],{duration:520,easing:`cubic-bezier(.25,.7,.3,1)`,fill:`forwards`});try{await this.flight.finished}catch{return}t===this.epoch&&(this.props.markIntroduced(e),this.buttons[e].style.visibility=``,this.intro.hidden=!0,this.introId=null,this.flying=!1,this.showNextIntro())}changed(){this.game.renderGameCanvas(!0),this.update(performance.now())}openPicker(){if(!this.props.isReady(`specify`))return;this.picking=!0;let e=this.props.manager.current;this.choice={color:e.color,templateId:e.template.id};let t=document.createElement(`section`);t.className=`caisha-prop-picker`;let n=document.createElement(`h2`);n.textContent=`指定生成沙块`,this.preview=$(128,82),this.preview.className=`caisha-prop-preview`,t.append(n,this.preview);let r=document.createElement(`div`);r.className=`caisha-prop-colors`,this.colorButtons=[];for(let e of this.props.levelData.palette){let t=document.createElement(`button`);t.type=`button`,t.className=`caisha-prop-color`,t.style.setProperty(`--sand-color`,_(o(e))),t.setAttribute(`aria-label`,yt[e]+`色沙块`),t.dataset.color=e,t.onclick=()=>{this.choice.color=e,this.renderChoice()},r.appendChild(t),this.colorButtons.push(t)}let i=document.createElement(`div`);i.className=`caisha-prop-shapes`,this.shapeButtons=[];for(let e of this.props.manager.templates){let t=document.createElement(`button`);t.type=`button`,t.className=`caisha-prop-shape`,t.setAttribute(`aria-label`,e.name),t.dataset.shape=e.id,t.appendChild($(80,44,t=>T(t,e,this.choice.color,80,44))),t.onclick=()=>{this.choice.templateId=e.id,this.renderChoice()},i.appendChild(t),this.shapeButtons.push(t)}for(let[e,n]of[[`选择颜色`,r],[`选择形状`,i]]){let r=document.createElement(`p`);r.textContent=e,t.append(r,n)}let a=document.createElement(`div`);a.className=`caisha-prop-actions`;let s=document.createElement(`button`);s.textContent=`取消`,s.onclick=()=>this.closePicker(),this.confirm=document.createElement(`button`),this.confirm.textContent=`确认生成`,this.confirm.onclick=()=>{this.props.specify(this.choice.color,this.choice.templateId)&&(this.closePicker(),this.changed())},a.append(s,this.confirm),t.appendChild(a),this.picker.replaceChildren(t),this.renderChoice(),this.picker.hidden=!1,s.focus()}renderChoice(){let e=this.props.manager.templates.find(e=>e.id===this.choice.templateId),t=this.preview.getContext(`2d`);T(t,e,this.choice.color,128,82);for(let e of this.colorButtons)e.setAttribute(`aria-pressed`,Number(e.dataset.color)===this.choice.color);for(let e of this.shapeButtons){e.setAttribute(`aria-pressed`,e.dataset.shape===this.choice.templateId);let t=this.props.manager.templates.find(t=>t.id===e.dataset.shape);T(e.firstChild.getContext(`2d`),t,this.choice.color,80,44)}let n=this.props.manager.current;this.confirm.disabled=n.color===this.choice.color&&n.template.id===this.choice.templateId}closePicker(){this.picking=!1,this.picker.hidden=!0,this.game.lastFrame=this.game.lastSimulation=performance.now(),this.buttons.specify.focus()}update(e,t=!1){if(this.dock.hidden)return;let n=Object.keys(this.buttons).map(e=>[e,this.props.counts[e],this.isBlocking()||!this.props.isReady(e)].join(`:`)).join(`|`);if(n!==this.stateKey){this.stateKey=n;for(let[e,t]of Object.entries(this.buttons))t.disabled=this.isBlocking()||!this.props.isReady(e),t.setAttribute(`aria-label`,w[e].name+`，剩余`+this.props.counts[e]+`次`),t.querySelectorAll(`i`).forEach((t,n)=>t.classList.toggle(`is-empty`,n>=this.props.counts[e]))}let r=this.game.gameShell.getBoundingClientRect(),i=this.game.gameRoot.getBoundingClientRect(),a=[this.game.grid.revision,r.width,r.height,i.x,i.y,i.width,i.height].join(`:`);if(a!==this.layoutKey){this.layoutKey=a;let n=(this.dock.getBoundingClientRect().left-i.left-30)/i.width*this.game.grid.width,o=ce(this.game.grid,n),s=i.top-r.top+o/this.game.grid.height*i.height,c=this.game.settingsPanel.gearButton.getBoundingClientRect(),l=Math.max(12,c.bottom-r.top+4),u=this.props.available().length,d=u*54+(u-1)*10,f=s-80-l<d;this.dock.classList.toggle(`is-compact`,f);let p=f&&s-l-u*48<24;this.dock.classList.toggle(`is-top-row`,p);let m=s;if(p){l=Math.max(8,c.top-r.top);let e=(this.dock.getBoundingClientRect().left-i.left-30)/i.width*this.game.grid.width;m=i.top-r.top+ce(this.game.grid,e)/this.game.grid.height*i.height}let h=ee({height:r.height,groupHeight:p?48:f?u*48:d,minTop:l,sandTop:m,gap:80});this.top===null||h<this.top||t?(this.top=h,this.dock.style.top=h+`px`,this.returnAt=0):h>this.top+1&&(this.returnTarget=h,this.returnAt=e+600)}this.returnAt&&e>=this.returnAt&&(this.top=this.returnTarget,this.dock.style.top=this.top+`px`,this.returnAt=0)}};function xt(){let e={};if(ht(e),gt(e),_t(e),e.gameShell=document.getElementById(`game-shell`),e.gameRoot=document.getElementById(`game-root`),!e.gameShell||!e.gameRoot)throw Error(`Missing mobile game container`);e.grid=new d,e.simulation=new y(e.grid),e.art=new ne(e.grid,e.simulation),e.modeProgress=new b,e.currentMode=x.ENDLESS,e.currentLevel=1,e.levelData=null,e.levelVictoryPending=!1,e.lastDraftSaveTime=0,e.artFinishing=!1,e.artFinishElapsed=0,e.artFinishStableTicks=0,e.sandRenderer=new i(e.grid),e.sandRenderer.canvas.className=`game-canvas`,e.sandRenderer.canvas.setAttribute(`aria-label`,`七彩沙画消除游戏画布`),e.gameRoot.appendChild(e.sandRenderer.canvas),e.stats=new ge(e.simulation),e.progress=new f,e.unlockManager=new me(e.progress),e.unlockManager.checkAll(),e.clearSystem=new g(e.grid,e.simulation),e.fruitManager=new n(e.grid,e.simulation,{getScore:()=>e.clearSystem.score}),e.rules=new a(e.grid),e.hud=new _e(e.gameShell),e.clearEffects=new ve(e.gameRoot,e.grid,e.sandRenderer.canvas,{getEffectId:()=>e.progress.getSelectedEffectId()}),e.audio=new Me(e.gameShell),e.settingsPanel=new at(e.gameShell,{audio:e.audio,onHome:()=>e.returnHome(),canGoHome:()=>!e.homeScreen.isOpen(),onModeSelect:()=>e.returnModeSelect(),canGoModeSelect:()=>!e.homeScreen.isOpen()&&(e.currentMode===x.ENDLESS||e.currentMode===x.LEVEL)}),e.settlementGate=new pe(3),e.blockProps=new ae(e.fruitManager,{canUse:()=>!e.gameOver&&e.currentMode===x.LEVEL&&!e.homeScreen.isOpen()&&!e.settingsPanel.isOpen()&&!e.effectPanel.isOpen()&&!e.clearEffects.isBusy()&&!e.settlementGate.isBlocking()&&e.simulation.movedCount===0&&!e.blockPropPanel.introId}),e.blockPropPanel=new bt(e,e.blockProps),e.debugEffectUiEnabled=!1,e.effectPanel=new Ie(e.gameShell,{progress:e.progress,unlockManager:e.unlockManager,enabled:e.debugEffectUiEnabled}),e.homeDemo=new fe({container:e.gameShell,fruitManager:e.fruitManager,grid:e.grid,simulation:e.simulation,onResetWorld:t=>e.resetHomeDemoWorld(t)}),e.homeScreen=new Je(e.gameShell,{progress:e.progress,showEffectsButton:e.debugEffectUiEnabled,onStart:(t,n)=>{e.homeDemo.hide(),e.restartGame(t,n)},getUnlockedLevel:()=>e.modeProgress.unlockedLevel,getLevelStars:t=>e.modeProgress.levelRecords[t]?.stars??0,onGallery:()=>e.openArtworkGallery(),onEffects:()=>e.effectPanel.open()}),e.gameOverArtwork=new $e(e.gameShell,{onRestart:()=>e.restartGame(e.currentMode,e.currentLevel),onHome:()=>e.returnHome()}),e.modePanels=new mt(e.gameShell),e.artToolbar=new pt(e.gameShell,{onHome:()=>e.returnHome(),onTool:t=>{e.setArtTool(t)||e.artToolbar.setTool(e.art.tool)},onSize:t=>e.art.setRadius(t),onColor:t=>{e.art.setColor(t),e.fruitManager.current?.state===`CONTROL`&&(e.fruitManager.current.color=e.art.color)},onUndo:()=>{e.art.undo(),e.renderGameCanvas(!0)},onRedo:()=>{e.art.redo(),e.renderGameCanvas(!0)},onClear:()=>{e.art.clear(),e.renderGameCanvas(!0)}}),e.levelStatus=document.createElement(`div`),e.levelStatus.className=`caisha-level-status`,e.levelStatus.style.cssText=`display:none;position:absolute;left:12px;top:max(12px,env(safe-area-inset-top));z-index:14;padding:8px 11px;white-space:pre-line;font:800 12px/1.45 system-ui,sans-serif;pointer-events:none;`,e.levelStatus.style.color=_(o(1)),e.gameShell.appendChild(e.levelStatus),e.lastLevelStatusRevision=-1,e.drawingArt=!1;for(let t of[`pointerdown`,`pointermove`,`pointerup`,`pointercancel`])e.sandRenderer.canvas.addEventListener(t,e.captureArtPointer,{capture:!0});return e.hud.setGameVisible(!1),new Ne(e.sandRenderer.canvas,e.fruitManager,e.grid,{canInteract:()=>!e.gameOver&&!e.artFinishing&&!e.homeScreen.isOpen()&&!e.settingsPanel.isOpen()&&!e.effectPanel.isOpen()&&!e.blockPropPanel.isBlocking()&&(e.currentMode!==x.ART||e.art.tool===`shape`),onRelease:()=>{e.hud.notifyDropReleased(),!e.homeDemo.isRunning()&&!e.homeScreen.isOpen()&&e.audio.playRelease()},onFastDrop:()=>{!e.homeDemo.isRunning()&&!e.homeScreen.isOpen()&&e.audio.playFastDrop()}}),e.clearSystem.onBeforeClear=()=>{e.renderGameCanvas(!0)},e.clearSystem.onClear=t=>{let{cleared:n,score:r,combo:i}=t;if(e.homeDemo.isRunning()){e.homeDemo.onClear(t),e.clearEffects.play(t);return}let a=h(n);e.currentMode===x.ENDLESS&&(e.progress.recordClear({cleared:n,score:r,combo:i}),e.unlockManager.checkAll()),e.currentMode===x.LEVEL&&E(e.grid)===0&&(e.levelVictoryPending=!0),e.hud.showCombo(i),e.clearEffects.play(t,{onStart:()=>e.audio.beginClearSweep(t),onComplete:()=>(e.audio.endClearSweep(),e.hud.setScore(r),e.audio.playReward(a,Math.min(4,n/1e3+i*.25)))})},e.lastSimulation=0,e.lastFrame=performance.now(),e.lastRenderedGridRevision=-1,e.lastRenderedFruit=null,e.lastRenderedFruitKey=``,e.lastFruitState=e.fruitManager.current?.state??null,e.gameOver=!1,e.homeDemo.show(),document.addEventListener(`visibilitychange`,()=>{if(document.hidden){e.currentMode===x.ART&&!e.gameOver&&E(e.grid)>0&&e.modeProgress.saveDraft(e.grid,e.art.fixed),e.audio.suspendForVisibility();return}e.audio.resumeFromVisibility();let t=performance.now();e.lastFrame=t,e.lastSimulation=t,e.renderGameCanvas(!0)}),e.renderGameCanvas(!0),e.loop(performance.now()),e}xt();