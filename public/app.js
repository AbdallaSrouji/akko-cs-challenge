/* =========================================================
   אתגר הקוד של עכו / تحدّي البرمجة في عكا
   השאלות, התשובות והניקוד נמצאים בשרת (תיקיית api/),
   כך שהתשובות הנכונות אינן חשופות בקוד הדף.
   טקסט הממשק נמצא ב-i18n.js (עברית / ערבית).
   ========================================================= */
const KINDS = ['gen','gen','gen','rec','loop','prog','rec','think','think','think'];
const KIND_TIME = {gen:120, loop:300, prog:300, rec:300, think:300, cipher:180, lateral:180};
const KIND_ICON = {think:'🏰', cipher:'🔐', lateral:'💡'};
const OFFLINE = typeof LOCAL_API !== 'undefined';

/* ---------- אחסון מקומי (משחק פתוח והגדרות של המחשב הזה) ---------- */
const KEY_CUR=OFFLINE?'akkoCS_offline_current_v2':'akkoCS_online_current_v2', KEY_SET='akkoCS_settings_v2';
const mem={};
function load(k,def){let v=null;try{v=localStorage.getItem(k)}catch(e){}if(v==null)v=mem[k];try{return v?JSON.parse(v):def}catch(e){return def}}
function save(k,v){const s=JSON.stringify(v);mem[k]=s;try{localStorage.setItem(k,s)}catch(e){}}
function del(k){delete mem[k];try{localStorage.removeItem(k)}catch(e){}}
let settings = Object.assign({timerOn:true, sound:true, lang:'java', ui:'he'}, load(KEY_SET,{}));
let game = load(KEY_CUR,null);
let screen = 'home';
let tickHandle = null;
let adminPass = null;
let lastFinished = null;

/* ---------- שפה ---------- */
// t('key', a, b) -> interface text in the current language with {0},{1} filled in.
function t(key,...args){
  const v=(I18N[settings.ui]||I18N.he)[key]??I18N.he[key]??key;
  return typeof v==='string'?v.replace(/\{(\d)\}/g,(_,i)=>args[i]):v;
}
// Question content is either a plain string (code / numbers) or {he, ar}.
const tx=v=>v==null?'':typeof v==='string'?v:(v[settings.ui]||v.he);
// The language-neutral form sent to the server when answering.
const canon=v=>typeof v==='string'?v:v.he;
function applyLang(){
  document.documentElement.lang=settings.ui;
  document.documentElement.dir='rtl';
  document.title=t('title');
}
function toggleUI(){
  settings.ui=settings.ui==='he'?'ar':'he';save(KEY_SET,settings);applyLang();
  if(screen==='game'){clearInterval(tickHandle)}
  render();
}

/* ---------- שרת ---------- */
async function api(path,data){
  if(OFFLINE) return LOCAL_API[path](JSON.parse(JSON.stringify(data||{})));
  let r;
  try{
    r=await fetch('/api/'+path,data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{cache:'no-store'});
  }catch(e){throw new Error(t('noConn'))}
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok) throw new Error(j.error||t('serverErr',r.status));
  return j;
}
async function fetchBoard(){return (await api('scores')).board}

/* ---------- עזרים ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtTime(sec){sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0')}
function fmtDate(ts){const d=new Date(ts),L=t('locale');return d.toLocaleDateString(L)+' '+d.toLocaleTimeString(L,{hour:'2-digit',minute:'2-digit'})}
function toLang(src,lang){
  if(lang!=='cs') return src;
  return src.replace(/System\.out\.println/g,'Console.WriteLine')
            .replace(/System\.out\.print/g,'Console.Write')
            .replace(/\.length\b/g,'.Length')
            .replace(/\bString\b/g,'string')
            .replace(/\bboolean\b/g,'bool')
            .replace(/public static void main\(/g,'public static void Main(');
}
function highlight(code){
  const re=/(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(\d+)\b|\b(public|static|int|void|return|if|else|while|for|new|boolean|bool|char|String|string|true|false)\b|\b([A-Za-z_]\w*)(?=\s*\()/gm;
  let out='',last=0,m;
  while((m=re.exec(code))){
    out+=esc(code.slice(last,m.index));const tok=esc(m[0]);
    const cls=m[1]?'c':m[2]?'s':m[3]?'n':m[4]?'k':'f';
    out+=`<span class="tk-${cls}">${tok}</span>`;last=re.lastIndex;
  }
  out+=esc(code.slice(last));
  return out.split('\n').map(l=>`<span class="ln">${l||' '}</span>`).join('');
}
function qScoreClass(e){return e==null?'':e===10?'full':e===0?'zero':'part'}

/* ---------- קול ---------- */
let actx=null;
function beep(freqs,dur=.12,type='sine'){
  if(!settings.sound) return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    freqs.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=f;
      const st=actx.currentTime+i*dur;g.gain.setValueAtTime(.0001,st);g.gain.exponentialRampToValueAtTime(.18,st+.02);
      g.gain.exponentialRampToValueAtTime(.0001,st+dur);o.connect(g).connect(actx.destination);o.start(st);o.stop(st+dur+.02)});
  }catch(e){}
}
const sfx={click:()=>beep([660],.06,'triangle'),good:()=>beep([523,659,784,1047],.11),bad:()=>beep([300,220],.18,'sawtooth'),win:()=>beep([523,659,784,1047,784,1047],.13)};

/* ---------- מודאל ---------- */
function modal(title,body,okText=t('ok'),cancelText=t('cancel'),danger=false,withInput=false){
  return new Promise(res=>{
    const bg=document.createElement('div');bg.className='modal-bg';
    bg.innerHTML=`<div class="card modal"><h2>${title}</h2><p class="muted" style="line-height:1.6">${body}</p>
      ${withInput?`<input class="in" type="password" data-in autocomplete="current-password">`:''}
      <div class="row" style="justify-content:flex-start;margin-top:18px">
      <button class="btn ${danger?'danger':''}" data-ok>${okText}</button>
      ${cancelText?`<button class="btn ghost" data-no>${cancelText}</button>`:''}</div></div>`;
    document.body.appendChild(bg);
    const inp=bg.querySelector('[data-in]');
    const done=v=>{bg.remove();res(v)};
    const ok=()=>done(withInput?inp.value:true);
    bg.querySelector('[data-ok]').onclick=ok;
    if(inp){inp.focus();inp.onkeydown=e=>{if(e.key==='Enter')ok()}}
    const no=bg.querySelector('[data-no]');if(no) no.onclick=()=>done(withInput?null:false);
    bg.onclick=e=>{if(e.target===bg) done(withInput?null:false)};
  });
}
const errModal=e=>modal(t('error'),esc(e.message||e),t('close'),null);

/* ---------- ניווט ---------- */
function go(s){screen=s;clearInterval(tickHandle);render();window.scrollTo(0,0)}
function render(){
  const app=$('#app');
  ({home:renderHome,rules:renderRules,register:renderRegister,game:renderGame,result:renderResult,board:renderBoard})[screen](app);
}
const langBtn=()=>`<button class="icon-btn lang-btn" title="${t('switchLang')}" onclick="toggleUI()">${settings.ui==='he'?I18N.ar.langName:I18N.he.langName}</button>`;
function cornerHTML(){
  return `<div class="corner">
    ${langBtn()}
    <button class="icon-btn" title="${t('fullscreen')}" onclick="toggleFS()">⛶</button>
    <button class="icon-btn" title="${t('sound')}" onclick="toggleSound()">${settings.sound?'🔊':'🔇'}</button>
  </div>`;
}
function toggleFS(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}}
function toggleSound(){settings.sound=!settings.sound;save(KEY_SET,settings);if(screen==='game')document.querySelectorAll('[data-snd]').forEach(b=>b.textContent=settings.sound?'🔊':'🔇');else render()}

/* ---------- 1. דף פתיחה ---------- */
function skylineSVG(){
  return `<svg class="skyline" viewBox="0 0 820 190" aria-hidden="true">
    <defs><linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f5b942"/><stop offset="1" stop-color="#9b6a17"/></linearGradient>
    <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2ec4d6" stop-opacity=".8"/><stop offset="1" stop-color="#0b2140" stop-opacity="0"/></linearGradient></defs>
    <circle cx="690" cy="48" r="26" fill="#ffd77a" opacity=".9"/>
    <rect x="70" y="40" width="22" height="96" fill="#eef4ff"/><rect x="70" y="62" width="22" height="12" fill="#ff5d6c"/><rect x="70" y="96" width="22" height="12" fill="#ff5d6c"/>
    <rect x="64" y="30" width="34" height="12" rx="2" fill="#13325a"/><polygon points="81,14 62,30 100,30" fill="#ff5d6c"/>
    <polygon points="92,36 230,6 230,60" fill="#ffd77a" opacity=".18"/>
    <path d="M0 120 h40 v-10 h14 v10 h20 v-10 h14 v10 h20 v-10 h14 v10 h20 v-10 h14 v10 h40 V190 H0Z" fill="url(#wall)"/>
    <rect x="330" y="100" width="120" height="40" fill="#b07f20"/>
    <rect x="240" y="104" width="70" height="40" fill="#c58d24"/><rect x="510" y="98" width="80" height="46" fill="#c58d24"/><rect x="600" y="110" width="60" height="34" fill="#a8761b"/>
    <path d="M200 132 h30 v-12 h12 v12 h30 v-12 h12 v12 h420 V190 H200Z" fill="url(#wall)"/>
    <g fill="#081629" opacity=".7"><rect x="256" y="114" width="10" height="14" rx="5"/><rect x="284" y="114" width="10" height="14" rx="5"/><rect x="528" y="110" width="10" height="16" rx="5"/><rect x="556" y="110" width="10" height="16" rx="5"/></g>
    <text x="540" y="164" font-family="JetBrains Mono,monospace" font-size="15" fill="#081629" opacity=".75" direction="ltr">for (Akko a : teams)</text>
    <rect x="0" y="170" width="820" height="20" fill="url(#sea)"/>
    <path d="M0 176 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#7ae6f2" stroke-width="2" fill="none" opacity=".6"/>
  </svg>`;
}
function statsHTML(board){
  const v=x=>board?x:'…';
  const best=board?board.reduce((m,r)=>Math.max(m,r.score),0):0;
  const schools=board?new Set(board.map(r=>r.school.trim())).size:0;
  return `<div class="stat"><b>${v(board&&board.length)}</b>${t('statTeams')}</div>
    <div class="stat"><b>${v(schools)}</b>${t('statSchools')}</div>
    <div class="stat"><b>${v(best)}</b>${t('statBest')}</div>`;
}
function renderHome(app){
  app.innerHTML=cornerHTML()+`<div class="center"><div class="wrap"><div class="hero" style="margin:0 auto">
    <span class="kicker">${t('kicker')}</span>
    ${skylineSVG()}
    <h1>${t('title')}</h1>
    <div class="sub">${t('sub')}</div>
    <div class="row">
      <button class="btn" onclick="sfx.click();go('rules')">${t('play')}</button>
      <button class="btn sea" onclick="sfx.click();go('board')">${t('board')}</button>
    </div>
    ${game?`<div class="resume">${t('resume',esc(game.team),esc(game.school),qLabel(game.qIndex))}
      <div class="row" style="justify-content:center;margin-top:10px">
        <button class="btn sm" onclick="go('game')">${t('resumeBtn')}</button>
        <button class="btn sm ghost" onclick="abandon()">${t('abandonBtn')}</button></div></div>`:''}
    <div class="stats" id="stats">${statsHTML(null)}</div>
  </div></div></div>`;
  fetchBoard().then(board=>{
    const el=$('#stats');if(el&&screen==='home')el.innerHTML=statsHTML(board);
  }).catch(e=>{
    const el=$('#stats');if(el)el.innerHTML=`<div class="offline">⚠️ ${esc(e.message)} ${t('offlineHint')}</div>`;
  });
}
async function abandon(){
  if(await modal(t('abandonTitle'),t('abandonBody'),t('yesCancel'),t('back'),true)){
    game=null;del(KEY_CUR);render();
  }
}

/* ---------- 2. הנחיות ---------- */
function renderRules(app){
  const tm=k=>settings.timerOn?t(k):'';
  app.innerHTML=cornerHTML()+`<div class="wrap" style="padding-top:60px"><div class="card">
    <h1>${t('rulesTitle')}</h1>
    <p class="muted" style="font-size:18px;line-height:1.7">${t('rulesIntro')}</p>
    <div class="steps">
      <div class="step"><div class="num">1–3</div><h3>${t('stage1Title')}</h3><div class="muted">${t('stage1Body')} ${tm('min2')}</div></div>
      <div class="step"><div class="num">4–7</div><h3>${t('stage2Title')}</h3><div class="muted">${t('stage2Body')} ${tm('min5')}</div></div>
      <div class="step"><div class="num">8–10</div><h3>${t('stage3Title')}</h3><div class="muted">${t('stage3Body')} ${tm('min5')}</div></div>
      <div class="step bonus"><div class="num">11–20</div><h3>${t('bonusStageTitle')}</h3><div class="muted">${t('bonusStageBody')}</div></div>
      <div class="step"><div class="num">✔</div><h3>${t('stage4Title')}</h3><div class="muted">${t('stage4Body')}</div></div>
    </div>
    <div class="steps" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
      <div class="step"><h3>${t('scoringTitle')}</h3>
        <table class="pts-table">
          <tr><td>${t('sc1')}</td><td>${t('pts',10)}</td></tr>
          <tr><td>${t('sc2')}</td><td>${t('pts',3)}</td></tr>
          <tr><td>${t('sc3')}</td><td>${t('pts',3)}</td></tr>
          <tr><td>${t('sc4')}</td><td>${t('pts',4)}</td></tr>
          <tr><td>${t('scBonus')}</td><td>${t('pts',10)}</td></tr>
          <tr><td>${t('scSkip')}</td><td>${t('pts',0)}</td></tr>
          <tr><td><b>${t('total')}</b></td><td>${t('totalVal')}</td></tr>
        </table></div>
      <div class="step"><h3>${t('timeTitle')}</h3>
        <div class="muted" style="line-height:1.7">${settings.timerOn?t('timeOn'):t('timeOff')} ${t('tieRule')}</div>
        <label class="f">${t('timerLabel')}</label>
        <div class="seg">
          <button class="${settings.timerOn?'on':''}" onclick="settings.timerOn=true;save(KEY_SET,settings);render()">${t('timerActive')}</button>
          <button class="${settings.timerOn?'':'on'}" onclick="settings.timerOn=false;save(KEY_SET,settings);render()">${t('timerOff')}</button>
        </div></div>
      <div class="step"><h3>${t('mapTitle')}</h3>
        <div class="qmap">${KINDS.map((k,i)=>`<div><b>${i+1}.</b> ${t('kind')[k]}</div>`).join('')}</div></div>
    </div>
    <div class="row" style="justify-content:space-between;margin-top:10px">
      <button class="btn ghost" onclick="go('home')">${t('backArrow')}</button>
      <button class="btn" onclick="sfx.click();go('register')">${t('understood')}</button>
    </div>
  </div></div>`;
}

/* ---------- 3. רישום צוות ---------- */
function renderRegister(app){
  if(game){go('game');return}
  let lang=settings.lang;
  app.innerHTML=cornerHTML()+`<div class="center"><div class="wrap" style="display:flex;justify-content:center">
    <div class="card form">
      <h1>${t('regTitle')}</h1>
      <div class="muted">${t('regSub')}</div>
      <label class="f" for="team">${t('team')}</label>
      <input class="in" id="team" maxlength="40" placeholder="${t('teamPh')}" autocomplete="off">
      <label class="f" for="school">${t('school')}</label>
      <input class="in" id="school" maxlength="60" placeholder="${t('schoolPh')}" autocomplete="off" list="schools">
      <datalist id="schools"></datalist>
      <label class="f" for="members">${t('members')}</label>
      <input class="in" id="members" maxlength="120" placeholder="${t('membersPh')}" autocomplete="off">
      <label class="f">${t('codeLang')}</label>
      <div class="seg" id="seg">
        <button data-l="java" class="${lang==='java'?'on':''}">Java</button>
        <button data-l="cs" class="${lang==='cs'?'on':''}">C#</button>
      </div>
      <div class="err" id="err"></div>
      <div class="row" style="justify-content:space-between;margin-top:8px">
        <button class="btn ghost" onclick="go('rules')">${t('backArrow')}</button>
        <button class="btn" id="startBtn">${t('startBtn')}</button>
      </div>
    </div></div></div>`;
  fetchBoard().then(b=>{const dl=$('#schools');if(dl)dl.innerHTML=[...new Set(b.map(r=>r.school))].map(s=>`<option value="${esc(s)}">`).join('')}).catch(()=>{});
  $('#seg').onclick=e=>{const b=e.target.closest('button');if(!b)return;lang=b.dataset.l;
    [...$('#seg').children].forEach(x=>x.classList.toggle('on',x===b));sfx.click()};
  $('#team').focus();
  let busy=false;
  const start=async()=>{
    if(busy) return;
    const team=$('#team').value.trim(),school=$('#school').value.trim(),members=$('#members').value.trim();
    if(!team||!school){$('#err').textContent=t('needNames');sfx.bad();return}
    busy=true;const btn=$('#startBtn');btn.disabled=true;btn.textContent=t('connecting');$('#err').textContent='';
    try{
      const r=await api('start',{team,school,members,lang});
      settings.lang=lang;save(KEY_SET,settings);
      game={id:r.id,team,school,members,lang,questions:r.questions,qIndex:0,score:0,
        results:[],answers:blankAnswers(r.questions[0]),qStart:Date.now(),submitted:false};
      save(KEY_CUR,game);sfx.win();go('game');
    }catch(e){
      $('#err').textContent=e.message;sfx.bad();btn.disabled=false;btn.textContent=t('startBtn');busy=false;
    }
  };
  $('#startBtn').onclick=start;
  app.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')start()});
}

/* ---------- 4. משחק ---------- */
let submitting=false;
const blankAnswers=q=>q.parts.map(()=>null);
// The bonus questions have no time limit.
const timeLimit=q=>settings.timerOn&&!q.bonus?(q.time||KIND_TIME[q.kind]||300):0;
function codeColumn(q,L){
  // A question may give its own C# version (csCode / csCall) when a simple rename is not enough.
  const cs=L==='cs'&&q.csCode;
  const code=cs?q.csCode:toLang(q.code,L),call=cs?q.csCall:q.call?toLang(q.call,L):null;
  const fileName=L==='cs'?q.file.replace('.java','.cs'):q.file;
  return `<div class="codebox">
      <div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span>${fileName}</span></div>
      <pre class="code">${highlight(code)}</pre>
    </div>
    ${call?`<div class="callbox"><h4>${t('callTitle')}</h4><pre>${highlight(call)}</pre>
      <div class="muted" style="margin-bottom:6px;font-size:14px">${t('paramsNote')}</div>
      <div class="params">${q.params.map(([n,v])=>`<span class="param"><b>${n}</b> = ${esc(v)}</span>`).join('')}</div></div>`
    :`<div class="callbox"><h4>${t('runTitle')}</h4><div class="muted">${t('runNote')}</div></div>`}`;
}
function promptColumn(q){
  const icon=KIND_ICON[q.kind]||'🧠';
  return `<div class="prompt ${q.kind}"><div class="picon">${icon}</div><h3>${esc(tx(q.title))}</h3>
    ${tx(q.prompt).split('\n').map(l=>`<p dir="auto">${esc(l)}</p>`).join('')}</div>`;
}
// The main questions come first, then the optional bonus stage (questions marked `bonus`).
const mainCount=()=>game.questions.filter(q=>!q.bonus).length;
const qLabel=i=>(game.questions[i].bonus?t('bonusQ',i-mainCount()+1):t('question',i+1))+' '+t('of10');
const dotClass=i=>{const r=game.results[i];return 'dot'+(game.questions[i].bonus?' bonus':'')+' '+(r?(r.skipped?'skip':qScoreClass(r.earned)):(i===game.qIndex?'cur':''))};
const sum=a=>a.reduce((s,e)=>s+(e||0),0);
// The main-questions part of a leaderboard row (rows from before the bonus existed have no bonus fields).
const rowMain=r=>r.score-(r.bonus||0);
function renderGame(app){
  if(!game){go('home');return}
  const qi=game.qIndex,q=game.questions[qi],L=game.lang,letters=t('letters'),M=mainCount(),inBonus=!!q.bonus;
  // The top bar shows the dots of the current stage only.
  const dots=game.questions.map((_,i)=>i).filter(i=>!!game.questions[i].bonus===inBonus)
    .map(i=>`<div class="${dotClass(i)}" data-i="${i}">${inBonus?i-M+1:i+1}</div>`).join('');
  app.innerHTML=`
  <div class="topbar"><div class="wrap">
    <div class="team-chip"><b>${esc(game.team)}</b><span>${esc(game.school)}</span></div>
    <div class="dots">${dots}</div>
    <div class="row">
      ${timeLimit(q)?`<div class="timer" id="timer">--:--</div>`:''}
      <div class="score-box"><span class="lbl">${t('score')}</span><span class="val" id="score">${game.score}</span><span class="lbl">/100</span></div>
      ${langBtn()}
      <button class="icon-btn" title="${t('sound')}" data-snd onclick="toggleSound()">${settings.sound?'🔊':'🔇'}</button>
      <button class="icon-btn" title="${t('fullscreen')}" onclick="toggleFS()">⛶</button>
      <button class="icon-btn" title="${t('homeTip')}" onclick="go('home')">🏠</button>
    </div>
  </div></div>
  <div class="wrap">
    <div class="qhead">
      <h2 style="margin:0">${inBonus?t('bonusQ',qi-M+1):t('question',qi+1)} <span class="muted" style="font-weight:400">${t('of10')}</span></h2>
      <span class="badge ${q.kind}">${t('kind')[q.kind]}</span>
      <span class="muted">${q.code?esc(tx(q.title))+' · ':''}${t('pts',10)}${timeLimit(q)?' · '+fmtTime(timeLimit(q))+' '+t('minutes'):''}</span>
      ${inBonus?`<button class="btn sm ghost" style="margin-inline-start:auto" onclick="finishEarly()">${t('finishNow')}</button>`:''}
    </div>
    <div class="qgrid">
      <div>${q.code?codeColumn(q,L):promptColumn(q)}</div>
      <div id="parts">
        ${q.parts.map((p,pi)=>`<div class="part"><h4><span>${q.parts.length>1?(pi+1)+'. ':''}${esc(tx(p.q))}</span><small>${t('pts',p.pts)}</small></h4>
          <div class="opts">${p.o.map((opt,oi)=>`<button class="opt" data-p="${pi}" data-o="${oi}">
            <span class="let">${letters[oi]}</span><span class="txt ${p.mono?'mono':''}">${esc(p.mono?toLang(tx(opt),L):tx(opt))}</span></button>`).join('')}</div></div>`).join('')}
        <div class="submit-row" id="submitRow"></div>
        <div id="fb"></div>
      </div>
    </div>
  </div>`;
  app.querySelector('#parts').onclick=e=>{
    const b=e.target.closest('.opt');if(!b||game.submitted||submitting)return;
    game.answers[+b.dataset.p]=+b.dataset.o;save(KEY_CUR,game);sfx.click();paintAnswers();
  };
  paintAnswers();
  if(game.submitted) showFeedback(false);
  else startTimer();
}
function paintAnswers(errMsg){
  const q=game.questions[game.qIndex],r=game.results[game.qIndex];
  document.querySelectorAll('.opt').forEach(b=>{
    const p=+b.dataset.p,o=+b.dataset.o,chosen=game.answers[p]===o;
    b.classList.remove('sel','right','wrong');b.disabled=game.submitted||submitting;
    if(game.submitted){if(canon(q.parts[p].o[o])===canon(r.right[p]))b.classList.add('right');else if(chosen)b.classList.add('wrong')}
    else if(chosen)b.classList.add('sel');
  });
  const row=$('#submitRow');if(!row)return;
  if(game.submitted){row.innerHTML='';return}
  const n=game.answers.filter(a=>a!=null).length,N=q.parts.length;
  if(errMsg){
    row.innerHTML=`<span class="offline" style="flex:1">⚠️ ${esc(errMsg)}</span><button class="btn" id="subBtn">${t('retry')}</button>`;
  }else{
    row.innerHTML=`<span class="muted">${N>1?t('selectedN',n,N):(n?t('selected1'):t('choose'))}</span>
      <div class="row">
        ${q.bonus?`<button class="btn ghost" id="skipBtn" ${submitting?'disabled':''}>${t('skip')}</button>`:''}
        <button class="btn" id="subBtn" ${n<N||submitting?'disabled':''}>${submitting?t('sending'):t('submit')}</button>
      </div>`;
    const sk=$('#skipBtn');if(sk) sk.onclick=()=>submit(false,true);
  }
  $('#subBtn').onclick=()=>submit(game.timedOut,game.skipping);
}
function startTimer(){
  clearInterval(tickHandle);
  const limit=timeLimit(game.questions[game.qIndex]);
  if(!limit) return;
  const tick=()=>{
    const left=limit-(Date.now()-game.qStart)/1000,el=$('#timer');
    if(el){el.textContent=fmtTime(left);el.classList.toggle('warn',left<=30)}
    if(left<=0){clearInterval(tickHandle);if(el)el.classList.remove('warn');submit(true)}
  };
  tick();tickHandle=setInterval(tick,500);
}
// skip: give up a bonus question (0 points). Stored on the game so a retry after a network error sends the same.
async function submit(timeout,skip){
  if(game.submitted||submitting) return;
  clearInterval(tickHandle);
  if(timeout){game.timedOut=true;save(KEY_CUR,game)}
  if(skip){game.skipping=true;save(KEY_CUR,game)}
  submitting=true;paintAnswers();
  const qi=game.qIndex,q=game.questions[qi];
  const answers=q.parts.map((p,i)=>game.answers[i]==null?null:canon(p.o[game.answers[i]]));
  let r;
  try{r=await api('answer',{id:game.id,q:qi,answers,skip:!!game.skipping})}
  catch(e){submitting=false;paintAnswers(e.message);sfx.bad();return}
  submitting=false;
  game.results[qi]={earned:r.earned,correct:r.correct,skipped:!!r.skipped,right:r.right,explain:r.explain,timeout:!!game.timedOut};
  game.score=r.score;game.submitted=true;game.done=r.done;save(KEY_CUR,game);
  r.skipped?sfx.click():r.earned===10?sfx.good():r.earned===0?sfx.bad():beep([523,659],.1);
  paintAnswers();showFeedback(true);
  const s=$('#score');if(s){s.textContent=game.score;s.classList.remove('bump');void s.offsetWidth;s.classList.add('bump')}
  const dot=$(`.dot[data-i="${qi}"]`);if(dot){dot.className=dotClass(qi)}
}
function showFeedback(scroll){
  const qi=game.qIndex,r=game.results[qi],M=mainCount();
  const last=qi===game.questions.length-1,toBonus=qi===M-1&&!last;
  const msg=r.skipped?t('skippedMsg'):r.earned===10?t('perfect'):r.earned>=6?t('great'):r.earned>0?t('almost'):t('notThis');
  const color=r.skipped?'var(--muted)':r.earned===10?'var(--ok)':r.earned===0?'var(--bad)':'var(--gold2)';
  $('#fb').innerHTML=`<div class="feedback">
    ${r.timeout?`<div style="color:var(--bad);font-weight:700;margin-bottom:6px">${t('timeUp')}</div>`:''}
    <div class="row" style="justify-content:space-between">
      <span class="big" style="color:${color}">${msg} +${t('pts',r.earned)}</span>
      ${r.skipped?'':`<span class="muted">${r.correct.map((c,i)=>`${i+1}: ${c?'✅':'❌'}`).join(' &nbsp; ')}</span>`}
    </div>
    <div class="exp"><b>${t('explain')}</b> ${esc(tx(r.explain))}</div>
    ${toBonus?`
    <div class="bonus-intro"><p style="margin-bottom:10px">${t('introScore',game.score)}</p>
      <h2>${t('introHead')}</h2><p class="muted">${t('introBody')}</p></div>
    <div class="row" style="justify-content:flex-start">
      <button class="btn violet" id="bonusBtn">${t('startBonus')}</button>
      <button class="btn ghost" id="finishBtn">${t('noBonus')}</button>
    </div>`:`
    <div class="row" style="justify-content:flex-start;margin-top:14px">
      <button class="btn" id="nextBtn">${last?t('toResults'):t('nextQ')}</button>
    </div>`}</div>`;
  // After the last main question: continue to the optional bonus, or finish (the result is already saved).
  if(toBonus){$('#bonusBtn').onclick=()=>{sfx.click();advance()};$('#finishBtn').onclick=finish}
  else $('#nextBtn').onclick=next;
  if(scroll) $('#fb').scrollIntoView({behavior:'smooth',block:'center'});
}
// Ends the game in the middle of the bonus (each school has limited time). The leaderboard row already
// holds the main score plus the bonus answered so far; the remaining bonus questions count as 0.
async function finishEarly(){
  if(submitting) return;
  if(await modal(t('finishTitle'),t('finishBody',game.score),t('finishYes'),t('cancel'))) finish();
}
function next(){
  if(game.qIndex<game.questions.length-1) advance();
  else finish();
}
function advance(){
  game.qIndex++;game.answers=blankAnswers(game.questions[game.qIndex]);
  game.submitted=false;game.timedOut=false;game.skipping=false;game.qStart=Date.now();
  save(KEY_CUR,game);go('game');
}

/* ---------- 5. סיום (השרת כבר שמר את התוצאה בטבלה) ---------- */
function finish(){
  const M=mainCount(),earned=i=>game.results[i]?game.results[i].earned:null;
  const per=game.questions.slice(0,M).map((_,i)=>earned(i)),bonusPer=game.questions.slice(M).map((_,j)=>earned(M+j));
  lastFinished={id:game.id,team:game.team,school:game.school,score:game.score,main:sum(per),bonus:sum(bonusPer),per,bonusPer};
  game=null;del(KEY_CUR);
  go('result');
}
// One square per question: the main questions, then the bonus ones (null = bonus question not reached).
function perSquares(per,bonusPer,tag,cls){
  return per.map((e,i)=>`<${tag} class="${cls} ${qScoreClass(e)}" title="${t('pts',e)}">${tag==='div'?i+1:''}</${tag}>`).join('')+
    (bonusPer||[]).map((e,i)=>`<${tag} class="${cls} bonus ${qScoreClass(e)}" title="${t('bonusLbl')} ${i+1}: ${e==null?'—':t('pts',e)}">${tag==='div'?'★':''}</${tag}>`).join('');
}
function renderResult(app){
  const r=lastFinished;
  if(!r){go('board');return}
  const title=r.main>=90?t('champ'):r.main>=70?t('excellent'):r.main>=40?t('effort'):t('thanks');
  const ptsText=r.bonus?t('ptsBreak',r.main,r.bonus):t('ptsOf100');
  app.innerHTML=cornerHTML()+`<div class="center"><div class="wrap" style="max-width:820px"><div class="card" style="text-align:center">
    <div style="color:var(--sea);font-weight:500">${esc(r.team)} · ${esc(r.school)}</div>
    <h1 style="margin-top:8px">${title}</h1>
    <div class="final-score" id="fs">0</div>
    <div class="muted" style="font-size:20px" id="rtime">${ptsText}</div>
    <div style="font-size:22px;margin:16px 0;min-height:40px" id="rank">${t('calcRank')}</div>
    <div class="dots" style="justify-content:center;margin:14px 0 24px">${perSquares(r.per,r.bonusPer,'div','dot')}</div>
    <div class="row" style="justify-content:center">
      <button class="btn sea" onclick="go('board')">${t('toBoard')}</button>
      <button class="btn" onclick="go('home')">${t('toHome')}</button>
    </div></div></div></div>`;
  let n=0;const el=$('#fs');const timer=setInterval(()=>{n=Math.min(r.score,n+2);el.textContent=n;if(n>=r.score)clearInterval(timer)},25);
  sfx.win();if(r.main>=50) confetti();
  fetchBoard().then(board=>{
    const idx=board.findIndex(x=>x.id===r.id);if(idx<0||screen!=='result')return;
    $('#rank').innerHTML=t('rank',idx+1,board.length);
    $('#rtime').textContent=ptsText+t('totalTime',fmtTime(board[idx].time));
  }).catch(()=>{const el=$('#rank');if(el)el.textContent=t('saved')});
}

/* ---------- 6. טבלת מובילים (מתעדכנת אוטומטית) ---------- */
let boardCache=null;
function renderBoard(app){
  app.innerHTML=cornerHTML()+`<div class="wrap" style="padding-top:60px"><div class="card">
    <div class="row" style="justify-content:space-between">
      <h1 style="margin:0">${t('board')} ${OFFLINE?`<span class="muted" style="font-size:14px">${t('localVer')}</span>`:`<span class="live">${t('live')}</span>`}</h1>
      <div class="row">
        <button class="btn sm ghost" onclick="go('home')">${t('homeBtn')}</button>
        <button class="btn sm" onclick="go('rules')">${t('newTeam')}</button>
      </div>
    </div>
    <div id="boardBody">${boardCache?boardHTML(boardCache):`<div class="empty">${t('loading')}</div>`}</div>
    <details style="margin-top:24px" ${adminPass?'open':''}><summary class="muted" style="cursor:pointer">${t('adminTools')}</summary>
      <div class="row" style="margin-top:12px">
        <button class="btn sm sea" onclick="exportCSV()">${t('exportCsv')}</button>
        <button class="btn sm ghost" onclick="exportJSON()">${t('backup')}</button>
        ${adminPass?`
        <button class="btn sm ghost" onclick="$('#imp').click()">${OFFLINE?t('importMerge'):t('importLocal')}</button>
        <input type="file" id="imp" accept=".json,application/json" style="display:none" onchange="importJSON(this.files[0])">
        <button class="btn sm danger" onclick="clearBoard()">${t('clearBoard')}</button>
        <button class="btn sm ghost" onclick="adminPass=null;render()">${t('adminLogout')}</button>`
        :`<button class="btn sm ghost" onclick="adminLogin()">${t('adminLogin')}</button>`}
      </div>
      <p class="muted" style="font-size:14px;line-height:1.6">${OFFLINE?t('noteOffline'):t('noteOnline')}</p>
    </details>
  </div></div>`;
  const refresh=()=>fetchBoard().then(b=>{boardCache=b;const el=$('#boardBody');if(el&&screen==='board')el.innerHTML=boardHTML(b)})
    .catch(e=>{const el=$('#boardBody');if(el&&screen==='board'&&!boardCache)el.innerHTML=`<div class="empty offline">⚠️ ${esc(e.message)}</div>`});
  refresh();
  tickHandle=setInterval(refresh,10000);
}
function boardHTML(board){
  if(!board.length) return `<div class="empty"><div style="font-size:50px">🏁</div>${t('empty')}</div>`;
  const medal=['🥇','🥈','🥉'];
  const top=board.slice(0,3);
  const podOrder=[1,0,2].filter(i=>top[i]);
  const heights={0:150,1:110,2:80},cols={0:'linear-gradient(180deg,#ffe08a,#f5b942)',1:'linear-gradient(180deg,#eef4ff,#a9bbd3)',2:'linear-gradient(180deg,#f0b68a,#c07a43)'};
  const meId=lastFinished&&lastFinished.id;
  return `<div class="podium">${podOrder.map(i=>`<div class="pod">
      <div style="font-size:34px">${medal[i]}</div><div class="nm">${esc(top[i].team)}</div><div class="sch">${esc(top[i].school)}</div>
      <div class="ps">${t('pts',top[i].score)}</div><div class="blk" style="height:${heights[i]}px;background:${cols[i]}">${i+1}</div></div>`).join('')}</div>
    <div class="table-scroll"><table class="board">
      <thead><tr><th>${t('thRank')}</th><th>${t('thTeam')}</th><th>${t('thSchool')}</th><th>${t('thScore')}</th><th>${t('thTime')}</th><th>${t('thPer')}</th><th>${t('thDate')}</th></tr></thead>
      <tbody>${board.map((r,i)=>`<tr class="${r.id===meId?'me':''}">
        <td>${medal[i]||i+1}</td>
        <td><b>${esc(r.team)}</b>${r.offline?` <span class="muted" title="${t('importedTip')}">📴</span>`:''}${r.members?`<div class="muted" style="font-size:13px">${esc(r.members)}</div>`:''}</td>
        <td>${esc(r.school)}</td><td class="sc">${r.score}${r.bonus?`<div class="sc-break">${rowMain(r)} + ${r.bonus}★</div>`:''}</td><td style="direction:ltr;text-align:right">${fmtTime(r.time)}</td>
        <td><div class="mini">${perSquares(r.per,r.bonusPer,'i','')}</div></td>
        <td class="muted" style="font-size:13px;white-space:nowrap">${fmtDate(r.date)}
          ${adminPass?`<button class="icon-btn" style="margin-right:8px" title="${t('deleteTip')}" data-id="${esc(r.id)}" data-team="${esc(r.team)}" onclick="deleteRow(this.dataset.id,this.dataset.team)">🗑</button>`:''}</td></tr>`).join('')}</tbody>
    </table></div>`;
}
async function adminCall(data){return api('admin',Object.assign({password:adminPass},data))}
async function adminLogin(){
  if(OFFLINE){adminPass='local';render();return}
  const p=await modal(t('adminTitle'),t('adminBody'),t('enter'),t('cancel'),false,true);
  if(!p) return;
  try{await api('admin',{password:p,action:'verify'});adminPass=p;render()}
  catch(e){errModal(e)}
}
async function deleteRow(id,team){
  if(!await modal(t('deleteTitle'),t('deleteBody',esc(team)),t('del'),t('cancel'),true)) return;
  try{await adminCall({action:'delete',id});boardCache=null;render()}catch(e){errModal(e)}
}
async function clearBoard(){
  if(!await modal(t('clearTitle'),t('clearBody'),t('clearYes'),t('cancel'),true)) return;
  try{await adminCall({action:'clear'});boardCache=null;render()}catch(e){errModal(e)}
}
function importJSON(file){
  if(!file) return;
  const fr=new FileReader();
  fr.onload=async()=>{
    try{
      const data=JSON.parse(fr.result);if(!Array.isArray(data)) throw new Error(t('badBackup'));
      const r=await adminCall({action:'import',records:data});
      await modal(t('importDone'),t('importAdded',r.added),t('close'),null);boardCache=null;render();
    }catch(e){errModal(e.message?e:t('badBackup'))}
  };
  fr.readAsText(file);
}
function download(name,content,type){
  const blob=new Blob([content],{type});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
async function exportCSV(){
  try{
    const board=await fetchBoard(),h=t('csv');
    const B=t('bonusLbl'),nB=Math.max(0,...board.map(r=>(r.bonusPer||[]).length));
    const rows=[[...h.slice(0,6),...KINDS.map((_,i)=>h[6].replace('{0}',i+1)),B,...Array.from({length:nB},(_,i)=>B+' '+(i+1)),h[7],h[8]]];
    board.forEach((r,i)=>rows.push([i+1,r.team,r.school,r.members||'',r.score,r.time,...r.per,r.bonus||0,
      ...Array.from({length:nB},(_,j)=>(r.bonusPer||[])[j]??''),r.lang==='cs'?'C#':'Java',fmtDate(r.date)]));
    const csv='﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    download('akko-cs-results.csv',csv,'text/csv;charset=utf-8');
  }catch(e){errModal(e)}
}
async function exportJSON(){
  try{download('akko-cs-backup.json',JSON.stringify(await fetchBoard(),null,1),'application/json')}
  catch(e){errModal(e)}
}

/* ---------- אפקטים ---------- */
(function rain(){
  const c=$('#rain'),x=c.getContext('2d');let cols=[],W,H;
  const chars='01{}();<>=+*/%[]ifforwhilereturn';
  function size(){W=c.width=innerWidth;H=c.height=innerHeight;cols=Array.from({length:Math.ceil(W/26)},()=>Math.random()*H)}
  size();addEventListener('resize',size);
  setInterval(()=>{
    x.fillStyle='rgba(6,17,31,.18)';x.fillRect(0,0,W,H);
    x.font='15px JetBrains Mono, monospace';
    cols.forEach((y,i)=>{x.fillStyle=i%5===0?'#f5b942':'#2ec4d6';x.fillText(chars[Math.floor(Math.random()*chars.length)],i*26,y);
      cols[i]=y>H+Math.random()*4000?0:y+18});
  },80);
})();
function confetti(){
  const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const colors=['#f5b942','#2ec4d6','#3ddc84','#ff8fb1','#ffffff'];
  const ps=Array.from({length:180},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.6,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,
    s:6+Math.random()*7,r:Math.random()*6,vr:(Math.random()-.5)*.3,col:colors[Math.floor(Math.random()*colors.length)]}));
  let f=0;(function step(){
    x.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.col;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});
    if(++f<260) requestAnimationFrame(step);else x.clearRect(0,0,c.width,c.height);
  })();
}

applyLang();
render();
