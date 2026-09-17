/* ============ online rooms ============
   Identity: every tab has a stable uid (sessionStorage). Player ids ARE uids, so a
   dropped socket + reconnect keeps your seat. The relay kills idle sockets after
   ~11s, so we keepalive every 6s and auto-reconnect with backoff.            */
const uid=(()=>{ let u=sessionStorage.getItem('jas.uid');
  if(!u){ u=Math.random().toString(36).slice(2,10); sessionStorage.setItem('jas.uid',u); } return u; })();
ME.uid=ME.id=uid;
const NET={ ws:null, room:null, host:false, id:null, peers:[], open:false, bye:false, tries:0,
  peerOf:{}, uidOf:{}, ka:null, joinT:0,
  send(o){ if(this.ws&&this.ws.readyState===1){ this.ws.send(JSON.stringify(o)); return true; } return false; },
  bcast(data){ this.send({type:'msg',data}); },
  toPeer(pid,data){ if(pid) this.send({type:'msg',to:pid,data}); },
  toUid(u,data){ if(u===ME.uid){ return; } this.toPeer(this.peerOf[u],data); },
  act(data){ if(this.host) handleAct(ME.uid,data); else this.toPeer(S.hostPeer,Object.assign({uid:ME.uid},data)); },
  sendRoles(){ Object.entries(ROLES).forEach(([u,r])=>{
      if(u===ME.uid){ ME.role=r.role; ME.word=r.word; }
      else this.toUid(u,{k:'role',role:r.role,word:r.word}); }); },
  keepalive(){ clearInterval(this.ka); this.ka=setInterval(()=>{
      if(this.ws&&this.ws.readyState===1) this.send({type:'set',key:'ka',value:Date.now()%1e6}); },6000); },
  leave(){ this.bye=true; clearInterval(this.ka); clearTimeout(this.rcT);
    try{ this.ws&&this.ws.close(); }catch(e){}
    this.ws=null; this.open=false; this.host=false; this.room=null; this.peers=[]; this.peerOf={}; this.uidOf={};
    S.mode='local'; },
};
function pub(){
  return { k:'state', host:S.host, hostPeer:NET.id, phase:S.phase, gameNo:S.gameNo, round:S.round, voteAt:S.voteAt,
    turn:S.turn, order:S.order, clues:S.clues, cat:S.cat, spyCount:S.spyCount,
    players:S.players.map(p=>({id:p.id,name:p.name,av:p.av,score:p.score,alive:p.alive,voted:p.voted,conn:p.conn})),
    ejected:S.ejected, ejectRoleShown:(S.phase==='eject'||S.phase==='end')?S.ejectRole:null, tally:S.tally,
    guesser:S.guesser, guessOpts:S.phase==='guess'?S.guessOpts:[], result:S.result,
    word:S.phase==='end'?S.word:null, revealRoles:S.phase==='end'?S.revealRoles:null,
    guessed:S.phase==='end'?S.guessed:null, votes:S.phase==='vote'?{}:null, readyN:S.readyN||0,
    tleft:S.tleft, tmax:S.tmax, set:SET };
}
function pushState(){ if(!NET.host) return;
  NET.bcast(pub());
  NET.send({type:'set',key:'meta',value:{hostUid:ME.uid,hostPeer:NET.id,phase:S.phase,gameNo:S.gameNo,
    n:S.players.length,set:SET}});
  render(); }
function applyState(st){
  const phaseChanged = st.phase!==S._ph || st.gameNo!==S._gn;
  S._ph=st.phase; S._gn=st.gameNo;
  Object.assign(S,{ host:st.host, hostPeer:st.hostPeer, phase:st.phase, gameNo:st.gameNo, round:st.round,
    voteAt:st.voteAt, turn:st.turn, order:st.order||[], clues:st.clues||[], cat:st.cat, spyCount:st.spyCount,
    players:st.players||[], ejected:st.ejected, ejectRoleShown:st.ejectRoleShown, tally:st.tally,
    guesser:st.guesser, guessOpts:st.guessOpts||[], result:st.result, revealRoles:st.revealRoles,
    guessed:st.guessed, word:st.word||S.word, readyN:st.readyN||0 });
  if(st.votes) S.votes=st.votes;
  if(st.set) SET=Object.assign({},DEF,st.set);
  syncTimer(st.tleft,st.tmax);
  // self-heal: if the host doesn't know me, (re)announce
  if(!S.players.some(p=>p.id===ME.uid) && Date.now()-NET.joinT>2500){ NET.joinT=Date.now();
    NET.toPeer(S.hostPeer,{a:'join',uid:ME.uid,name:ME.name,av:ME.av}); }
  if(st.phase!=='lobby' && !S.players.some(p=>p.id===ME.uid)){ if(CUR!=='s-wait') go('s-wait'); else render(); return; }
  const map={lobby:'s-room',reveal:'s-reveal',clue:'s-clue',discuss:'s-discuss',vote:'s-vote',
    eject:'s-eject',guess:'s-guess',end:'s-end'};
  const want=map[st.phase]||'s-room';
  if(phaseChanged){
    if(st.phase==='reveal'){ S.votes={}; S._iReady=false; }
    go(want);
    if(st.phase==='eject') (st.ejectRoleShown==='spy'?sfx.civ:sfx.spy)();
    if(st.phase==='end') (st.result==='civ'?sfx.win:sfx.lose)();
  } else if(CUR!==want) go(want); else render();
}
function handleAct(from,d){        // `from` is a uid
  if(!NET.host) return;
  if(d.a==='join'){
    const ex=S.players.find(p=>p.id===from);
    if(ex){ ex.conn=true; if(d.name) ex.name=d.name.slice(0,12); }
    else{
      if(S.players.length>=12) return NET.toUid(from,{k:'err',m:'Room full (12 tak)'});
      if(S.phase!=='lobby'){                       // seat them for the next round
        S.queue=S.queue||[];
        if(!S.queue.some(q=>q.id===from)) { S.queue.push({id:from,name:(d.name||'Player').slice(0,12),av:d.av||'🙂'});
          toast((d.name||'Koi')+' agle round mein aayega'); }
        pushState(); return; }
      const used=S.players.map(p=>p.av);
      S.players.push({id:from,name:(d.name||'Player').slice(0,12),
        av:(d.av&&!used.includes(d.av))?d.av:(AVS.find(a=>!used.includes(a))||'🙂'),
        score:0,alive:true,voted:false,conn:true});
      sfx.ok();
    }
    if(ROLES[from]) NET.toUid(from,{k:'role',role:ROLES[from].role,word:ROLES[from].word});
    pushState(); return;
  }
  if(d.a==='clue') return submitClue(from,d.t);
  if(d.a==='vote') return castVote(from,d.t);
  if(d.a==='ready'){ if(S.phase!=='reveal') return; (S.ready=S.ready||{})[from]=true;
    S.readyN=Object.keys(S.ready).length;
    if(S.readyN>=S.players.length) beginClues(); else pushState(); return; }
  if(d.a==='guess'){ if(from===S.guesser) doGuess(d.t); return; }
  if(d.a==='next'){ if(S.phase==='eject') afterEject(); return; }
  if(d.a==='again'){ if(S.phase==='end') newGame(true); return; }
}
function connect(code){
  return new Promise((res,rej)=>{
    S.mode='online'; NET.room=code; NET.bye=false; ME.uid=uid;
    let ws; try{ ws=new WebSocket(`wss://${location.host}/ws/jasoos-${code}`); }catch(e){ return rej(e); }
    NET.ws=ws;
    const to=setTimeout(()=>{ try{ws.close();}catch(e){} rej(new Error('timeout')); },9000);
    ws.onmessage=ev=>{
      let m; try{ m=JSON.parse(ev.data); }catch(e){ return; }
      if(m.type==='welcome'){
        clearTimeout(to); NET.id=m.id; NET.peers=(m.peers||[]).slice(); NET.open=true; NET.tries=0;
        NET.keepalive();
        const meta=(m.state||{}).meta||{};
        if(meta.hostUid===ME.uid){                       // I was the host and just reconnected
          NET.host=true; S.host=ME.uid; S.hostPeer=NET.id; pushState();
        } else if(meta.hostUid && meta.hostPeer && NET.peers.includes(meta.hostPeer)){
          NET.host=false; S.host=meta.hostUid; S.hostPeer=meta.hostPeer;
          if(meta.set) SET=Object.assign({},DEF,meta.set);
          NET.joinT=Date.now();
          NET.toPeer(meta.hostPeer,{a:'join',uid:ME.uid,name:ME.name,av:ME.av});
          clearTimeout(NET.waitT);
          NET.waitT=setTimeout(()=>{ if(!NET.host && !S.players.some(p=>p.id===ME.uid)) becomeHost(true); },5000);
        } else {                                          // empty room, or host is gone
          becomeHost(!!meta.hostUid);
        }
        res();
      }
      else if(m.type==='join'){ if(!NET.peers.includes(m.id)) NET.peers.push(m.id); }
      else if(m.type==='leave'){
        NET.peers=NET.peers.filter(p=>p!==m.id);
        const gone=NET.uidOf[m.id];
        if(NET.host){
          const p=gone&&S.players.find(x=>x.id===gone);
          if(p){ p.conn=false;
            if(S.phase==='lobby'){ S.players=S.players.filter(x=>x.id!==gone); }
            else { toast(p.name+' ka connection gaya…'); clearTimeout(p._dropT);
              p._dropT=setTimeout(()=>{ const q=S.players.find(x=>x.id===gone);
                if(q&&q.conn===false&&S.phase!=='lobby'&&S.phase!=='end'){ q.alive=false; toast(q.name+' bahar ho gaya'); pushState(); } },30000); }
            pushState(); }
        }
        else if(m.id===S.hostPeer){
          clearTimeout(NET.waitT);
          NET.waitT=setTimeout(()=>{ if(!NET.host && !NET.peers.includes(S.hostPeer)) becomeHost(true); },6000);
        }
      }
      else if(m.type==='msg'){
        const d=m.data||{};
        if(d.uid){ NET.peerOf[d.uid]=m.from; NET.uidOf[m.from]=d.uid; }
        if(d.k==='state'){ if(!NET.host){ S.hostPeer=d.hostPeer; clearTimeout(NET.waitT); applyState(d); } }
        else if(d.k==='role'){ ME.role=d.role; ME.word=d.word; if(CUR==='s-reveal'||CUR==='s-clue') render(); }
        else if(d.k==='err'){ toast(d.m,4200); NET.leave(); location.hash=''; go('s-home'); }
        else if(d.a){ const u=NET.uidOf[m.from]||d.uid; if(u) handleAct(u,d); }
      }
    };
    ws.onclose=()=>{ NET.open=false; clearInterval(NET.ka);
      if(!NET.bye&&S.mode==='online'){ reconnectSoon(); } };
    ws.onerror=()=>{ clearTimeout(to); if(!NET.open) rej(new Error('ws')); };
  });
}
function reconnectSoon(){
  if(NET.bye||!NET.room) return;
  NET.tries=(NET.tries||0)+1;
  if(NET.tries>8){ toast('Connection nahi jud raha — dobara join karo',5000); return; }
  clearTimeout(NET.rcT);
  NET.rcT=setTimeout(()=>{ connect(NET.room).catch(()=>reconnectSoon()); }, Math.min(3000,300*NET.tries));
}
function becomeHost(wasSomeoneElse){
  NET.host=true; S.host=ME.uid; S.hostPeer=NET.id;
  if(!S.players.some(p=>p.id===ME.uid))
    S.players=[{id:ME.uid,name:ME.name,av:ME.av,score:0,alive:true,voted:false,conn:true}];
  if(wasSomeoneElse){
    S.players=S.players.filter(p=>p.conn!==false);
    S.phase='lobby'; ROLES={}; stopTimer();
    toast('Purana host chala gaya — ab tum host ho. Round dobara shuru karo.',4500);
    pushState(); go('s-room');
  } else { S.phase='lobby'; pushState(); }
}
/* ============ name gate ============ */
function askName(next){
  const me=JSON.parse(localStorage.getItem('jas.me')||'{}');
  ME.uid=uid; ME.name=ME.name||me.name||''; ME.av=ME.av||me.av||rnd(AVS);
  sheet(`<div class="row sb"><h2>Tumhara naam</h2><button class="iconbtn" id="sh-x">✕</button></div>
    <div class="hr"></div>
    <div class="row gap6"><button class="av lg" id="n-av">${ME.av}</button>
      <input class="inp" id="n-name" maxlength="12" placeholder="Naam…" value="${esc(ME.name)}" autocomplete="off"></div>
    <div class="xs dim mt">Avatar tap karke badlo.</div>
    <button class="btn p mt" id="n-ok">Chalo →</button>`);
  $('#sh-x').onclick=closeSheet;
  $('#n-av').onclick=()=>{ ME.av=AVS[(AVS.indexOf(ME.av)+1)%AVS.length]; $('#n-av').textContent=ME.av; sfx.tap(); };
  const done=()=>{ const v=$('#n-name').value.trim(); if(!v) return toast('Naam likho');
    ME.name=v.slice(0,12); localStorage.setItem('jas.me',JSON.stringify({name:ME.name,av:ME.av}));
    closeSheet(); next(); };
  $('#n-ok').onclick=done; $('#n-name').onkeydown=e=>{ if(e.key==='Enter') done(); };
  setTimeout(()=>$('#n-name').focus(),120);
}
async function createRoom(){
  askName(async()=>{
    const code=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
    toast('Room ban raha hai…',1200);
    try{ await connect(code); location.hash='r='+code; go('s-room'); sfx.ok(); }
    catch(e){ toast('Room nahi bana — dobara try karo',3000); S.mode='local'; }
  });
}
async function joinRoom(code){
  code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);
  if(code.length!==4) return toast('4 letter ka code dalo');
  askName(async()=>{
    toast('Jud rahe hain…',1200);
    try{ await connect(code); location.hash='r='+code; go('s-room'); sfx.ok(); }
    catch(e){ toast('Join fail — code check karo',3000); S.mode='local'; }
  });
}
function joinSheet(pref){
  sheet(`<div class="row sb"><h2>Room code</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <input class="inp big" id="j-code" maxlength="4" placeholder="ABCD" value="${esc(pref||'')}" autocomplete="off" autocapitalize="characters">
    <button class="btn p mt" id="j-ok">Join karo →</button>
    <div class="xs dim ctr mt">Host se 4-letter code maango, ya uska link kholo.</div>`);
  $('#sh-x').onclick=closeSheet;
  const inp=$('#j-code'); setTimeout(()=>inp.focus(),120);
  const go2=()=>{ const v=inp.value; closeSheet(); joinRoom(v); };
  $('#j-ok').onclick=go2; inp.onkeydown=e=>{ if(e.key==='Enter') go2(); };
}
