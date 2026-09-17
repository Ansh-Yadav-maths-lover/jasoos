/* ============ discuss ============ */
const REACTS = ['🤨', '😂', '😱', '🤝', '🔍', '🙅'];
function renderDiscuss() {
  $('#ds-feed').innerHTML = feedHTML() || `<div class="dim sm ctr">${t('dis.noclues')}</div>`;
  const rr = $('#ds-reacts');
  rr.style.display = S.mode === 'online' ? 'flex' : 'none';
  if (S.mode === 'online' && !rr.dataset.wired) {
    rr.dataset.wired = '1';
    rr.innerHTML = REACTS.map(r => `<button data-r="${r}">${r}</button>`).join('');
    rr.querySelectorAll('[data-r]').forEach(b => b.onclick = e => {
      const r = b.dataset.r;
      const box = b.getBoundingClientRect();
      flyReact(r, box.left + box.width / 2, box.top);
      sfx.tap(); NET.bcast({ k: 'react', r, uid: ME.uid });
    });
  }
  $('#b-tovote').style.display = isHost() ? 'flex' : 'none';
}
/* ============ vote ============ */
function lastClueOf(pid) {
  const c = S.clues.filter(x => x.pid === pid).slice(-1)[0];
  return c ? c.t : '';
}
function renderVote() {
  const list = $('#vt-list'), act = $('#vt-action'), av = alive();
  if (onePhone()) {
    S.localTally = S.localTally || {};
    const cast = Object.values(S.localTally).reduce((a, b) => a + b, 0);
    const left = av.length - cast;
    $('#vt-title').textContent = t('vote.hands');
    $('#vt-prog').textContent = left > 0 ? t('vote.left', { n: left }) : t('vote.alldone');
    $('#vt-note').textContent = t('vote.tapcount');
    list.innerHTML = '<div class="vgrid">' + av.map(p => `<button class="vcell ${S.localTally[p.id] ? 'sel' : ''}" data-v="${p.id}">
      <div class="av">${p.av}</div><div class="nm">${esc(p.name)}</div>
      <div class="cl2">${esc(lastClueOf(p.id))}</div>
      ${S.localTally[p.id] ? `<div class="cnt">${S.localTally[p.id]}</div>` : ''}</button>`).join('') +
      `<button class="vcell" data-v="skip"><div class="av">🙈</div><div class="nm">${t('vote.nobody')}</div>
        <div class="cl2">&nbsp;</div>${S.localTally.skip ? `<div class="cnt">${S.localTally.skip}</div>` : ''}</button></div>`;
    list.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
      if (left <= 0) return toast(t('vote.full'), 2600);
      const k = b.dataset.v; S.localTally[k] = (S.localTally[k] || 0) + 1; sfx.vote(); buzz(9); render();
    });
    act.innerHTML = `<div class="row gap6"><button class="btn ghost" id="b-vreset" style="flex:1">${t('vote.reset')}</button>
      <button class="btn r" id="b-vdone" style="flex:2" ${cast === 0 ? 'disabled' : ''}>${t('vote.result')}</button></div>`;
    $('#b-vreset').onclick = () => { S.localTally = {}; sfx.tap(); render(); };
    $('#b-vdone').onclick = () => resolveVote();
  } else {
    const mine = S.votes[ME.id], done = av.filter(p => p.voted).length;
    const iAmOut = !av.some(p => p.id === ME.id);
    $('#vt-title').textContent = t('vote.title');
    $('#vt-prog').textContent = t('vote.progress', { n: done, m: av.length });
    $('#vt-note').textContent = iAmOut ? t('vote.out') : (mine ? t('vote.locked') : t('vote.who'));
    const canPick = !mine && !iAmOut;
    list.innerHTML = '<div class="vgrid">' + av.map(p => `<button class="vcell ${mine === p.id ? 'sel' : ''} ${p.id === ME.id ? 'self' : ''}" data-v="${p.id}" ${canPick && p.id !== ME.id ? '' : 'disabled'}>
      <div class="av ${p.bot ? 'bot' : ''}">${p.av}</div>
      <div class="nm">${esc(p.name)}${p.id === ME.id ? ' ·' + t('ui.you') : ''}</div>
      <div class="cl2">${esc(lastClueOf(p.id))}</div>
      ${p.voted ? '<div class="cnt">✓</div>' : ''}</button>`).join('') +
      (canPick ? `<button class="vcell" data-v="skip"><div class="av">🙈</div><div class="nm">${t('vote.nobody')}</div><div class="cl2">&nbsp;</div></button>` : '') + '</div>';
    if (canPick) list.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
      buzz(12);
      if (soloish()) castVote(ME.id, b.dataset.v);
      else { NET.act({ a: 'vote', t: b.dataset.v }); sfx.vote(); }
    });
    act.innerHTML = mine || iAmOut ? `<div class="card tight ctr sm dim"><span class="spin"></span> ${t('vote.busy')}</div>` : '';
  }
}
/* ============ eject ============ */
function renderEject() {
  const tl = S.tally || {}, none = !S.ejected;
  const p = none ? null : pById(S.ejected);
  $('#ej-pre').textContent = none ? t('ej.prenone') : t('ej.pre');
  $('#ej-av').textContent = none ? '🤷' : p.av;
  $('#ej-name').textContent = none ? t('ej.tie') : p.name;
  const role = S.mode === 'online' ? S.ejectRoleShown : S.ejectRole;
  const v = $('#ej-verdict');
  if (none) { v.textContent = t('ej.nonev'); v.className = 'bigres gold'; $('#ej-note').textContent = t('ej.nonen'); }
  else if (role === 'spy') { v.innerHTML = '🔍 ' + t('ej.wasspy'); v.className = 'bigres res-civ'; $('#ej-note').textContent = t('ej.wasspyn'); }
  else { v.innerHTML = '🪔 ' + t('ej.wasciv'); v.className = 'bigres res-spy'; $('#ej-note').textContent = t('ej.wascivn'); }
  $('#ej-tally').innerHTML = Object.keys(tl).length ? Object.entries(tl).sort((a, b) => b[1] - a[1]).map(([id, c]) =>
    `<div class="prow"><div class="av sm">${id === 'skip' ? '🙈' : pById(id).av}</div>
      <div class="nm sm">${id === 'skip' ? t('vote.nobody') : esc(pById(id).name)}</div><div class="vcount">${c}</div></div>`).join('') : '';
  $('#b-ej-next').style.display = isHost() ? 'flex' : 'none';
}
/* ============ guess ============ */
function renderGuess() {
  const g = pById(S.guesser), mine = onePhone() || S.guesser === ME.id;
  $('#gs-title').textContent = mine ? t('gs.mine') : t('gs.other', { name: g.name });
  $('#gs-note').textContent = mine ? t('gs.noteM') : t('gs.noteO');
  const opts = $('#gs-opts');
  if (!mine) { opts.innerHTML = `<div class="card tight ctr sm dim"><span class="spin"></span> ${t('ui.waiting')}</div>`; $('#gs-action').innerHTML = ''; return; }
  opts.innerHTML = S.guessOpts.map((w, i) => `<button class="prow pick ${S.pickW === i ? 'sel' : ''}" data-w="${i}">
    <div class="av sm">🎯</div><div class="nm">${wtext(w)}</div></button>`).join('');
  opts.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { S.pickW = +b.dataset.w; sfx.tap(); renderGuess(); });
  $('#gs-action').innerHTML = `<button class="btn r" id="b-guess" ${S.pickW == null ? 'disabled' : ''}>${t('gs.final')} 🔒</button>`;
  const btn = $('#b-guess');
  if (btn) btn.onclick = () => {
    const w = S.guessOpts[S.pickW]; S.pickW = null;
    if (onePhone() || soloish()) doGuess(w); else NET.act({ a: 'guess', t: w.a });
  };
  if (onePhone() && !S.guessSeen) { toast(t('gs.give', { name: g.name }), 2800); S.guessSeen = true; }
}
/* ============ end ============ */
function renderEnd() {
  const r = S.result;
  const T = { civ: ['🪔', t('end.civ'), t('end.civn')], spy: ['🔍', t('end.spy'), t('end.spyn')], steal: ['🎯', t('end.steal'), t('end.stealn')] }[r] || ['🏆', '', ''];
  $('#en-ico').textContent = T[0];
  $('#en-title').textContent = T[1];
  $('#en-title').className = 'bigres ' + (r === 'civ' ? 'res-civ' : 'res-spy');
  $('#en-note').textContent = T[2] + (S.guessed && r !== 'spy' ? ' ' + t('end.guessed') + ': “' + S.guessed + '”' : '');
  $('#en-word').innerHTML = wtext(S.wordObj);
  $('#en-cat').textContent = catLabel(S.catObj || { e: '', nm: ['', '', ''] });
  const roles = S.mode === 'online' ? (S.revealRoles || {}) : Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v.role]));
  $('#en-roles').innerHTML = S.players.map(p => {
    const sp = roles[p.id] === 'spy';
    return `<div class="prow ${sp ? 'sel' : ''}"><div class="av ${p.bot ? 'bot' : ''}">${p.av}</div><div class="nm">${esc(p.name)}</div>
      <span class="pill ${sp ? 'rd' : 'g'}">${sp ? '🔍 ' + t('ui.jasoos') : '🪔 ' + t('ui.nagrik')}</span></div>`;
  }).join('');
  $('#en-score').innerHTML = S.players.slice().sort((a, b) => b.score - a.score).map((p, i) =>
    `<div class="prow ${i === 0 ? 'me' : ''}"><div class="av sm">${i === 0 ? '👑' : p.av}</div>
      <div class="nm">${esc(p.name)}</div><div class="vcount">${p.score}</div></div>`).join('');
  const act = $('#en-action');
  const nextBtn = S.mode === 'daily' ? '' :
    (isHost() ? `<button class="btn p" id="b-next">${t('end.again')} 🔄</button>` : `<div class="card tight ctr sm dim">${t('end.hostnext')}</div>`);
  act.innerHTML = nextBtn +
    `<div class="grid2 mt1"><button class="btn wa sm2" id="b-shend" style="width:100%">${t('ui.share')}</button>
     <button class="btn ghost sm2" id="b-home" style="width:100%">${t('end.finish')}</button></div>`;
  const nb = $('#b-next');
  if (nb) nb.onclick = () => {
    if (S.mode === 'online') NET.act({ a: 'again' });
    else if (soloish()) startSolo(false);
    else newGame(true);
  };
  $('#b-shend').onclick = () => shareResult();
  $('#b-home').onclick = () => { if (S.mode === 'online') NET.leave(); clearBots(); stopTimer(); go('s-home'); };
}
/* ============ room ============ */
function renderRoom() {
  $('#room-code').textContent = NET.room || '····';
  $('#room-role').textContent = NET.host ? '👑 ' + t('ui.host') : t('ui.guest');
  $('#room-count').textContent = S.players.length + ' / 12';
  $('#room-players').innerHTML = S.players.map(p => `<div class="prow ${p.id === ME.id ? 'me' : ''}">
    <div class="av">${p.av}</div><div class="nm">${esc(p.name)}${p.id === ME.id ? ' <span class="xs dim">(' + t('ui.you') + ')</span>' : ''}</div>
    ${p.id === S.host ? `<span class="pill y">${t('ui.host')}</span>` : ''}
    ${p.conn === false ? `<span class="pill rd">${t('room.gone')}</span>` : ''}
    ${NET.host && p.id !== ME.id ? `<button class="iconbtn" data-kick="${p.id}" style="width:30px;height:30px;font-size:13px" aria-label="remove">✕</button>` : ''}</div>`).join('')
    || `<div class="dim sm ctr">${t('room.none')}</div>`;
  $('#room-players').querySelectorAll('[data-kick]').forEach(b => b.onclick = () => kick(b.dataset.kick));
  const rs = $('#room-settings');
  rs.innerHTML = settingsHTML(NET.host) + `<div class="hr"></div><div class="up gold mb">${t('ui.cats')}</div><div class="catbox" id="rcats">${catsHTML(false)}</div>`;
  wireSettings(rs, NET.host); wireCats(rs, NET.host);
  const act = $('#room-actions');
  if (NET.host) {
    const ok = S.players.length >= 3;
    act.innerHTML = `<button class="btn p" id="b-gostart" ${ok ? '' : 'disabled'}>${ok ? t('ui.start') + ' →' : t('set.need3b') + ' (' + S.players.length + ')'}</button>`;
    $('#b-gostart').onclick = () => { sfx.ok(); newGame(false); };
  } else act.innerHTML = `<div class="card tight ctr sm dim"><span class="spin"></span> ${t('room.waithost')}</div>`;
}
function renderWait() {
  $('#wt-info').innerHTML = t('wait.info', { n: S.players.length, r: S.round }) +
    '<br>' + t('ui.host') + ': ' + esc((S.players.find(p => p.id === S.host) || {}).name || '—');
}
/* ============ stats ============ */
function renderStats() {
  const wr = ST.games ? Math.round(ST.wins / ST.games * 100) : 0;
  const swr = ST.spyG ? Math.round(ST.spyW / ST.spyG * 100) : 0;
  const cwr = ST.civG ? Math.round(ST.civW / ST.civG * 100) : 0;
  let h = `<div class="card">
    <div class="stats">
      <div class="stat"><b>${ST.games}</b><span>${t('st.games')}</span></div>
      <div class="stat"><b>${ST.wins}</b><span>${t('st.wins')}</span></div>
      <div class="stat"><b>${wr}%</b><span>${t('st.winrate')}</span></div>
    </div>
    <div class="hr"></div>
    <div class="kv"><span>🔍 ${t('st.asspy')}</span><b class="gold">${ST.spyW}/${ST.spyG} · ${swr}%</b></div>
    <div class="bar"><i style="width:${swr}%"></i></div>
    <div class="kv" style="border:0"><span>🪔 ${t('st.asciv')}</span><b class="gold">${ST.civW}/${ST.civG} · ${cwr}%</b></div>
    <div class="bar"><i style="width:${cwr}%"></i></div>
    <div class="hr"></div>
    <div class="kv"><span>${t('st.caught')}</span><b class="gold">${ST.caught}</b></div>
    <div class="kv"><span>${t('st.steals')}</span><b class="gold">${ST.steals}</b></div>
    <div class="kv"><span>🔥 ${t('st.streak')}</span><b class="gold">${DAILY.streak || 0} · ${t('day.best')} ${DAILY.best || 0}</b></div>
  </div>`;
  h += `<div class="card mt"><div class="up gold mb">${t('st.ach')} · ${ST.ach.length}/${ACHS.length}</div><div class="plist">`;
  ACHS.forEach(a => {
    const got = ST.ach.includes(a.id);
    h += `<div class="ach ${got ? 'got' : ''}"><div class="ai">${a.ic}</div>
      <div class="f1"><div class="an">${got ? esc(t('ach.' + a.id)) : '???'}</div><div class="ad">${esc(t('ach.' + a.id + 'd'))}</div></div>
      ${got ? '<span class="pill y">✓</span>' : ''}</div>`;
  });
  h += `</div></div>`;
  if (!ST.games) h += `<div class="ctr dim sm mt">${t('st.none')}</div>`;
  h += `<button class="btn ghost sm2 mt" id="st-reset" style="width:100%">${t('st.reset')}</button>`;
  $('#st-body').innerHTML = h;
  $('#st-reset').onclick = () => {
    if (!confirm(t('st.resetq'))) return;
    ST = Object.assign({}, DEFST, { ach: [] }); saveST(); render();
  };
}
/* ============ dispatcher ============ */
function render() {
  switch (CUR) {
    case 's-home': renderHome(); break;
    case 's-setup': renderSetup(); break;
    case 's-solo': renderSolo(); break;
    case 's-daily': renderDaily(); break;
    case 's-room': renderRoom(); break;
    case 's-pass': renderPass(); break;
    case 's-reveal': renderReveal(); break;
    case 's-clue': $('#b-mycard').style.display = onePhone() ? 'none' : 'grid'; renderClue(); paintTimers(); break;
    case 's-discuss': renderDiscuss(); paintTimers(); break;
    case 's-vote': renderVote(); paintTimers(); break;
    case 's-eject': renderEject(); break;
    case 's-guess': renderGuess(); break;
    case 's-end': renderEnd(); break;
    case 's-wait': renderWait(); break;
    case 's-stats': renderStats(); break;
    case 's-packs': renderPacks(); break;
    case 's-packedit': renderPackEdit(); break;
    case 's-ob': renderOb(); break;
    case 's-lang': renderLang(); break;
  }
}
