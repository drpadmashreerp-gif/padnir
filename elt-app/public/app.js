(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=s=>String(s).replace(/<[^>]+>/g,'');
const local={get(k,d){try{const v=localStorage.getItem('eltb-'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
             set(k,v){try{localStorage.setItem('eltb-'+k,JSON.stringify(v))}catch(e){}}};
const ENH1='https://claude.ai/artifact/DdjrbLETz2nbAhRr9Ty2Q3';
const PARTS=[['Part I','Foundations','p1',1],['Part II','Skill Integration','p2',26],['Part III','Advanced Pedagogy','p3',51],['Part IV','Theory & Research','p4',76]];
const partOf=n=>PARTS[n<26?0:n<51?1:n<76?2:3];
const api=async(p,o)=>{ const r=await fetch('/api/'+p,o&&{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}); if(!r.ok) throw new Error((await r.json().catch(()=>({}))).error||r.statusText); return r.json(); };

/* theme */
function setTheme(t){ if(t==='system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme',t);
  $$('.theme button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===t))); local.set('theme',t); }
$$('.theme button').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.t))); setTheme(local.get('theme','system'));

/* ---------- learner state: saved on the server when a name is given, otherwise in this browser ---------- */
const blank=()=>({visited:{},tried:{},notes:{},reflections:{},attempts:[]});
let learner=local.get('learner',''), S=blank();
async function loadState(){
  if(learner){ try{ S=Object.assign(blank(),await api('state?learner='+encodeURIComponent(learner))); return; }catch(e){} }
  S=Object.assign(blank(),local.get('state',null)||{});
}
function save(kind,key,value){
  if(kind==='visit'){ const v=S.visited[key]||(S.visited[key]=[]); if(v.includes(value)) return; v.push(value); }
  else if(kind==='tried') S.tried[key]=value; else if(kind==='note') S.notes[key]=value; else if(kind==='reflection') S.reflections[key]=value;
  if(learner) return api('state',{learner,kind,key,value}).catch(()=>{});
  local.set('state',S);
}
const whereSaved=()=>learner?`Saved for ${esc(learner)}`:'Saved in this browser';
const nameBox=$('#learner'); nameBox.value=learner;
nameBox.addEventListener('change',async()=>{ learner=nameBox.value.trim(); local.set('learner',learner); await loadState(); route(); });

const CH=['start','aims','p1','p2','p3','p4','p5','p6','p7','p8','review','check','reading'];
const unitPct=n=>{const v=S.visited[n]||[];return Math.round(100*CH.filter(c=>c!=='start'&&v.includes(c)).length/(CH.length-1))};
const markVisit=(n,c)=>save('visit',String(n),c);
const cache={}; let glossCache=null, MANIFEST=[], IPA=null;
async function loadUnit(n){ return cache[n]||(cache[n]=await api('units/'+n)); }
async function loadGloss(){ return glossCache||(glossCache=await api('glossary')); }
function rng(seed){ let s=seed>>>0||1; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%100000)/100000; }; }
function shuffle(a,r){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function nav(id){ $$('.tlink').forEach(a=>a.removeAttribute('aria-current')); if(id) $('#'+id).setAttribute('aria-current','page'); }

/* ---------- speech ---------- */
let voice=null;
function pickVoice(){ const vs=speechSynthesis.getVoices(); voice=vs.find(v=>/en-GB/i.test(v.lang)&&/Google|Daniel|Serena|Kate|Libby|Ryan|Sonia/i.test(v.name))||vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null; }
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
function say(text,rate=.85){ if(!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='en-GB'; u.rate=rate; if(voice) u.voice=voice; speechSynthesis.speak(u); }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-say]'); if(b){ e.preventDefault(); say(b.dataset.say); } });

/* ---------- LIBRARY ---------- */
function renderLibrary(){
  nav('navlib');
  const started=MANIFEST.filter(u=>unitPct(u.n)>0).length, finished=MANIFEST.filter(u=>unitPct(u.n)===100).length;
  const last=local.get('last',null);
  $('#app').innerHTML=`<section class="hero"><div><p class="eyebrow">Interactive edition · 100 units</p>
    <h1>English Language Teaching: A Sequenced Guide</h1>
    <p class="lede">One hundred units, from classroom foundations to theory and research. Each unit opens on its own wall of eight stones: the poster’s points, a classroom activity, model language, tools, and exercises you can try. Bricks fill in as you read.</p>
    <div class="row">${last?`<a class="btn primary" href="#u${last}">Continue Unit ${last}</a>`:`<a class="btn primary" href="#u1">Start with Unit 1</a>`}<a class="btn" href="#lab">Phonetics Lab (IPA)</a><a class="btn" href="#glossary">Open the glossary</a></div></div>
    <div><div class="stats"><div><b class="num">${started}</b><span>units started</span></div><div><b class="num">${finished}</b><span>units finished</span></div><div><b class="num">${MANIFEST.length}</b><span>units in all</span></div></div>
    <p class="muted" style="margin-top:8px">${learner?`Signed in as <b>${esc(learner)}</b>: progress, notes and scores are saved on the server.`:'Type your name at the top to save progress, notes and scores on the server. Without a name they stay in this browser.'}</p></div></section>
    <div class="tools-row"><label for="find" class="muted">Find a unit</label><input type="search" id="find" placeholder="Title or topic, e.g. feedback, CLIL, phonology"></div><div id="parts"></div>
    <p class="credit">Padmashree R.P. · Dr PRP</p>`;
  const draw=q=>{ q=(q||'').toLowerCase().trim(); let out='';
    PARTS.forEach(([pn,pt,pc,st])=>{ const us=MANIFEST.filter(u=>u.n>=st&&u.n<st+25&&(!q||(u.t+' '+u.d+' '+u.h.join(' ')).toLowerCase().includes(q)||String(u.n)===q));
      if(!us.length) return;
      out+=`<section class="partblock" style="--pc:var(--${pc})"><div class="parthead"><h2><span>${pn}</span>${pt}</h2><span class="muted">Units ${st}–${st+24}</span></div><div class="bricks">`+
        us.map(u=>{const p=unitPct(u.n); return `<button type="button" class="brick${p===100?' done':''}${/Checkpoint|Capstone/.test(u.t)?' cp':''}" data-u="${u.n}" title="${esc(u.d)}" aria-label="Unit ${u.n}: ${esc(u.t)}, ${p}% read"><span class="n">${u.n}</span><span class="t">${esc(u.t)}</span><i class="bar" style="width:${p}%"></i></button>`}).join('')+`</div></section>`;});
    $('#parts').innerHTML= out || `<p class="empty">No unit matches “${esc(q)}”. Try a shorter word, or search the glossary.</p>`; };
  draw(''); $('#find').addEventListener('input',e=>draw(e.target.value));
  $('#parts').addEventListener('click',e=>{const b=e.target.closest('.brick'); if(b) location.hash='u'+b.dataset.u;});
}

/* ---------- GLOSSARY ---------- */
async function renderGlossary(){
  nav('navgl'); $('#app').innerHTML='<p class="empty">Loading the glossary…</p>';
  let g; try{ g=await loadGloss(); }catch(e){ $('#app').innerHTML='<p class="empty">The glossary could not be loaded. Reload the page to try again.</p>'; return; }
  $('#app').innerHTML=`<div class="chap" style="max-width:820px"><p class="eyebrow">Back matter</p><h2>Glossary</h2><p class="dek">${g.length} terms, each linked to the units that use it</p>
   <div class="tools-row"><label for="gfind" class="muted">Search</label><input type="search" id="gfind" placeholder="e.g. washback, recast, scaffolding"></div><div class="letters" id="letters"></div><div id="glist"></div></div>`;
  const draw=q=>{ q=(q||'').toLowerCase().trim(); const f=g.filter(e=>!q||e.term.toLowerCase().includes(q)||e.def.toLowerCase().includes(q));
    let L='', out='', letters=[];
    f.forEach(e=>{ const l=/[a-z]/i.test(e.term[0])?e.term[0].toUpperCase():'#'; if(l!==L){L=l; letters.push(l); out+=`<h3 id="gl-${l==='#'?'num':l}" style="margin-top:20px">${l==='#'?'Numbers':l}</h3>`;}
      out+=`<div class="gl-entry"><b>${esc(e.term)}</b> ${e.def}${e.units.length?`<div class="u">Units: ${e.units.map(n=>`<a href="#u${n}">${n}</a>`).join('')}</div>`:''}</div>`;});
    $('#glist').innerHTML=out||`<p class="empty">No term matches “${esc(q)}”.</p>`;
    $('#letters').innerHTML=letters.map(l=>`<a href="#" data-l="${l==='#'?'num':l}">${l}</a>`).join('');};
  draw(''); $('#gfind').addEventListener('input',e=>draw(e.target.value));
  $('#letters').addEventListener('click',e=>{const a=e.target.closest('[data-l]'); if(!a) return; e.preventDefault(); const t=$('#gl-'+a.dataset.l); if(t) t.scrollIntoView({behavior:'smooth'});});
}

/* ---------- LIST OF FIGURES ---------- */
function renderFigures(){
  nav('navfig');
  $('#app').innerHTML=`<div class="chap" style="max-width:820px"><p class="eyebrow">Front matter</p><h2>List of figures</h2><p class="dek">${MANIFEST.reduce((a,u)=>a+(u.f||[]).length,0)} figures, one for each point in the book</p>
    <div class="tools-row"><label for="ffind" class="muted">Search</label><input type="search" id="ffind" placeholder="e.g. timeline, rubric, seating"></div><div id="flist"></div></div>`;
  const draw=q=>{ q=(q||'').toLowerCase().trim(); let h='';
    PARTS.forEach(([pn,pt,pc,st])=>{ let part='';
      MANIFEST.filter(u=>u.n>=st&&u.n<st+25).forEach(u=>{ const fs=(u.f||[]).filter(f=>!q||f[1].toLowerCase().includes(q)||u.t.toLowerCase().includes(q)); if(!fs.length) return;
        part+=`<h4 style="margin-top:14px">Unit ${u.n}  ${esc(u.t)}</h4>`+fs.map(f=>`<p style="margin:0 0 4px;font-family:var(--ui);font-size:15px"><a href="#u${u.n}-p${f[2]}">Figure ${f[0]}</a>  ${esc(f[1])}</p>`).join(''); });
      if(part) h+=`<h3 style="color:var(--${pc})">${pn}  ${pt}</h3>`+part; });
    $('#flist').innerHTML=h||`<p class="empty">No figure matches “${esc(q)}”.</p>`; };
  draw(''); $('#ffind').addEventListener('input',e=>draw(e.target.value));
}

/* ---------- block renderer ---------- */
function dlgLine(x){ const m=strip(x).match(/^\s*(T|S\d*|Ss|A|B|L)\s?:\s*/); if(!m) return `<p>${x}</p>`;
  const who=m[1]; const rest=x.replace(new RegExp('^(\\s*(<[^>]+>)*)'+who+'\\s?:\\s*'),'$1'); return `<p><span class="who">${who}</span> ${rest}</p>`; }
function calloutClass(l){ return {'Tip':'c-tip','Did you know?':'c-dyk','Try this':'c-try','Art brief':'c-art'}[l]||'c-dyk'; }
function renderBlocks(blocks,ctx){
  let h='', afterAct=false;
  blocks.forEach((b,i)=>{
    if(b.t==='label'){ afterAct=b.x==='Classroom activity'; h+= b.x==='Visualization' ? '' : `<h3>${esc(b.x)}</h3>`; return; }
    if(b.t==='p'){ if(afterAct){ afterAct=false; h+=`<p class="actname">${strip(b.x)}</p>`; return; } h+=`<p>${b.x}</p>`; return; }
    afterAct=false;
    if(b.t==='sub'){ h+=`<h4>${esc(b.x)}</h4>`; if(b.x==='Procedure') ctx.procIndex=i+1; return; }
    if(b.t==='profile'){ h+=`<div class="profile">${b.h.map((k,j)=>`<div><b>${esc(k.replace(' (CEFR)',''))}</b>${esc(b.v[j]||'')}</div>`).join('')}</div>`; return; }
    if(b.t==='ol'){ h+=`<ol>${b.items.map(x=>`<li>${x}</li>`).join('')}</ol>`; if(ctx.procIndex===i){ h+='<div data-seq></div>'; ctx.steps=b.items; } return; }
    if(b.t==='ul'){ h+=`<ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul>`; return; }
    if(b.t==='dlg'){ h+=`<div class="dlg">${b.lines.map(dlgLine).join('')}<p><button class="btn mini" type="button" data-say="${esc(b.lines.map(strip).join('. '))}">▶ Listen</button></p></div>`; return; }
    if(b.t==='offline'){ h+=`<div class="offline"><b>Offline alternative</b>${b.x}</div>`; return; }
    if(b.t==='callout' && b.lab==='Art brief'){ const t=strip(b.body[0][1]); const m=t.match(/^Figure (\d+\.\d+)\s+(.*)$/); const id=m?m[1]:'', title=m?m[2]:t;
      const spec=(U.figs||{})[id]; let svg=''; if(spec&&window.FigKit){ try{ svg=FigKit.render(Object.assign({_id:id.replace('.','-')},spec)); }catch(e){ svg=''; } }
      const brief=b.body.slice(1).map(x=>strip(x[1])).join(' ');
      h+= svg ? `<figure class="fig" id="fig-${id.replace('.','-')}"><div class="art">${svg}</div><figcaption><b>Figure ${id}</b>${esc(title)}</figcaption><details><summary>Illustrator’s brief</summary><p>${esc(brief)}</p></details></figure>`
              : `<div class="callout c-art"><p class="lab">Picture this · art brief</p><p><strong>${esc(t)}</strong></p><p>${esc(brief)}</p></div>`; return; }
    if(b.t==='callout'){ const body=b.body.map(([k,x])=> k==='li'?`<ul><li>${x}</li></ul>`:`<p>${x}</p>`).join('');
      h+=`<div class="callout ${calloutClass(b.lab)}"><p class="lab">${esc(b.lab)}</p>${body}</div>`; return; }
  });
  return h;
}

/* ---------- UNIT ---------- */
let U=null, curCh='start';
async function renderUnit(n,ch){
  nav(null);
  if(!U||U.n!==n){ $('#app').innerHTML='<p class="empty">Opening Unit '+n+'…</p>';
    try{ U=await loadUnit(n); }catch(e){ $('#app').innerHTML=`<p class="empty">Unit ${n} could not be loaded. Check the server is running and reload the page.</p><p><a class="btn" href="#library">Back to the library</a></p>`; return; }
    buildUnitShell(); }
  local.set('last',n);
  if(!CH.includes(ch)) ch='start';
  curCh=ch; showChapter(ch);
}
function chTitle(c){ if(c==='start') return 'Unit opening'; if(c==='aims') return 'Aims and background'; if(/^p\d$/.test(c)) return (+c[1])+'  '+U.points[+c[1]-1].h;
  return {review:'Assess and reflect',check:'Self-check',reading:'Further reading'}[c]; }
function buildUnitShell(){
  const n=U.n, [pn,pt,pc]=partOf(n);
  const groups=[['Unit',['start','aims']],['The eight points',['p1','p2','p3','p4','p5','p6','p7','p8']],['Close the unit',['review','check','reading']]];
  const toc=groups.map(([g,cs])=>`<li class="grp">${g}</li>`+cs.map(c=>`<li><a href="#u${n}-${c}" data-c="${c}"><span class="mk">✓</span><span>${esc(chTitle(c))}</span></a></li>`).join('')).join('');
  const opts=groups.map(([g,cs])=>`<optgroup label="${g}">`+cs.map(c=>`<option value="${c}">${esc(chTitle(c))}</option>`).join('')+'</optgroup>').join('');
  $('#app').innerHTML=`<div class="shell"><nav class="rail" aria-label="Unit contents"><p class="eyebrow" style="color:var(--${pc})">${pn} · ${pt}</p><p class="ut">Unit ${n}<br>${esc(U.title)}</p>
     <div class="progress"><i id="upbar"></i></div><p class="muted" id="uptext"></p><ol class="toc" id="utoc">${toc}</ol>
     <div class="unitnav">${n>1?`<a class="btn mini" href="#u${n-1}">← Unit ${n-1}</a>`:''}<a class="btn mini" href="#library">Library</a>${n<100?`<a class="btn mini" href="#u${n+1}">Unit ${n+1} →</a>`:''}</div></nav>
    <div style="min-width:0"><div class="mobilebar" style="margin:0 0 10px"><span class="muted">Unit ${n}</span><select id="msel" aria-label="Go to a section of this unit">${opts}</select><span class="muted num" id="mpct"></span></div>
    <main class="page" id="upage"></main></div></div>`;
  $('#msel').addEventListener('change',e=>location.hash=`u${n}-${e.target.value}`);
}
function progressUnit(){ const n=U.n, v=S.visited[n]||[], p=unitPct(n);
  $('#upbar').style.width=p+'%'; $('#uptext').textContent=`${p}% read`; $('#mpct').textContent=p+'%';
  $$('#utoc a').forEach(a=>{a.classList.toggle('done',v.includes(a.dataset.c)); a.removeAttribute('aria-current'); if(a.dataset.c===curCh) a.setAttribute('aria-current','page');});
  $$('.stone').forEach(s=>s.classList.toggle('done',v.includes(s.dataset.c)));
  $('#msel').value=curCh; }
function autosave(ta,kind,key,flag){ let tm; ta.addEventListener('input',()=>{ clearTimeout(tm); tm=setTimeout(()=>{ save(kind,key,ta.value); flag.textContent=whereSaved(); setTimeout(()=>flag.textContent='',1500); },500); }); }
function showChapter(ch){
  const n=U.n, [pn,pt]=partOf(n); let h='';
  const phon = n===4 || n===1 ? `<div class="feature"><strong>Phonetics Lab.</strong> Practise with the interactive IPA chart (44 sounds of British English), mouth diagrams, minimal pairs, word stress and transcription activities. <a href="#lab">Open the Phonetics Lab</a></div>` : '';
  if(ch==='start'){
    h=`<p class="eyebrow">Unit ${n} of 100 · ${pn} ${pt}</p><h1>${esc(U.title)}</h1><p class="lede">${strip(U.dek).replace(/^Unit \d+ of 100:\s*/,'').replace(/^./,c=>c.toUpperCase())}</p>
      ${n===1?`<div class="feature"><strong>Enhanced edition available.</strong> Unit 1 also has a fully interactive version with a language-portrait builder, stress-box sorter, collocation forks and more. <a href="${ENH1}" target="_blank" rel="noopener">Open the enhanced Unit 1</a></div>`:''}${phon}
      <p>Tap a stone to open that point. Each one has the poster’s three statements, a classroom activity, model language, a visual and tools, with an exercise to try.</p>
      <div class="wall">${U.points.map((p,i)=>`<button type="button" class="stone" data-c="p${i+1}"><span class="n">${i+1}</span><span class="nm">${esc(p.h)}</span><span class="sb">${esc(p.sub)}</span></button>`).join('')}</div><div class="ground"></div>
      <div class="row" style="margin-top:22px"><a class="btn primary" href="#u${n}-aims">Start reading</a><a class="btn" href="#u${n}-check">Jump to the self-check</a></div>`;
  } else if(ch==='aims'){
    h=`<p class="eyebrow">Unit ${n} · Before you begin</p><h2>Aims and background</h2><p class="dek">${esc(U.title)}</p>`+renderBlocks(U.aims,{})+`<h3>Background</h3><p class="why">${U.why}</p>`+renderBlocks(U.background,{});
  } else if(/^p\d$/.test(ch)){
    const i=+ch[1]-1, P=U.points[i], ctx={};
    h=`<p class="eyebrow">Unit ${n} · Point ${i+1} of 8</p><h2>${esc(P.h)}</h2><p class="dek">${esc(P.sub)}</p>
      <div class="poster"><p class="k">From the poster</p><ul>${P.pts.map(x=>`<li>${x}</li>`).join('')}</ul>${P.who?`<p class="gi">Grounded in: ${esc(P.who)}</p>`:''}</div>`+renderBlocks(P.blocks,ctx);
    const key=`${n}-${i}`;
    h+=`<div class="trybox"><span class="lt">Your classroom</span><h5>Did you try this activity?</h5>
      <label class="tried"><input type="checkbox" id="tr-${key}" ${S.tried[key]?'checked':''}> I have tried this activity in class</label>
      <label for="an-${key}" class="hint" style="display:block;margin:10px 0 4px">What happened, and what would you change?</label>
      <textarea id="an-${key}" placeholder="A few lines for next time…">${esc(S.notes[key]||'')}</textarea><span class="saved" id="as-${key}"></span></div>`;
    $('#upage').innerHTML=wrapNav(h,ch); afterRender(ch);
    if(ctx.steps && ctx.steps.length>=3) sequencer($('[data-seq]'),ctx.steps,n*10+i);
    $('#tr-'+key).addEventListener('change',e=>save('tried',key,e.target.checked));
    autosave($('#an-'+key),'note',key,$('#as-'+key));
    return;
  } else if(ch==='review'){
    const rq=(U.reflect||[]).flatMap(b=>b.items||[b.x]).filter(Boolean);
    h=`<p class="eyebrow">Unit ${n} · Close the unit</p><h2>Assess and reflect</h2><p class="dek">Evidence that it is working</p><h3>Assessment ideas</h3>`+renderBlocks(U.assess,{})+
      `<h3>Teacher reflection questions</h3><p class="hint">${learner?'Your answers are saved on the server under your name.':'Type your name at the top to save these on the server; otherwise they stay in this browser.'}</p>`+
      rq.map((q,j)=>`<div style="margin:0 0 16px"><label for="rq-${j}" style="display:block;font-weight:600;margin:0 0 6px">${j+1}. ${q}</label><textarea id="rq-${j}" data-j="${j}" placeholder="Write a few lines…">${esc(S.reflections[n+'-'+j]||'')}</textarea><span class="saved" id="rs-${j}"></span></div>`).join('');
    $('#upage').innerHTML=wrapNav(h,ch); afterRender(ch);
    $$('#upage textarea[data-j]').forEach(t=>autosave(t,'reflection',n+'-'+t.dataset.j,$('#rs-'+t.dataset.j)));
    return;
  } else if(ch==='check'){
    h=`<p class="eyebrow">Unit ${n} · Close the unit</p><h2>Self-check</h2><p class="dek">Which point does each statement belong to? Then match the key terms.</p><div id="quiz"></div>
      <div class="row" style="margin-top:12px"><button class="btn primary" type="button" id="qcheck" disabled>Check my answers</button><span class="muted" id="qleft"></span></div>
      <div class="trybox" id="qres" hidden><span class="lt">Your score</span><p class="score num" id="qscore"></p><p id="qmsg"></p><button class="btn" type="button" id="qagain">Try a new set</button></div>`;
    $('#upage').innerHTML=wrapNav(h,ch); afterRender(ch); buildQuiz(0); $('#qagain').addEventListener('click',()=>buildQuiz(Date.now()%9973)); return;
  } else if(ch==='reading'){
    h=`<p class="eyebrow">Unit ${n} · Close the unit</p><h2>Further reading and sources</h2><p class="dek">Where the ideas in this unit come from</p><div class="refs">${(U.reading||[]).map(r=>`<p>${r}</p>`).join('')}</div>`+
      ((U.perm||[]).length?`<div class="callout c-perm"><p class="lab">Permissions</p>${U.perm.map(x=>`<p>${x}</p>`).join('')}</div>`:'')+
      (U.next?`<div class="callout c-try"><p class="lab">${n<100?'Coming next':'Closing'}</p><p>${U.next.replace(/^<strong>[^<]*<\/strong>\s*/,'')}</p></div>`:'')+
      `<p class="credit">From <em>English Language Teaching: A Sequenced Guide</em> · Padmashree R.P. (Dr PRP)</p>`;
  }
  $('#upage').innerHTML=wrapNav(h,ch); afterRender(ch);
}
function wrapNav(h,ch){ const n=U.n, i=CH.indexOf(ch);
  const prev = i>0 ? `<a class="btn" href="#u${n}-${CH[i-1]}">← ${esc(chTitle(CH[i-1]))}</a>` : (n>1?`<a class="btn" href="#u${n-1}">← Unit ${n-1}</a>`:'<span></span>');
  const next = i<CH.length-1 ? `<a class="btn primary" href="#u${n}-${CH[i+1]}">${esc(chTitle(CH[i+1]))} →</a>` : (n<100?`<a class="btn primary" href="#u${n+1}">Unit ${n+1}: ${esc(MANIFEST[n].t)} →</a>`:`<a class="btn primary" href="#library">Back to the library</a>`);
  return `<div class="chap">${h}<nav class="pnav" aria-label="Page turning">${prev}${next}</nav></div>`; }
function afterRender(ch){ if(ch!=='start') markVisit(U.n,ch); progressUnit(); window.scrollTo({top:0,behavior:'auto'});
  $$('.stone').forEach(s=>s.addEventListener('click',()=>location.hash=`u${U.n}-${s.dataset.c}`)); }

/* sequencer: put the procedure in order */
function sequencer(el,steps,seed){
  const r=rng(seed+7); const order=shuffle(steps.map((s,i)=>i),r); let pos=0;
  el.innerHTML=`<div class="trybox"><span class="lt">Try it</span><h5>Put the procedure in order</h5><p class="hint">Without looking above, tap the steps in the order you would teach them.</p><div class="seq"></div><p class="fb" aria-live="polite"></p><div class="row" style="margin-top:8px"><button class="btn mini" type="button" data-reset>Shuffle again</button></div></div>`;
  const box=el.querySelector('.seq'), fb=el.querySelector('.fb');
  const short=s=>{s=strip(s); return s.length>150?s.slice(0,147).replace(/\s+\S*$/,'')+'…':s;};
  order.forEach(i=>{const b=document.createElement('button'); b.type='button'; b.innerHTML=`<span class="k">·</span><span>${esc(short(steps[i]))}</span>`;
    b.addEventListener('click',()=>{ if(b.classList.contains('ok')) return;
      if(i===pos){ pos++; b.classList.add('ok'); b.querySelector('.k').textContent=pos; b.classList.remove('no'); fb.className='fb ok';
        fb.textContent= pos===steps.length ? 'All in order. The sequence is the activity’s logic: each step prepares the next.' : 'Yes. What comes next?';
        box.appendChild(b); } else { b.classList.add('no'); fb.className='fb no'; fb.textContent='Not yet. Which step does the teacher need first?'; setTimeout(()=>b.classList.remove('no'),700); } });
    box.appendChild(b);});
  el.querySelector('[data-reset]').addEventListener('click',()=>sequencer(el,steps,seed+Math.floor(Math.random()*999)+1));
}

/* unit self-check: questions from the server, marked by the server */
async function buildQuiz(salt){
  const n=U.n, box=$('#quiz'); $('#qres').hidden=true; box.innerHTML='<p class="empty">Loading questions…</p>';
  let data; try{ data=await api(`units/${n}/quiz?salt=${salt}`); }catch(e){ box.innerHTML='<p class="empty">The self-check could not be loaded.</p>'; return; }
  const answers=new Array(data.questions.length).fill(null), btn=$('#qcheck'), left=$('#qleft');
  const upd=()=>{ const k=answers.filter(a=>a===null).length; btn.disabled=k>0; left.textContent=k?`${k} still to answer`:'All answered.'; };
  box.innerHTML='';
  data.questions.forEach((Q,qi)=>{ const d=document.createElement('div'); d.className='q';
    d.innerHTML=`<p class="qt">${qi+1}. ${Q.q}</p><p class="qq">${Q.kind==='t'?esc(Q.quote):Q.quote}</p><div class="opts"></div><p class="why" hidden></p>`;
    Q.opts.forEach((o,oi)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=o;
      b.addEventListener('click',()=>{ if(d.dataset.done) return; answers[qi]=oi; d.querySelectorAll('.opts button').forEach((x,xi)=>x.setAttribute('aria-pressed',String(xi===oi))); upd(); });
      d.querySelector('.opts').appendChild(b);});
    box.appendChild(d);});
  upd(); btn.hidden=false;
  btn.onclick=async()=>{ btn.disabled=true;
    let res; try{ res=await api(`units/${n}/quiz/check`,{learner,salt:data.salt,answers}); }catch(e){ left.textContent='Could not reach the server. Try again.'; btn.disabled=false; return; }
    $$('#quiz .q').forEach((d,qi)=>{ const r=res.results[qi], bs=d.querySelectorAll('.opts button'); d.dataset.done=1;
      bs[r.ans].classList.add('ok'); if(!r.ok&&answers[qi]!=null) bs[answers[qi]].classList.add('no');
      const w=d.querySelector('.why'); w.hidden=false; w.textContent=(r.ok?'Correct. ':'Not quite. ')+r.why; });
    if(learner) S.attempts.push({activity:'unit-'+n,score:res.score,total:res.total,at:new Date().toISOString()});
    btn.hidden=true; left.textContent='';
    $('#qres').hidden=false; $('#qscore').textContent=`${res.score} / ${res.total}`;
    $('#qmsg').textContent= res.score>=res.total*0.8 ? 'Strong grasp of this unit.' : res.score>=res.total*0.5 ? 'A good base. Revisit the points you missed.' : 'Worth another read before moving on.';
    $('#qres').scrollIntoView({behavior:'smooth',block:'nearest'}); };
}

/* ---------- PHONETICS LAB ---------- */
const LABS=[['chart','IPA chart'],['minimal','Minimal pairs'],['symbol','Symbol to sound'],['transcription','Read the transcription'],['stress','Word stress'],['shift','Stress shift'],['record','Record yourself']];
async function renderLab(tab){
  nav('navlab'); tab=LABS.some(l=>l[0]===tab)?tab:'chart';
  if(!IPA){ $('#app').innerHTML='<p class="empty">Loading the Phonetics Lab…</p>'; try{ IPA=await api('ipa'); }catch(e){ $('#app').innerHTML='<p class="empty">The Phonetics Lab could not be loaded.</p>'; return; } }
  $('#app').innerHTML=`<div class="chap" style="max-width:1000px"><p class="eyebrow">Companion to Unit 4 · Sounds First</p><h1>Phonetics Lab</h1>
    <p class="dek">The 44 sounds of British English in the phonemic symbols used by the British Council and Cambridge dictionaries, with mouth diagrams and listening, stress and transcription practice.</p>
    <div class="tools-row">${LABS.map(([k,t])=>`<a class="btn mini${k===tab?' primary':''}" href="#lab-${k}">${t}</a>`).join('')}</div><div id="lab"></div>
    <p class="muted" style="margin-top:24px">Audio uses your device’s British English voice (speech synthesis) to say the key words; isolated sounds are best modelled by the teacher. For the British Council’s own interactive chart with recorded sounds, see <a href="https://www.teachingenglish.org.uk/professional-development/teachers/knowing-subject/phonemic-chart" target="_blank" rel="noopener">TeachingEnglish: Phonemic chart</a>. The layout here is an original grouped table, as the book’s permissions note requires (Unit 4).</p>
    <div class="row"><a class="btn" href="#u4">Read Unit 4: Sounds First — The Deep Dive</a><a class="btn" href="#u1-p3">Unit 1 · Sounds First</a></div></div>`;
  if(tab==='chart') return renderChart();
  if(tab==='record') return renderRecord();
  renderLabQuiz(tab);
}
function cell(p,k){ return `<button type="button" class="ph ${k}${k==='c'&&p.v?' vd':''}" data-s="${esc(p.s)}" aria-pressed="false" title="/${esc(p.s)}/ as in ${esc(p.w)}"><span class="s">${esc(p.s)}</span><span class="w">${esc(p.w)}</span></button>`; }
function renderChart(){
  const cons=IPA.consonants, pairs=[];
  $('#lab').innerHTML=`<div class="legend"><span><i style="background:var(--vow)"></i>Monophthongs (12)</span><span><i style="background:var(--dip)"></i>Diphthongs (8)</span><span><i style="background:var(--con)"></i>Consonants (24)</span><span><i style="background:var(--rose)"></i>voiceless</span><span><i style="background:var(--gold-soft);border:1px solid var(--gold)"></i>voiced</span></div>
    <div class="chart"><section><h3>Vowels · monophthongs</h3><div class="cells">${IPA.monophthongs.map(p=>cell(p,'v')).join('')}</div></section>
    <section><h3>Vowels · diphthongs</h3><div class="cells">${IPA.diphthongs.map(p=>cell(p,'d')).join('')}</div></section></div>
    <section style="margin-top:14px"><h3 style="font-size:18px;margin:0 0 8px;border:none;padding:0">Consonants</h3><div class="cells c">${cons.map(p=>cell(p,'c')).join('')}</div></section>
    <div id="phd" class="card" style="margin-top:16px"><p class="muted" style="margin:0">Tap any symbol to hear its key word, see where it is made, and find more example words.</p></div>
    <h3>How the chart is organised</h3><p>Monophthongs are single vowel sounds; the chart moves from close (tongue high) to open (tongue low), front to back. Diphthongs glide from one vowel to another. Consonants come in voiceless/voiced pairs (p/b, t/d, k/ɡ, f/v, θ/ð, s/z, ʃ/ʒ, tʃ/dʒ), followed by the nasals, the lateral, and the approximants. Long vowels carry the length mark ː.</p>`;
  $('#lab').addEventListener('click',e=>{ const b=e.target.closest('.ph'); if(!b) return; $$('.ph').forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true'); showPhoneme(b.dataset.s); });
}
function showPhoneme(s){
  const v=IPA.monophthongs.find(x=>x.s===s), d=IPA.diphthongs.find(x=>x.s===s), c=IPA.consonants.find(x=>x.s===s), p=v||d||c;
  const facts = c ? [['Type','Consonant'],['Voicing',c.v?'Voiced (vocal folds vibrate)':'Voiceless (no vibration)'],['Place',c.place],['Manner',c.manner]]
    : d ? [['Type','Diphthong (gliding vowel)'],['Glide',`from /${d.from}/ towards /${d.to}/`]]
    : [['Type','Monophthong (pure vowel)'],['Tongue height',v.h],['Tongue position',v.b],['Lips',v.r?'rounded':'unrounded / spread'],['Length',v.long?'long (ː)':'short']];
  const pairs=IPA.minimalPairs.filter(m=>m[2]===s||m[3]===s);
  $('#phd').innerHTML=`<div class="detail"><div><p class="big">/${esc(p.s)}/</p>
    <p style="margin:6px 0 0;font-size:19px">as in <b>${esc(p.w)}</b> <span class="ipa">/${esc(p.t)}/</span> <button class="btn mini" type="button" data-say="${esc(p.w)}">▶ Listen</button></p>
    <div class="facts">${facts.map(([k,x])=>`<b>${k}</b><span>${esc(x)}</span>`).join('')}</div>
    <h4>More words with /${esc(p.s)}/</h4><div class="row">${p.more.map(w=>`<button class="btn mini" type="button" data-say="${esc(w)}">▶ ${esc(w)}</button>`).join('')}</div>
    ${pairs.length?`<h4>Minimal pairs</h4><div class="row">${pairs.map(m=>`<button class="btn mini" type="button" data-say="${esc(m[0])}. ${esc(m[1])}">${esc(m[0])} /${esc(m[2])}/ – ${esc(m[1])} /${esc(m[3])}/</button>`).join('')}</div>`:''}
    <h4>Teaching tip</h4><p style="font-size:15.5px">${c?(c.v?`Touch your throat: you should feel a buzz for /${esc(c.s)}/. Contrast it with its voiceless partner.`:`Hold a paper strip in front of your mouth${c.manner==='plosive'?': the burst of air (aspiration) at the start of a stressed syllable should move it.':'. No throat buzz: the vocal folds are apart.'}`)
      : d?'Start on the first vowel and glide smoothly; the first part is longer and stronger.':(v.long?'Hold this vowel longer than its short partner, and keep the mouth still.':'Keep it short and relaxed; learners often over-lengthen short vowels.')}</p></div>
    <div>${c?Illus.mouth(c):Illus.vowelChart(IPA,p)}<p class="muted" style="text-align:center;margin:4px 0 0">${c?'Side view of the mouth: where the sound is made':'Vowel chart: where the tongue is'}</p></div></div>`;
  say(p.w); $('#phd').scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function renderLabQuiz(type){
  const box=$('#lab'); box.innerHTML='<p class="empty">Loading…</p>';
  let data; try{ data=await api(`lab/${type}?n=8`); }catch(e){ box.innerHTML='<p class="empty">This activity could not be loaded.</p>'; return; }
  const ans={};
  box.innerHTML=`<h2 style="margin-top:0">${esc(data.title)}</h2><div id="lq"></div><div class="row" style="margin-top:12px"><button class="btn primary" id="lcheck" type="button" disabled>Check my answers</button><button class="btn" id="lnew" type="button">New set</button><span class="muted" id="lleft"></span></div>
    <div class="trybox" id="lres" hidden><span class="lt">Your score</span><p class="score num" id="lscore"></p></div>`;
  const lq=$('#lq'), upd=()=>{ const k=data.questions.length-Object.keys(ans).length; $('#lcheck').disabled=k>0; $('#lleft').textContent=k?`${k} still to answer`:'All answered.'; };
  data.questions.forEach((Q,qi)=>{ const d=document.createElement('div'); d.className='q labq'; d.dataset.id=Q.id;
    d.innerHTML=`<p class="qt">${qi+1}. ${esc(Q.prompt)}</p><p>${Q.symbol?`<span class="sym">${esc(Q.symbol)}</span>`:''}${Q.word?`<span class="word">${esc(Q.word)}</span>`:''}${Q.speak?`<button class="btn mini" type="button" data-say="${esc(Q.speak)}">▶ Listen</button>`:''}</p><div class="opts inline"></div><p class="why" hidden></p>`;
    Q.options.forEach(o=>{ const b=document.createElement('button'); b.type='button'; b.textContent=o;
      b.addEventListener('click',()=>{ if(d.dataset.done) return; ans[Q.id]=o; d.querySelectorAll('.opts button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); upd(); });
      d.querySelector('.opts').appendChild(b); });
    lq.appendChild(d); });
  upd();
  $('#lnew').onclick=()=>renderLabQuiz(type);
  $('#lcheck').onclick=async()=>{ $('#lcheck').disabled=true;
    let res; try{ res=await api(`lab/${type}/check`,{learner,answers:data.questions.map(q=>({id:q.id,answer:ans[q.id]}))}); }catch(e){ $('#lleft').textContent='Could not reach the server.'; $('#lcheck').disabled=false; return; }
    res.results.forEach(r=>{ const d=lq.querySelector(`[data-id="${CSS.escape(r.id)}"]`); if(!d) return; d.dataset.done=1;
      d.querySelectorAll('.opts button').forEach(b=>{ if(b.textContent===r.correct) b.classList.add('ok'); else if(b.textContent===ans[r.id]) b.classList.add('no'); });
      const w=d.querySelector('.why'); w.hidden=false; w.textContent=(r.ok?'Correct. ':'Not quite. ')+(r.explain||''); });
    if(learner) S.attempts.push({activity:'lab-'+type,score:res.score,total:res.total,at:new Date().toISOString()});
    $('#lres').hidden=false; $('#lscore').textContent=`${res.score} / ${res.total}`; $('#lcheck').hidden=true; $('#lleft').textContent=''; };
}
function renderRecord(){
  const words=IPA.stressShift.map(s=>s[1].split(' ')[0]+' / '+s[2].split(' ')[0]).concat(['I didn’t say she took the money.','Would you like a cup of tea?','Where are you from?']);
  $('#lab').innerHTML=`<h2 style="margin-top:0">Record yourself</h2><p>Listen to the model, record yourself, then play both back and compare stress, rhythm and the target sounds. Recordings stay on your device.</p>
    <p><label for="rtext" class="muted">Practise this (or type your own):</label><input type="text" id="rtext" value="${esc(words[0])}"></p>
    <div class="row" style="margin:8px 0">${words.map(w=>`<button class="btn mini" type="button" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>
    <div class="row"><button class="btn" type="button" id="rmodel">▶ Model</button><button class="btn primary" type="button" id="rrec">● Record</button><span class="muted" id="rstat"></span></div><p id="rplay"></p>
    <h3>Self-check</h3><ul><li>Did the stressed syllable sound longer, louder and higher?</li><li>Were unstressed syllables reduced (often to /ə/)?</li><li>Did the words link smoothly in connected speech?</li></ul>`;
  $('#lab').addEventListener('click',e=>{const b=e.target.closest('[data-w]'); if(b) $('#rtext').value=b.dataset.w;});
  $('#rmodel').onclick=()=>say($('#rtext').value.replace(/\//g,'.'),.8);
  let rec=null;
  $('#rrec').onclick=async()=>{
    if(rec&&rec.state==='recording'){ rec.stop(); return; }
    if(!navigator.mediaDevices||!window.MediaRecorder){ $('#rstat').textContent='Recording is not supported in this browser.'; return; }
    try{ const stream=await navigator.mediaDevices.getUserMedia({audio:true}); const chunks=[]; rec=new MediaRecorder(stream);
      rec.ondataavailable=e=>chunks.push(e.data);
      rec.onstop=()=>{ stream.getTracks().forEach(t=>t.stop()); $('#rrec').textContent='● Record'; $('#rstat').textContent='';
        $('#rplay').innerHTML=`<audio controls src="${URL.createObjectURL(new Blob(chunks,{type:rec.mimeType}))}"></audio>`; };
      rec.start(); $('#rrec').textContent='■ Stop'; $('#rstat').textContent='Recording…';
    }catch(e){ $('#rstat').textContent='Microphone permission was not given.'; } };
}

/* ---------- MY PROGRESS ---------- */
function renderMe(){
  nav('navme');
  const started=MANIFEST.filter(u=>unitPct(u.n)>0), tried=Object.values(S.tried).filter(Boolean).length;
  const notes=Object.values(S.notes).filter(x=>x&&x.trim()).length+Object.values(S.reflections).filter(x=>x&&x.trim()).length;
  const at=(S.attempts||[]).slice().reverse();
  const label=a=>a.startsWith('unit-')?`Unit ${a.slice(5)} self-check`:'Phonetics Lab · '+((LABS.find(l=>'lab-'+l[0]===a)||[])[1]||a);
  $('#app').innerHTML=`<div class="chap" style="max-width:860px"><p class="eyebrow">Your record</p><h2>My progress</h2>
    <p class="dek">${learner?`Saved on the server for <b>${esc(learner)}</b>. Use the same name on any device to pick up where you left off.`:'Not signed in: this record is kept in this browser only. Type your name at the top to save it on the server.'}</p>
    <div class="stats" style="margin:0 0 20px"><div><b class="num">${started.length}</b><span>units started</span></div><div><b class="num">${tried}</b><span>activities tried in class</span></div><div><b class="num">${notes}</b><span>notes and reflections</span></div></div>
    <h3>Scores</h3>${at.length?`<table class="t"><tr><th>Activity</th><th>Score</th><th>Date</th></tr>${at.map(a=>`<tr><td>${esc(label(a.activity))}</td><td class="num">${a.score} / ${a.total}</td><td>${esc(new Date(a.at).toLocaleString())}</td></tr>`).join('')}</table>`:`<p class="muted">${learner?'No scores yet. Try a unit self-check or a Phonetics Lab activity.':'Scores are saved only when you are signed in with a name.'}</p>`}
    <h3>Units in progress</h3>${started.length?started.map(u=>`<p style="margin:0 0 4px;font-family:var(--ui)"><a href="#u${u.n}">Unit ${u.n} · ${esc(u.t)}</a> <span class="muted">${unitPct(u.n)}% read</span></p>`).join(''):'<p class="muted">None yet.</p>'}</div>`;
}

/* ---------- router ---------- */
function route(){ const h=(location.hash||'').slice(1);
  let m=h.match(/^u(\d{1,3})(?:-(\w+))?$/);
  if(m && +m[1]>=1 && +m[1]<=100){ renderUnit(+m[1], m[2]||'start'); return; }
  U=null; window.scrollTo(0,0);
  if(h==='glossary') return renderGlossary();
  if(h==='figures') return renderFigures();
  if(h==='me') return renderMe();
  if((m=h.match(/^lab(?:-(\w+))?$/))) return renderLab(m[1]);
  renderLibrary();
}
(async()=>{
  try{ MANIFEST=await api('manifest'); }catch(e){ $('#app').innerHTML='<p class="empty">Could not reach the server. Start it with <code>node server.js</code> and reload.</p>'; return; }
  await loadState(); window.addEventListener('hashchange',route); route();
})();
})();
