const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg',pad=n=>String(n).padStart(2,'0');
const ones=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],tens=['','','twenty','thirty','forty','fifty'];
const N=n=>n<20?ones[n]:tens[n/10|0]+(n%10?'-'+ones[n%10]:'');
function parts(tm){const h=(tm/60|0)%24,m=tm%60;return{h,m,h12:h%12||12,n12:(h+1)%12||12}}
function eng(tm){const{m,h12,n12}=parts(tm);
 if(!m)return tm===720?'noon':tm===0?'midnight':N(h12)+' o’clock';
 if(m<=30)return(m===15?'quarter':m===30?'half':N(m)+(m%5?(m>1?' minutes':' minute'):''))+' past '+N(h12);
 const k=60-m;return(k===15?'quarter':N(k)+(k%5?' minutes':''))+' to '+N(n12)}
function alt(tm){const{m,h12}=parts(tm);return m?N(h12)+' '+(m<10?'oh '+N(m):N(m)):null}
function dig(tm){const{h12,m}=parts(tm);return h12+':'+pad(m)}
function period(tm){const h=parts(tm).h;return h<5?'at night':h<12?'in the morning':h<18?'in the afternoon':h<21?'in the evening':'at night'}
function ampm(tm){return parts(tm).h<12?'a.m.':'p.m.'}
function speechTime(tm){const ap=ampm(tm);if(tm===0)return 'It is midnight.';if(tm===720)return 'It is noon.';return 'It is '+eng(tm)+', '+ap+'.'}
function pt(tm){const{m,h12,n12}=parts(tm);
 if(!m)return tm===720?'Meio-dia':tm===0?'Meia-noite':(h12===1?'É 1 hora':'São '+h12+' horas');
 if(m<=30)return(h12===1?'É 1':'São '+h12)+' e '+(m===30?'meia':m);
 return'Faltam '+(60-m)+' para '+(n12===1?'a 1':'as '+n12)}
function why(tm){const{m,h12,n12}=parts(tm);
 if(!m)return'Ponteiro grande no 12: só dizes a hora e acrescentas o’clock.';
 const dh=h12===1?'da 1':'das '+h12,pa=n12===1?'a 1':'as '+n12;
 if(m===15)return'Passou um quarto de hora depois '+dh+': quarter past '+N(h12)+'.';
 if(m===45)return'Falta um quarto de hora para '+pa+': quarter to '+N(n12)+'.';
 if(m===30)return'Passou meia hora depois '+dh+': half past '+N(h12)+'. Aos 30, a forma convencional é half past.';
 if(m<30)return(m===1?'Passou 1 minuto':'Passaram '+m+' minutos')+' depois '+dh+': past. Dizes o que passou.';
 return(m===59?'Falta 1 minuto':'Faltam '+(60-m)+' minutos')+' para '+pa+': to. Dizes o que falta, em contagem decrescente.'}
function say(t){
 const synth=window.speechSynthesis;
 if(!synth||!window.SpeechSynthesisUtterance){alert('A leitura por voz não é suportada neste navegador. Experimenta no Chrome ou Edge.');return}
 try{
  synth.cancel();
  const u=new SpeechSynthesisUtterance(t.replace(/’/g,"'"));
  u.lang='en-US';u.rate=.85;
  const voices=synth.getVoices();
  const voice=voices.find(v=>v.lang==='en-US')||voices.find(v=>v.lang.startsWith('en-'));
  if(voice)u.voice=voice;
  u.onerror=()=>{if(!voices.length)console.warn('Speech synthesis: não foram encontradas vozes instaladas.')};
  synth.speak(u);
 }catch(e){console.error(e);alert('Não foi possível reproduzir a voz. Verifica se o navegador tem suporte de áudio por voz.');}
}
function el(p,t,a,txt){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;p.appendChild(e);return e}

function buildClock(svg,handle){
 svg.setAttribute('viewBox','-190 -190 380 380');svg.setAttribute('role','img');
 const R=150;
 el(svg,'circle',{r:176,fill:'var(--panel)',stroke:'var(--line)','stroke-width':2});
 const hv=el(svg,'g',{});
 const pa=el(hv,'path',{d:`M0 ${-R}A${R} ${R} 0 0 1 0 ${R}Z`,fill:'var(--pastbg)'});
 const ta=el(hv,'path',{d:`M0 ${-R}A${R} ${R} 0 0 0 0 ${R}Z`,fill:'var(--tobg)'});
 const lb={'text-anchor':'middle','font-size':16,'font-weight':600};
 el(hv,'text',{...lb,x:50,y:-34,fill:'var(--past)'},'past');
 el(hv,'text',{...lb,x:-50,y:-34,fill:'var(--to)'},'to');
 for(let i=0;i<60;i++){const a=i*Math.PI/30,s=Math.sin(a),c=-Math.cos(a),l=i%5?6:14;
  el(svg,'line',{x1:s*R,y1:c*R,x2:s*(R-l),y2:c*(R-l),stroke:'var(--ink)','stroke-width':i%5?1:2.5,opacity:i%5?.45:1})}
 for(let i=1;i<=12;i++){const a=i*Math.PI/6,s=Math.sin(a),c=-Math.cos(a),b={'text-anchor':'middle','dominant-baseline':'central'};
  el(svg,'text',{...b,x:s*112,y:c*112,'font-size':24,'font-weight':600,fill:'var(--ink)'},i);
  el(svg,'text',{...b,x:s*163,y:c*163,'font-size':10,fill:'var(--muted)'},i*5)}
 const hh=el(svg,'g',{});el(hh,'line',{y2:-78,stroke:'var(--ink)','stroke-width':10,'stroke-linecap':'round'});
 const mh=el(svg,'g',{});const ml=el(mh,'line',{y2:-132,'stroke-width':6,'stroke-linecap':'round'});
 const tip=handle?el(mh,'circle',{cy:-132,r:10,stroke:'var(--panel)','stroke-width':3}):null;
 el(svg,'circle',{r:8,fill:'var(--ink)'});
 return{svg,update(tm,hint=true){const m=tm%60,col=!hint||!m?'var(--ink)':m<=30?'var(--past)':'var(--to)';
  hh.setAttribute('transform',`rotate(${(tm%720)/2})`);mh.setAttribute('transform',`rotate(${m*6})`);
  ml.setAttribute('stroke',col);tip&&tip.setAttribute('fill',col);hv.style.display=hint?'':'none';
  pa.setAttribute('opacity',m>=1&&m<=30?1:.3);ta.setAttribute('opacity',m>30?1:.3)}}}

function drag(c,get,set){const svg=c.svg;let mode=null;
 const pt=e=>{const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*380-190,y=(e.clientY-r.top)/r.height*380-190;return{d:Math.hypot(x,y),a:(Math.atan2(x,-y)*180/Math.PI+360)%360}};
 const move=e=>{if(!mode)return;const p=pt(e);let tm=get();
  if(mode==='m'){const m=Math.round(p.a/6)%60,prev=tm%60;let h=tm/60|0;if(prev>=45&&m<=15)h++;else if(prev<=15&&m>=45)h--;tm=((h*60+m)%1440+1440)%1440}
  else{const m=tm%60,hh=Math.round((((p.a-m/2)%360+360)%360)/30)%12;tm=(tm>=720?720:0)+hh*60+m}
  set(tm)};
 svg.addEventListener('pointerdown',e=>{mode=pt(e).d>88?'m':'h';svg.setPointerCapture(e.pointerId);move(e)});
 svg.addEventListener('pointermove',move);
 svg.addEventListener('pointerup',()=>mode=null);svg.addEventListener('pointercancel',()=>mode=null)}

/* Tabs */
const tabs=[...document.querySelectorAll('[role=tab]')],panels=[...document.querySelectorAll('[role=tabpanel]')],IDS=tabs.map(t=>t.dataset.p);
function show(id){tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.p===id));panels.forEach(p=>p.hidden=p.id!==id);try{history.replaceState(null,'','#'+id)}catch(e){}}
tabs.forEach(t=>t.onclick=()=>show(t.dataset.p));
const fromHash=()=>IDS.includes(location.hash.slice(1))?location.hash.slice(1):'aprender';
addEventListener('hashchange',()=>show(fromHash()));show(fromHash());

/* Praticar */
let tm=940;const pc=buildClock($('#clk'),true);
function render(){pc.update(tm);const{h,m}=parts(tm),s=eng(tm),a=alt(tm);
 $('#dig').textContent=dig(tm);
 $('#ap').textContent=ampm(tm)+' · '+pad(h)+':'+pad(m)+' · '+period(tm);
 $('#ampm-note').textContent=ampm(tm)==='a.m.'?'a.m. — da meia-noite até antes do meio-dia.':'p.m. — do meio-dia até antes da meia-noite.';
 $('#choose-am').setAttribute('aria-pressed',ampm(tm)==='a.m.');$('#choose-pm').setAttribute('aria-pressed',ampm(tm)==='p.m.');
 $('#eng').textContent='It’s '+s+'.';
 $('#alt').textContent=a?'Também se diz: It’s '+a+'.':'';
 $('#pt').textContent='Em português: '+pt(tm);
 $('#why').textContent=why(tm);
 $('#out').style.setProperty('--side',!m?'var(--ink)':m<=30?'var(--past)':'var(--to)')}
const setTm=v=>{tm=((v%1440)+1440)%1440;render()};
drag(pc,()=>tm,setTm);
document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>setTm(tm+ +b.dataset.d));
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>setTm((tm/60|0)*60+ +b.dataset.m));
function choosePeriod(isPM){const {h12,m}=parts(tm);setTm((isPM?720:0)+(h12%12)*60+m)}
$('#choose-am').onclick=()=>choosePeriod(false);$('#choose-pm').onclick=()=>choosePeriod(true);
$('#say').onclick=()=>say(speechTime(tm));
render();

/* Exemplos */
[900,905,915,930,940,945].forEach(t=>{const b=document.createElement('button');
 b.innerHTML=`<span class="d">${dig(t)}</span><span>It’s ${eng(t)}.</span><small>${pt(t)}</small>`;
 b.onclick=()=>{setTm(t);show('praticar')};$('#ex').appendChild(b)});

/* Truques */
const mk=(t,c)=>{const b=document.createElement('button');b.className=c;b.innerHTML=`<b>${eng(t)}</b><small>${dig(t)}</small>`;b.onclick=()=>{setTm(t);show('praticar')};return b};
const mir=$('#mir');
mir.insertAdjacentHTML('beforeend','<div class="mh cp">Passou: past</div><div class="mh ct">Falta: to</div>');
[5,10,15,20,25].forEach(k=>mir.append(mk(900+k,'p'),mk(960-k,'t')));
mir.append(mk(930,'full'));
const H=[
 {label:'Mais natural',a:'What hour is it?',b:'What time is it?',note:'Para perguntar as horas, “What time is it?” é a expressão habitual. “What hour…?” pode aparecer noutros contextos, quando se pergunta especificamente qual é a hora.'},
 {label:'Correcção gramatical',a:'They are three o’clock',b:'It’s three o’clock',note:'Usamos “it” como sujeito impessoal para dizer as horas: “It is…” ou “It’s…”. “They are…” não funciona nesta expressão.'},
 {label:'Forma convencional',a:'Half to four',b:'Half past three',note:'Às 3:30, a forma convencional em inglês é “half past three”. “Half to four” comunica a ideia de que faltam 30 minutos para as quatro, mas não é a forma habitual de dizer esta hora.'}
];
H.forEach(({label,a,b,note})=>{
 const x=document.createElement('div');
 const tag=document.createElement('span');tag.className='hack-label';tag.textContent=label;
 const examples=document.createElement('div');examples.className='hack-example';
 const first=document.createElement('code');first.textContent=a;
 const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');
 const second=document.createElement('code');second.textContent=b;
 const explanation=document.createElement('p');explanation.className='hack-explain';explanation.textContent=note;
 examples.append(first,arrow,second);x.append(tag,examples,explanation);$('#hacks').appendChild(x);
});

/* Teste */
const qc=buildClock($('#qclk'));
/* Todas as horas possíveis: 12 horas x 60 minutos x a.m./p.m. = 1440 */
const ALL=[];for(let t=0;t<1440;t++)ALL.push(t);
const SPECIAL=[0,15,30,45],FIVES=[5,10,20,25,35,40,50,55],OTHERS=Array.from({length:60},(_,i)=>i).filter(i=>i%5);
const rnd=a=>a[Math.random()*a.length|0],shuf=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
let qi=0,score=0,cur=null,done=false;
/* Uma ronda de 10: nenhum minuto nem nenhuma hora se repete; 3 especiais, 4 de 5 em 5, 3 minutos estranhos */
function buildRound(){
 const ms=shuf([...shuf(SPECIAL).slice(0,3),...shuf(FIVES).slice(0,4),...shuf(OTHERS).slice(0,3)]),
  hs=shuf([1,2,3,4,5,6,7,8,9,10,11,12]),types=shuf([0,1,2,0,1,2,0,1,2,rnd([0,1,2])]);
 return ms.map((m,i)=>({t:rnd(ALL.filter(t=>parts(t).h12===hs[i]&&t%60===m)),type:types[i]}))}
let R=buildRound();
function newQ(t,type){
 const key=x=>dig(x)+' '+ampm(x),label=x=>dig(x)+'  '+ampm(x),base=t>=720?720:0,r=t%720,hh=r/60|0,mm=r%60;
 const c=[hh*60+60-mm,hh*60-mm,(hh+1)*60+mm,(hh-1)*60+mm,r+5,r-5,r+15,r-15,r+30].map(x=>base+((x%720)+720)%720);c.push((t+720)%1440);
 const seen=new Set([key(t)]),ds=[];[...shuf(c.slice(0,4)).slice(0,2),...shuf(c.slice(4)),...shuf(c.slice(0,4))].forEach(x=>{if(!seen.has(key(x))&&ds.length<3){seen.add(key(x));ds.push(x)}});
 return{t,type,opts:shuf([t,...ds]).map(x=>({x,label:label(x),ok:x===t}))}}
function ask(){cur=newQ(R[qi].t,R[qi].type);done=false;const q=cur;
 $('#qno').textContent='Pergunta '+(qi+1)+' de 10';$('#qsc').textContent='Certas: '+score;
 $('#qprogress-fill').style.width=((qi+1)*10)+'%';
 $('#qclk').toggleAttribute('hidden',q.type!==0);$('#qsay').hidden=q.type!==2;$('#fb').hidden=true;$('#next').hidden=true;
 if(q.type===0){qc.update(q.t,false);$('#qp').textContent='Lê o relógio e escolhe a hora e o período correctos.'}
 else if(q.type===1)$('#qp').textContent='A expressão é “It’s '+eng(q.t)+'.”. Qual é a hora e o período?';
 else{$('#qp').textContent='Ouve com atenção e escolhe a hora e o período.'}
 $('#opts').innerHTML='';
 q.opts.forEach(o=>{const b=document.createElement('button');b.className='opt';b.textContent=o.label;b.onclick=()=>answer(b,o);o.b=b;$('#opts').appendChild(b)})}
function answer(b,o){if(done)return;done=true;if(o.ok)score++;
 cur.opts.forEach(x=>{x.b.disabled=true;if(x.ok)x.b.classList.add('ok')});if(!o.ok)b.classList.add('bad');
 $('#qsc').textContent='Certas: '+score;
 const f=$('#fb');f.className='fb '+(o.ok?'ok':'bad');
 f.textContent=(o.ok?'Certo! ':'Não é essa. ')+dig(cur.t)+' '+ampm(cur.t)+' → It’s '+eng(cur.t)+'. '+why(cur.t);f.hidden=false;
 $('#next').textContent=qi===9?'Ver resultado':'Seguinte';$('#next').hidden=false}
$('#qsay').onclick=()=>say(speechTime(cur.t));
$('#next').onclick=()=>{qi++;if(qi>=10)finish();else ask()};
function finish(){$('#qbox').hidden=true;$('#end').hidden=false;$('#final').textContent=score+' de 10';
 $('#finalmsg').textContent=score>=9?'Excelente. Já dominas a hora em inglês.':score>=6?'Bom resultado. Revê os Truques e tenta outra vez.':'Volta ao relógio em Praticar e repete o teste.'}
$('#again').onclick=()=>{qi=0;score=0;R=buildRound();$('#end').hidden=true;$('#qbox').hidden=false;ask()};
ask();