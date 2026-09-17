/* ============ mandala art ============ */
function mandala(el){
  if(!el) return; const R=100; let p='';
  for(let ring=0;ring<4;ring++){
    const r=22+ring*22, n=8+ring*6;
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, x=R+Math.cos(a)*r, y=R+Math.sin(a)*r;
      p+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4-ring*0.6).toFixed(1)}" fill="#f5b83d"/>`; }
    p+=`<circle cx="${R}" cy="${R}" r="${r}" fill="none" stroke="#f5b83d" stroke-width=".8"/>`;
  }
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2;
    p+=`<path d="M100 100 Q${100+Math.cos(a-.18)*70} ${100+Math.sin(a-.18)*70} ${100+Math.cos(a)*94} ${100+Math.sin(a)*94} Q${100+Math.cos(a+.18)*70} ${100+Math.sin(a+.18)*70} 100 100" fill="none" stroke="#f5b83d" stroke-width=".7"/>`; }
  el.innerHTML=p;
}
/* ============ local roster ============ */
let LOCAL=JSON.parse(localStorage.getItem('jas.roster')||'null')||
  NAMES.slice(0,4).map((n,i)=>({id:'p'+i,name:n,av:AVS[i]}));
const saveRoster=()=>localStorage.setItem('jas.roster',JSON.stringify(LOCAL));
let nextPid=LOCAL.length;

/* ============ settings ui ============ */
function settingsHTML(editable){
  const seg=(key,opts)=>`<div class="seg">`+opts.map(o=>
    `<button data-set="${key}" data-val="${o[0]}" class="${String(SET[key])===String(o[0])?'on':''}">${o[1]}</button>`).join('')+`</div>`;
  const stp=(key,min,max)=>`<div class="stp"><button data-step="${key}" data-d="-1">−</button><b>${SET[key]}</b><button data-step="${key}" data-d="1">+</button></div>`;
  return `<div class="up gold">Game settings</div>
  <div class="srow"><div><div style="font-weight:600">Jasoos count</div><div class="xs dim">Kitne imposters</div></div>${stp('spies',1,3)}</div>
  <div class="srow"><div><div style="font-weight:600">Jasoos ko kya mile</div><div class="xs dim">Blank = kuch nahi · Dhokha = milta-julta shabd</div></div>${seg('hide',[['blank','Blank'],['decoy','Dhokha']])}</div>
  <div class="srow"><div><div style="font-weight:600">Clue rounds</div><div class="xs dim">Vote se pehle kitne round</div></div>${stp('rounds',1,4)}</div>
  <div class="srow"><div><div style="font-weight:600">Turn timer</div><div class="xs dim">Per clue</div></div>${seg('turnT',[[0,'Off'],[20,'20s'],[30,'30s'],[45,'45s']])}</div>
  <div class="srow"><div><div style="font-weight:600">Discussion</div><div class="xs dim">Vote se pehle bahes</div></div>${seg('discT',[[0,'Off'],[60,'60s'],[90,'90s'],[120,'2m']])}</div>
  <div class="srow"><div><div style="font-weight:600">Steal chance</div><div class="xs dim">Pakde jane par Jasoos guess kar sakta hai</div></div>${seg('steal',[[true,'On'],[false,'Off']])}</div>
  <div class="srow"><div><div style="font-weight:600">Clue log</div><div class="xs dim">Type = phone par likho · Bolo = sirf zubaani</div></div>${seg('log',[['type','Type'],['talk','Bolo']])}</div>
  ${editable?'':'<div class="xs dim mt">Sirf host settings badal sakta hai.</div>'}`;
}
function wireSettings(root,editable){
  root.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{
    if(!editable) return toast('Host hi settings badal sakta hai');
    const k=b.dataset.set; let v=b.dataset.val;
    if(v==='true') v=true; else if(v==='false') v=false; else if(/^-?\d+$/.test(v)) v=+v;
    SET[k]=v; saveSet(); sfx.tap(); render(); if(S.mode==='online'&&NET.host) pushState();
  });
  root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{
    if(!editable) return toast('Host hi settings badal sakta hai');
    const k=b.dataset.step, d=+b.dataset.d, lim={spies:[1,3],rounds:[1,4]}[k];
    SET[k]=Math.max(lim[0],Math.min(lim[1],SET[k]+d)); saveSet(); sfx.tap(); render();
    if(S.mode==='online'&&NET.host) pushState();
  });
}
function catsHTML(editable){
  return CATS.map(c=>`<button class="chip ${SET.cats.includes(c.id)?'on':''}" data-cat="${c.id}">${c.e} ${c.name}</button>`).join('');
}
function wireCats(root,editable){
  root.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{
    if(!editable) return toast('Host hi categories badal sakta hai');
    const id=b.dataset.cat, i=SET.cats.indexOf(id);
    if(i>=0){ if(SET.cats.length<=1) return toast('Kam se kam ek category'); SET.cats.splice(i,1); }
    else SET.cats.push(id);
    saveSet(); sfx.tap(); render(); if(S.mode==='online'&&NET.host) pushState();
  });
}
/* ============ screen renderers ============ */
function renderHome(){
  $('#marq').innerHTML=(TIPS.concat(TIPS)).map(t=>`<span style="padding:0 18px">${t}</span>`).join('');
  $('#b-sound').textContent='🔊 Sound: '+(SND?'On':'Off');
}
function renderSetup(){
  $('#pcount').textContent=LOCAL.length+' / 12';
  $('#setup-players').innerHTML=LOCAL.map((p,i)=>`
    <div class="prow"><div class="av" data-av="${i}">${p.av}</div>
      <div class="nm">${esc(p.name)}</div>
      <button class="iconbtn" data-del="${i}" style="width:32px;height:32px;font-size:15px">✕</button></div>`).join('')
    ||`<div class="dim sm ctr">Kam se kam 3 khiladi add karo.</div>`;
  $('#setup-players').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    LOCAL.splice(+b.dataset.del,1); saveRoster(); sfx.tap(); render(); });
  $('#setup-players').querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{
    const p=LOCAL[+b.dataset.av]; p.av=AVS[(AVS.indexOf(p.av)+1)%AVS.length]; saveRoster(); sfx.tap(); render(); });
  const used=LOCAL.map(p=>p.name);
  $('#quickadd').innerHTML=NAMES.filter(n=>!used.includes(n)).slice(0,6)
    .map(n=>`<button class="chip" data-quick="${n}">+ ${n}</button>`).join('');
  $('#quickadd').querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>addPlayer(b.dataset.quick));
  const sc=$('#settings-card'); sc.innerHTML=settingsHTML(true); wireSettings(sc,true);
  $('#cats').innerHTML=catsHTML(true); wireCats($('#cats'),true);
  $('#b-startlocal').disabled=LOCAL.length<3;
  $('#b-startlocal').textContent=LOCAL.length<3?'3 khiladi chahiye':'Shuru karo →';
}
function addPlayer(name){
  name=(name||'').trim().slice(0,12);
  if(!name) return toast('Naam likho');
  if(LOCAL.length>=12) return toast('Max 12 khiladi');
  if(LOCAL.some(p=>p.name.toLowerCase()===name.toLowerCase())) return toast('Yeh naam already hai');
  LOCAL.push({id:'p'+(nextPid++),name,av:AVS[LOCAL.length%AVS.length]}); saveRoster(); sfx.ok();
  $('#pname').value=''; render();
}
function renderPass(){
  const pid=S.order[S.revealIdx]; const p=pById(pid);
  $('#pass-av').textContent=p.av; $('#pass-name').textContent=p.name;
  $('#pass-name2').textContent='';
  $('#pass-note').textContent='Sirf tum dekho. Baaki sab dur raho. ('+(S.revealIdx+1)+'/'+S.order.length+')';
  $('#pass-dots').innerHTML=S.order.map((_,i)=>`<i class="${i<=S.revealIdx?'on':''}"></i>`).join('');
  $('#b-pass-ok').innerHTML=`Main hoon <b>${esc(p.name)}</b> — dikhao`;
}
function renderReveal(){
  const pid=S.mode==='local'?S.order[S.revealIdx]:ME.id;
  const r=S.mode==='local'?ROLES[pid]:{role:ME.role,word:ME.word};
  const p=pById(pid);
  $('#rev-title').textContent=S.mode==='local'?p.name+' ka card':'Tumhara card';
  $('#rev-cat').textContent=S.cat;
  const front=$('#cardfront'); front.className='face front '+(r?.role==='spy'?'spy':'civ');
  $('#cf-cat').textContent=S.cat;
  if(r?.role==='spy'){
    $('#cf-role').innerHTML='<span class="rose">🔍 JASOOS</span>';
    $('#cf-word').innerHTML=r.word? esc(r.word) : '<span style="opacity:.55">— koi shabd nahi —</span>';
    $('#cf-hint').textContent=r.word? 'Yeh asli shabd NAHI hai. Milta-julta hai.' : rnd(SPY_HINTS);
  } else {
    $('#cf-role').innerHTML='<span class="tealc">🪔 NAGRIK</span>';
    $('#cf-word').textContent=r?.word||'—';
    $('#cf-hint').textContent=rnd(CIV_HINTS);
  }
  const f=$('#flip'), btn=$('#b-rev-next');
  if(!S._flipKeep){ f.classList.remove('open'); btn.style.visibility='hidden'; }
  if(S.mode==='local'){
    btn.textContent=S.revealIdx>=S.order.length-1?'Sabne dekh liya — khel shuru →':'Chhupao & aage →';
    btn.disabled=false;
  } else if(S._iReady){
    btn.style.visibility='visible'; btn.disabled=true;
    btn.innerHTML=`<span class="spin"></span> Baaki khiladi dekh rahe hain (${S.readyN||0}/${S.players.length})`;
  } else {
    btn.disabled=false; btn.textContent='Samajh gaya →';
  }
}
function renderClue(){
  $('#cl-round').textContent=S.round; $('#cl-of').textContent=S.voteAt>1?' / '+S.voteAt:'';
  const pid=myTurnPid(), p=pById(pid);
  $('#cl-av').textContent=p.av; $('#cl-who').textContent=p.name+(S.mode==='online'&&pid===ME.id?' (tum)':'');
  const feed=$('#cl-feed'); let h='',last=0;
  S.clues.forEach(c=>{ if(c.r!==last){ last=c.r; h+=`<div class="rlabel"><i></i><span>Round ${c.r}</span><i></i></div>`; }
    const q=pById(c.pid); h+=`<div class="cl"><div class="av" style="width:30px;height:30px;font-size:16px">${q.av}</div>
      <div style="flex:1"><div class="who">${esc(q.name)}</div><div class="txt">${esc(c.t)}</div></div></div>`; });
  feed.innerHTML=h; $('#cl-empty').style.display=S.clues.length?'none':'block';
  feed.parentElement.scrollTop=feed.parentElement.scrollHeight;
  const act=$('#cl-action');
  const prev=$('#clue-in'), keep=prev&&S._turnKey===S.gameNo+':'+S.round+':'+S.turn?prev.value:'';
  S._turnKey=S.gameNo+':'+S.round+':'+S.turn;
  const mine = S.mode==='local' || pid===ME.id;
  if(mine && SET.log==='type'){
    act.innerHTML=`<div class="row gap6"><input class="inp" id="clue-in" maxlength="26" placeholder="${S.mode==='local'?esc(p.name)+' ka clue…':'Tumhara clue…'}" autocomplete="off">
      <button class="btn p sm2" id="b-clue" style="flex:none;padding:14px 18px">Bolo</button></div>
      <div class="xs dim ctr mt" style="margin-top:8px">Ek-do shabd. Secret word bolna mana hai.</div>`;
    const inp=$('#clue-in'); inp.value=keep;
    if(S.mode==='online') setTimeout(()=>inp.focus(),60);
    const send=()=>{ const v=inp.value.trim(); if(!v) return toast('Kuch likho');
      const w=ROLES[pid]?.word||ME.word;
      if(w&&norm(v).includes(norm(w))) return toast('Secret word nahi bol sakte!');
      if(S.mode==='local') submitClue(pid,v); else NET.act({a:'clue',t:v}); inp.value=''; };
    $('#b-clue').onclick=send; inp.onkeydown=e=>{ if(e.key==='Enter') send(); };
  } else if(mine){
    act.innerHTML=`<button class="btn p" id="b-said">${S.mode==='local'?esc(p.name)+' ne bol diya':'Main bol chuka'} →</button>`;
    $('#b-said').onclick=()=>{ if(S.mode==='local') submitClue(pid,''); else NET.act({a:'clue',t:''}); };
  } else {
    act.innerHTML=`<div class="card tight ctr"><span class="spin"></span> <span class="sm dim">${esc(p.name)} ka clue aa raha hai…</span></div>`;
  }
}
function renderDiscuss(){
  const feed=$('#ds-feed'); let h='',last=0;
  S.clues.forEach(c=>{ if(c.r!==last){ last=c.r; h+=`<div class="rlabel"><i></i><span>Round ${c.r}</span><i></i></div>`; }
    const q=pById(c.pid); h+=`<div class="cl"><div class="av" style="width:30px;height:30px;font-size:16px">${q.av}</div>
      <div style="flex:1"><div class="who">${esc(q.name)}</div><div class="txt">${esc(c.t)}</div></div></div>`; });
  feed.innerHTML=h||`<div class="dim sm ctr">Koi clue record nahi hua — zubaani yaad karo.</div>`;
  $('#b-tovote').style.display=isHost()?'flex':'none';
}
