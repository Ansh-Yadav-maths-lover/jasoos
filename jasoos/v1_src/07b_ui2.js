function renderVote(){
  const list=$('#vt-list'), act=$('#vt-action'), av=alive();
  if(S.mode==='local'){
    S.localTally=S.localTally||{}; const cast=Object.values(S.localTally).reduce((a,b)=>a+b,0);
    const left=av.length-cast;
    $('#vt-title').textContent='Haath uthao';
    $('#vt-prog').textContent=left>0?left+' vote bache':'Sab vote ho gaye';
    $('#vt-note').textContent='Har khiladi ke vote ko yahan tap karke count karo.';
    list.innerHTML=av.map(p=>`<div class="prow pick ${S.localTally[p.id]?'sel':''}" data-v="${p.id}">
      <div class="av">${p.av}</div><div class="nm">${esc(p.name)}</div>
      <div class="vcount">${S.localTally[p.id]||''}</div></div>`).join('')+
      `<div class="prow pick" data-v="skip" style="opacity:.85"><div class="av">🙈</div>
        <div class="nm">Koi nahi / skip</div><div class="vcount">${S.localTally.skip||''}</div></div>`;
    list.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{
      if(left<=0) return toast('Poore vote ho gaye — Reset karo ya confirm');
      const k=b.dataset.v; S.localTally[k]=(S.localTally[k]||0)+1; sfx.vote(); render(); });
    act.innerHTML=`<div class="row gap6"><button class="btn ghost" id="b-vreset" style="flex:1">Reset</button>
      <button class="btn r" id="b-vdone" style="flex:2" ${cast===0?'disabled':''}>Nateeja dekho</button></div>`;
    $('#b-vreset').onclick=()=>{ S.localTally={}; sfx.tap(); render(); };
    $('#b-vdone').onclick=()=>resolveVote();
  } else {
    const mine=S.votes[ME.id], done=av.filter(p=>p.voted).length;
    $('#vt-title').textContent='Vote';
    $('#vt-prog').textContent=done+' / '+av.length+' voted';
    const iAmOut=!av.some(p=>p.id===ME.id);
    $('#vt-note').textContent=iAmOut?'Tum bahar ho — dekhte raho.':(mine?'Vote lock ho gaya. Baaki ka intezaar…':'Kis ko bahar karna hai?');
    list.innerHTML=av.map(p=>`<div class="prow ${iAmOut||mine?'':'pick'} ${mine===p.id?'sel':''}" data-v="${p.id}">
      <div class="av">${p.av}</div><div class="nm">${esc(p.name)}${p.id===ME.id?' <span class="xs dim">(tum)</span>':''}</div>
      ${p.voted?'<span class="pill g">voted</span>':''}</div>`).join('')+
      (iAmOut||mine?'':`<div class="prow pick" data-v="skip"><div class="av">🙈</div><div class="nm">Skip — kisi ko nahi</div></div>`);
    if(!mine&&!iAmOut) list.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{
      NET.act({a:'vote',t:b.dataset.v}); sfx.vote(); });
    act.innerHTML=mine||iAmOut?`<div class="card tight ctr sm dim"><span class="spin"></span> Baaki khiladi vote kar rahe hain…</div>`:'';
  }
}
function renderEject(){
  const t=S.tally||{}, none=!S.ejected;
  const p=none?null:pById(S.ejected);
  $('#ej-pre').textContent=none?'Vote ka nateeja':'Bahar nikala gaya';
  $('#ej-av').textContent=none?'🤷':p.av;
  $('#ej-name').textContent=none?'Tie / koi nahi':p.name;
  const role=S.mode==='online'?S.ejectRoleShown:S.ejectRole;
  const v=$('#ej-verdict');
  if(none){ v.textContent='Koi bahar nahi gaya'; v.className='bigres gold'; $('#ej-note').textContent='Barabar vote. Ek aur round khelo.'; }
  else if(role==='spy'){ v.innerHTML='🔍 YEH JASOOS THA!'; v.className='bigres res-civ'; $('#ej-note').textContent='Nagriko ne pakad liya.'; }
  else { v.innerHTML='🪔 Yeh NAGRIK tha'; v.className='bigres res-spy'; $('#ej-note').textContent='Bekaar mein ek nagrik chala gaya. Jasoos abhi bhi andar hai.'; }
  $('#ej-tally').innerHTML=Object.keys(t).length? Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([id,c])=>
    `<div class="prow"><div class="av" style="width:30px;height:30px;font-size:15px">${id==='skip'?'🙈':pById(id).av}</div>
      <div class="nm sm">${id==='skip'?'Skip':esc(pById(id).name)}</div><div class="vcount">${c}</div></div>`).join(''):'';
  $('#b-ej-next').style.display=isHost()?'flex':'none';
}
function renderGuess(){
  const g=pById(S.guesser), mine=S.mode==='local'||S.guesser===ME.id;
  $('#gs-title').textContent=mine?'Secret word guess karo':g.name+' guess kar raha hai…';
  $('#gs-note').textContent=mine
    ? 'Sahi guess = Jasoos ne bazi palat di. Galat = Nagrik jeet gaye.'
    : 'Jasoos pakda gaya, par ek mauka mila hai. Dua karo galat guess kare.';
  const opts=$('#gs-opts');
  if(!mine){ opts.innerHTML=`<div class="card tight ctr sm dim"><span class="spin"></span> Intezaar…</div>`; $('#gs-action').innerHTML=''; return; }
  opts.innerHTML=S.guessOpts.map(w=>`<div class="prow pick ${S.pickW===w?'sel':''}" data-w="${esc(w)}">
    <div class="av" style="width:30px;height:30px;font-size:15px">🎯</div><div class="nm">${esc(w)}</div></div>`).join('');
  opts.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{ S.pickW=b.dataset.w; sfx.tap(); renderGuess(); });
  $('#gs-action').innerHTML=`<button class="btn r" id="b-guess" ${S.pickW?'':'disabled'}>Final answer 🔒</button>`;
  const btn=$('#b-guess'); if(btn) btn.onclick=()=>{ const w=S.pickW; S.pickW=null;
    if(S.mode==='local') doGuess(w); else NET.act({a:'guess',t:w}); };
  if(S.mode==='local'&&!S.guessSeen){ toast('Phone '+g.name+' ko do 👀',2600); S.guessSeen=true; }
}
function renderEnd(){
  const r=S.result;
  const T={civ:['🪔','Nagrik jeet gaye!','Jasoos pakda gaya. Izzat bach gayi.'],
    spy:['🔍','Jasoos jeet gaya!','Bilkul saamne tha aur kisi ko shak nahi hua.'],
    steal:['🎯','Jasoos ne baazi palat di!','Pakda gaya… par secret word sahi guess kar liya.']}[r]||['🏆','Khatam',''];
  $('#en-ico').textContent=T[0]; $('#en-title').textContent=T[1]; $('#en-title').className='bigres '+(r==='civ'?'res-civ':'res-spy');
  $('#en-note').textContent=T[2]+(S.guessed&&r!=='spy'?' Guess: “'+S.guessed+'”':'');
  $('#en-word').textContent=S.word; $('#en-cat').textContent=S.cat;
  const roles=S.mode==='online'?(S.revealRoles||{}):Object.fromEntries(Object.entries(ROLES).map(([k,v])=>[k,v.role]));
  $('#en-roles').innerHTML=S.players.map(p=>{ const sp=roles[p.id]==='spy';
    return `<div class="prow ${sp?'sel':''}"><div class="av">${p.av}</div><div class="nm">${esc(p.name)}</div>
      <span class="pill ${sp?'rd':'g'}">${sp?'🔍 Jasoos':'🪔 Nagrik'}</span></div>`; }).join('');
  $('#en-score').innerHTML=S.players.slice().sort((a,b)=>b.score-a.score).map((p,i)=>
    `<div class="prow ${i===0?'me':''}"><div class="av" style="width:30px;height:30px;font-size:15px">${i===0?'👑':p.av}</div>
      <div class="nm">${esc(p.name)}</div><div class="vcount">${p.score}</div></div>`).join('');
  const act=$('#en-action');
  act.innerHTML=(isHost()?`<button class="btn p" id="b-next">Agla round 🔄</button>`:`<div class="card tight ctr sm dim">Host agla round shuru karega…</div>`)
    +`<button class="btn ghost mt" id="b-home" style="margin-top:9px">Khatam — ghar jao</button>`;
  const nb=$('#b-next'); if(nb) nb.onclick=()=>{ if(S.mode==='online') NET.act({a:'again'}); else newGame(true); };
  $('#b-home').onclick=()=>{ if(S.mode==='online') NET.leave(); stopTimer(); go('s-home'); };
}
function renderRoom(){
  $('#room-code').textContent=NET.room||'····';
  $('#room-role').textContent=NET.host?'👑 Host':'Guest';
  $('#room-count').textContent=S.players.length+' / 12';
  $('#room-players').innerHTML=S.players.map(p=>`<div class="prow ${p.id===ME.id?'me':''}">
    <div class="av">${p.av}</div><div class="nm">${esc(p.name)}${p.id===ME.id?' <span class="xs dim">(tum)</span>':''}</div>
    ${p.id===S.host?'<span class="pill y">host</span>':''}${p.conn===false?'<span class="pill rd">gaya</span>':''}</div>`).join('')
    ||`<div class="dim sm ctr">Koi nahi aaya… link bhejo.</div>`;
  const rs=$('#room-settings');
  rs.innerHTML=settingsHTML(NET.host)+`<div class="hr"></div><div class="up gold mb">Categories</div><div class="catbox" id="rcats">${catsHTML(NET.host)}</div>`;
  wireSettings(rs,NET.host); wireCats(rs,NET.host);
  const act=$('#room-actions');
  if(NET.host){
    const ok=S.players.length>=3;
    act.innerHTML=`<button class="btn p" id="b-gostart" ${ok?'':'disabled'}>${ok?'Shuru karo →':'3 khiladi chahiye ('+S.players.length+')'}</button>`;
    $('#b-gostart').onclick=()=>{ sfx.ok(); newGame(false); };
  } else act.innerHTML=`<div class="card tight ctr sm dim"><span class="spin"></span> Host ke shuru karne ka intezaar…</div>`;
}
function renderWait(){
  $('#wt-info').innerHTML=`${S.players.length} khiladi khel rahe hain · Round ${S.round}<br>Host: ${esc((S.players.find(p=>p.id===S.host)||{}).name||'—')}`;
}
/* ============ dispatcher ============ */
function render(){
  switch(CUR){
    case 's-home': renderHome(); break;
    case 's-setup': renderSetup(); break;
    case 's-room': renderRoom(); break;
    case 's-pass': renderPass(); break;
    case 's-reveal': renderReveal(); break;
    case 's-clue': $('#b-mycard').style.display=S.mode==='online'?'grid':'none'; renderClue(); paintTimers(); break;
    case 's-discuss': renderDiscuss(); paintTimers(); break;
    case 's-vote': renderVote(); break;
    case 's-eject': renderEject(); break;
    case 's-guess': renderGuess(); break;
    case 's-end': renderEnd(); break;
    case 's-wait': renderWait(); break;
  }
}
/* ============ sheets ============ */
const RULES=`
<div class="row sb"><h2>Kaise khelein</h2><button class="iconbtn" onclick="document.getElementById('sheet').classList.remove('on')">✕</button></div>
<div class="hr"></div>
<div class="sm" style="line-height:1.65">
<p><b class="gold">1. Card milta hai.</b> Sab <b class="tealc">Nagrik</b> ko ek hi secret word milta hai — jaise “Vada Pav”. Ek (ya do) <b class="rose">Jasoos</b> ko kuch nahi milta, sirf category.</p>
<p><b class="gold">2. Clue do.</b> Bari-bari se har khiladi ek-do shabd ka clue deta hai. Nagrik ko saabit karna hai ki woh jaanta hai — par itna nahi ki Jasoos copy kar le.</p>
<p><b class="gold">3. Vote.</b> Rounds ke baad sab milkar ek khiladi ko bahar karte hain.</p>
<p><b class="gold">4. Nateeja.</b> Jasoos pakda gaya to Nagrik jeete — par Jasoos ko ek <b>steal</b> mauka milta hai: sahi word guess kiya to baazi palat gayi. Jasoos bach gaya jab tak sirf woh aur ek Nagrik bache — to Jasoos jeeta.</p>
<div class="hr"></div>
<div class="kv"><span>Nagrik jeete</span><b class="gold">+2 har nagrik</b></div>
<div class="kv"><span>Jasoos bach gaya</span><b class="gold">+4 jasoos</b></div>
<div class="kv"><span>Jasoos ne steal kiya</span><b class="gold">+3 jasoos · +1 nagrik</b></div>
<div class="hr"></div>
<p class="dim">Ek Phone mode: sabhi ek hi phone par, pass karke. Online mode: sabke apne phone, room code se jud jao.</p>
</div>`;
function menuSheet(){
  sheet(`<div class="row sb"><h2>Menu</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <div style="display:flex;flex-direction:column;gap:9px">
      <button class="btn ghost" id="m-rules">📖 Rules</button>
      <button class="btn ghost" id="m-snd">${SND?'🔊 Sound On':'🔇 Sound Off'}</button>
      <button class="btn ghost" id="m-quit">🚪 Khel chhodo</button>
    </div>`);
  $('#sh-x').onclick=closeSheet;
  $('#m-rules').onclick=()=>sheet(RULES);
  $('#m-snd').onclick=()=>{ SND=!SND; localStorage.setItem('jas.snd',SND?'1':'0'); closeSheet(); toast('Sound '+(SND?'on':'off')); };
  $('#m-quit').onclick=()=>{ closeSheet(); if(S.mode==='online') NET.leave(); stopTimer(); go('s-home'); };
}
