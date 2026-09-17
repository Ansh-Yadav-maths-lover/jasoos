/* ================= AUDIO ================= */
let AC=null, MASTER=null, DEST=null;
function audioInit(){
  AC=new (window.AudioContext||window.webkitAudioContext)();
  MASTER=AC.createGain(); MASTER.gain.value=.9;
  const comp=AC.createDynamicsCompressor();
  comp.threshold.value=-14; comp.ratio.value=4;
  MASTER.connect(comp);
  DEST=AC.createMediaStreamDestination();
  comp.connect(DEST); comp.connect(AC.destination);
}
const noiseBuf=(dur=.4)=>{ const b=AC.createBuffer(1,AC.sampleRate*dur,AC.sampleRate);
  const d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return b; };
let NB=null;
function kick(t,g=1){
  const o=AC.createOscillator(), a=AC.createGain();
  o.type='sine'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(46,t+.13);
  a.gain.setValueAtTime(0,t); a.gain.linearRampToValueAtTime(.9*g,t+.008); a.gain.exponentialRampToValueAtTime(.001,t+.34);
  o.connect(a).connect(MASTER); o.start(t); o.stop(t+.36);
}
function tabla(t,f=340,g=.5,dur=.16){          // dry "na/tin" hit
  const o=AC.createOscillator(), a=AC.createGain(), b=AC.createBiquadFilter();
  o.type='triangle'; o.frequency.setValueAtTime(f*1.5,t); o.frequency.exponentialRampToValueAtTime(f,t+.05);
  b.type='bandpass'; b.frequency.value=f*2.2; b.Q.value=2.5;
  a.gain.setValueAtTime(0,t); a.gain.linearRampToValueAtTime(g,t+.005); a.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(b).connect(a).connect(MASTER); o.start(t); o.stop(t+dur+.02);
  const n=AC.createBufferSource(), na=AC.createGain(), nb=AC.createBiquadFilter();
  n.buffer=NB; nb.type='highpass'; nb.frequency.value=2600;
  na.gain.setValueAtTime(g*.5,t); na.gain.exponentialRampToValueAtTime(.001,t+.05);
  n.connect(nb).connect(na).connect(MASTER); n.start(t); n.stop(t+.07);
}
function drone(t,dur){
  [55,82.5].forEach((f,i)=>{
    const o=AC.createOscillator(), a=AC.createGain(), lp=AC.createBiquadFilter();
    o.type=i?'triangle':'sawtooth'; o.frequency.value=f;
    lp.type='lowpass'; lp.frequency.value=260;
    a.gain.setValueAtTime(0,t); a.gain.linearRampToValueAtTime(i?.05:.085,t+1.2);
    a.gain.setValueAtTime(i?.05:.085,t+dur-2); a.gain.linearRampToValueAtTime(0,t+dur);
    o.connect(lp).connect(a).connect(MASTER); o.start(t); o.stop(t+dur+.1);
  });
}
function note(t,f,dur=.34,g=.16,type='triangle'){
  const o=AC.createOscillator(), a=AC.createGain(), lp=AC.createBiquadFilter();
  o.type=type; o.frequency.setValueAtTime(f,t);
  const lfo=AC.createOscillator(), lg=AC.createGain();
  lfo.frequency.value=5.5; lg.gain.value=f*.007; lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t+dur+.1);
  lp.type='lowpass'; lp.frequency.value=2600;
  a.gain.setValueAtTime(0,t); a.gain.linearRampToValueAtTime(g,t+.02);
  a.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(lp).connect(a).connect(MASTER); o.start(t); o.stop(t+dur+.05);
}
function whoosh(t,g=.35){
  const n=AC.createBufferSource(), a=AC.createGain(), bp=AC.createBiquadFilter();
  n.buffer=NB; bp.type='bandpass'; bp.Q.value=1.1;
  bp.frequency.setValueAtTime(280,t); bp.frequency.exponentialRampToValueAtTime(4200,t+.4);
  a.gain.setValueAtTime(0,t); a.gain.linearRampToValueAtTime(g,t+.12); a.gain.exponentialRampToValueAtTime(.001,t+.5);
  n.connect(bp).connect(a).connect(MASTER); n.start(t); n.stop(t+.55);
}
function stamp(t){
  kick(t,1.3); tabla(t,180,.7,.3);
  const o=AC.createOscillator(), a=AC.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(420,t); o.frequency.exponentialRampToValueAtTime(90,t+.5);
  a.gain.setValueAtTime(.28,t); a.gain.exponentialRampToValueAtTime(.001,t+.6);
  o.connect(a).connect(MASTER); o.start(t); o.stop(t+.62);
}
function shimmer(t){
  [880,1320,1760,2640].forEach((f,i)=>note(t+i*.07,f,.9,.075,'sine'));
}
/* raga-flavoured motif (D minor pentatonic-ish) */
const D=146.83, sc=[0,2,3,5,7,10,12].map(s=>D*Math.pow(2,s/12));
const RIFF=[0,2,3,2,4,3,2,0], RIFF2=[4,5,4,3,2,3,2,0];
function schedule(t0){
  NB=noiseBuf(.5);
  const bpm=104, beat=60/bpm;                  // 0.577s
  drone(t0,TOTAL);
  for(let b=0;b*beat<TOTAL-.4;b++){
    const t=t0+b*beat, bar=Math.floor(b/4), inBar=b%4;
    const vote=t-t0>=17.4&&t-t0<23.4, quiet=(t-t0)<1.2;
    if(quiet) continue;
    if(inBar===0) kick(t,vote?1.1:.9);
    if(inBar===2) kick(t,.7);
    tabla(t+beat*.5,vote?300:360,vote?.42:.3,.14);
    if(inBar===1||inBar===3) tabla(t,520,.22,.1);
    if(inBar===3) tabla(t+beat*.75,660,.18,.08);
  }
  // melody enters with the cards, drops out for the vote, returns for the finale
  for(let b=0;b*beat<TOTAL-1;b++){
    const t=t0+b*beat, rel=b*beat;
    if(rel<4.2||(rel>16.9&&rel<23.2)) continue;
    const riff=(Math.floor(b/8)%2)?RIFF2:RIFF, deg=riff[b%8];
    const oct=rel>28?2:1;
    note(t,sc[deg]*oct,beat*.9,rel>28?.15:.12,'triangle');
    if(rel>23.4&&rel<28.4) note(t+beat*.5,sc[(deg+2)%7]*2,beat*.45,.07,'sine');
  }
  // accents at scene changes
  [0,4.4,10.2,17.4,23.4,28.4].forEach(s=>whoosh(t0+s,s===0?.5:.3));
  stamp(t0+17.4+2.85);
  shimmer(t0+23.4+2.5);
  shimmer(t0+28.4+.1);
  note(t0+.15,sc[0],1.6,.2,'triangle');
}
/* ================= RECORD ================= */
async function record(){
  ST.textContent='loading fonts…';
  try{ await document.fonts.load('800 100px "Baloo 2"'); await document.fonts.load('600 24px "Mukta"');
    await document.fonts.ready; }catch(e){}
  audioInit(); await AC.resume();
  const vs=C.captureStream(30);
  const stream=new MediaStream([...vs.getVideoTracks(), ...DEST.stream.getAudioTracks()]);
  let rec=null, mime='';
  for(const m of ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1.4d002a,mp4a.40.2','video/mp4',
                  'video/webm;codecs=vp9,opus','video/webm']){
    try{ rec=new MediaRecorder(stream,{mimeType:m,videoBitsPerSecond:6_000_000,audioBitsPerSecond:128_000});
      mime=rec.mimeType||m; break; }catch(e){}
  }
  if(!rec) throw new Error('no recorder mime');
  ST.textContent='recorder: '+mime;
  const chunks=[]; rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  const done=new Promise(r=>rec.onstop=r);
  drawAt(0);
  rec.start();                                  // single fragment
  const t0=AC.currentTime+.12;
  schedule(t0);
  const start=performance.now()+120;
  await new Promise(res=>{
    function loop(now){
      const t=(now-start)/1000;
      if(t>=TOTAL){ res(); return; }
      drawAt(Math.max(0,t));
      ST.textContent='recording '+t.toFixed(1)+' / '+TOTAL.toFixed(1)+'s';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
  await new Promise(r=>setTimeout(r,260));
  rec.stop(); await done;
  const blob=new Blob(chunks,{type:mime.split(';')[0]});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='jasoos_trailer.'+(mime.includes('mp4')?'mp4':'webm');
  document.body.appendChild(a); a.click();
  ST.textContent='done: '+a.download+' · '+(blob.size/1048576).toFixed(2)+' MB · '+mime;
  window.__trailerDone={size:blob.size,mime,name:a.download,total:TOTAL};
}
document.getElementById('go').onclick=()=>record().catch(e=>{ST.textContent='ERR '+e.message;});
/* preview a still so the page isn't blank */
document.fonts.ready.then(()=>drawAt(30.2));
window.__preview=s=>{drawAt(s);return 'drew '+s};
</script></body></html>
