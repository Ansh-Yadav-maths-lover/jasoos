/* ================= SCENES ================= */
const SEQ=[];
const scene=(dur,fn)=>SEQ.push({dur,fn});
const NAMES=['Rahul','Priya','Bunty','Pinky','Guddu'];
const CLUES=['batata','tapri','mumbai','…tasty','pav'];
const SPY=3;

/* 1. title -------------------------------------------------- 0 .. 4.4 */
scene(4.4,t=>{
  bg(t);
  mandala(W/2,H*.46,H*.62,t*.12,cl(0,.2,t/1.6));
  const dl=eb((t-.15)/.9);
  lens(W/2-4,cl(-140,196,dl),44,cl(0,1,t/.5),cl(-.6,0,dl));
  const ls=eb((t-.75)/.85);
  if(t>.75) logo(W/2,H*.5-6,cl(40,116,ls),cl(0,1,(t-.75)/.5),34);
  if(t>1.35) txt('जासूस',W/2,H*.5+74,{size:30,font:'Mukta',weight:600,fill:GOLD2,alpha:cl(0,.95,(t-1.35)/.6)});
  if(t>1.55) txt('THE DESI IMPOSTER PARTY GAME',W/2,H*.5+114,{size:21,font:'Mukta',weight:600,fill:GOLD2,
    ls:6,alpha:cl(0,.85,(t-1.55)/.6)});
  if(t>2.0){
    const a=cl(0,1,(t-2.0)/.55);
    X.save();X.globalAlpha=a*.55;X.strokeStyle=GOLD;X.lineWidth=1.5;
    const w=cl(0,420,eo((t-2.0)/.9));
    X.beginPath();X.moveTo(W/2-w/2,H*.5+150);X.lineTo(W/2+w/2,H*.5+150);X.stroke();X.restore();
  }
  if(t>2.5) txt('Ek shabd.  Sab jhooth.  Ek jasoos.',W/2,H*.5+194,
    {size:36,fill:'#fff',alpha:cl(0,1,(t-2.5)/.6),glow:12,gc:'rgba(224,69,123,.6)'});
});
/* 2. deal the cards ---------------------------------------- 4.4 .. 10.2 */
scene(5.8,t=>{
  bg(t+4);
  mandala(W/2,H*.5,H*.68,-t*.08,.09);
  txt('Sabko ek hi secret word milta hai…',W/2,86,{size:40,fill:'#fff',alpha:cl(0,1,t/.5)});
  for(let i=0;i<5;i++){
    const st=.35+i*.17, a=cl(0,1,(t-st)/.3);
    if(a<=0) continue;
    const p=eb((t-st)/.85);
    const tx=cl(W/2,224+i*208,p), ty=cl(H+180,H*.53,p), rot=cl(.5,(i-2)*.062,p);
    const ft=t-(1.9+i*.16);
    const flip=ft<0?1:(ft<.22?Math.abs(Math.cos(ft/.22*Math.PI/2)):Math.min(1,(ft-.22)/.22));
    const shown=ft>.22;
    const spy=i===SPY;
    card(tx,ty,190,272,{rot,alpha:a,flip:Math.max(.04,flip),
      kind: shown?(spy?'spy':'civ'):'back',
      role: spy?'JASOOS':'NAGRIK', word: spy?'?':'Vada Pav', note: spy?'kuch nahi pata':'tum jaante ho'});
    if(shown) txt(NAMES[i],tx,ty+168,{size:22,font:'Mukta',weight:600,fill:DIM,alpha:cl(0,1,(ft-.3)/.4)});
  }
  if(t>4.0) txt('… ek ko nahi.',W/2,H-56,{size:44,fill:ROSE,alpha:cl(0,1,(t-4.0)/.5),glow:22,gc:ROSE});
});
/* 3. clues -------------------------------------------------- 10.2 .. 17.4 */
scene(7.2,t=>{
  bg(t+10);
  txt('Bari-bari se ek shabd ka clue.',W/2,74,{size:40,fill:'#fff',alpha:cl(0,1,t/.4)});
  txt('Nagrik saabit karo. Jasoos, bluff maaro.',W/2,120,{size:24,font:'Mukta',weight:600,fill:DIM,alpha:cl(0,1,(t-.3)/.5)});
  for(let i=0;i<5;i++){
    const st=.75+i*.95, a=cl(0,1,(t-st)/.35);
    if(a<=0) continue;
    const slide=cl(-70,0,eo((t-st)/.5));
    const spy=i===SPY;
    let clue=CLUES[i];
    if(spy){ const w=t-st; clue = w<1.15? '…' : 'tasty'; }
    bubble(258,172+i*92,764,76,{who:NAMES[i],clue,alpha:a,slide,hot:spy&&t-st>1.15});
    if(spy&&t-st>1.35) txt('shak!',1050,172+i*92+38,{size:26,fill:ROSE,alpha:cl(0,1,(t-st-1.35)/.4),glow:14,gc:ROSE});
  }
  if(t>6.1) txt('Kaun bol raha hai jhooth?',W/2,H-40,{size:34,fill:GOLD,alpha:cl(0,1,(t-6.1)/.5)});
});
/* 4. vote --------------------------------------------------- 17.4 .. 23.4 */
scene(6.0,t=>{
  const shake=t>2.85&&t<3.4? Math.sin((t-2.85)*70)*(1-(t-2.85)/.55)*9 : 0;
  X.save();X.translate(shake,0);
  bg(t+17);
  txt('Sab milkar vote karo.',W/2,80,{size:42,fill:'#fff',alpha:cl(0,1,t/.4)});
  const votes=[0,1,0,4,0];
  for(let i=0;i<5;i++){
    const y=160+i*96, spy=i===SPY, a=cl(0,1,(t-.2-i*.08)/.35);
    X.save();X.globalAlpha=a;
    const hot=spy&&t>1.7;
    X.fillStyle=hot?'rgba(224,69,123,.18)':'rgba(255,255,255,.05)';rr(292,y,700,74,18);X.fill();
    X.strokeStyle=hot?'rgba(224,69,123,.7)':'rgba(255,255,255,.08)';X.lineWidth=hot?2.2:1.4;rr(292,y,700,74,18);X.stroke();
    X.fillStyle='rgba(255,255,255,.07)';rr(306,y+15,44,44,13);X.fill();
    txt(NAMES[i].slice(0,2),328,y+37,{size:20,font:'Mukta',weight:700,fill:'#d9c9f5'});
    txt(NAMES[i],366,y+38,{size:28,fill:'#fff',align:'left'});
    for(let v=0;v<votes[i];v++){
      const vt=t-(.9+v*.19+i*.05); if(vt<0) continue;
      const s=eb(vt/.3);
      X.save();X.globalAlpha=Math.min(1,s);X.fillStyle=GOLD;
      X.beginPath();X.arc(700+v*44,y+37,13*s,0,7);X.fill();
      X.fillStyle='#2a1600';X.font='700 15px "Mukta"';X.textAlign='center';X.textBaseline='middle';
      X.fillText('✓',700+v*44,y+38);X.restore();
    }
    X.restore();
  }
  if(t>2.85){
    const s=eb((t-2.85)/.4), a=cl(0,1,(t-2.85)/.2);
    X.save();X.globalAlpha=a*.78;X.fillStyle='#0b0713';X.fillRect(0,0,W,H);X.restore();
    X.save();X.globalAlpha=a;X.translate(W/2,H*.46);X.rotate(cl(-.5,-.09,s));X.scale(cl(2.4,1,s),cl(2.4,1,s));
    X.fillStyle='rgba(224,69,123,.16)';rr(-330,-72,660,144,26);X.fill();
    X.strokeStyle=ROSE;X.lineWidth=4;rr(-330,-72,660,144,26);X.stroke();
    txt('YEH JASOOS THA!',0,4,{size:62,fill:'#fff',glow:26,gc:ROSE});
    X.restore();
    if(t>3.25) txt('Pinky ke 4 vote.',W/2,H*.46+118,{size:32,font:'Mukta',weight:700,fill:DIM,alpha:cl(0,1,(t-3.25)/.35)});
    X.save();X.globalAlpha=Math.max(0,.45-(t-2.85));X.fillStyle=ROSE;X.fillRect(0,0,W,H);X.restore();
  }
  if(t>4.2) txt('Nagrik jeet gaye… ya nahi?',W/2,H-58,{size:36,fill:TEAL,alpha:cl(0,1,(t-4.2)/.4),glow:14,gc:TEAL});
  X.restore();
});
/* 5. the steal ---------------------------------------------- 23.4 .. 28.4 */
const conf=Array.from({length:90},()=>({x:0,y:0,vx:(Math.random()-.5)*13,vy:-4-Math.random()*11,
  r:3+Math.random()*6,c:[GOLD,ROSE,TEAL,'#fff'][Math.floor(Math.random()*4)],sp:Math.random()*7}));
scene(5.0,t=>{
  bg(t+23);
  txt('Par Jasoos ko ek aakhri mauka milta hai…',W/2,84,{size:36,fill:'#fff',alpha:cl(0,1,t/.4)});
  const opts=['Pav Bhaji','Vada Pav','Misal Pav'];
  const sel=t<1.5?-1:(t<2.0?0:1);
  opts.forEach((o,i)=>{
    const y=210+i*104, on=i===sel && t>1.9, a=cl(0,1,(t-.4-i*.12)/.35);
    X.save();X.globalAlpha=a;
    X.fillStyle=on?'rgba(245,184,61,.9)':'rgba(255,255,255,.05)';rr(390,y,500,80,20);X.fill();
    X.strokeStyle=on?'#ffdf9d':'rgba(255,255,255,.09)';X.lineWidth=on?3:1.4;rr(390,y,500,80,20);X.stroke();
    txt(o,640,y+42,{size:34,fill:on?'#2a1600':'#fff'});X.restore();
  });
  if(t>2.5){
    const a=cl(0,1,(t-2.5)/.3), s=eb((t-2.5)/.45);
    txt('SAHI GUESS!',W/2,H-150,{size:cl(30,66,s),fill:GOLD,alpha:a,glow:30});
    if(t>3.0) txt('Jasoos ne baazi palat di.',W/2,H-88,{size:34,font:'Mukta',weight:700,fill:'#fff',alpha:cl(0,1,(t-3.0)/.4)});
    const ct=t-2.5;
    conf.forEach(p=>{X.save();X.globalAlpha=Math.max(0,a-ct*.28);X.fillStyle=p.c;
      X.translate(W/2+p.vx*ct*40, H*.82+p.vy*ct*36+ct*ct*160);X.rotate(p.sp+ct*4);
      X.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.7);X.restore();});
  }
});
/* 6. end card ----------------------------------------------- 28.4 .. 33.4 */
scene(5.0,t=>{
  bg(t+28);
  mandala(W/2,H*.46,H*.7,t*.1,cl(0,.2,t/1.2));
  lens(W/2-4,168,44,cl(0,1,t/.4),0);
  logo(W/2,H*.42,cl(70,112,eb(t/.7)),cl(0,1,t/.35),36);
  txt('Ek shabd. Sab jhooth. Ek jasoos.',W/2,H*.42+92,{size:32,fill:GOLD2,alpha:cl(0,1,(t-.4)/.4)});
  if(t>.8){
    const a=cl(0,1,(t-.8)/.4);
    let labels=['3–12 khiladi','Ek phone ya sabke phone','346 desi shabd'];
    const ws=labels.map(l=>{X.font='600 22px "Mukta"';return X.measureText(l).width+32;});
    const tot=ws.reduce((x,y)=>x+y,0)+24*2; let x=W/2-tot/2;
    labels.forEach((l,i)=>{ chip(x+ws[i]/2,H*.63,l,{alpha:a}); x+=ws[i]+24; });
  }
  if(t>1.4){
    const a=cl(0,1,(t-1.4)/.4);
    txt('jasoos.games.bu.app',W/2,H*.78,{size:52,fill:'#fff',alpha:a,glow:18});
    txt('free · no install · khelo abhi',W/2,H*.78+52,{size:24,font:'Mukta',weight:600,fill:DIM,alpha:a});
  }
  if(t>4.4){X.fillStyle=`rgba(0,0,0,${cl(0,1,(t-4.4)/.6)})`;X.fillRect(0,0,W,H);}
});
const TOTAL=SEQ.reduce((a,s)=>a+s.dur,0);
function drawAt(time){
  let t=time;
  for(const s of SEQ){ if(t<s.dur){ s.fn(t); break; } t-=s.dur; }
  if(time<.45){X.fillStyle=`rgba(0,0,0,${1-time/.45})`;X.fillRect(0,0,W,H);}
}
