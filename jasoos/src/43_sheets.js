/* ============ rules / menu / my card ============ */
function rulesHTML() {
  return `<div class="row sb"><h2>${t('rl.h')}</h2><button class="iconbtn" id="sh-x">✕</button></div>
  <div class="hr"></div>
  <div class="sm" style="line-height:1.65">
  <p><b class="gold">${t('rl.1h')}</b> ${t('rl.1p')}</p>
  <p><b class="gold">${t('rl.2h')}</b> ${t('rl.2p')}</p>
  <p><b class="gold">${t('rl.3h')}</b> ${t('rl.3p')}</p>
  <p><b class="gold">${t('rl.4h')}</b> ${t('rl.4p')}</p>
  <div class="hr"></div>
  <div class="kv"><span>${t('rl.sc1')}</span><b class="gold">${t('rl.sc1v')}</b></div>
  <div class="kv"><span>${t('rl.sc2')}</span><b class="gold">${t('rl.sc2v')}</b></div>
  <div class="kv"><span>${t('rl.sc3')}</span><b class="gold">${t('rl.sc3v')}</b></div>
  <div class="hr"></div>
  <p class="dim">${t('rl.modes')}</p>
  </div>`;
}
function rulesSheet() { sheet(rulesHTML()); $('#sh-x').onclick = closeSheet; }
function menuSheet() {
  sheet(`<div class="row sb"><h2>${t('ui.settings')}</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <div class="col" style="gap:9px">
      <button class="btn ghost" id="m-rules">📖 ${t('ui.rules')}</button>
      <button class="btn ghost" id="m-snd">${SND ? '🔊 ' + t('ui.sound') + ': ' + t('ui.on') : '🔇 ' + t('ui.sound') + ': ' + t('ui.off')}</button>
      <button class="btn ghost" id="m-lang">🌐 ${t('ui.lang')}</button>
      <button class="btn ghost" id="m-relay">⚡ ${LANG === 'hi' ? 'Online Server' : 'Online Relay'}</button>
      <button class="btn ghost" id="m-credit">👨‍💻 ${LANG === 'hi' ? 'Made by Ansh' : 'Made by Ansh'}</button>
      <button class="btn ghost" id="m-quit">🚪 ${t('ui.quit')}</button>
    </div>`);
  $('#sh-x').onclick = closeSheet;
  $('#m-rules').onclick = rulesSheet;
  $('#m-snd').onclick = () => { toggleSnd(); closeSheet(); };
  $('#m-lang').onclick = () => { closeSheet(); go('s-lang'); };
  $('#m-relay').onclick = () => { closeSheet(); relaySettingsSheet(); };
  $('#m-credit').onclick = () => { closeSheet(); creditSheet(); };
  $('#m-quit').onclick = () => { closeSheet(); leaveGame(); };
}
function creditSheet() {
  sheet(`<div class="row sb"><h2>${LANG === 'hi' ? 'About & Credits' : 'About & Credits'}</h2><button class="iconbtn" id="sh-x">✕</button></div>
    <div class="hr"></div>
    <div class="center" style="padding:6px 4px 14px">
      <svg class="eye glow" viewBox="0 0 100 100" fill="none" style="width:60px;height:60px" aria-hidden="true">
        <circle cx="42" cy="42" r="26" stroke="#f5b83d" stroke-width="7"/>
        <path d="M60 60l26 26" stroke="#f5b83d" stroke-width="10" stroke-linecap="round"/>
        <circle cx="42" cy="42" r="11" fill="#e0457b"/>
        <circle cx="37" cy="37" r="3.6" fill="#fff" opacity=".85"/>
      </svg>
      <div class="dsp gold mt1" style="font-size:26px">JASOOS</div>
      <div class="up xs dim" style="letter-spacing:.2em">The Desi Imposter Game · जासूस</div>
      <div class="card tight mt2" style="width:100%;text-align:left;border-color:rgba(245,184,61,.3);background:linear-gradient(140deg,rgba(255,255,255,.05),rgba(245,184,61,.05))">
        <div class="row" style="gap:12px">
          <div class="av lg" style="background:linear-gradient(135deg,rgba(245,184,61,.24),rgba(224,69,123,.2));border-color:var(--gold);font-size:30px">👨‍💻</div>
          <div class="f1">
            <div class="up xs gold" style="letter-spacing:.12em">${LANG === 'hi' ? 'Designed & Developed by' : 'Designed & Developed by'}</div>
            <div style="font-size:20px;font-weight:800;font-family:'Baloo 2';color:#fff">Ansh Yadav</div>
            <div class="xs dim" style="margin-top:2px">Creator & Developer · India's Desi Imposter Party Game</div>
          </div>
        </div>
      </div>
      <div class="col mt1" style="gap:8px;width:100%">
        <a href="https://github.com/Ansh-Yadav-maths-lover" target="_blank" rel="noopener" class="btn ghost sm2" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px">
          <span style="font-size:18px">🐙</span>
          <span style="font-weight:700">GitHub: @Ansh-Yadav-maths-lover</span>
          <span class="xs dim">↗</span>
        </a>
        <a href="https://github.com/Ansh-Yadav-maths-lover/jasoos" target="_blank" rel="noopener" class="btn p sm2" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px">
          <span>⭐ Star on GitHub</span>
        </a>
      </div>
    </div>`);
  $('#sh-x').onclick = closeSheet;
}
function myCardSheet() {
  if (onePhone()) return toast(t('clue.onephone'), 2600);
  const r = soloish() ? ROLES[ME.id] : { role: ME.role, word: ME.word, mates: (ROLES[ME.id] || {}).mates };
  const spy = (r || {}).role === 'spy';
  const mates = ((r || {}).mates || []).filter(m => S.players.some(x => x.id === m));
  sheet(`<div class="row sb"><h2>${t('clue.mycard')}</h2><button class="iconbtn" id="sh-x">✕</button></div><div class="hr"></div>
    <div class="ctr"><div class="up ${spy ? 'rose' : 'tealc'}">${spy ? '🔍 ' + t('ui.jasoos') : '🪔 ' + t('ui.nagrik')}</div>
    <div class="word mt1">${spy && !(r || {}).word ? t('rev.noword') : wtext((r || {}).word)}</div>
    <div class="sm dim mt1">${esc(catLabel(S.catObj || { e: '', nm: ['', '', ''] }))}</div>
    ${mates.length ? `<div class="pill v mt1">${esc(t('rev.jodi', { name: mates.map(m => pById(m).name).join(', ') }))}</div>` : ''}</div>`);
  $('#sh-x').onclick = closeSheet;
}
function toggleSnd() {
  SND = !SND; LSet('jas.snd', SND ? '1' : '0');
  if (SND) { actx(); sfx.ok(); }
  toast(t('ui.sound') + ': ' + (SND ? t('ui.on') : t('ui.off')));
  render();
}
function leaveGame() {
  if (S.mode === 'online') NET.leave();
  clearBots(); stopTimer(); go('s-home');
}
/* ============ language screen ============ */
function renderLang() {
  $('#lang-list').innerHTML = LANGS.map(l => `<button data-lang="${l.id}" class="${LANG === l.id ? 'on' : ''}">
    <span style="font-size:26px">${l.flag}</span>
    <span class="f1"><span class="lg" style="display:block">${l.name}</span><span class="ls">${l.sub}</span></span>
    ${LANG === l.id ? '<span class="gold">✓</span>' : ''}</button>`).join('');
  $('#lang-list').querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
    setLang(b.dataset.lang); sfx.ok(); paintStatic();
    const seen = LS('jas.ob') === '1';
    if (!seen) { OBI = 0; go('s-ob'); } else go('s-home');
  });
}
/* ============ onboarding ============ */
let OBI = 0;
const OBART = [
  `<svg viewBox="0 0 220 220" fill="none">
    <g stroke="#f5b83d" stroke-width="2.4">
      <rect x="16" y="52" width="74" height="104" rx="12" fill="rgba(34,184,166,.14)"/>
      <rect x="56" y="42" width="74" height="104" rx="12" fill="rgba(34,184,166,.18)"/>
      <rect x="100" y="52" width="74" height="104" rx="12" fill="rgba(34,184,166,.14)"/>
    </g>
    <rect x="132" y="70" width="74" height="104" rx="12" fill="rgba(224,69,123,.24)" stroke="#e0457b" stroke-width="2.6"/>
    <text x="93" y="102" font-size="26" text-anchor="middle" fill="#8ff0e3" font-family="Baloo 2">वडा</text>
    <text x="93" y="128" font-size="26" text-anchor="middle" fill="#8ff0e3" font-family="Baloo 2">पाव</text>
    <text x="169" y="132" font-size="44" text-anchor="middle" fill="#ff8fb4" font-family="Baloo 2">?</text>
  </svg>`,
  `<svg viewBox="0 0 220 220" fill="none">
    <g stroke="#f5b83d" stroke-width="2.2" fill="rgba(245,184,61,.1)">
      <rect x="14" y="30" width="120" height="42" rx="16"/><path d="M40 72l-6 18 22-18z" fill="rgba(245,184,61,.1)"/>
      <rect x="70" y="94" width="132" height="42" rx="16"/><path d="M180 136l6 18-22-18z" fill="rgba(245,184,61,.1)"/>
      <rect x="24" y="158" width="118" height="42" rx="16"/><path d="M50 200l-6 18 22-18z" fill="rgba(245,184,61,.1)"/>
    </g>
    <text x="74" y="58" font-size="21" text-anchor="middle" fill="#ffd98a" font-family="Baloo 2">पाव</text>
    <text x="136" y="122" font-size="21" text-anchor="middle" fill="#ffd98a" font-family="Baloo 2">चटनी</text>
    <text x="83" y="186" font-size="21" text-anchor="middle" fill="#ff8fb4" font-family="Baloo 2">tasty…</text>
  </svg>`,
  `<svg viewBox="0 0 220 220" fill="none">
    <circle cx="110" cy="110" r="86" stroke="rgba(245,184,61,.28)" stroke-width="2"/>
    ${[0, 1, 2, 3, 4].map(i => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5, x = 110 + Math.cos(a) * 66, y = 110 + Math.sin(a) * 66;
      const on = i === 2;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="21" fill="${on ? 'rgba(224,69,123,.3)' : 'rgba(255,255,255,.07)'}" stroke="${on ? '#e0457b' : '#f5b83d'}" stroke-width="2.2"/>
      ${i !== 2 ? `<path d="M${x.toFixed(1)} ${y.toFixed(1)} L${(110 + Math.cos(-Math.PI / 2 + 2 * Math.PI * 2 / 5) * 40).toFixed(1)} ${(110 + Math.sin(-Math.PI / 2 + 2 * Math.PI * 2 / 5) * 40).toFixed(1)}" stroke="rgba(224,69,123,.5)" stroke-width="2" stroke-dasharray="4 4"/>` : ''}`;
    }).join('')}
    <text x="110" y="118" font-size="30" text-anchor="middle" fill="#ffd98a" font-family="Baloo 2">🗳</text>
  </svg>`,
  `<svg viewBox="0 0 220 220" fill="none">
    <circle cx="96" cy="94" r="52" stroke="#f5b83d" stroke-width="9"/>
    <path d="M132 132l50 50" stroke="#f5b83d" stroke-width="13" stroke-linecap="round"/>
    <circle cx="96" cy="94" r="24" fill="rgba(224,69,123,.35)" stroke="#e0457b" stroke-width="3"/>
    <text x="96" y="104" font-size="26" text-anchor="middle" fill="#fff" font-family="Baloo 2">🎯</text>
  </svg>`,
];
function renderOb() {
  $('#ob-art').innerHTML = OBART[OBI];
  $('#ob-h').textContent = t('ob.s' + (OBI + 1) + 'h');
  $('#ob-p').textContent = t('ob.s' + (OBI + 1) + 'p');
  $('#ob-dots').innerHTML = OBART.map((_, i) => `<i class="${i <= OBI ? 'on' : ''}"></i>`).join('');
  $('#ob-next').textContent = OBI >= OBART.length - 1 ? t('ob.go') + ' →' : t('ui.next') + ' →';
}
function obDone() { LSet('jas.ob', '1'); go('s-home'); }
