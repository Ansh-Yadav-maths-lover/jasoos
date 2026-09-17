/* ============ audio: tiny self-contained synth (no CDN) ============ */
let AC = null, MASTER = null;
let SND = LS('jas.snd') !== '0';
function actx() {
  if (!AC) {
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    MASTER = AC.createGain(); MASTER.gain.value = .5; MASTER.connect(AC.destination);
  }
  if (AC.state === 'suspended') AC.resume().catch(() => {});
  return AC;
}
function tone(o) {
  if (!SND) return;
  const c = actx(); if (!c) return;
  const t0 = c.currentTime + (o.at || 0), dur = o.d || .12, vol = (o.v ?? .3);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(.02, dur * .3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(MASTER);
  if (o.noise) {
    const n = c.createBufferSource(), len = Math.ceil(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    n.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.f || 800; f.Q.value = 1.4;
    n.connect(f); f.connect(g); n.start(t0); n.stop(t0 + dur);
    return;
  }
  const os = c.createOscillator();
  os.type = o.t || 'square';
  os.frequency.setValueAtTime(o.f || 440, t0);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(Math.max(30, o.f2), t0 + dur);
  os.connect(g); os.start(t0); os.stop(t0 + dur + .02);
}
const seq = (notes, o) => notes.forEach((n, i) => tone(Object.assign({ f: n, at: i * (o.gap || .09) }, o)));
const sfx = {
  tap: () => tone({ f: 620, f2: 480, d: .05, v: .16, t: 'triangle' }),
  ok: () => tone({ f: 660, f2: 990, d: .13, v: .2, t: 'triangle' }),
  flip: () => { tone({ f: 300, d: .1, v: .12, noise: 1 }); tone({ f: 220, f2: 520, d: .18, v: .14, t: 'sawtooth', at: .04 }); },
  spy: () => seq([196, 165, 131], { d: .28, v: .22, t: 'sawtooth', gap: .11 }),
  civ: () => seq([523, 659, 784], { d: .18, v: .18, t: 'triangle', gap: .07 }),
  vote: () => tone({ f: 340, f2: 250, d: .08, v: .2, t: 'square' }),
  win: () => seq([523, 659, 784, 1047], { d: .3, v: .22, t: 'triangle', gap: .1 }),
  lose: () => seq([392, 330, 262, 196], { d: .34, v: .22, t: 'sawtooth', gap: .12 }),
  tick: () => tone({ f: 1100, d: .03, v: .12, t: 'square' }),
  pop: () => tone({ f: 880, f2: 1400, d: .07, v: .16, t: 'sine' }),
  bad: () => tone({ f: 180, f2: 90, d: .22, v: .2, t: 'sawtooth' }),
};
/* ============ dom helpers ============ */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
let CUR = 's-home';
function go(id) {
  if (CUR === id) { render(); return; }
  $$('.scr').forEach(e => e.classList.remove('on'));
  const el = document.getElementById(id);
  el.classList.add('on'); CUR = id;
  el.querySelectorAll('.scroll').forEach(s => s.scrollTop = 0);
  render();
}
let tT;
function toast(m, ms) {
  const el = $('#toast'); el.textContent = m; el.classList.add('on');
  clearTimeout(tT); tT = setTimeout(() => el.classList.remove('on'), ms || 2200);
}
function sheet(html) { $('#sheet-box').innerHTML = html; $('#sheet').classList.add('on'); }
function closeSheet() { $('#sheet').classList.remove('on'); }
/* ============ settings ============ */
const DEF = {
  spies: 1, hide: 'blank', rounds: 2, turnT: 0, discT: 90, steal: true, log: 'type',
  script: 'both', diff: 'normal', bots: 5, soloSpy: 'random', packs: [],
  cats: CATIDS.slice(),
};
let SET = Object.assign({}, DEF, jget('jas.set', {}));
if (!SET.cats || !SET.cats.length) SET.cats = CATIDS.slice();
SET.cats = SET.cats.filter(id => CATIDS.includes(id) || String(id).startsWith('pk:'));
if (!SET.cats.length) SET.cats = CATIDS.slice();
const saveSet = () => jset('jas.set', SET);
/* ============ stats ============ */
const DEFST = { games: 0, wins: 0, spyG: 0, spyW: 0, civG: 0, civW: 0, caught: 0, steals: 0, ach: [] };
let ST = Object.assign({}, DEFST, jget('jas.stats', {}));
const saveST = () => jset('jas.stats', ST);
let DAILY = jget('jas.daily', { day: '', streak: 0, best: 0, res: '', role: '' });
const saveDaily = () => jset('jas.daily', DAILY);
const ACHS = [
  { id: 'first', ic: '🎬', ok: s => s.games >= 1 },
  { id: 'spy3', ic: '🕵️', ok: s => s.spyW >= 3 },
  { id: 'det5', ic: '🔍', ok: s => s.caught >= 5 },
  { id: 'steal', ic: '🎯', ok: s => s.steals >= 1 },
  { id: 'day7', ic: '🔥', ok: () => (DAILY.best || 0) >= 7 },
  { id: 'g25', ic: '👑', ok: s => s.games >= 25 },
  { id: 'pack', ic: '📚', ok: () => (jget('jas.packs', []) || []).length >= 1 },
  { id: 'online', ic: '🤝', ok: s => !!s.onlineDone },
];
function checkAch() {
  ACHS.forEach(a => {
    if (!ST.ach.includes(a.id) && a.ok(ST)) {
      ST.ach.push(a.id); saveST(); sfx.pop();
      setTimeout(() => toast(t('ach.got', { name: t('ach.' + a.id) }), 3200), 700);
    }
  });
}
/* ============ state ============ */
let S = {
  mode: 'local', phase: 'lobby', players: [], order: [], turn: 0, round: 0, clues: [],
  votes: {}, catId: '', wordObj: null, ejected: null, result: null, guessOpts: [], guessed: null,
  gameNo: 0, tleft: 0, revealIdx: 0, host: null, bots: {},
};
let ROLES = {}, ME = { id: null, role: null, word: null, name: null };
const alive = () => S.players.filter(p => p.alive);
const pById = id => S.players.find(p => p.id === id) || { name: '?', av: '❔' };
const isHost = () => S.mode !== 'online' || NET.host;
const isBot = id => !!S.bots[id];
const myTurnPid = () => S.order[S.turn];
const soloish = () => S.mode === 'solo' || S.mode === 'daily';
const onePhone = () => S.mode === 'local';

/* ============ word picking ============ */
function packWords() {
  const out = [];
  (jget('jas.packs', []) || []).forEach(p => {
    if (SET.cats.includes('pk:' + p.id)) out.push({ id: 'pk:' + p.id, e: '📚', nm: [p.name, p.name, p.name], words: p.words.map(w => ({ a: w, h: w })) });
  });
  return out;
}
function activeCats() {
  const list = CATS.filter(c => SET.cats.includes(c.id)).concat(packWords());
  return list.length ? list : CATS.slice();
}
function pickWord(rng) {
  const r = rng || Math.random;
  const pool = activeCats();
  const c = pool[Math.floor(r() * pool.length)];
  const ws = shuffle(c.words, r);
  const i = Math.floor(r() * c.words.length);
  const word = c.words[i];
  // decoy = a neighbour in the authored list, so it reads as "close but wrong"
  const near = [i - 2, i - 1, i + 1, i + 2].filter(j => j >= 0 && j < c.words.length && j !== i);
  const decoy = near.length ? c.words[near[Math.floor(r() * near.length)]] : ws[0];
  return { cat: c, word, decoy };
}
function pickSoloWord(rng) {
  const r = rng || Math.random;
  const pool = SOLOCATS.filter(c => SET.cats.includes(c.id));
  const list = pool.length ? pool : SOLOCATS;
  const c = list[Math.floor(r() * list.length)];
  const i = Math.floor(r() * c.words.length);
  const near = [i - 1, i + 1, i - 2, i + 2].filter(j => j >= 0 && j < c.words.length && j !== i);
  return { cat: c, word: c.words[i], decoy: near.length ? c.words[near[0]] : c.words[(i + 1) % c.words.length] };
}
/* ============ new game ============ */
function newGame(keepScores, opts) {
  opts = opts || {};
  if (S.queue && S.queue.length) {
    S.queue.forEach(q => {
      if (S.players.length < 12 && !S.players.some(p => p.id === q.id)) {
        const used = S.players.map(p => p.av);
        S.players.push({ id: q.id, name: q.name, av: used.includes(q.av) ? (AVS.find(a => !used.includes(a)) || q.av) : q.av, score: 0, alive: true, voted: false, conn: true });
      }
    });
    S.queue = [];
  }
  const rng = opts.rng || Math.random;
  const n = S.players.length;
  const spies = clamp(opts.spies ?? SET.spies, 1, Math.max(1, Math.floor((n - 1) / 2)));
  const src = soloish() ? pickSoloWord(rng) : pickWord(rng);
  S.catId = src.cat.id; S.catObj = src.cat; S.wordObj = src.word; S.decoyObj = src.decoy;
  S.players.forEach(p => { p.alive = true; p.voted = false; if (!keepScores) p.score = 0; });
  let ids = shuffle(S.players.map(p => p.id), rng);
  if (opts.forceSpy) { ids = [opts.forceSpy].concat(ids.filter(i => i !== opts.forceSpy)); }
  ROLES = {};
  const spyIds = ids.slice(0, spies);
  ids.forEach((id, i) => {
    const spy = i < spies;
    ROLES[id] = { role: spy ? 'spy' : 'civ', word: spy ? (SET.hide === 'decoy' ? src.decoy : null) : src.word,
      mates: spy ? spyIds.filter(x => x !== id) : [] };
  });
  S.spyCount = spies; S.order = shuffle(S.players.map(p => p.id), rng);
  S.turn = 0; S.round = 1; S.clues = []; S.votes = {}; S.ejected = null; S.result = null;
  S.guessed = null; S.guessOpts = []; S.revealIdx = 0; S.gameNo++; S.ready = {}; S._iReady = false; S.readyN = 0;
  S.voteAt = SET.rounds; S.phase = 'reveal'; S.localTally = {}; S.reacts = [];
  S.botGuess = null; S.guessSeen = false;
  if (S.mode === 'online') { NET.sendRoles(); pushState(); go('s-reveal'); }
  else if (soloish()) { ME.id = 'me'; ME.role = ROLES.me.role; ME.word = ROLES.me.word; go('s-reveal'); }
  else go('s-pass');
}
/* ============ clue phase ============ */
function beginClues() {
  S.phase = 'clue'; S.turn = 0; startTurnTimer();
  if (S.mode === 'online') pushState();
  go('s-clue'); tickBots();
}
function submitClue(pid, text) {
  if (S.phase !== 'clue' || myTurnPid() !== pid) return;
  const raw = (text || '').trim().slice(0, 26);
  if (SET.log === 'type' && !raw && !isBot(pid)) return;
  S.clues.push({ pid, t: raw || '🗣', r: S.round });
  sfx.ok(); nextTurn();
}
function nextTurn() {
  let i = S.turn + 1;
  while (i < S.order.length && !pById(S.order[i]).alive) i++;
  if (i < S.order.length) { S.turn = i; startTurnTimer(); if (S.mode === 'online') pushState(); go('s-clue'); tickBots(); return; }
  if (S.round >= S.voteAt) { toVoteStage(); return; }
  S.round++; S.turn = S.order.findIndex(id => pById(id).alive); startTurnTimer();
  if (S.mode === 'online') pushState();
  go('s-clue'); tickBots();
}
function toVoteStage() {
  stopTimer();
  if (SET.discT > 0 && !soloish()) {
    S.phase = 'discuss'; setTimer(SET.discT, () => startVote());
    if (S.mode === 'online') pushState();
    go('s-discuss');
  } else startVote();
}
/* ============ voting ============ */
function startVote() {
  stopTimer(); S.phase = 'vote'; S.votes = {}; S.players.forEach(p => p.voted = false); S.localTally = {};
  if (S.mode === 'online') { setTimer(45, () => resolveVote()); pushState(); }
  go('s-vote'); tickBots();
}
function castVote(voter, target) {
  if (S.phase !== 'vote') return;
  S.votes[voter] = target;
  const p = S.players.find(x => x.id === voter); if (p) p.voted = true;
  sfx.vote();
  if (S.mode === 'online') { pushState(); if (alive().every(p => p.voted)) setTimeout(resolveVote, 400); }
  else if (soloish()) { render(); if (alive().every(p => p.voted)) setTimeout(resolveVote, 650); }
}
function tallyOf() { const t = {}; Object.values(S.votes).forEach(v => { if (v && v !== 'skip') t[v] = (t[v] || 0) + 1; }); return t; }
function resolveVote() {
  if (S.phase !== 'vote') return; stopTimer();
  const tl = onePhone() ? (S.localTally || {}) : tallyOf();
  let top = null, max = 0, tie = false;
  Object.entries(tl).forEach(([id, c]) => { if (c > max) { max = c; top = id; tie = false; } else if (c === max && c > 0) tie = true; });
  S.tally = tl; S.phase = 'eject';
  if (!top || max === 0 || tie) S.ejected = null;
  else { S.ejected = top; pById(top).alive = false; }
  S.ejectRole = S.ejected ? (ROLES[S.ejected] || {}).role : null;
  if (S.mode === 'online') { S.ejectRoleShown = S.ejectRole; pushState(); }
  (S.ejectRole === 'spy' ? sfx.civ : sfx.spy)();
  go('s-eject');
}
function afterEject() {
  const spiesLeft = S.players.filter(p => p.alive && (ROLES[p.id] || {}).role === 'spy').length;
  const civsLeft = S.players.filter(p => p.alive && (ROLES[p.id] || {}).role === 'civ').length;
  if (S.ejectRole === 'spy' && spiesLeft === 0) {
    if (SET.steal) return startGuess(S.ejected);
    return endRound('civ');
  }
  if (civsLeft <= spiesLeft) return endRound('spy');
  if (S.round >= 8) return endRound('spy');
  S.round++; S.voteAt = S.round; S.phase = 'clue';
  S.turn = S.order.findIndex(id => pById(id).alive); startTurnTimer();
  if (S.mode === 'online') pushState();
  go('s-clue'); tickBots();
}
/* ============ steal ============ */
function startGuess(spyId) {
  S.phase = 'guess'; S.guesser = spyId;
  const cat = soloish() ? (soloCatById(S.catId) || S.catObj) : (S.catObj || catById(S.catId) || CATS[0]);
  const others = shuffle((cat.words || []).filter(w => w.a !== S.wordObj.a)).slice(0, 7);
  S.guessOpts = shuffle([S.wordObj].concat(others));
  if (S.mode === 'online') { setTimer(30, () => doGuess(null)); pushState(); }
  go('s-guess'); tickBots();
}
function doGuess(w) {
  if (S.phase !== 'guess') return; stopTimer();
  S.guessed = w ? wplain(w) : '—';
  endRound(w && norm(w.a) === norm(S.wordObj.a) ? 'steal' : 'civ');
}
/* ============ end of round ============ */
function endRound(result) {
  stopTimer(); S.phase = 'end'; S.result = result;
  S.players.forEach(p => {
    const r = (ROLES[p.id] || {}).role;
    if (result === 'civ') { if (r === 'civ') p.score += 2; }
    else if (result === 'spy') { if (r === 'spy') p.score += 4; }
    else { p.score += r === 'spy' ? 3 : 1; }
  });
  S.revealRoles = Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v.role]));
  if (S.mode === 'online') pushState();
  recordStats(result);
  (result === 'civ' ? sfx.win : sfx.lose)();
  go('s-end');
  if (result === 'civ' || result === 'steal') burst(result === 'civ' ? 'civ' : 'spy');
}
function recordStats(result) {
  const myRole = S.mode === 'online' || soloish() ? (ROLES[ME.id] || {}).role : null;
  if (!myRole) { ST.games++; saveST(); checkAch(); return; }
  ST.games++;
  const iWon = myRole === 'spy' ? (result !== 'civ') : (result === 'civ');
  if (iWon) ST.wins++;
  if (myRole === 'spy') { ST.spyG++; if (iWon) ST.spyW++; if (result === 'steal') ST.steals++; }
  else { ST.civG++; if (iWon) { ST.civW++; ST.caught++; } }
  if (S.mode === 'online') ST.onlineDone = true;
  saveST();
  if (S.mode === 'daily') finishDaily(iWon, myRole);
  checkAch();
}
function finishDaily(won, role) {
  const k = todayKey();
  if (DAILY.day === k) return;
  const prev = DAILY.day ? Number(DAILY.day) : 0;
  DAILY.streak = (prev === Number(k) - 1) ? (DAILY.streak || 0) + 1 : 1;
  DAILY.best = Math.max(DAILY.best || 0, DAILY.streak);
  DAILY.day = k; DAILY.res = won ? 'won' : 'lost'; DAILY.role = role;
  saveDaily(); checkAch();
}
/* ============ timers ============ */
let tvId = null;
function setTimer(sec, cb) {
  S.tleft = sec; S.tmax = sec; stopTimer();
  S._end = Date.now() + sec * 1000; S._cb = cb;
  tvId = setInterval(() => {
    const left = Math.max(0, Math.ceil((S._end - Date.now()) / 1000));
    if (left !== S.tleft) { S.tleft = left; if (left <= 5 && left > 0) sfx.tick(); paintTimers(); }
    if (left <= 0) { const cb2 = S._cb; stopTimer(); if (isHost() && cb2) cb2(); }
  }, 250);
  paintTimers();
}
function stopTimer() { if (tvId) clearInterval(tvId); tvId = null; }
function startTurnTimer() {
  if (SET.turnT > 0 && isHost() && !isBot(myTurnPid())) setTimer(SET.turnT, () => { if (S.phase === 'clue') submitClue(myTurnPid(), ''); });
  else { stopTimer(); S.tleft = 0; S.tmax = 0; }
}
function syncTimer(tleft, tmax) {
  if (!tleft) { stopTimer(); S.tleft = 0; S.tmax = tmax || 0; return; }
  S.tmax = tmax || tleft; S._end = Date.now() + tleft * 1000; S._cb = null;
  if (!tvId) tvId = setInterval(() => {
    const left = Math.max(0, Math.ceil((S._end - Date.now()) / 1000));
    if (left !== S.tleft) { S.tleft = left; paintTimers(); }
    if (left <= 0) stopTimer();
  }, 250);
  paintTimers();
}
function paintTimers() {
  const pct = S.tmax ? Math.max(0, S.tleft / S.tmax * 100) : 100;
  const set = (bar, lab) => {
    const b = $(bar);
    if (b) { b.style.display = S.tmax ? 'block' : 'none'; b.querySelector('i').style.width = pct + '%'; b.classList.toggle('warn', S.tleft <= 10); }
    const l = lab && $(lab); if (l) l.textContent = S.tmax ? S.tleft : '';
  };
  set('#cl-tbar', '#cl-timer'); set('#ds-tbar', '#ds-timer'); set('#vt-tbar', '#vt-timer'); set('#gs-tbar', null);
}
