/* ============ online rooms ============
   Every tab holds a stable uid; player ids ARE uids, so a dropped socket and
   reconnect keeps your seat. The relay drops idle sockets, so keepalive at 6s
   and reconnect with backoff. Host state is mirrored into room storage, so a
   host reload or a late joiner still finds the game.                        */
const uid = (() => {
  let u = sessionStorage.getItem('jas.uid');
  if (!u) { u = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('jas.uid', u); }
  return u;
})();
ME.uid = ME.id = uid;
const NET = {
  ws: null, room: null, host: false, id: null, peers: [], open: false, bye: false, tries: 0,
  peerOf: {}, uidOf: {}, ka: null, joinT: 0,
  send(o) { if (this.ws && this.ws.readyState === 1) { this.ws.send(JSON.stringify(o)); return true; } return false; },
  bcast(data) { this.send({ type: 'msg', data }); },
  toPeer(pid, data) { if (pid) this.send({ type: 'msg', to: pid, data }); },
  toUid(u, data) { if (u === ME.uid) return; this.toPeer(this.peerOf[u], data); },
  act(data) { if (this.host) handleAct(ME.uid, data); else this.toPeer(S.hostPeer, Object.assign({ uid: ME.uid }, data)); },
  sendRoles() {
    Object.entries(ROLES).forEach(([u, r]) => {
      const pay = { k: 'role', role: r.role, word: r.word, mates: r.mates || [] };
      if (u === ME.uid) { ME.role = r.role; ME.word = r.word; }
      else this.toUid(u, pay);
    });
  },
  keepalive() {
    clearInterval(this.ka);
    this.ka = setInterval(() => {
      if (this.ws && this.ws.readyState === 1) this.send({ type: 'set', key: 'ka', value: Date.now() % 1e6 });
    }, 6000);
  },
  leave() {
    this.bye = true; clearInterval(this.ka); clearTimeout(this.rcT); clearTimeout(this.waitT);
    try { this.ws && this.ws.close(); } catch (e) {}
    this.ws = null; this.open = false; this.host = false; this.room = null;
    this.peers = []; this.peerOf = {}; this.uidOf = {};
    S.mode = 'local'; location.hash = '';
  },
};
function pub() {
  return {
    k: 'state', host: S.host, hostPeer: NET.id, phase: S.phase, gameNo: S.gameNo, round: S.round, voteAt: S.voteAt,
    turn: S.turn, order: S.order, clues: S.clues, catId: S.catId, catNm: catName(S.catObj || { nm: ['', '', ''] }),
    catE: (S.catObj || {}).e || '', spyCount: S.spyCount,
    players: S.players.map(p => ({ id: p.id, name: p.name, av: p.av, score: p.score, alive: p.alive, voted: p.voted, conn: p.conn })),
    ejected: S.ejected, ejectRoleShown: (S.phase === 'eject' || S.phase === 'end') ? S.ejectRole : null, tally: S.tally,
    guesser: S.guesser, guessOpts: S.phase === 'guess' ? S.guessOpts : [], result: S.result,
    word: S.phase === 'end' ? S.wordObj : null, revealRoles: S.phase === 'end' ? S.revealRoles : null,
    guessed: S.phase === 'end' ? S.guessed : null, votes: S.phase === 'vote' ? {} : null, readyN: S.readyN || 0,
    tleft: S.tleft, tmax: S.tmax, set: SET,
  };
}
function pushState() {
  if (!NET.host) return;
  NET.bcast(pub());
  NET.send({ type: 'set', key: 'meta', value: { hostUid: ME.uid, hostPeer: NET.id, phase: S.phase, gameNo: S.gameNo, n: S.players.length, set: SET } });
  render();
}
function applyState(st) {
  const phaseChanged = st.phase !== S._ph || st.gameNo !== S._gn;
  S._ph = st.phase; S._gn = st.gameNo;
  Object.assign(S, {
    host: st.host, hostPeer: st.hostPeer, phase: st.phase, gameNo: st.gameNo, round: st.round,
    voteAt: st.voteAt, turn: st.turn, order: st.order || [], clues: st.clues || [], catId: st.catId,
    spyCount: st.spyCount, players: st.players || [], ejected: st.ejected, ejectRoleShown: st.ejectRoleShown,
    tally: st.tally, guesser: st.guesser, guessOpts: st.guessOpts || [], result: st.result,
    revealRoles: st.revealRoles, guessed: st.guessed, readyN: st.readyN || 0,
  });
  if (st.word) S.wordObj = st.word;
  S.catObj = catById(st.catId) || { e: st.catE || '📚', nm: [st.catNm || '', st.catNm || '', st.catNm || ''] };
  if (st.votes) S.votes = st.votes;
  if (st.set) SET = Object.assign({}, DEF, st.set);
  syncTimer(st.tleft, st.tmax);
  if (!S.players.some(p => p.id === ME.uid) && Date.now() - NET.joinT > 2500) {
    NET.joinT = Date.now();
    NET.toPeer(S.hostPeer, { a: 'join', uid: ME.uid, name: ME.name, av: ME.av });
  }
  if (st.phase !== 'lobby' && !S.players.some(p => p.id === ME.uid)) {
    if (CUR !== 's-wait') go('s-wait'); else render();
    return;
  }
  const map = { lobby: 's-room', reveal: 's-reveal', clue: 's-clue', discuss: 's-discuss', vote: 's-vote', eject: 's-eject', guess: 's-guess', end: 's-end' };
  const want = map[st.phase] || 's-room';
  if (phaseChanged) {
    if (st.phase === 'reveal') { S.votes = {}; S._iReady = false; }
    go(want);
    if (st.phase === 'eject') (st.ejectRoleShown === 'spy' ? sfx.civ : sfx.spy)();
    if (st.phase === 'end') {
      (st.result === 'civ' ? sfx.win : sfx.lose)();
      recordStats(st.result);
      burst(st.result === 'civ' ? 'civ' : 'spy');
    }
  } else if (CUR !== want) go(want); else render();
}
function kick(pid) {
  if (!NET.host || pid === ME.uid) return;
  NET.toUid(pid, { k: 'err', m: t('room.kicked') });
  S.players = S.players.filter(p => p.id !== pid);
  if (S.queue) S.queue = S.queue.filter(q => q.id !== pid);
  NET.kicked = NET.kicked || {}; NET.kicked[pid] = 1;
  sfx.bad(); pushState();
}
function handleAct(from, d) {
  if (!NET.host) return;
  if (d.a === 'join') {
    if (NET.kicked && NET.kicked[from]) return;
    const ex = S.players.find(p => p.id === from);
    if (ex) { ex.conn = true; if (d.name) ex.name = d.name.slice(0, 12); }
    else {
      if (S.players.length >= 12) return NET.toUid(from, { k: 'err', m: t('room.full') });
      if (S.phase !== 'lobby') {
        S.queue = S.queue || [];
        if (!S.queue.some(q => q.id === from)) {
          S.queue.push({ id: from, name: (d.name || 'Player').slice(0, 12), av: d.av || '🙂' });
          toast(t('room.nextround', { name: d.name || '?' }));
        }
        pushState(); return;
      }
      const used = S.players.map(p => p.av);
      S.players.push({
        id: from, name: (d.name || 'Player').slice(0, 12),
        av: (d.av && !used.includes(d.av)) ? d.av : (AVS.find(a => !used.includes(a)) || '🙂'),
        score: 0, alive: true, voted: false, conn: true,
      });
      sfx.ok();
    }
    if (ROLES[from]) NET.toUid(from, { k: 'role', role: ROLES[from].role, word: ROLES[from].word, mates: ROLES[from].mates || [] });
    pushState(); return;
  }
  if (d.a === 'clue') return submitClue(from, d.t);
  if (d.a === 'vote') return castVote(from, d.t);
  if (d.a === 'ready') {
    if (S.phase !== 'reveal') return;
    (S.ready = S.ready || {})[from] = true;
    S.readyN = Object.keys(S.ready).length;
    if (S.readyN >= S.players.length) beginClues(); else pushState();
    return;
  }
  if (d.a === 'guess') {
    if (from !== S.guesser) return;
    const w = (S.guessOpts || []).find(o => o.a === d.t) || null;
    return doGuess(w);
  }
  if (d.a === 'next') { if (S.phase === 'eject') afterEject(); return; }
  if (d.a === 'again') { if (S.phase === 'end') newGame(true); return; }
}
function getWsEndpoint(code) {
  const custom = (typeof window !== 'undefined' && (window.JASOOS_WS_URL || localStorage.getItem('jas.ws_url'))) || '';
  if (custom) {
    const base = custom.replace(/\/+$/, '').replace(/^http/, 'ws');
    return `${base}/ws/jasoos-${code}`;
  }
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws/jasoos-${code}`;
}
function connect(code) {
  return new Promise((res, rej) => {
    S.mode = 'online'; NET.room = code; NET.bye = false; ME.uid = ME.id = uid;
    let ws;
    try { ws = new WebSocket(getWsEndpoint(code)); } catch (e) { return rej(e); }
    NET.ws = ws;
    const to = setTimeout(() => { try { ws.close(); } catch (e) {} rej(new Error('timeout')); }, 9000);
    ws.onmessage = ev => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.type === 'welcome') {
        clearTimeout(to);
        NET.id = m.id; NET.peers = (m.peers || []).slice(); NET.open = true; NET.tries = 0;
        NET.keepalive();
        const meta = (m.state || {}).meta || {};
        if (meta.hostUid === ME.uid) { NET.host = true; S.host = ME.uid; S.hostPeer = NET.id; pushState(); }
        else if (meta.hostUid && meta.hostPeer && NET.peers.includes(meta.hostPeer)) {
          NET.host = false; S.host = meta.hostUid; S.hostPeer = meta.hostPeer;
          if (meta.set) SET = Object.assign({}, DEF, meta.set);
          NET.joinT = Date.now();
          NET.toPeer(meta.hostPeer, { a: 'join', uid: ME.uid, name: ME.name, av: ME.av });
          clearTimeout(NET.waitT);
          NET.waitT = setTimeout(() => { if (!NET.host && !S.players.some(p => p.id === ME.uid)) becomeHost(true); }, 5000);
        } else becomeHost(!!meta.hostUid);
        res();
      } else if (m.type === 'join') {
        if (!NET.peers.includes(m.id)) NET.peers.push(m.id);
      } else if (m.type === 'leave') {
        NET.peers = NET.peers.filter(p => p !== m.id);
        const gone = NET.uidOf[m.id];
        if (NET.host) {
          const p = gone && S.players.find(x => x.id === gone);
          if (p) {
            p.conn = false;
            if (S.phase === 'lobby') S.players = S.players.filter(x => x.id !== gone);
            else {
              toast(t('room.dropped', { name: p.name }));
              clearTimeout(p._dropT);
              p._dropT = setTimeout(() => {
                const q = S.players.find(x => x.id === gone);
                if (q && q.conn === false && S.phase !== 'lobby' && S.phase !== 'end') {
                  q.alive = false; toast(t('room.dropout', { name: q.name })); pushState();
                }
              }, 30000);
            }
            pushState();
          }
        } else if (m.id === S.hostPeer) {
          clearTimeout(NET.waitT);
          NET.waitT = setTimeout(() => { if (!NET.host && !NET.peers.includes(S.hostPeer)) becomeHost(true); }, 6000);
        }
      } else if (m.type === 'msg') {
        const d = m.data || {};
        if (d.uid) { NET.peerOf[d.uid] = m.from; NET.uidOf[m.from] = d.uid; }
        if (d.k === 'state') { if (!NET.host) { S.hostPeer = d.hostPeer; clearTimeout(NET.waitT); applyState(d); } }
        else if (d.k === 'role') {
          ME.role = d.role; ME.word = d.word;
          ROLES[ME.id] = { role: d.role, word: d.word, mates: d.mates || [] };
          if (CUR === 's-reveal' || CUR === 's-clue') render();
        }
        else if (d.k === 'react') {
          if (d.uid !== ME.uid) flyReact(d.r, 40 + Math.random() * (innerWidth - 80), innerHeight * .5);
        }
        else if (d.k === 'err') { toast(d.m, 4200); NET.leave(); go('s-home'); }
        else if (d.a) { const u = NET.uidOf[m.from] || d.uid; if (u) handleAct(u, d); }
      }
    };
    ws.onclose = () => { NET.open = false; clearInterval(NET.ka); if (!NET.bye && S.mode === 'online') reconnectSoon(); };
    ws.onerror = () => { clearTimeout(to); if (!NET.open) rej(new Error('ws')); };
  });
}
function reconnectSoon() {
  if (NET.bye || !NET.room) return;
  NET.tries = (NET.tries || 0) + 1;
  if (NET.tries > 8) { toast(t('room.nolink'), 5000); return; }
  clearTimeout(NET.rcT);
  NET.rcT = setTimeout(() => { connect(NET.room).catch(() => reconnectSoon()); }, Math.min(3000, 300 * NET.tries));
}
function becomeHost(wasSomeoneElse) {
  NET.host = true; S.host = ME.uid; S.hostPeer = NET.id;
  if (!S.players.some(p => p.id === ME.uid))
    S.players = [{ id: ME.uid, name: ME.name, av: ME.av, score: 0, alive: true, voted: false, conn: true }];
  if (wasSomeoneElse) {
    S.players = S.players.filter(p => p.conn !== false);
    S.phase = 'lobby'; ROLES = {}; stopTimer();
    toast(t('room.newhost'), 4500);
    pushState(); go('s-room');
  } else { S.phase = 'lobby'; pushState(); }
}
/* ============ name gate ============ */
function askName(next) {
  const me = jget('jas.me', {});
  ME.uid = ME.id = uid; ME.name = ME.name || me.name || ''; ME.av = ME.av || me.av || rnd(AVS);
  sheet(`<div class="row sb"><h2>${t('room.yourname')}</h2><button class="iconbtn" id="sh-x">✕</button></div>
    <div class="hr"></div>
    <div class="row gap6"><button class="av lg" id="n-av">${ME.av}</button>
      <input class="inp" id="n-name" maxlength="12" placeholder="${esc(t('set.addname'))}" value="${esc(ME.name)}" autocomplete="off"></div>
    <div class="xs dim mt">${t('room.avhint')}</div>
    <button class="btn p mt" id="n-ok">${t('room.go')} →</button>`);
  $('#sh-x').onclick = closeSheet;
  $('#n-av').onclick = () => { ME.av = AVS[(AVS.indexOf(ME.av) + 1) % AVS.length]; $('#n-av').textContent = ME.av; sfx.tap(); };
  const done = () => {
    const v = $('#n-name').value.trim();
    if (!v) return toast(t('set.typename'));
    ME.name = v.slice(0, 12); jset('jas.me', { name: ME.name, av: ME.av });
    closeSheet(); next();
  };
  $('#n-ok').onclick = done;
  $('#n-name').onkeydown = e => { if (e.key === 'Enter') done(); };
  setTimeout(() => $('#n-name').focus(), 120);
}
function createRoom() {
  askName(async () => {
    const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    toast(t('room.making'), 1200);
    try { await connect(code); location.hash = 'r=' + code; go('s-room'); sfx.ok(); }
    catch (e) { toast(t('room.makefail'), 3000); S.mode = 'local'; }
  });
}
function joinRoom(code) {
  code = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  if (code.length !== 4) return toast(t('room.code4'));
  askName(async () => {
    toast(t('room.joining'), 1200);
    try { await connect(code); location.hash = 'r=' + code; go('s-room'); sfx.ok(); }
    catch (e) { toast(t('room.joinfail'), 3000); S.mode = 'local'; }
  });
}
function joinSheet(pref) {
  sheet(`<div class="row sb"><h2>${t('room.askcode')}</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <input class="inp big" id="j-code" maxlength="4" placeholder="ABCD" value="${esc(pref || '')}" autocomplete="off" autocapitalize="characters" inputmode="text">
    <button class="btn p mt" id="j-ok">${t('home.m3t')} →</button>
    <div class="xs dim ctr mt">${t('room.codehint')}</div>`);
  $('#sh-x').onclick = closeSheet;
  const inp = $('#j-code');
  setTimeout(() => inp.focus(), 120);
  const go2 = () => { const v = inp.value; closeSheet(); joinRoom(v); };
  $('#j-ok').onclick = go2;
  inp.onkeydown = e => { if (e.key === 'Enter') go2(); };
}
