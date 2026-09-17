/* ============ animated background ============ */
(function bgAnim(){
  const c=$('#bg'), x=c.getContext('2d'); let W,H,dpr,parts=[],t=0,last=0;
  const P=['🪔','🌼','✨','🔍'];
  function size(){ dpr=Math.min(2,devicePixelRatio||1); W=c.width=innerWidth*dpr; H=c.height=innerHeight*dpr;
    c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; }
  function make(n){ parts=Array.from({length:n},()=>({x:Math.random()*1,y:Math.random(),
    r:(6+Math.random()*16),sp:.008+Math.random()*.02,dr:Math.random()*Math.PI*2,
    sw:.3+Math.random()*.9, a:.05+Math.random()*.14, g:Math.random()<.25 }));}
  size(); make(innerWidth<520?16:26); addEventListener('resize',()=>{size();});
  function frame(ts){
    const dt=Math.min(50,ts-last)/16.667; last=ts; t+=dt;
    if(!document.hidden){
      x.clearRect(0,0,W,H);
      const g=x.createRadialGradient(W*.5,H*.1,0,W*.5,H*.1,W*.9);
      g.addColorStop(0,'rgba(70,25,70,.55)'); g.addColorStop(1,'rgba(8,4,16,0)');
      x.fillStyle=g; x.fillRect(0,0,W,H);
      parts.forEach(p=>{
        p.y-=p.sp*dt*.006; if(p.y<-.08){ p.y=1.08; p.x=Math.random(); }
        p.dr+=.004*dt;
        const px=(p.x+Math.sin(p.y*7+p.dr)*.03)*W, py=p.y*H, r=p.r*dpr;
        x.save(); x.globalAlpha=p.a; x.translate(px,py); x.rotate(Math.sin(p.dr)*.5);
        if(p.g){ x.fillStyle='#f5b83d'; x.beginPath();
          for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; x.ellipse(Math.cos(a)*r*.6,Math.sin(a)*r*.6,r*.42,r*.28,a,0,7); }
          x.fill(); x.beginPath(); x.arc(0,0,r*.36,0,7); x.fillStyle='#ff9f45'; x.fill(); }
        else { x.strokeStyle='#e0457b'; x.lineWidth=p.sw*dpr; x.beginPath();
          x.arc(0,0,r,0,Math.PI*2); x.stroke(); x.beginPath(); x.arc(0,0,r*.45,0,Math.PI*2); x.stroke(); }
        x.restore();
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
mandala($('#mand1')); mandala($('#mand2'));

/* ============ wiring ============ */
$('#b-local').onclick=()=>{ sfx.tap(); S.mode='local'; go('s-setup'); };
$('#b-create').onclick=()=>{ sfx.tap(); createRoom(); };
$('#b-join').onclick=()=>{ sfx.tap(); joinSheet(); };
$('#b-how').onclick=()=>{ sfx.tap(); sheet(RULES); };
$('#b-sound').onclick=()=>{ SND=!SND; localStorage.setItem('jas.snd',SND?'1':'0'); sfx.ok(); render(); };
$$('[data-back]').forEach(b=>b.onclick=()=>{ sfx.tap(); go(b.dataset.back); });
$('#b-add').onclick=()=>addPlayer($('#pname').value);
$('#pname').onkeydown=e=>{ if(e.key==='Enter'){ e.stopPropagation(); addPlayer($('#pname').value); } };
$('#cat-all').onclick=()=>{ SET.cats=DEF.cats.slice(); saveSet(); sfx.tap(); render(); };
$('#cat-none').onclick=()=>{ SET.cats=[DEF.cats[0]]; saveSet(); sfx.tap(); render(); };
$('#b-startlocal').onclick=()=>{
  if(LOCAL.length<3) return toast('Kam se kam 3 khiladi');
  S.mode='local'; S.players=LOCAL.map(p=>({id:p.id,name:p.name,av:p.av,score:0,alive:true,voted:false}));
  sfx.ok(); newGame(false);
};
$('#b-leave').onclick=()=>{ NET.leave(); location.hash=''; stopTimer(); go('s-home'); };
$('#b-copy').onclick=async()=>{ const url=location.origin+location.pathname+'#r='+NET.room;
  try{ await navigator.clipboard.writeText(url); toast('Link copy ho gaya 📋'); }catch(e){ toast(url,4000); } };
$('#b-share').onclick=async()=>{ const url=location.origin+location.pathname+'#r='+NET.room;
  const d={title:'JASOOS',text:'Aa jao — room code '+NET.room,url};
  if(navigator.share){ try{ await navigator.share(d); }catch(e){} } else $('#b-copy').click(); };
$('#b-pass-ok').onclick=()=>{ sfx.tap(); go('s-reveal'); };
$('#b-menu').onclick=()=>{ sfx.tap(); menuSheet(); };
$('#b-mycard').onclick=()=>{
  if(S.mode==='local') return toast('Sab ek phone par — card nahi dikha sakte 😅');
  const spy=ME.role==='spy';
  sheet(`<div class="row sb"><h2>Mera card</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <div class="ctr"><div class="up ${spy?'rose':'tealc'}">${spy?'🔍 JASOOS':'🪔 NAGRIK'}</div>
    <div class="word mt">${spy&&!ME.word?'— koi shabd nahi —':esc(ME.word||'')}</div>
    <div class="sm dim mt">${S.cat}</div></div>`);
  $('#sh-x').onclick=closeSheet;
};
$('#flip').onclick=()=>{
  const f=$('#flip'); if(f.classList.contains('open')) return;
  f.classList.add('open'); sfx.flip();
  const pid=S.mode==='local'?S.order[S.revealIdx]:ME.id;
  const spy=(S.mode==='local'?ROLES[pid]?.role:ME.role)==='spy';
  setTimeout(()=>{ (spy?sfx.spy:sfx.civ)(); $('#b-rev-next').style.visibility='visible'; },420);
};
$('#b-rev-next').onclick=()=>{
  sfx.tap();
  if(S.mode==='local'){
    if(S.revealIdx>=S.order.length-1){ beginClues(); }
    else { S.revealIdx++; go('s-pass'); }
  } else {
    S._iReady=true; NET.act({a:'ready'}); render();
  }
};
$('#b-tovote').onclick=()=>{ if(!isHost()) return; sfx.tap(); startVote(); };
$('#b-ej-next').onclick=()=>{ sfx.tap(); if(S.mode==='local') afterEject(); else NET.act({a:'next'}); };

$('#b-wait-leave').onclick=()=>{ NET.leave(); location.hash=''; go('s-home'); };
/* haptics on every button press */
document.addEventListener('click',e=>{ if(e.target.closest('button,.prow.pick,.chip')) navigator.vibrate&&navigator.vibrate(9); },true);

/* keyboard safety: never eat typing */
addEventListener('keydown',e=>{
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea') return;
  if(e.key==='Escape') closeSheet();
});
addEventListener('hashchange',()=>{ const m=location.hash.match(/r=([A-Z0-9]{4})/i);
  if(m&&!NET.open) joinRoom(m[1]); });

/* ============ boot ============ */
(function boot(){
  const m=location.hash.match(/r=([A-Z0-9]{4})/i);
  renderHome();
  if(m){ setTimeout(()=>joinSheet(m[1].toUpperCase()),400); }
})();

/* debug hook (local mode only exposes roles; online keeps them hidden) */
window.__J={ get S(){return S}, get SET(){return SET}, get ME(){return ME}, get CUR(){return CUR},
  get ROLES(){return ROLES}, get NET(){return {room:NET.room,host:NET.host,id:NET.id}},
  go, toast, render, newGame, submitClue, resolveVote, LOCALset(a){LOCAL=a;saveRoster();render();} };
