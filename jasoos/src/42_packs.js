/* ============ custom word packs ============ */
const b64 = s => btoa(Array.from(new TextEncoder().encode(s), c => String.fromCharCode(c)).join(''));
const unb64 = s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
const getPacks = () => jget('jas.packs', []) || [];
const setPacks = p => jset('jas.packs', p);
let PE = null;                                       // pack being edited
function renderPacks() {
  const packs = getPacks();
  let h = `<div class="card"><div class="sm dim">${t('pk.sub')}</div></div>`;
  if (!packs.length) h += `<div class="ctr dim sm mt2">${t('pk.none')}</div>`;
  else h += '<div class="plist mt">' + packs.map(p => `<button class="prow pick" data-pk="${p.id}">
    <div class="av">📚</div><div class="f1" style="min-width:0"><div class="nm">${esc(p.name)}</div>
    <div class="xs dim">${t('pk.nwords', { n: p.words.length })}</div></div><div class="arw dim">›</div></button>`).join('') + '</div>';
  $('#pk-body').innerHTML = h;
  $('#pk-body').querySelectorAll('[data-pk]').forEach(b => b.onclick = () => {
    PE = JSON.parse(JSON.stringify(getPacks().find(x => x.id === b.dataset.pk)));
    sfx.tap(); go('s-packedit');
  });
}
function renderPackEdit() {
  if (!PE) return go('s-packs');
  $('#pe-ttl').textContent = PE.name || t('pk.new');
  const ni = $('#pe-name');
  if (ni.value !== PE.name) ni.value = PE.name || '';
  $('#pe-n').textContent = t('pk.nwords', { n: PE.words.length });
  $('#pe-list').innerHTML = PE.words.map((w, i) =>
    `<span class="wchip"><b>${esc(w)}</b><button data-rm="${i}" aria-label="remove">✕</button></span>`).join('');
  $('#pe-list').querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
    PE.words.splice(+b.dataset.rm, 1); sfx.tap(); renderPackEdit();
  });
}
function peAdd() {
  const el = $('#pe-w'), v = el.value.trim().slice(0, 28);
  if (!v) return;
  if (PE.words.some(w => w.toLowerCase() === v.toLowerCase())) { el.value = ''; return toast(t('pk.dupe')); }
  PE.words.push(v); el.value = ''; sfx.ok(); renderPackEdit(); el.focus();
}
function peSave() {
  PE.name = ($('#pe-name').value || '').trim().slice(0, 24) || t('pk.new');
  if (PE.words.length < 8) return toast(t('pk.min'), 2600);
  const packs = getPacks();
  const i = packs.findIndex(p => p.id === PE.id);
  if (i >= 0) packs[i] = PE; else packs.push(PE);
  setPacks(packs);
  if (!SET.cats.includes('pk:' + PE.id)) { SET.cats.push('pk:' + PE.id); saveSet(); }
  sfx.ok(); toast(t('pk.saved')); checkAch(); go('s-packs');
}
function packCode(p) { return 'JAS1' + b64(JSON.stringify({ n: p.name, w: p.words })); }
function importPack(code) {
  code = (code || '').trim().replace(/\s+/g, '');
  const i = code.indexOf('JAS1');
  if (i < 0) return toast(t('pk.bad'), 2600);
  try {
    const o = JSON.parse(unb64(code.slice(i + 4)));
    if (!o || !Array.isArray(o.w) || o.w.length < 3) throw 0;
    const p = { id: 'p' + Date.now().toString(36), name: String(o.n || 'Pack').slice(0, 24), words: o.w.slice(0, 300).map(String) };
    const packs = getPacks(); packs.push(p); setPacks(packs);
    SET.cats.push('pk:' + p.id); saveSet();
    sfx.ok(); toast(t('pk.got', { name: p.name }), 2800); checkAch(); closeSheet(); go('s-packs');
  } catch (e) { toast(t('pk.bad'), 2600); }
}
function importSheet(pref) {
  sheet(`<div class="row sb"><h2>${t('pk.import')}</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <textarea class="inp" id="ip-code" placeholder="${esc(t('pk.importph'))}">${esc(pref || '')}</textarea>
    <button class="btn p mt" id="ip-ok">${t('pk.import')}</button>`);
  $('#sh-x').onclick = closeSheet;
  $('#ip-ok').onclick = () => importPack($('#ip-code').value);
  setTimeout(() => $('#ip-code').focus(), 120);
}
/* ============ share ============ */
function waLink(text) { return 'https://wa.me/?text=' + encodeURIComponent(text); }
const gameUrl = () => location.origin + location.pathname;
async function shareText(text, url) {
  const full = text + '\n' + (url || gameUrl());
  if (navigator.share) { try { await navigator.share({ text: full }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  window.open(waLink(full), '_blank');
}
function shareInvite() {
  sfx.tap();
  shareText(t('sh.game'), gameUrl());
}
function shareRoom() {
  const url = gameUrl() + '#r=' + NET.room;
  shareText(t('room.invite', { code: NET.room }), url);
}
function shareDaily() {
  const role = DAILY.role === 'spy' ? t('ui.jasoos') : t('ui.nagrik');
  const res = DAILY.res === 'won' ? t('day.won') : t('day.lost');
  const streak = (DAILY.streak || 0) > 1 ? ' 🔥' + DAILY.streak : '';
  shareText('🔍 ' + t('day.brag', { n: dayNo(), role, res }) + streak, gameUrl());
}
/* result card: draw it, then share the png if the device allows it */
function resultCard() {
  const W = 1000, H = 1000, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#241539'); g.addColorStop(.55, '#150d24'); g.addColorStop(1, '#0b0713');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W / 2, 180, 0, W / 2, 180, 760);
  rg.addColorStop(0, 'rgba(224,69,123,.30)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(245,184,61,.35)'; x.lineWidth = 5;
  x.strokeRect(34, 34, W - 68, H - 68);
  x.textAlign = 'center';
  x.fillStyle = '#f5b83d'; x.font = '800 62px "Baloo 2", sans-serif';
  x.letterSpacing = '10px';
  x.fillText('JASOOS', W / 2, 150);
  x.letterSpacing = '0px';
  const r = S.result;
  const head = { civ: t('end.civ'), spy: t('end.spy'), steal: t('end.steal') }[r] || '';
  x.fillStyle = r === 'civ' ? '#22b8a6' : '#e0457b';
  x.font = '800 74px "Baloo 2", sans-serif';
  wrapText(x, head, W / 2, 300, W - 160, 82);
  x.fillStyle = '#a396c0'; x.font = '600 34px Mukta, sans-serif';
  x.fillText(t('end.wordwas'), W / 2, 440);
  x.fillStyle = '#fff'; x.font = '800 76px "Baloo 2", sans-serif';
  wrapText(x, wplain(S.wordObj), W / 2, 530, W - 160, 84);
  x.fillStyle = 'rgba(245,184,61,.9)'; x.font = '600 32px Mukta, sans-serif';
  x.fillText(catLabel(S.catObj || { e: '', nm: ['', '', ''] }), W / 2, 610);
  // roles strip
  const roles = S.mode === 'online' ? (S.revealRoles || {}) : Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v.role]));
  const spies = S.players.filter(p => roles[p.id] === 'spy');
  x.fillStyle = '#a396c0'; x.font = '600 30px Mukta, sans-serif';
  x.fillText('🔍 ' + t('ui.jasoos') + ': ' + spies.map(p => p.name).join(', '), W / 2, 700);
  const top = S.players.slice().sort((a, b) => b.score - a.score).slice(0, 3);
  x.font = '600 30px Mukta, sans-serif'; x.fillStyle = '#f6eeff';
  top.forEach((p, i) => x.fillText(['🥇', '🥈', '🥉'][i] + ' ' + p.name + ' — ' + p.score, W / 2, 780 + i * 44));
  x.fillStyle = 'rgba(245,184,61,.75)'; x.font = '700 30px Mukta, sans-serif';
  x.fillText('jasoos.games.bu.app', W / 2, H - 60);
  return c;
}
function wrapText(x, text, cx, cy, max, lh) {
  const words = String(text || '').split(' ');
  const lines = []; let line = '';
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (x.measureText(test).width > max && line) { lines.push(line); line = w; } else line = test;
  });
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((l, i) => x.fillText(l, cx, cy + i * lh));
}
async function shareResult() {
  sfx.tap();
  const r = S.result;
  const resTxt = { civ: t('end.civ'), spy: t('end.spy'), steal: t('end.steal') }[r] || '';
  const msg = '🔍 ' + t('sh.result', { res: resTxt, word: wplain(S.wordObj) });
  let file = null;
  try {
    const c = resultCard();
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    if (blob) file = new File([blob], 'jasoos.png', { type: 'image/png' });
  } catch (e) {}
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text: msg + '\n' + gameUrl() }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  shareSheet(msg, file);
}
function shareSheet(msg, file) {
  const url = file ? URL.createObjectURL(file) : '';
  sheet(`<div class="row sb"><h2>${t('sh.title')}</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    ${url ? `<img class="shot" src="${url}" alt="result">` : ''}
    <button class="btn wa mt" id="sh-wa">${t('ui.whatsapp')}</button>
    ${url ? `<a class="btn ghost mt1" id="sh-dl" href="${url}" download="jasoos.png" style="text-decoration:none">${t('sh.img')}</a>` : ''}
    <button class="btn ghost mt1" id="sh-cp">${t('sh.txt')}</button>`);
  $('#sh-x').onclick = closeSheet;
  $('#sh-wa').onclick = () => window.open(waLink(msg + '\n' + gameUrl()), '_blank');
  $('#sh-cp').onclick = async () => {
    try { await navigator.clipboard.writeText(msg + '\n' + gameUrl()); toast(t('sh.copied')); }
    catch (e) { toast(msg, 4000); }
  };
}
