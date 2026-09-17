/* ============ static text ============ */
function paintStatic() {
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $('#pname').placeholder = t('set.addname');
  $('#pe-name').placeholder = t('pk.nameph');
  $('#pe-w').placeholder = t('pk.wordph');
}
/* ============ local roster ============ */
const QNAMES = [['Rahul','राहुल'],['Priya','प्रिया'],['Arjun','अर्जुन'],['Neha','नेहा'],['Vicky','विक्की'],
  ['Meera','मीरा'],['Aisha','आयशा'],['Karan','करण'],['Simran','सिमरन'],['Rohit','रोहित']];
const qName = i => LANG === 'hi' ? QNAMES[i][1] : QNAMES[i][0];
let LOCAL = jget('jas.roster', null) || [0, 1, 2, 3].map(i => ({ id: 'p' + i, name: qName(i), av: AVS[i] }));
const saveRoster = () => jset('jas.roster', LOCAL);
let nextPid = LOCAL.length + 1;
/* ============ settings ui ============ */
function seg(key, opts) {
  return '<div class="seg">' + opts.map(o =>
    `<button data-set="${key}" data-val="${o[0]}" class="${String(SET[key]) === String(o[0]) ? 'on' : ''}">${esc(o[1])}</button>`).join('') + '</div>';
}
const stp = key => `<div class="stp"><button data-step="${key}" data-d="-1" aria-label="minus">−</button><b>${SET[key]}</b><button data-step="${key}" data-d="1" aria-label="plus">+</button></div>`;
const srow = (lab, sub, ctl) => `<div class="srow"><div><div class="lab">${lab}</div><div class="xs dim">${sub}</div></div>${ctl}</div>`;
function settingsHTML(editable, kind) {
  let h = `<div class="up gold">${t('ui.settings')}</div>`;
  if (kind === 'solo') {
    h += srow(t('solo.count'), t('solo.sub', { n: SET.bots }).slice(0, 0) || '&nbsp;', stp('bots'));
    h += srow(t('set.diff'), t('set.diffS'), seg('diff', [['easy', t('set.easy')], ['normal', t('set.normal')], ['hard', t('set.hard')]]));
    h += srow(t('solo.spy'), t('solo.spyS'), seg('soloSpy', [['random', t('solo.random')], ['spy', t('ui.jasoos')]]));
  } else {
    h += srow(t('set.spies'), t('set.spiesS'), stp('spies'));
  }
  h += srow(t('set.hide'), t('set.hideS'), seg('hide', [['blank', t('set.blank')], ['decoy', t('set.decoy')]]));
  h += srow(t('set.rounds'), t('set.roundsS'), stp('rounds'));
  if (kind !== 'solo') {
    h += srow(t('set.turnT'), t('set.turnTS'), seg('turnT', [[0, t('ui.off')], [20, '20s'], [30, '30s'], [45, '45s']]));
    h += srow(t('set.discT'), t('set.discTS'), seg('discT', [[0, t('ui.off')], [60, '60s'], [90, '90s'], [120, '2m']]));
    h += srow(t('set.log'), t('set.logS'), seg('log', [['type', t('set.type')], ['talk', t('set.talk')]]));
  }
  h += srow(t('set.steal'), t('set.stealS'), seg('steal', [[true, t('ui.on')], [false, t('ui.off')]]));
  h += srow(t('set.script'), t('set.scriptS'), seg('script', [['both', t('set.both')], ['hi', 'हिंदी'], ['en', 'A-Z']]));
  if (!editable) h += `<div class="xs dim mt">${t('set.hostonly')}</div>`;
  return h;
}
function wireSettings(root, editable) {
  root.querySelectorAll('[data-set]').forEach(b => b.onclick = () => {
    if (!editable) return toast(t('set.hostonly'));
    const k = b.dataset.set; let v = b.dataset.val;
    if (v === 'true') v = true; else if (v === 'false') v = false; else if (/^-?\d+$/.test(v)) v = +v;
    SET[k] = v; saveSet(); sfx.tap(); render();
    if (S.mode === 'online' && NET.host) pushState();
  });
  root.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
    if (!editable) return toast(t('set.hostonly'));
    const k = b.dataset.step, d = +b.dataset.d, lim = { spies: [1, 3], rounds: [1, 4], bots: [2, 9] }[k];
    SET[k] = clamp(SET[k] + d, lim[0], lim[1]); saveSet(); sfx.tap(); render();
    if (S.mode === 'online' && NET.host) pushState();
  });
}
function catsHTML(solo) {
  const list = solo ? SOLOCATS : CATS;
  let h = list.map(c => `<button class="chip ${SET.cats.includes(c.id) ? 'on' : ''}" data-cat="${c.id}">${c.e} ${esc(catName(c))}</button>`).join('');
  if (!solo) (jget('jas.packs', []) || []).forEach(p => {
    h += `<button class="chip ${SET.cats.includes('pk:' + p.id) ? 'on' : ''}" data-cat="pk:${p.id}">📚 ${esc(p.name)}</button>`;
  });
  return h;
}
function wireCats(root, editable) {
  root.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => {
    if (!editable) return toast(t('set.hostonly'));
    const id = b.dataset.cat, i = SET.cats.indexOf(id);
    if (i >= 0) { if (SET.cats.length <= 1) return toast(t('set.catmin')); SET.cats.splice(i, 1); }
    else SET.cats.push(id);
    saveSet(); sfx.tap(); render();
    if (S.mode === 'online' && NET.host) pushState();
  });
}
/* ============ home ============ */
let TIPT = 0, TIPI = 0;
function startTips() {
  clearInterval(TIPT);
  const el = $('#marq'), tips = [1, 2, 3, 4, 5, 6, 7, 8].map(i => t('tip.' + i));
  const show = () => {
    el.classList.remove('on');
    setTimeout(() => { el.textContent = '💡 ' + tips[TIPI % tips.length]; el.classList.add('on'); TIPI++; }, 320);
  };
  TIPI = Math.floor(Math.random() * tips.length);
  show();
  TIPT = setInterval(() => { if (!document.hidden && $('#s-home').classList.contains('on')) show(); }, 5200);
}
function renderHome() {
  startTips();
  $('#h-sub').textContent = t('home.sub');
  $('#h-pills').innerHTML = [t('home.p1'), t('home.p2', { n: WORDN }), t('home.p3', { n: CATS.length }), t('home.p4')]
    .map(x => `<span class="pill y">${esc(x)}</span>`).join('');
  $('#h-snd').textContent = SND ? '🔊' : '🔇';
  const dayDone = DAILY.day === todayKey();
  const st = DAILY.streak || 0;
  $('#h-streak').style.display = st > 0 ? 'inline-flex' : 'none';
  $('#h-streakn').textContent = st;
  const M = [
    ['hero', '🪔', t('home.m1t'), t('home.m1s'), 'local'],
    ['day', '🗓️', t('home.m5t'), dayDone ? t('home.m5done', { n: st }) : t('home.m5s'), 'daily'],
    ['', '📡', t('home.m2t'), t('home.m2s'), 'create'],
    ['', '🔑', t('home.m3t'), t('home.m3s'), 'join'],
    ['', '🤖', t('home.m4t'), t('home.m4s', { n: SET.bots }), 'solo'],
  ];
  $('#h-modes').innerHTML = M.map(m =>
    `<button class="mode ${m[0]}" data-mode="${m[4]}"><div class="ic">${m[1]}</div>
      <div class="f1"><div class="t1">${esc(m[2])}</div><div class="t2">${esc(m[3])}</div></div>
      <div class="arw">›</div>${m[4] === 'daily' && !dayDone ? `<div class="nb">${t('ui.new')}</div>` : ''}</button>`).join('');
  $('#h-modes').querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
    sfx.tap();
    const m = b.dataset.mode;
    if (m === 'local') { S.mode = 'local'; go('s-setup'); }
    else if (m === 'solo') { go('s-solo'); }
    else if (m === 'daily') { go('s-daily'); }
    else if (m === 'create') { if (!isOnline()) return toast(t('sh.offline'), 3200); createRoom(); }
    else if (m === 'join') { if (!isOnline()) return toast(t('sh.offline'), 3200); joinSheet(); }
  });
}
/* ============ local setup ============ */
function renderSetup() {
  $('#pcount').textContent = LOCAL.length + ' / 12';
  $('#setup-players').innerHTML = LOCAL.map((p, i) => `
    <div class="prow"><button class="av" data-av="${i}" aria-label="avatar">${p.av}</button>
      <div class="nm">${esc(p.name)}</div>
      <button class="iconbtn" data-del="${i}" style="width:32px;height:32px;font-size:15px" aria-label="remove">✕</button></div>`).join('')
    || `<div class="dim sm ctr">${t('set.empty')}</div>`;
  $('#setup-players').querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    LOCAL.splice(+b.dataset.del, 1); saveRoster(); sfx.tap(); render();
  });
  $('#setup-players').querySelectorAll('[data-av]').forEach(b => b.onclick = () => {
    const p = LOCAL[+b.dataset.av]; p.av = AVS[(AVS.indexOf(p.av) + 1) % AVS.length]; saveRoster(); sfx.tap(); render();
  });
  const used = LOCAL.map(p => p.name);
  $('#quickadd').innerHTML = QNAMES.map((_, i) => qName(i)).filter(n => !used.includes(n)).slice(0, 6)
    .map(n => `<button class="chip mini" data-quick="${esc(n)}">+ ${esc(n)}</button>`).join('');
  $('#quickadd').querySelectorAll('[data-quick]').forEach(b => b.onclick = () => addPlayer(b.dataset.quick));
  const sc = $('#settings-card'); sc.innerHTML = settingsHTML(true); wireSettings(sc, true);
  $('#cats').innerHTML = catsHTML(false); wireCats($('#cats'), true);
  const ok = LOCAL.length >= 3;
  $('#b-startlocal').disabled = !ok;
  $('#b-startlocal').textContent = ok ? t('ui.start') + ' →' : t('set.need3b');
}
function addPlayer(name) {
  name = (name || '').trim().slice(0, 12);
  if (!name) return toast(t('set.typename'));
  if (LOCAL.length >= 12) return toast(t('set.max'));
  if (LOCAL.some(p => p.name.toLowerCase() === name.toLowerCase())) return toast(t('set.dupe'));
  LOCAL.push({ id: 'p' + (nextPid++), name, av: AVS[LOCAL.length % AVS.length] });
  saveRoster(); sfx.ok(); $('#pname').value = ''; render();
}
/* ============ solo setup ============ */
function renderSolo() {
  $('#solo-sub').textContent = t('solo.sub', { n: SET.bots });
  const sc = $('#solo-set'); sc.innerHTML = settingsHTML(true, 'solo'); wireSettings(sc, true);
  $('#solo-cats').innerHTML = catsHTML(true); wireCats($('#solo-cats'), true);
}
/* ============ daily ============ */
function renderDaily() {
  const done = DAILY.day === todayKey();
  $('#day-no').textContent = t('day.no', { n: dayNo() });
  $('#day-ico').textContent = done ? (DAILY.res === 'won' ? '🏆' : '🗓️') : '🗓️';
  $('#day-h').textContent = done ? t('day.played') : t('day.title');
  $('#day-sub').textContent = done ? t('day.tomorrow') : t('day.sub');
  $('#day-cur').textContent = DAILY.streak || 0;
  $('#day-best').textContent = DAILY.best || 0;
  $('#day-done').style.display = done ? 'block' : 'none';
  if (done) {
    const role = DAILY.role === 'spy' ? t('ui.jasoos') : t('ui.nagrik');
    $('#day-donetxt').textContent = role + ' · ' + (DAILY.res === 'won' ? t('day.won') : t('day.lost'));
  }
  $('#day-act').innerHTML = done
    ? `<button class="btn wa" id="day-share">${t('ui.whatsapp')}</button>
       <button class="btn ghost mt1" id="day-play">${t('day.again')}</button>`
    : `<button class="btn p" id="day-play">${t('solo.begin')} →</button>`;
  const pb = $('#day-play'); if (pb) pb.onclick = () => { sfx.ok(); startSolo(true); };
  const sb = $('#day-share'); if (sb) sb.onclick = () => shareDaily();
}
/* ============ pass ============ */
function renderPass() {
  const pid = S.order[S.revealIdx], p = pById(pid);
  $('#pass-av').textContent = p.av;
  $('#pass-name').textContent = p.name;
  $('#pass-note').textContent = t('pass.note') + ' (' + (S.revealIdx + 1) + '/' + S.order.length + ')';
  $('#pass-dots').innerHTML = S.order.map((_, i) => `<i class="${i <= S.revealIdx ? 'on' : ''}"></i>`).join('');
  $('#b-pass-ok').innerHTML = t('pass.iam', { name: '<b>' + esc(p.name) + '</b>' });
}
/* ============ reveal ============ */
function renderReveal() {
  const pid = onePhone() ? S.order[S.revealIdx] : ME.id;
  const r = onePhone() ? ROLES[pid] : { role: ME.role, word: ME.word, mates: (ROLES[ME.id] || {}).mates };
  const p = pById(pid);
  $('#rev-title').textContent = onePhone() ? t('rev.of', { name: p.name }) : t('rev.mine');
  const cl = catLabel(S.catObj || { e: '', nm: ['', '', ''] });
  $('#rev-cat').textContent = cl; $('#cf-cat').textContent = cl;
  const front = $('#cardfront');
  const spy = (r || {}).role === 'spy';
  front.className = 'face front ' + (spy ? 'spy' : 'civ');
  if (spy) {
    $('#cf-role').innerHTML = '<span class="rose">🔍 ' + t('ui.jasoos') + '</span>';
    $('#cf-word').innerHTML = r.word ? wtext(r.word) : `<span style="opacity:.55">${t('rev.noword')}</span>`;
    const mates = (r.mates || []).filter(m => S.players.some(x => x.id === m));
    $('#cf-hint').textContent = mates.length ? t('rev.jodi', { name: mates.map(m => pById(m).name).join(', ') })
      : (r.word ? t('rev.decoy') : t('spy.h' + (1 + Math.floor(Math.random() * 3))));
  } else {
    $('#cf-role').innerHTML = '<span class="tealc">🪔 ' + t('ui.nagrik') + '</span>';
    $('#cf-word').innerHTML = wtext((r || {}).word);
    $('#cf-hint').textContent = t('civ.h' + (1 + Math.floor(Math.random() * 3)));
  }
  const f = $('#flip'), btn = $('#b-rev-next');
  if (!S._flipKeep) { f.classList.remove('open'); btn.style.visibility = 'hidden'; }
  if (onePhone()) {
    btn.textContent = S.revealIdx >= S.order.length - 1 ? t('rev.allseen') + ' →' : t('rev.hide') + ' →';
    btn.disabled = false;
  } else if (soloish()) {
    btn.textContent = t('rev.ok') + ' →'; btn.disabled = false;
  } else if (S._iReady) {
    btn.style.visibility = 'visible'; btn.disabled = true;
    btn.innerHTML = `<span class="spin"></span> ${t('rev.others', { n: S.readyN || 0, m: S.players.length })}`;
  } else { btn.disabled = false; btn.textContent = t('rev.ok') + ' →'; }
}
/* ============ clue feed ============ */
function feedHTML() {
  let h = '', last = 0;
  S.clues.forEach(c => {
    if (c.r !== last) { last = c.r; h += `<div class="rlabel"><i></i><span>${t('ui.round')} ${c.r}</span><i></i></div>`; }
    const q = pById(c.pid);
    h += `<div class="cl ${c.pid === ME.id ? 'mine' : ''}"><div class="av sm ${q.bot ? 'bot' : ''}">${q.av}</div>
      <div class="f1"><div class="who">${esc(q.name)}</div><div class="txt">${esc(c.t)}</div></div></div>`;
  });
  return h;
}
function renderClue() {
  $('#cl-round').textContent = S.round;
  $('#cl-of').textContent = S.voteAt > 1 ? ' / ' + S.voteAt : '';
  const pid = myTurnPid(), p = pById(pid);
  const mine = onePhone() || pid === ME.id;
  $('#cl-av').textContent = p.av;
  $('#cl-av').className = 'av ' + (p.bot ? 'bot' : '');
  $('#cl-lab').textContent = mine && !onePhone() ? t('clue.myturn') : t('clue.turn');
  $('#cl-who').textContent = p.name + (!onePhone() && pid === ME.id ? ' (' + t('ui.you') + ')' : '');
  const feed = $('#cl-feed');
  feed.innerHTML = feedHTML();
  $('#cl-empty').style.display = S.clues.length ? 'none' : 'block';
  feed.parentElement.scrollTop = feed.parentElement.scrollHeight;
  const act = $('#cl-action');
  const prev = $('#clue-in'), tk = S.gameNo + ':' + S.round + ':' + S.turn;
  const keep = prev && S._turnKey === tk ? prev.value : '';
  S._turnKey = tk;
  if (mine && SET.log === 'type') {
    act.innerHTML = `<div class="row gap6"><input class="inp" id="clue-in" maxlength="26" placeholder="${onePhone() ? esc(t('clue.phl', { name: p.name })) : esc(t('clue.ph'))}" autocomplete="off" enterkeyhint="send">
      <button class="btn p sm2 fn" id="b-clue" style="padding:14px 18px">${t('clue.send')}</button></div>
      <div class="xs dim ctr" style="margin-top:8px">${t('clue.rule')}</div>`;
    const inp = $('#clue-in'); inp.value = keep;
    if (!onePhone()) setTimeout(() => inp.focus(), 60);
    const send = () => {
      const v = inp.value.trim();
      if (!v) return toast(t('clue.write'));
      const w = (ROLES[pid] || {}).word || ME.word;
      if (w && (norm(v).includes(norm(w.a)) || norm(v).includes(norm(w.h)))) return toast(t('clue.banned'));
      if (onePhone() || soloish()) submitClue(pid, v); else NET.act({ a: 'clue', t: v });
      inp.value = '';
    };
    $('#b-clue').onclick = send;
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); send(); } };
  } else if (mine) {
    act.innerHTML = `<button class="btn p" id="b-said">${onePhone() ? esc(t('clue.said', { name: p.name })) : t('clue.isaid')} →</button>`;
    $('#b-said').onclick = () => { if (onePhone() || soloish()) submitClue(pid, ''); else NET.act({ a: 'clue', t: '' }); };
  } else {
    const msg = soloish() && S.thinking === pid ? t('solo.thinking', { name: p.name }) : t('clue.wait', { name: p.name });
    act.innerHTML = `<div class="card tight ctr"><span class="spin"></span> <span class="sm dim">${esc(msg)}</span></div>`;
  }
}
