/* ============ clue bank ============ */
const BANK = {};                                  // norm(word.a) -> [{a,h}]
(CLUERAW_A + '\n' + CLUERAW_B).split('\n').forEach(line => {
  const i = line.indexOf('=');
  if (i < 1) return;
  const key = norm(line.slice(0, i));
  BANK[key] = line.slice(i + 1).split(';').map(c => {
    const p = c.split('~');
    return { a: (p[0] || '').trim(), h: (p[1] || p[0] || '').trim() };
  }).filter(c => c.a);
});
const cluetext = c => !c ? '' : (LANG === 'hi' ? c.h : c.a);
/* vague clues a clueless spy can fall back on, per category */
const VAGUE = {
  food: 'tasty~स्वादिष्ट;street~सड़क;spicy~तीखा;plate~प्लेट;evening~शाम',
  khana: 'home~घर;hot~गरम;plate~थाली;daily~रोज़;mummy~मम्मी',
  mithai: 'sweet~मीठा;festival~त्योहार;sugar~चीनी;box~डब्बा;shop~दुकान',
  films: 'classic~क्लासिक;hit~हिट;story~कहानी;theatre~सिनेमा;song~गाना',
  stars: 'famous~मशहूर;screen~पर्दा;fans~फ़ैन;award~अवार्ड;style~अंदाज़',
  south: 'blockbuster~ब्लॉकबस्टर;action~एक्शन;dubbed~डब;mass~मास;hero~हीरो',
  cricket: 'match~मैच;bat~बल्ला;stadium~स्टेडियम;runs~रन;team~टीम',
  ipl: 'season~सीज़न;team~टीम;evening~शाम;tv~टीवी;crowd~भीड़',
  khel: 'game~खेल;ground~मैदान;team~टीम;practice~अभ्यास;childhood~बचपन',
  tyohar: 'festival~त्योहार;family~परिवार;sweets~मिठाई;holiday~छुट्टी;pooja~पूजा',
  jagah: 'tourists~पर्यटक;photo~फ़ोटो;ticket~टिकट;old~पुराना;famous~मशहूर',
  shehar: 'city~शहर;traffic~जाम;crowd~भीड़;big~बड़ा;station~स्टेशन',
  shaadi: 'wedding~शादी;guests~मेहमान;food~खाना;photo~फ़ोटो;loud~शोर',
  ghar: 'house~घर;daily~रोज़;old~पुराना;kitchen~रसोई;mummy~मम्मी',
  safar: 'travel~सफ़र;road~सड़क;crowd~भीड़;ticket~टिकट;late~देर',
  tv: 'screen~पर्दा;episode~एपिसोड;evening~शाम;popular~लोकप्रिय;family~परिवार',
  sangeet: 'music~संगीत;song~गाना;sound~आवाज़;stage~मंच;beat~ताल',
  padhai: 'school~स्कूल;exam~एग्ज़ाम;teacher~शिक्षक;copy~कॉपी;marks~नंबर',
  bazaar: 'shop~दुकान;money~पैसा;crowd~भीड़;buy~ख़रीदना;corner~नुक्कड़',
  desi: 'india~भारत;daily~रोज़;people~लोग;habit~आदत;funny~मज़ेदार',
  katha: 'story~कथा;god~भगवान;ancient~प्राचीन;temple~मंदिर;power~शक्ति',
  veer: 'history~इतिहास;brave~वीर;statue~मूर्ति;book~किताब;india~भारत',
  brand: 'packet~पैकेट;ad~विज्ञापन;shop~दुकान;famous~मशहूर;cheap~सस्ता',
  net: 'phone~फ़ोन;screen~स्क्रीन;online~ऑनलाइन;data~डेटा;scroll~स्क्रॉल',
  naukri: 'office~दफ़्तर;boss~बॉस;salary~सैलरी;monday~सोमवार;laptop~लैपटॉप',
  rishte: 'family~परिवार;guest~मेहमान;questions~सवाल;wedding~शादी;phone~फ़ोन',
  mausam: 'weather~मौसम;season~मौसम;outside~बाहर;sky~आसमान;change~बदलाव',
  janwar: 'animal~जानवर;street~गली;village~गांव;sound~आवाज़;nature~कुदरत',
  bachpan: 'childhood~बचपन;play~खेल;friends~दोस्त;school~स्कूल;memory~याद',
  kapde: 'clothes~कपड़े;wedding~शादी;colour~रंग;shop~दुकान;style~अंदाज़',
  sehat: 'health~सेहत;bitter~कड़वा;grandmother~दादी;medicine~दवा;rest~आराम',
};
const VAGUEC = {};
for (const k in VAGUE) VAGUEC[k] = VAGUE[k].split(';').map(c => { const p = c.split('~'); return { a: p[0], h: p[1] || p[0] }; });
/* categories usable by bots: only words we have clues for */
const SOLOCATS = CATS.map(c => ({
  id: c.id, e: c.e, nm: c.nm,
  words: c.words.filter(w => BANK[norm(w.a)] && BANK[norm(w.a)].length >= 5)
})).filter(c => c.words.length >= 5);
const SOLOIDS = SOLOCATS.map(c => c.id);
const SOLOWORDS = SOLOCATS.reduce((a, c) => a + c.words.length, 0);
const soloCatById = id => SOLOCATS.find(c => c.id === id);
const cluesFor = w => BANK[norm(w && w.a)] || [];

/* ============ bot brains ============
   A civilian bot picks an unused clue from its word.
   A spy bot ranks every candidate word in the category by how well the
   clues it has heard match, then borrows a clue from its best guess.     */
const BOTNAMES = [
  ['Bunty','बंटी'],['Pinky','पिंकी'],['Chotu','छोटू'],['Guddu','गुड्डू'],['Dolly','डॉली'],
  ['Bablu','बबलू'],['Tina','टीना'],['Raju','राजू'],['Sanju','संजू'],['Golu','गोलू'],
  ['Mithu','मीठू'],['Sweety','स्वीटी'],['Lucky','लक्की'],['Happy','हैप्पी'],['Rinku','रिंकू'],
];
const BOTAV = ['🐯','🦚','🐘','🦁','🐒','🦜','🦋','🐝','🐢','🦉','🐧','🐬','🦄','🐙','🐊'];
const botName = i => { const p = BOTNAMES[i % BOTNAMES.length]; return LANG === 'hi' ? p[1] : p[0]; };

function usedClues() { return S.clues.map(c => norm(c.t)); }
/* rank candidate words for the spy given what it has heard */
function spyRank(catId, heard) {
  const cat = soloCatById(catId) || rnd(SOLOCATS);
  const hs = heard.map(norm).filter(Boolean);
  const scored = cat.words.map(w => {
    const cl = cluesFor(w).map(c => [norm(c.a), norm(c.h)]);
    let sc = 0;
    hs.forEach(h => {
      if (!h) return;
      if (cl.some(p => p[0] === h || p[1] === h)) sc += 3;
      else if (cl.some(p => p[0].includes(h) || h.includes(p[0]))) sc += 1;
    });
    return { w, sc };
  });
  scored.sort((a, b) => b.sc - a.sc || Math.random() - .5);
  return scored;
}
/* a bot's clue for this turn */
function botClue(pid) {
  const role = ROLES[pid] && ROLES[pid].role;
  const used = usedClues();
  const diff = SET.diff || 'normal';
  const pick = list => {
    const free = list.filter(c => !used.includes(norm(c.a)) && !used.includes(norm(c.h)));
    const pool = free.length ? free : list;
    if (diff === 'easy') return pool[0];
    if (diff === 'hard') return pool[Math.min(pool.length - 1, 1 + Math.floor(Math.random() * (pool.length - 1)))];
    return pool[Math.floor(Math.random() * pool.length)];
  };
  if (role === 'civ') {
    const cl = cluesFor(S.wordObj);
    if (!cl.length) return t('clue.send');
    return cluetext(pick(cl));
  }
  // spy
  const heard = S.clues.map(c => c.t);
  if (heard.length < 1 || diff === 'easy') {
    const v = VAGUEC[S.catId] || VAGUEC.desi;
    return cluetext(pick(v));
  }
  const ranked = spyRank(S.catId, heard);
  const best = ranked[0];
  if (!best || best.sc === 0) { const v = VAGUEC[S.catId] || VAGUEC.desi; return cluetext(pick(v)); }
  S.botGuess = best.w;
  const cl = cluesFor(best.w);
  // hard spies echo a sibling clue; easy ones sometimes leak a vague word
  if (diff === 'hard' && Math.random() < .25 && ranked[1] && ranked[1].sc > 0) {
    const cl2 = cluesFor(ranked[1].w);
    if (cl2.length) return cluetext(pick(cl2));
  }
  return cluetext(pick(cl.length ? cl : (VAGUEC[S.catId] || VAGUEC.desi)));
}
/* how odd does pid's clue history look, judged against the real word */
function suspicion(pid) {
  const mine = S.clues.filter(c => c.pid === pid);
  if (!mine.length) return .5;
  const cl = cluesFor(S.wordObj).map(c => [norm(c.a), norm(c.h)]);
  const cat = soloCatById(S.catId);
  let bad = 0;
  mine.forEach(c => {
    const n = norm(c.t);
    if (cl.some(p => p[0] === n || p[1] === n)) return;               // dead on
    const near = cat && cat.words.some(w => w !== S.wordObj &&
      cluesFor(w).some(x => norm(x.a) === n || norm(x.h) === n));
    bad += near ? .6 : 1;                                             // plausible vs wild
  });
  return bad / mine.length;
}
/* who a bot votes for */
function botVote(pid) {
  const role = ROLES[pid] && ROLES[pid].role;
  const others = alive().filter(p => p.id !== pid);
  if (!others.length) return 'skip';
  const diff = SET.diff || 'normal';
  const noise = diff === 'easy' ? 1.1 : diff === 'hard' ? .18 : .5;
  if (role === 'civ') {
    const scored = others.map(p => ({ p, s: suspicion(p.id) + Math.random() * noise }));
    scored.sort((a, b) => b.s - a.s);
    if (diff !== 'hard' && scored[0].s < .45 && Math.random() < .3) return 'skip';
    return scored[0].p.id;
  }
  // a spy pushes suspicion onto the citizen who already looks worst
  const civs = others.filter(p => (ROLES[p.id] || {}).role !== 'spy');
  if (!civs.length) return 'skip';
  const scored = civs.map(p => ({ p, s: suspicion(p.id) + Math.random() * noise }));
  scored.sort((a, b) => b.s - a.s);
  return scored[0].p.id;
}
/* a caught spy bot's final guess */
function botGuessWord() {
  const ranked = spyRank(S.catId, S.clues.map(c => c.t));
  const opts = S.guessOpts || [];
  for (const r of ranked) { if (opts.some(o => o.a === r.w.a)) return r.w; }
  return rnd(opts.length ? opts : [S.wordObj]);
}
