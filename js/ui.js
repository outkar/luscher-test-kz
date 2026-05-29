/* =================================================================
   4) UI ЛОГИКАСЫ
   ================================================================= */
const ORDER = [1,2,3,4,5,6,7,0]; // карталардың тұрақты реті
let pass = 1;
let choice1 = [];
let choice2 = [];
let greyChoice = [];
let pairs = [];
let pairIdx = 0;
let wins = {};
let prevScreen = 'intro';

function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

// кіріспе нүктелері + тарих батырмасын тексеру
(function(){
  const d=document.getElementById('introDots');
  ORDER.forEach((c,i)=>{
    const s=document.createElement('span');
    s.style.background=COLORS[c].hex;
    s.style.animationDelay=(i*0.06)+'s';
    d.appendChild(s);
  });
  if(storageOK() && loadHistory().length){
    document.getElementById('introHistoryBtn').style.display='inline-flex';
  }
})();

function startFlow(){
  greyChoice=[]; choice1=[]; choice2=[]; pairs=[]; pairIdx=0; wins={};
  startAchromatic();
}

/* ---------- 1-бөлім: ахроматты ---------- */
function startAchromatic(){
  greyChoice=[];
  renderGreys(); renderGreyPicked();
  show('achromatic');
}
function renderGreys(){
  const box=document.getElementById('greyCards');
  box.innerHTML='';
  GREY_ORDER.forEach((k,i)=>{
    const el=document.createElement('div');
    el.className='card';
    el.dataset.grey=k;
    el.style.background=GREYS[k].hex;
    el.style.animationDelay=(i*0.05)+'s';
    el.onclick=()=>pickGrey(k,el);
    box.appendChild(el);
  });
}
function pickGrey(k,el){
  if(el.classList.contains('emptied')) return;
  el.onclick=null;
  el.classList.add('emptied','pulse');
  setTimeout(()=>el.classList.remove('pulse'),220);
  greyChoice.push(k);
  renderGreyPicked();
  if(greyChoice.length===5){ setTimeout(()=>startColors(),300); }
}
function undoGrey(){
  if(greyChoice.length===0) return;
  const last=greyChoice.pop();
  const el=document.querySelector('#greyCards .card[data-grey="'+last+'"]');
  if(el){ el.classList.remove('emptied'); el.onclick=()=>pickGrey(last,el); }
  renderGreyPicked();
}
function renderGreyPicked(){
  const box=document.getElementById('greyPicked');
  document.getElementById('greyCounter').textContent='Таңдалды: '+greyChoice.length+' / 5';
  document.getElementById('greyUndoBtn').style.display=greyChoice.length>0?'inline-flex':'none';
  if(greyChoice.length===0){ box.innerHTML='<span class="picked-empty">әзірге бос…</span>'; return; }
  box.innerHTML='';
  greyChoice.forEach((k,i)=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.style.background=GREYS[k].hex;
    chip.innerHTML='<span>'+(i+1)+'</span>';
    box.appendChild(chip);
  });
}

/* ---------- 2-бөлім: сегіз түс ---------- */
function startColors(){
  pass=1; choice1=[]; choice2=[];
  document.getElementById('passTag').textContent='2-бөлім · 1-таңдау';
  document.getElementById('instr').textContent='Ең жағымды түстен бастаңыз';
  document.getElementById('subinstr').textContent='Дәл қазір көзіңізге қандай түс жағымды көрінеді?';
  renderCards(); renderPicked();
  show('test');
}

function startSecondPass(){
  pass=2;
  document.getElementById('passTag').textContent='2-бөлім · 2-таңдау';
  document.getElementById('instr').textContent='Қайтадан — ең жағымды түстен';
  document.getElementById('subinstr').textContent='Бірінші ретті ұмытыңыз. Жаңадан, таза таңдаңыз.';
  renderCards(); renderPicked();
  show('test');
}

function renderCards(){
  const box=document.getElementById('cards');
  box.innerHTML='';
  ORDER.forEach((c,i)=>{
    const el=document.createElement('div');
    el.className='card';
    el.dataset.color=c;
    el.style.background=COLORS[c].hex;
    el.style.animationDelay=(i*0.05)+'s';
    el.onclick=()=>pickCard(c,el);
    box.appendChild(el);
  });
}

function currentChoice(){ return pass===1 ? choice1 : choice2; }

function pickCard(c,el){
  if(el.classList.contains('emptied')) return;
  el.onclick=null;
  el.classList.add('emptied','pulse');
  setTimeout(()=>el.classList.remove('pulse'),220);
  currentChoice().push(c);
  renderPicked();
  if(currentChoice().length===8){ finishPass(); }
}

function undoPick(){
  const ch=currentChoice();
  if(ch.length===0) return;
  const last=ch.pop();
  const el=document.querySelector('#cards .card[data-color="'+last+'"]');
  if(el){
    el.classList.remove('emptied');
    el.onclick=()=>pickCard(last,el);
  }
  renderPicked();
}

function renderPicked(){
  const box=document.getElementById('picked');
  const ch=currentChoice();
  document.getElementById('counter').textContent='Таңдалды: '+ch.length+' / 8';
  document.getElementById('undoBtn').style.display = ch.length>0 ? 'inline-flex' : 'none';
  if(ch.length===0){ box.innerHTML='<span class="picked-empty">әзірге бос…</span>'; return; }
  box.innerHTML='';
  ch.forEach((c,i)=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.style.background=COLORS[c].hex;
    chip.innerHTML='<span>'+(i+1)+'</span>';
    box.appendChild(chip);
  });
}

function finishPass(){
  setTimeout(()=>{
    if(pass===1){ show('between'); }
    else { startPairwise(); }
  },300);
}

/* ---------- 3-бөлім: жұптап салыстыру (round-robin) ---------- */
function startPairwise(){
  pairs=[]; pairIdx=0; wins={};
  ORDER.forEach(c=>wins[c]=0);
  for(let i=0;i<ORDER.length;i++)
    for(let j=i+1;j<ORDER.length;j++)
      pairs.push([ORDER[i],ORDER[j]]);
  // жұптарды араластыру
  for(let i=pairs.length-1;i>0;i--){ const k=Math.floor(Math.random()*(i+1)); [pairs[i],pairs[k]]=[pairs[k],pairs[i]]; }
  // әр жұп ішіндегі сол/оң ретін кездейсоқтау
  pairs=pairs.map(p=>Math.random()<0.5?p:[p[1],p[0]]);
  renderPair();
  show('pairwise');
}
function renderPair(){
  const total=pairs.length;
  document.getElementById('pwCounter').textContent=(pairIdx+1)+' / '+total;
  document.getElementById('pwBar').style.width=(pairIdx/total*100)+'%';
  const box=document.getElementById('pwPair');
  box.innerHTML='';
  pairs[pairIdx].forEach(c=>{
    const el=document.createElement('div');
    el.className='pw-card';
    el.style.background=COLORS[c].hex;
    el.onclick=()=>pickPair(c,el);
    box.appendChild(el);
  });
}
function pickPair(c,el){
  el.classList.add('flash');
  el.onclick=null;
  wins[c]=(wins[c]||0)+1;
  setTimeout(()=>{
    pairIdx++;
    if(pairIdx>=pairs.length){
      document.getElementById('pwBar').style.width='100%';
      const saved=saveEntry(makeEntry());
      renderResults();
      showSaveNote(saved);
      show('results');
    } else { renderPair(); }
  },180);
}
function pairwiseRank(){
  return [...ORDER].sort((a,b)=>{
    if((wins[b]||0)!==(wins[a]||0)) return (wins[b]||0)-(wins[a]||0);
    return choice2.indexOf(a)-choice2.indexOf(b); // тең болса 2-таңдау ретімен
  });
}
function makeEntry(){
  const rank=pairwiseRank();
  return { date:Date.now(), grey:greyChoice.slice(), c1:choice1.slice(), c2:choice2.slice(),
           wins:Object.assign({},wins), anx:computeAnxiety(choice2), type:dominantType(rank) };
}
function showSaveNote(saved){
  const el=document.getElementById('saveNote');
  if(saved){ el.className='save-note ok'; el.textContent='✓ Нәтиже тарихқа сақталды.'; }
  else { el.className='save-note'; el.textContent='Тарих жергілікті файлда ғана сақталады (бұл алдын ала қарауда емес).'; }
}

/* =================================================================
   Қосымша индекстер (8 түс ретінен есептеледі)
   ================================================================= */
// Жұмыс тобы: жасыл+қызыл+сары
function workGroup(){
  const pos=c=>choice2.indexOf(c);
  const avg=(pos(2)+pos(3)+pos(4))/3;
  const inBack=[2,3,4].filter(c=>pos(c)>=5).length;
  const shiftG=choice2.indexOf(2)-choice1.indexOf(2);
  const shiftR=choice2.indexOf(3)-choice1.indexOf(3);
  let level,color,text;
  if(avg<=2.5 && inBack===0){ level='Жоғары'; color='#157A68';
    text='Жасыл, қызыл, сары шоғырланып, қатардың басында тұр — ұзақ әрі қиын жұмысты табысты аяқтауға қабілет жоғары.'; }
  else if(avg<=4.2 && inBack<=1){ level='Орташа'; color='#8A6D00';
    text='Жұмыс тобы біршама шашыраңқы — өнімділік орташа, ұзақ жүктемеде шаршау мүмкін.'; }
  else { level='Төмен'; color='#B5743F';
    text='Жұмыс тобы шашыраған немесе қатардың соңында — қазіргі жұмысқа қатысты болжам онша қолайлы емес.'; }
  if(shiftG>=2) text+=' Жасыл артқа жылжыған: ерік-жігердің әлсіреуі, мақсаттың жоғалуы мүмкін.';
  if(shiftR>=2) text+=' Қызыл артқа жылжыған: дене қуатының сарқылуы мүмкін.';
  return {level,color,text};
}
// Вегетативті баланс: жарық (қызыл,сары) vs күңгірт (көк,қара)
function vegetative(){
  const pos=c=>choice2.indexOf(c);
  const light=(pos(3)+pos(4))/2, dark=(pos(1)+pos(7))/2;
  if(Math.abs(light-dark)<3) return {state:'Тұрақты',color:'#157A68',
    text:'Жарық және күңгірт түстер ретте араласқан — вегетативті өзін-өзі реттеу тұрақты көрінеді.'};
  if(light<dark) return {state:'Жеңіл толқу',color:'#8A6D00',
    text:'Жарық түстер (қызыл, сары) алда, күңгірт түстер (көк, қара) артта — қозуға бейім, бірақ салдары ауыр болмауы мүмкін.'};
  return {state:'Ұзаққа созылған толқу',color:'#B5743F',
    text:'Күңгірт түстер алда, жарық түстер артта — саморегуляцияның ұзаққа созылған тұрақсыздығын білдіруі мүмкін.'};
}
// Амбиваленттік: 1-таңдауда алда (1-2), 2-таңдауда артта (7-8) — не керісінше
function ambivalence(){
  const res=[];
  ORDER.forEach(c=>{
    const a=choice1.indexOf(c), b=choice2.indexOf(c);
    if((a<=1&&b>=6)||(a>=6&&b<=1)) res.push(c);
  });
  return res;
}
// 1-ші vs 2-ші таңдау
function choiceComparison(){
  const same=choice1.join()===choice2.join();
  const a1=computeAnxiety(choice1), a2=computeAnxiety(choice2);
  let prog;
  if(a2<a1) prog='қолайлы — 2-таңдауда кернеу азайды';
  else if(a2>a1) prog='онша қолайлы емес — 2-таңдауда кернеу өсті';
  else prog='бейтарап';
  return {same,prog};
}
// Актуалды проблемалардың рейтингі (Драгунский: 18,17,28,27,16,26,38,37,36)
function problemRanking(){
  return ['18','17','28','27','16','26','38','37','36'].map(code=>{
    const pi=+code[0]-1, ri=+code[1]-1;
    return {a:choice2[pi], b:choice2[ri]};
  });
}

function renderProblem(){
  const c1=choice2[0], c8=choice2[7];
  const pd=getPair(c1,c8);
  let h='<h3>Қазіргі негізгі шиеленіс — «'+pd.name+'»</h3>'
    +'<div class="group-top" style="margin-bottom:12px;"><div class="swatches">'+swatchHTML(c1)+swatchHTML(c8)+'</div></div>'
    +'<p style="margin-bottom:10px;">Сіз <b>'+SHORT[c1]+'</b> ұмтыласыз, ал <b>'+SHORT_LACK[c8]
    +'</b> қазір қолжетімсіз. Осы екеуінің қарама-қарсылығы — шиеленіс өзегі.</p>'
    +'<p class="small" style="margin:0 0 4px;">'+pd.desc+'</p>';
  const extra=problemRanking().slice(1,4);
  if(extra.length){
    h+='<div class="pl-label">Тағы назарда</div><div class="plist">';
    extra.forEach(r=>{
      const pp=getPair(r.a,r.b);
      h+='<div class="pl-item"><div class="swatches">'+swatchHTML(r.a)+swatchHTML(r.b)+'</div><span>'+pp.name+'</span></div>';
    });
    h+='</div>';
  }
  document.getElementById('problemBox').innerHTML=h;
}

function idxCard(title,sub,val,color,text){
  return '<div class="idx"><div class="idx-top"><span class="idx-title">'+title
    +(sub?' <span class="idx-sub">'+sub+'</span>':'')+'</span>'
    +'<span class="idx-val" style="color:'+color+'">'+val+'</span></div>'
    +'<div class="idx-text">'+text+'</div></div>';
}
function renderIndices(){
  const wg=workGroup(), vg=vegetative(), cc=choiceComparison(), amb=ambivalence();
  let h='';
  h+=idxCard('Жұмысқа қабілет','(жасыл+қызыл+сары)', wg.level, wg.color, wg.text);
  h+=idxCard('Вегетативті баланс','(жарық/күңгірт)', vg.state, vg.color, vg.text);
  h+=idxCard('Таңдаулардың тұрақтылығы','(1-ші vs 2-ші)', cc.same?'Ригидтік':'Икемділік', '#6F4A2E',
    (cc.same?'1-ші және 2-ші таңдау бірдей — көзқарас бекем, эмоционалды ригид.':'Таңдаулар өзгерді — қабылдау икемді.')+' Болжам: '+cc.prog+'.');
  if(amb.length){
    h+=idxCard('Амбиваленттік','', amb.map(c=>COLORS[c].name).join(', '), '#823D86',
      'Бұл түс(тер) бір таңдауда алда, екіншісінде артта тұр — оларға қатынас қарама-қайшы (бір мезгілде тартады әрі итереді).');
  }
  document.getElementById('idxBox').innerHTML=h;
}

/* ---------- нәтижені құрастыру ---------- */
function colorStrip(elId, arr){
  const el=document.getElementById(elId);
  el.innerHTML='';
  arr.forEach(c=>{
    const d=document.createElement('div');
    d.style.background=COLORS[c].hex;
    el.appendChild(d);
  });
}

function swatchHTML(c){
  return '<div class="sw" style="background:'+COLORS[c].hex+'"></div>';
}

function greyStrip(elId, arr){
  const el=document.getElementById(elId);
  el.innerHTML='';
  arr.forEach(k=>{
    const d=document.createElement('div');
    d.style.background=GREYS[k].hex;
    el.appendChild(d);
  });
}

function renderMood(){
  const box=document.getElementById('moodBox');
  if(greyChoice.length<5){ box.style.display='none'; return; }
  box.style.display='block';
  const first=greyChoice[0], last=greyChoice[4];
  let m='<div class="mlabel">1-бөлім · Жалпы көңіл-күй</div>'
    +'<h3>'+GREY_MOOD[first]+'</h3>'
    +'<div class="mtext">'+GREY_FIRST[first]+' Сонымен қатар, '+GREY_LAST[last]+'.</div>'
    +'<div class="mstrip">';
  greyChoice.forEach(k=>{ m+='<div style="background:'+GREYS[k].hex+'"></div>'; });
  m+='</div>';
  box.innerHTML=m;
}

function renderType(rank){
  const lead=rank[0], rej=rank[7];
  const tc=dominantType(rank);          // жетекші негізгі түс = тип
  const t=TYPES4[tc];
  const compensated = lead!==tc;        // жетекші орында негізгі емес түс тұр ма
  let h='<div class="tlabel">Мінез-құлық типі · '+t.element+' стихиясы</div>'
    +'<div class="tname">'+t.name+'</div>'
    +'<div class="tmeta3">'
    +  '<div><span class="k3">Стихия</span><span class="v3">'+t.element+'</span></div>'
    +  '<div><span class="k3">Өзін сезінуі</span><span class="v3">'+t.feeling+'</span></div>'
    +  '<div><span class="k3">Мінез</span><span class="v3">'+t.behavior+'</span></div>'
    +'</div>'
    +'<div class="tbadges">'
    +  '<span class="tbadge pp"><span class="d" style="background:'+COLORS[lead].hex+'"></span>++ '+COLORS[lead].name+' · ең қалаулы</span>'
    +  '<span class="tbadge mm"><span class="d" style="background:'+COLORS[rej].hex+'"></span>−− '+COLORS[rej].name+' · ең қабылданбаған</span>'
    +'</div>'
    +'<p class="tgoal"><b>Мақсат.</b> '+t.goal+'</p>'
    +'<div class="roles">'
    +  '<div class="role idol"><div class="role-h">Рөл-идол<span>мақсатқа ұмтылғанда</span></div><p>'+t.idol+'</p></div>'
    +  '<div class="role def"><div class="role-h">Рөл-қорғаныс<span>қысым не фрустрацияда</span></div><p>'+t.defense+'</p></div>'
    +'</div>';
  if(compensated){
    h+='<div class="tnote">Жетекші орында негізгі емес түс — <b>'+COLORS[lead].name+'</b>. Бұл компенсация белгісі: негізгі ұмтылысыңыз <b>'+t.name+'</b>ке жатады, бірақ ол ауытқыған не компенсацияланған түрде көрінеді.</div>';
  } else {
    h+='<div class="tnote">Ең қабылданбаған түс — <b>'+COLORS[rej].name+'</b>: дәл осы рөл-қорғаныстың қай жағы белсенді екенін көрсетеді — сіз осы сападан немесе оның жоқтығынан қашасыз.</div>';
  }
  document.getElementById('typeBox').innerHTML=h;
}

function renderResults(){
  const row = choice2;                 // функц. талдау 2-таңдауға негізделеді
  greyStrip('stripGrey', greyChoice);
  colorStrip('strip1', choice1);
  colorStrip('strip2', choice2);

  // 1-бөлім: жалпы көңіл-күй
  renderMood();

  // мінез-құлық типі (жұптап салыстыру рейтингі бойынша)
  renderType(pairwiseRank());

  // функционалдық топтар (жұп негізінде)
  const g = functionalGroups(row);
  const order = ['plus','cross','equal','minus'];
  let html='';
  order.forEach(key=>{
    const pr=g[key];
    const f=FUNC[key];
    const pd=getPair(pr[0],pr[1]);
    html+=''
      +'<div class="group">'
      +  '<div class="group-top">'
      +    '<div class="swatches">'+swatchHTML(pr[0])+swatchHTML(pr[1])+'</div>'
      +    '<div class="group-titles"><h3>'+f.title+' · '+pd.name+'</h3><div class="q">'+f.q+'</div></div>'
      +  '</div>'
      +  '<p class="pdesc">'+pd.desc+'</p>'
      +  '<p class="pmod">'+FUNC_MOD[key]+'</p>'
      +'</div>';
  });
  document.getElementById('groups').innerHTML=html;

  // актуалды проблема (жұп + рейтинг)
  renderProblem();

  // қосымша индекстер
  renderIndices();

  // мазасыздық
  const a=computeAnxiety(row);
  const b=anxBand(a);
  let scale='';
  for(let i=1;i<=12;i++){
    const on = i<=a;
    scale+='<i style="background:'+(on?b.color:'var(--line)')+'"></i>';
  }
  document.getElementById('anxBox').innerHTML=''
    +'<div class="anx-score"><span class="num" style="color:'+b.color+'">'+a+'</span>'
    +  '<span class="den">/ 12</span>'
    +  '<span class="band" style="background:'+b.bg+';color:'+b.color+'">'+b.label+'</span></div>'
    +'<div class="scale">'+scale+'</div>'
    +'<div class="scale-labels"><span>0 — тұрақты</span><span>6</span><span>12 — кернеулі</span></div>'
    +'<div class="anx-text">'+b.text+'</div>';

  // түстер анықтамасы
  let ref='';
  ORDER.forEach(c=>{
    ref+='<div class="ref-item"><div class="rsw" style="background:'+COLORS[c].hex+'"></div>'
      +'<div><span class="rname">'+COLORS[c].name+'.</span> <span class="rtext">'+CORE[c]+'</span></div></div>';
  });
  document.getElementById('refGrid').innerHTML=ref;
}

function currentScreenId(){ const a=document.querySelector('.screen.active'); return a?a.id:'intro'; }
function showHistory(){ prevScreen=currentScreenId(); renderHistory(); show('history'); }
function historyBack(){ show(prevScreen==='history'?'intro':prevScreen); }

function renderTrend(hist){
  if(!storageOK()) return '<p class="small">Тарих жергілікті файлда ғана жұмыс істейді — бұл чат алдын ала қарауында сақталмайды. Файлды компьютерге жүктеп ашсаңыз, нәтижелер осында жиналады.</p>';
  if(hist.length<2) return '<p class="small">Динамиканы көру үшін кемінде екі рет өту керек. Қазір сақталған: '+hist.length+'.</p>';
  const W=620,H=200,pl=36,pr=14,pt=16,pb=28;
  const n=hist.length;
  const x=i=> pl + (n===1?0:(i/(n-1))*(W-pl-pr));
  const y=v=> pt + (1-v/12)*(H-pt-pb);
  // тор сызықтары 0/3/6/9/12
  let grid='';
  [0,3,6,9,12].forEach(v=>{
    grid+='<line x1="'+pl+'" y1="'+y(v)+'" x2="'+(W-pr)+'" y2="'+y(v)+'" stroke="var(--line-soft)" stroke-width="1"/>'
      +'<text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+v+'</text>';
  });
  let path='', dots='';
  hist.forEach((e,i)=>{
    const px=x(i), py=y(e.anx);
    path+=(i?'L':'M')+px.toFixed(1)+' '+py.toFixed(1)+' ';
    const col=anxBand(e.anx).color;
    dots+='<circle cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="5" fill="'+col+'" stroke="var(--surface)" stroke-width="2"/>';
  });
  const svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мазасыздық динамикасы">'
    +grid
    +'<path d="'+path+'" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
    +dots
    +'<text x="'+pl+'" y="'+(H-6)+'" font-size="11" fill="var(--muted)">'+fmtDate(hist[0].date).split(' ')[0]+'</text>'
    +'<text x="'+(W-pr)+'" y="'+(H-6)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+fmtDate(hist[n-1].date).split(' ')[0]+'</text>'
    +'</svg>';
  return '<div class="trend-wrap"><div class="trend-title">Мазасыздық деңгейі · уақыт бойынша</div>'+svg+'</div>';
}

function renderHistory(){
  document.getElementById('trendBox').innerHTML=renderTrend(loadHistory());
  const list=document.getElementById('histList');
  const hist=loadHistory();
  if(!storageOK()){ list.innerHTML=''; return; }
  if(!hist.length){ list.innerHTML='<p class="small">Тарих бос. Тест өткізіңіз — нәтиже осында сақталады.</p>'; return; }
  let h='<div class="picked-label" style="margin-bottom:12px;">Өткен нәтижелер · кез келгенін ашуға болады</div>';
  for(let i=hist.length-1;i>=0;i--){
    const e=hist[i], band=anxBand(e.anx);
    const tname=(TYPES4[e.type]&&TYPES4[e.type].name)||'—';
    const strip=e.c2.map(c=>'<div style="background:'+COLORS[c].hex+'"></div>').join('');
    h+='<div class="hist-item" onclick="viewEntry('+i+')">'
      +'<div class="hist-main"><div class="hist-date">'+fmtDate(e.date)+'</div><div class="hist-type">'+tname+'</div></div>'
      +'<div class="strip mini">'+strip+'</div>'
      +'<div class="hist-anx" style="color:'+band.color+'">'+e.anx+'<span>/12</span></div>'
      +'</div>';
  }
  list.innerHTML=h;
}

function viewEntry(i){
  const e=loadHistory()[i];
  if(!e) return;
  greyChoice=e.grey.slice(); choice1=e.c1.slice(); choice2=e.c2.slice();
  wins=Object.assign({}, e.wins||{});
  prevScreen='history';
  renderResults();
  document.getElementById('saveNote').textContent='';
  show('results');
}

function confirmClear(){
  if(confirm('Барлық тарихты өшіру керек пе? Бұл әрекетті қайтару мүмкін емес.')){
    clearHistory();
    renderHistory();
    document.getElementById('introHistoryBtn').style.display='none';
  }
}

function restart(){ show('intro'); }
