/* ============ bot scheduling ============ */
let BOTT = [];
function clearBots() { BOTT.forEach(clearTimeout); BOTT = []; }
function botDelay() { return 900 + Math.random() * 1300; }
function tickBots() {
  clearBots();
  if (!soloish()) return;
  const gen = S.gameNo + ':' + S.phase + ':' + S.round + ':' + S.turn + ':' + S.clues.length;
  S._gen = gen;
  const ok = () => S._gen === gen && CUR !== 's-home';
  if (S.phase === 'clue') {
    const pid = myTurnPid();
    if (!pid || !isBot(pid)) return;
    S.thinking = pid; render();
    BOTT.push(setTimeout(() => {
      if (!ok()) return;
      S.thinking = null;
      submitClue(pid, botClue(pid));
    }, botDelay()));
  } else if (S.phase === 'vote') {
    alive().filter(p => isBot(p.id)).forEach((p, i) => {
      BOTT.push(setTimeout(() => {
        if (!ok() || S.phase !== 'vote' || S.votes[p.id]) return;
        castVote(p.id, botVote(p.id));
      }, 700 + i * (450 + Math.random() * 500)));
    });
  } else if (S.phase === 'guess') {
    if (!isBot(S.guesser)) return;
    BOTT.push(setTimeout(() => { if (ok() && S.phase === 'guess') doGuess(botGuessWord()); }, 1800));
  }
}
/* ============ solo / daily setup ============ */
const AVS = ['🙂','😎','🤠','🧐','😼','🐯','🦚','🐘','🦁','🐒','🦜','🐊','🦋','🐝','🐢','🦉','🐧','🐬','🦄','🐙','🍁','⭐'];
function startSolo(daily) {
  const rng = daily ? mulberry(hashStr('jasoos-' + todayKey())) : null;
  const nBots = daily ? 5 : clamp(SET.bots, 2, 9);
  S.mode = daily ? 'daily' : 'solo';
  S.bots = {}; S.players = [];
  const me = jget('jas.me', {});
  ME.id = 'me'; ME.name = me.name || (LANG === 'hi' ? 'तुम' : 'You'); ME.av = me.av || '😎';
  S.players.push({ id: 'me', name: ME.name, av: ME.av, score: 0, alive: true, voted: false });
  const order = daily ? shuffle(BOTNAMES.map((_, i) => i), mulberry(hashStr('b' + todayKey()))) : shuffle(BOTNAMES.map((_, i) => i));
  for (let i = 0; i < nBots; i++) {
    const idx = order[i % order.length];
    const id = 'b' + i;
    S.bots[id] = true;
    S.players.push({ id, name: botName(idx), av: BOTAV[idx % BOTAV.length], score: 0, alive: true, voted: false, bot: true });
  }
  const opts = { rng: rng || undefined };
  if (daily) { opts.spies = 1; if (rng && rng() < .34) opts.forceSpy = 'me'; }
  else if (SET.soloSpy === 'spy') opts.forceSpy = 'me';
  else opts.spies = clamp(SET.spies, 1, Math.max(1, Math.floor((S.players.length - 1) / 2)));
  newGame(false, opts);
}
/* ============ visual fx ============ */
const FX = { c: null, x: null, p: [], on: false };
function fxInit() {
  FX.c = $('#fx'); if (!FX.c) return;
  FX.x = FX.c.getContext('2d');
  const size = () => {
    const d = Math.min(2, devicePixelRatio || 1);
    FX.c.width = innerWidth * d; FX.c.height = innerHeight * d;
    FX.c.style.width = innerWidth + 'px'; FX.c.style.height = innerHeight + 'px';
    FX.d = d;
  };
  size(); addEventListener('resize', size);
}
function burst(kind) {
  if (!FX.x || document.body.classList.contains('nomo')) return;
  const cols = kind === 'civ' ? ['#f5b83d', '#22b8a6', '#3ecf8e', '#ffd98a'] : ['#e0457b', '#ff7a2f', '#8b5cf6', '#f5b83d'];
  for (let i = 0; i < 90; i++) {
    FX.p.push({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35,
      vx: (Math.random() - .5) * 9, vy: -5 - Math.random() * 9,
      s: 3 + Math.random() * 6, c: rnd(cols), r: Math.random() * 6, vr: (Math.random() - .5) * .4, l: 1,
    });
  }
  if (!FX.on) { FX.on = true; requestAnimationFrame(fxFrame); }
}
function fxFrame() {
  const x = FX.x, d = FX.d || 1;
  x.clearRect(0, 0, FX.c.width, FX.c.height);
  FX.p = FX.p.filter(p => p.l > 0);
  FX.p.forEach(p => {
    p.vy += .28; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.l -= .008;
    x.save(); x.globalAlpha = Math.max(0, p.l); x.translate(p.x * d, p.y * d); x.rotate(p.r);
    x.fillStyle = p.c; x.fillRect(-p.s * d / 2, -p.s * d / 2, p.s * d, p.s * d * .6); x.restore();
  });
  if (FX.p.length) requestAnimationFrame(fxFrame);
  else { FX.on = false; x.clearRect(0, 0, FX.c.width, FX.c.height); }
}
function flyReact(emoji, x, y) {
  const el = document.createElement('div');
  el.className = 'rfly'; el.textContent = emoji;
  el.style.left = (x - 15) + 'px'; el.style.top = (y - 20) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
/* ============ mandala art ============ */
function mandala(el) {
  if (!el) return;
  const R = 100; let p = '';
  for (let ring = 0; ring < 4; ring++) {
    const r = 22 + ring * 22, n = 8 + ring * 6;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, x = R + Math.cos(a) * r, y = R + Math.sin(a) * r;
      p += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4 - ring * .6).toFixed(1)}" fill="#f5b83d"/>`;
    }
    p += `<circle cx="${R}" cy="${R}" r="${r}" fill="none" stroke="#f5b83d" stroke-width=".8"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    p += `<path d="M100 100 Q${100 + Math.cos(a - .18) * 70} ${100 + Math.sin(a - .18) * 70} ${100 + Math.cos(a) * 94} ${100 + Math.sin(a) * 94} Q${100 + Math.cos(a + .18) * 70} ${100 + Math.sin(a + .18) * 70} 100 100" fill="none" stroke="#f5b83d" stroke-width=".7"/>`;
  }
  el.innerHTML = p;
}
