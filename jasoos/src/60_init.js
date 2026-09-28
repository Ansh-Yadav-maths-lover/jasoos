/* ============ animated background ============ */
(function bgAnim() {
  const c = $('#bg'), x = c.getContext('2d');
  let W, H, dpr, parts = [], t0 = 0, last = 0;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
  }
  function make(n) {
    parts = Array.from({ length: n }, () => ({
      x: Math.random(), y: Math.random(), r: 6 + Math.random() * 16,
      sp: .008 + Math.random() * .02, dr: Math.random() * Math.PI * 2,
      sw: .3 + Math.random() * .9, a: .05 + Math.random() * .14, g: Math.random() < .25,
    }));
  }
  size(); make(innerWidth < 520 ? 14 : 24);
  addEventListener('resize', size);
  function frame(ts) {
    const dt = Math.min(50, ts - last) / 16.667; last = ts; t0 += dt;
    if (!document.hidden && !document.body.classList.contains('nomo')) {
      x.clearRect(0, 0, W, H);
      const g = x.createRadialGradient(W * .5, H * .1, 0, W * .5, H * .1, W * .9);
      g.addColorStop(0, 'rgba(70,25,70,.55)'); g.addColorStop(1, 'rgba(8,4,16,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      parts.forEach(p => {
        p.y -= p.sp * dt * .006; if (p.y < -.08) { p.y = 1.08; p.x = Math.random(); }
        p.dr += .004 * dt;
        const px = (p.x + Math.sin(p.y * 7 + p.dr) * .03) * W, py = p.y * H, r = p.r * dpr;
        x.save(); x.globalAlpha = p.a; x.translate(px, py); x.rotate(Math.sin(p.dr) * .5);
        if (p.g) {
          x.fillStyle = '#f5b83d'; x.beginPath();
          for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; x.ellipse(Math.cos(a) * r * .6, Math.sin(a) * r * .6, r * .42, r * .28, a, 0, 7); }
          x.fill(); x.beginPath(); x.arc(0, 0, r * .36, 0, 7); x.fillStyle = '#ff9f45'; x.fill();
        } else {
          x.strokeStyle = '#e0457b'; x.lineWidth = p.sw * dpr;
          x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.stroke();
          x.beginPath(); x.arc(0, 0, r * .45, 0, Math.PI * 2); x.stroke();
        }
        x.restore();
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
fxInit();
mandala($('#mand1')); mandala($('#mand2'));
if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('nomo');

/* ============ wiring ============ */
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };
$$('[data-back]').forEach(b => b.onclick = () => { sfx.tap(); go(b.dataset.back); });
$('#h-stats').onclick = () => { sfx.tap(); go('s-stats'); };
$('#h-lang').onclick = () => { sfx.tap(); go('s-lang'); };
$('#h-snd').onclick = () => toggleSnd();
$('#h-how').onclick = () => { sfx.tap(); rulesSheet(); };
$('#h-packs').onclick = () => { sfx.tap(); go('s-packs'); };
$('#h-share').onclick = shareInvite;
const bCred = $('#b-credit'); if (bCred) bCred.onclick = () => { sfx.tap(); creditSheet(); };
$('#ob-next').onclick = () => { sfx.tap(); if (OBI >= OBART.length - 1) obDone(); else { OBI++; renderOb(); } };
$('#ob-skip').onclick = () => { sfx.tap(); obDone(); };
$('#b-add').onclick = () => addPlayer($('#pname').value);
$('#pname').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); addPlayer($('#pname').value); } };
$('#cat-all').onclick = () => { SET.cats = CATIDS.slice(); saveSet(); sfx.tap(); render(); };
$('#cat-none').onclick = () => { SET.cats = [CATIDS[0]]; saveSet(); sfx.tap(); render(); };
$('#b-startlocal').onclick = () => {
  if (LOCAL.length < 3) return toast(t('set.need3'));
  S.mode = 'local'; S.bots = {}; clearBots();
  S.players = LOCAL.map(p => ({ id: p.id, name: p.name, av: p.av, score: 0, alive: true, voted: false }));
  actx(); sfx.ok(); newGame(false);
};
$('#b-solostart').onclick = () => { actx(); sfx.ok(); startSolo(false); };
$('#b-leave').onclick = () => { NET.leave(); stopTimer(); go('s-home'); };
$('#b-copy').onclick = async () => {
  const url = gameUrl() + '#r=' + NET.room;
  try { await navigator.clipboard.writeText(url); toast(t('room.copied')); } catch (e) { toast(url, 4000); }
};
$('#b-share').onclick = shareRoom;
$('#b-pass-ok').onclick = () => { sfx.tap(); go('s-reveal'); };
$('#b-menu').onclick = () => { sfx.tap(); menuSheet(); };
$('#b-mycard').onclick = myCardSheet;
function doFlip() {
  const f = $('#flip');
  if (f.classList.contains('open')) return;
  f.classList.add('open'); actx(); sfx.flip();
  const pid = onePhone() ? S.order[S.revealIdx] : ME.id;
  const spy = (onePhone() || soloish() ? (ROLES[pid] || {}).role : ME.role) === 'spy';
  setTimeout(() => { (spy ? sfx.spy : sfx.civ)(); $('#b-rev-next').style.visibility = 'visible'; }, 420);
}
$('#flip').onclick = doFlip;
$('#flip').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doFlip(); } };
$('#b-rev-next').onclick = () => {
  sfx.tap();
  if (onePhone()) {
    if (S.revealIdx >= S.order.length - 1) beginClues();
    else { S.revealIdx++; go('s-pass'); }
  } else if (soloish()) beginClues();
  else { S._iReady = true; NET.act({ a: 'ready' }); render(); }
};
$('#b-tovote').onclick = () => { if (!isHost()) return; sfx.tap(); startVote(); };
$('#b-ej-next').onclick = () => { sfx.tap(); if (S.mode === 'online') NET.act({ a: 'next' }); else afterEject(); };
$('#b-wait-leave').onclick = () => { NET.leave(); go('s-home'); };
/* packs */
$('#pk-new').onclick = () => { PE = { id: 'p' + Date.now().toString(36), name: '', words: [] }; sfx.tap(); go('s-packedit'); };
$('#pk-imp').onclick = () => { sfx.tap(); importSheet(); };
$('#pe-back').onclick = () => { sfx.tap(); go('s-packs'); };
$('#pe-add').onclick = peAdd;
$('#pe-w').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); peAdd(); } };
$('#pe-save').onclick = peSave;
$('#pe-del').onclick = () => {
  if (!PE || !confirm(t('pk.del') + '?')) return;
  setPacks(getPacks().filter(p => p.id !== PE.id));
  SET.cats = SET.cats.filter(c => c !== 'pk:' + PE.id); saveSet();
  PE = null; sfx.bad(); go('s-packs');
};
$('#pe-share').onclick = () => {
  if (!PE || PE.words.length < 3) return toast(t('pk.min'));
  shareText(t('pk.title') + ': ' + (PE.name || '') + '\n' + packCode(PE), gameUrl());
};
/* haptics + audio unlock on first real tap */
document.addEventListener('click', e => { if (e.target.closest('button,.prow.pick,.chip,.vcell,.mode')) { buzz(9); actx(); } }, true);
addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;
  if (e.key === 'Escape') closeSheet();
});
addEventListener('hashchange', () => {
  const m = location.hash.match(/r=([A-Z0-9]{4})/i);
  if (m && !NET.open) joinRoom(m[1]);
});
addEventListener('online', () => toast('✅ ' + t('ui.on')));
addEventListener('offline', () => toast(t('sh.offline'), 3200));
document.addEventListener('visibilitychange', () => { if (document.hidden) clearBots(); else if (soloish()) tickBots(); });

/* ============ pwa ============ */
let INSTALL = null;
if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); INSTALL = e;
  if (LS('jas.noinst') !== '1') $('#h-install').style.display = 'flex';
});
$('#h-instb').onclick = async () => {
  if (!INSTALL) { $('#h-install').style.display = 'none'; return; }
  INSTALL.prompt();
  try { const r = await INSTALL.userChoice; if (r.outcome === 'accepted') toast(t('sh.installed'), 3000); } catch (e) {}
  INSTALL = null; LSet('jas.noinst', '1'); $('#h-install').style.display = 'none';
};
addEventListener('appinstalled', () => { LSet('jas.noinst', '1'); $('#h-install').style.display = 'none'; });

/* ============ boot ============ */
(function boot() {
  const hash = location.hash;
  const pk = hash.match(/p=([A-Za-z0-9+/=]+)/);
  const room = hash.match(/r=([A-Z0-9]{4})/i);
  if (!LANG) { setLang('hin'); LSet('jas.lang', ''); }
  else setLang(LANG);
  paintStatic();
  const needLang = !LS('jas.lang');
  const needOb = LS('jas.ob') !== '1';
  if (needLang) go('s-lang');
  else if (needOb) { OBI = 0; go('s-ob'); }
  else { go('s-home'); }
  if (pk) setTimeout(() => importSheet('JAS1' + pk[1]), 500);
  else if (room) setTimeout(() => joinSheet(room[1].toUpperCase()), 500);
  render();
})();
/* debug hook */
window.__J = {
  get S() { return S; }, get SET() { return SET; }, get ME() { return ME; }, get CUR() { return CUR; },
  get ROLES() { return ROLES; }, get ST() { return ST; }, get DAILY() { return DAILY; },
  get NET() { return { room: NET.room, host: NET.host, id: NET.id }; },
  go, toast, render, newGame, submitClue, resolveVote, startSolo, t, LANG: () => LANG,
  counts: () => ({ words: WORDN, cats: CATS.length, solo: SOLOWORDS, soloCats: SOLOCATS.length, bank: Object.keys(BANK).length }),
};
