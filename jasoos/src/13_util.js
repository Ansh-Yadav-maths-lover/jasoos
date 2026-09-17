/* ============ small utils ============ */
const rnd = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a, rng) {
  const b = a.slice(), r = rng || Math.random;
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* deterministic rng — daily challenge */
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a += 0x6D2B79F5; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
/* IST day index — the daily word flips at midnight India time */
function istDay(d) {
  const now = d || new Date();
  return Math.floor((now.getTime() + 5.5 * 3600e3) / 86400e3);
}
const DAY0 = 20340;               // day index of the first Daily Jasoos
const dayNo = () => istDay() - DAY0 + 1;
const todayKey = () => String(istDay());
/* json local storage */
function jget(k, def) { try { return JSON.parse(LS(k) || 'null') ?? def; } catch (e) { return def; } }
const jset = (k, v) => LSet(k, JSON.stringify(v));
/* fire-and-forget haptics */
const buzz = n => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };
const isOnline = () => navigator.onLine !== false;
