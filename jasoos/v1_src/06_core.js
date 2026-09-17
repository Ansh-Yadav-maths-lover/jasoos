/* ============ audio ============ */
let zz=null, SND=localStorage.getItem('jas.snd')!=='0';
import('https://cdn.jsdelivr.net/npm/zzfx@1.3.2/ZzFX.min.js').then(m=>{zz=m.zzfx;}).catch(()=>{});
const play=(...a)=>{ if(SND&&zz){ try{ zz(...a); }catch(e){} } };
const sfx={
  tap:()=>play(.5,.05,420,.01,.02,.06,1,1.4,0,0,0,0,0,0,0,0,.02,.5,.01),
  ok:()=>play(.7,.05,660,.02,.09,.16,1,1.6,0,0,180,.06,.02,0,0,0,0,.6,.03),
  flip:()=>play(.6,.05,180,.02,.12,.2,2,1.8,-3,0,0,0,0,.2,0,0,.05,.7,.02),
  spy:()=>play(1,.05,90,.06,.3,.5,2,2.6,-2,0,0,0,.1,.4,0,.2,.1,.5,.06),
  civ:()=>play(.7,.05,523,.03,.18,.3,1,1.4,0,0,262,.05,.05,0,0,0,0,.7,.03),
  vote:()=>play(.7,.05,300,.01,.05,.12,3,1.2,0,0,0,0,0,.1,0,0,.02,.6,.02),
  win:()=>play(.8,.05,523,.05,.32,.4,1,1.5,0,0,784,.07,.09,0,0,0,.02,.8,.04),
  lose:()=>play(.8,.05,220,.06,.35,.5,1,2.2,-4,0,110,.1,.1,.1,0,0,.05,.6,.05),
  tick:()=>play(.3,.05,900,.01,.01,.03,1,1,0,0,0,0,0,0,0,0,0,.4,.01),
};
/* ============ dom helpers ============ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let CUR='s-home';
function go(id){ if(CUR===id){render();return;} $$('.scr').forEach(e=>e.classList.remove('on'));
  const el=document.getElementById(id); el.classList.add('on'); CUR=id; el.querySelectorAll('.scroll').forEach(s=>s.scrollTop=0); render(); }
let tT;
function toast(m,ms=2000){ const t=$('#toast'); t.textContent=m; t.classList.add('on'); clearTimeout(tT); tT=setTimeout(()=>t.classList.remove('on'),ms); }
function sheet(html){ $('#sheet-box').innerHTML=html; $('#sheet').classList.add('on'); }
function closeSheet(){ $('#sheet').classList.remove('on'); }
$('#sheet').onclick=e=>{ if(e.target.id==='sheet') closeSheet(); };

/* ============ state ============ */
const DEF={ spies:1, hide:'blank', rounds:2, turnT:0, discT:90, steal:true, log:'type',
  cats:['food','films','cricket','tyohar','jagah','shaadi','ghar','safar','tv','sangeet','padhai','bazaar','desi','katha'] };
let SET=Object.assign({},DEF,JSON.parse(localStorage.getItem('jas.set')||'{}'));
if(!SET.cats||!SET.cats.length) SET.cats=DEF.cats.slice();
const saveSet=()=>localStorage.setItem('jas.set',JSON.stringify(SET));

let S={ mode:'local', phase:'lobby', players:[], order:[], turn:0, round:0, cycle:0, clues:[],
  votes:{}, cat:'', word:'', ejected:null, result:null, guessOpts:[], guessed:null, gameNo:0, tleft:0, revealIdx:0, host:null };
let ROLES={};            // pid -> {role:'spy'|'civ', word}
let ME={ id:null, role:null, word:null, name:null };
const alive=()=>S.players.filter(p=>p.alive);
const pById=id=>S.players.find(p=>p.id===id)||{name:'?',av:'❔'};
const isHost=()=>S.mode==='local'||NET.host;
const myTurnPid=()=>S.order[S.turn];

/* ============ round setup ============ */
function pickWord(){
  const pool=SET.cats.length?SET.cats:DEF.cats;
  const c=catById(rnd(pool))||CATS[0];
  const ws=shuffle(c.words);
  return { cat:c, word:ws[0], decoy:ws[1] };
}
function newGame(keepScores){
  if(S.queue&&S.queue.length){ S.queue.forEach(q=>{ if(S.players.length<12&&!S.players.some(p=>p.id===q.id)){
      const used=S.players.map(p=>p.av);
      S.players.push({id:q.id,name:q.name,av:used.includes(q.av)?(AVS.find(a=>!used.includes(a))||q.av):q.av,
        score:0,alive:true,voted:false,conn:true}); } }); S.queue=[]; }
  const n=S.players.length;
  const spies=Math.min(SET.spies, Math.max(1, Math.floor((n-1)/2)));
  const {cat,word,decoy}=pickWord();
  S.cat=cat.name+' '+cat.e; S.catId=cat.id; S.word=word;
  S.players.forEach(p=>{ p.alive=true; p.voted=false; if(!keepScores) p.score=0; });
  const ids=shuffle(S.players.map(p=>p.id));
  ROLES={};
  ids.forEach((id,i)=>{ const spy=i<spies;
    ROLES[id]={ role:spy?'spy':'civ', word:spy?(SET.hide==='decoy'?decoy:null):word }; });
  S.spyCount=spies; S.order=shuffle(S.players.map(p=>p.id));
  S.turn=0; S.round=1; S.cycle=0; S.clues=[]; S.votes={}; S.ejected=null; S.result=null;
  S.guessed=null; S.guessOpts=[]; S.revealIdx=0; S.gameNo++; S.ready={}; S._iReady=false; S.readyN=0;
  S.voteAt=SET.rounds; S.phase='reveal';
  if(S.mode==='online'){ NET.sendRoles(); pushState(); go('s-reveal'); }
  else go('s-pass');
}
/* ============ clue phase ============ */
function beginClues(){ S.phase='clue'; S.turn=0; startTurnTimer(); if(S.mode==='online') pushState(); go('s-clue'); }
function submitClue(pid,text){
  if(S.phase!=='clue'||myTurnPid()!==pid) return;
  const t=(text||'').trim().slice(0,26);
  if(SET.log==='type'&&!t) return;
  S.clues.push({pid,t:t||'🗣',r:S.round});
  sfx.ok(); nextTurn();
}
function nextTurn(){
  let i=S.turn+1;
  while(i<S.order.length && !pById(S.order[i]).alive) i++;
  if(i<S.order.length){ S.turn=i; startTurnTimer(); if(S.mode==='online') pushState(); go('s-clue'); return; }
  if(S.round>=S.voteAt){ toVoteStage(); return; }              // all spoke, vote time
  S.round++; S.turn=S.order.findIndex(id=>pById(id).alive); startTurnTimer();
  if(S.mode==='online') pushState(); go('s-clue');
}
function toVoteStage(){
  stopTimer();
  if(SET.discT>0){ S.phase='discuss'; setTimer(SET.discT,()=>startVote()); if(S.mode==='online') pushState(); go('s-discuss'); }
  else startVote();
}
/* ============ voting ============ */
function startVote(){
  stopTimer(); S.phase='vote'; S.votes={}; S.players.forEach(p=>p.voted=false); S.localTally={};
  if(S.mode==='online'){ setTimer(45,()=>resolveVote()); pushState(); }
  go('s-vote');
}
function castVote(voter,target){
  if(S.phase!=='vote') return;
  S.votes[voter]=target; const p=S.players.find(x=>x.id===voter); if(p) p.voted=true;
  sfx.vote();
  if(S.mode==='online'){ pushState(); if(alive().every(p=>p.voted)) setTimeout(resolveVote,400); }
}
function tallyOf(){ const t={}; Object.values(S.votes).forEach(v=>{ if(v&&v!=='skip') t[v]=(t[v]||0)+1; }); return t; }
function resolveVote(){
  if(S.phase!=='vote') return; stopTimer();
  const t = S.mode==='local'? (S.localTally||{}) : tallyOf();
  let top=null, max=0, tie=false;
  Object.entries(t).forEach(([id,c])=>{ if(c>max){max=c;top=id;tie=false;} else if(c===max&&c>0){tie=true;} });
  S.tally=t; S.phase='eject';
  if(!top||max===0||tie){ S.ejected=null; }
  else { S.ejected=top; const p=pById(top); p.alive=false; }
  S.ejectRole = S.ejected? ROLES[S.ejected]?.role : null;
  if(S.mode==='online'){ S.ejectRoleShown=S.ejectRole; pushState(); }
  (S.ejectRole==='spy'?sfx.civ:sfx.spy)();
  go('s-eject');
}
function afterEject(){
  const spiesLeft=S.players.filter(p=>p.alive&&ROLES[p.id]?.role==='spy').length;
  const civsLeft=S.players.filter(p=>p.alive&&ROLES[p.id]?.role==='civ').length;
  if(S.ejectRole==='spy'&&spiesLeft===0){
    if(SET.steal){ startGuess(S.ejected); return; }
    return endRound('civ');
  }
  if(civsLeft<=spiesLeft) return endRound('spy');
  if(S.round>=8) return endRound('spy');
  S.cycle++; S.round++; S.voteAt=S.round; S.phase='clue';
  S.turn=S.order.findIndex(id=>pById(id).alive); startTurnTimer();
  if(S.mode==='online') pushState();
  go('s-clue');
}
/* ============ jasoos steal ============ */
function startGuess(spyId){
  S.phase='guess'; S.guesser=spyId;
  const c=catById(S.catId)||CATS[0];
  const others=shuffle(c.words.filter(w=>w!==S.word)).slice(0,7);
  S.guessOpts=shuffle([S.word,...others]);
  if(S.mode==='online'){ setTimer(30,()=>doGuess(null)); pushState(); }
  go('s-guess');
}
function doGuess(w){
  if(S.phase!=='guess') return; stopTimer();
  S.guessed=w||'—';
  endRound(norm(w)===norm(S.word)?'steal':'civ');
}
/* ============ end of round ============ */
function endRound(result){
  stopTimer(); S.phase='end'; S.result=result;
  S.players.forEach(p=>{ const r=ROLES[p.id]?.role;
    if(result==='civ'){ if(r==='civ') p.score+=2; }
    else if(result==='spy'){ if(r==='spy') p.score+=4; }
    else { if(r==='spy') p.score+=3; else p.score+=1; } });
  S.revealRoles=Object.fromEntries(Object.entries(ROLES).map(([k,v])=>[k,v.role]));
  if(S.mode==='online') pushState();
  (result==='civ'?sfx.win:sfx.lose)();
  go('s-end');
}
/* ============ timers ============ */
let tvId=null;
function setTimer(sec,cb){ S.tleft=sec; S.tmax=sec; stopTimer();
  const end=Date.now()+sec*1000; S._end=end; S._cb=cb;
  tvId=setInterval(()=>{ const left=Math.max(0,Math.ceil((S._end-Date.now())/1000));
    if(left!==S.tleft){ S.tleft=left; if(left<=5&&left>0) sfx.tick(); paintTimers(); }
    if(left<=0){ const cb=S._cb; stopTimer(); if(isHost()&&cb) cb(); } },250); paintTimers(); }
function stopTimer(){ if(tvId) clearInterval(tvId); tvId=null; }
function startTurnTimer(){ if(SET.turnT>0&&isHost()) setTimer(SET.turnT,()=>{ if(S.phase==='clue') submitClue(myTurnPid(),''); }); else { stopTimer(); S.tleft=0; S.tmax=0; } }
function syncTimer(tleft,tmax){ if(!tleft){ stopTimer(); S.tleft=0; S.tmax=tmax||0; return; }
  S.tmax=tmax||tleft; S._end=Date.now()+tleft*1000; S._cb=null;
  if(!tvId) tvId=setInterval(()=>{ const left=Math.max(0,Math.ceil((S._end-Date.now())/1000));
    if(left!==S.tleft){ S.tleft=left; paintTimers(); } if(left<=0) stopTimer(); },250);
  paintTimers(); }
function paintTimers(){
  const pct=S.tmax? Math.max(0,S.tleft/S.tmax*100):100;
  const set=(bar,lab)=>{ const b=$(bar); if(b){ b.style.display=S.tmax?'block':'none'; b.querySelector('i').style.width=pct+'%'; b.classList.toggle('warn',S.tleft<=10);} const l=lab&&$(lab); if(l) l.textContent=S.tmax?S.tleft:''; };
  set('#cl-tbar','#cl-timer'); set('#ds-tbar','#ds-timer'); set('#vt-tbar','#vt-timer'); set('#gs-tbar',null);
}
