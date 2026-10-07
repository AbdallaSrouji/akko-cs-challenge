/* =========================================================
   אתגר הקוד של עכו — גרסה מקוונת.
   השאלות, התשובות והניקוד נמצאים בשרת (תיקיית api/),
   כך שהתשובות הנכונות אינן חשופות בקוד הדף.
   ========================================================= */
const KINDS = ['gen','gen','gen','rec','loop','prog','rec','think','think','think'];
const KIND_LABEL = {gen:'מדעי המחשב · כללי', loop:'קוד · לולאה ומחרוזת', prog:'קוד · תוכנית ומערך', rec:'קוד · רקורסיה ומערך', think:'אתגר חשיבה'};
const KIND_TIME = {gen:120, loop:300, prog:300, rec:300, think:300};
const OFFLINE = typeof LOCAL_API !== 'undefined';
const LETTERS = ['א','ב','ג','ד'];

/* ---------- אחסון מקומי (משחק פתוח והגדרות של המחשב הזה) ---------- */
const KEY_CUR=OFFLINE?'akkoCS_offline_current_v2':'akkoCS_online_current_v2', KEY_SET='akkoCS_settings_v2';
const mem={};
function load(k,def){let v=null;try{v=localStorage.getItem(k)}catch(e){}if(v==null)v=mem[k];try{return v?JSON.parse(v):def}catch(e){return def}}
function save(k,v){const s=JSON.stringify(v);mem[k]=s;try{localStorage.setItem(k,s)}catch(e){}}
function del(k){delete mem[k];try{localStorage.removeItem(k)}catch(e){}}
let settings = Object.assign({timerOn:true, sound:true, lang:'java'}, load(KEY_SET,{}));
let game = load(KEY_CUR,null);
let screen = 'home';
let tickHandle = null;
let adminPass = null;
let lastFinished = null;

/* ---------- שרת ---------- */
async function api(path,data){
  if(OFFLINE) return LOCAL_API[path](JSON.parse(JSON.stringify(data||{})));
  let r;
  try{
    r=await fetch('/api/'+path,data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{cache:'no-store'});
  }catch(e){throw new Error('אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.')}
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok) throw new Error(j.error||('שגיאת שרת ('+r.status+')'));
  return j;
}
async function fetchBoard(){return (await api('scores')).board}

/* ---------- עזרים ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtTime(sec){sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0')}
function fmtDate(ts){const d=new Date(ts);return d.toLocaleDateString('he-IL')+' '+d.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})}
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
  const re=/(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(\d+)\b|\b(public|static|int|void|return|if|else|while|for|new|boolean|bool|String|string|true|false)\b|\b([A-Za-z_]\w*)(?=\s*\()/gm;
  let out='',last=0,m;
  while((m=re.exec(code))){
    out+=esc(code.slice(last,m.index));const t=esc(m[0]);
    const cls=m[1]?'c':m[2]?'s':m[3]?'n':m[4]?'k':'f';
    out+=`<span class="tk-${cls}">${t}</span>`;last=re.lastIndex;
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
      const t=actx.currentTime+i*dur;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.02);
      g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+.02)});
  }catch(e){}
}
const sfx={click:()=>beep([660],.06,'triangle'),good:()=>beep([523,659,784,1047],.11),bad:()=>beep([300,220],.18,'sawtooth'),win:()=>beep([523,659,784,1047,784,1047],.13)};

/* ---------- מודאל ---------- */
function modal(title,body,okText='אישור',cancelText='ביטול',danger=false,withInput=false){
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

/* ---------- ניווט ---------- */
function go(s){screen=s;clearInterval(tickHandle);render();window.scrollTo(0,0)}
function render(){
  const app=$('#app');
  ({home:renderHome,rules:renderRules,register:renderRegister,game:renderGame,result:renderResult,board:renderBoard})[screen](app);
}
function cornerHTML(){
  return `<div class="corner">
    <button class="icon-btn" title="מסך מלא" onclick="toggleFS()">⛶</button>
    <button class="icon-btn" title="צלילים" onclick="toggleSound()">${settings.sound?'🔊':'🔇'}</button>
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
    <rect x="330" y="96" width="120" height="40" fill="url(#wall)"/><path d="M345 96 a45 40 0 0 1 90 0Z" fill="#2ec4d6"/><rect x="386" y="44" width="8" height="14" fill="#f5b942"/>
    <rect x="470" y="34" width="18" height="102" fill="url(#wall)"/><polygon points="479,0 466,34 492,34" fill="#2ec4d6"/><rect x="464" y="60" width="30" height="5" fill="#9b6a17"/>
    <rect x="240" y="104" width="70" height="40" fill="#c58d24"/><rect x="510" y="98" width="80" height="46" fill="#c58d24"/><rect x="600" y="110" width="60" height="34" fill="#a8761b"/>
    <path d="M200 132 h30 v-12 h12 v12 h30 v-12 h12 v12 h420 V190 H200Z" fill="url(#wall)"/>
    <g fill="#081629" opacity=".7"><rect x="256" y="114" width="10" height="14" rx="5"/><rect x="284" y="114" width="10" height="14" rx="5"/><rect x="528" y="110" width="10" height="16" rx="5"/><rect x="556" y="110" width="10" height="16" rx="5"/></g>
    <text x="540" y="164" font-family="JetBrains Mono,monospace" font-size="15" fill="#081629" opacity=".75" direction="ltr">for (Akko a : teams)</text>
    <rect x="0" y="170" width="820" height="20" fill="url(#sea)"/>
    <path d="M0 176 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#7ae6f2" stroke-width="2" fill="none" opacity=".6"/>
  </svg>`;
}
function renderHome(app){
  app.innerHTML=cornerHTML()+`<div class="center"><div class="wrap"><div class="hero" style="margin:0 auto">
    <span class="kicker">יום שיא במדעי המחשב · תיכוני עכו</span>
    ${skylineSVG()}
    <h1>אתגר הקוד של עכו</h1>
    <div class="sub">10 שאלות · ידע במדעי המחשב, מעקב קוד ואתגרי חשיבה · 100 נקודות · צוות אחד יכבוש את החומות</div>
    <div class="row">
      <button class="btn" onclick="sfx.click();go('rules')">▶ התחילו לשחק</button>
      <button class="btn sea" onclick="sfx.click();go('board')">🏆 טבלת המובילים</button>
    </div>
    ${game?`<div class="resume">יש משחק פתוח של הצוות <b>${esc(game.team)}</b> (${esc(game.school)}) — שאלה ${game.qIndex+1} מתוך 10.
      <div class="row" style="justify-content:center;margin-top:10px">
        <button class="btn sm" onclick="go('game')">המשך משחק</button>
        <button class="btn sm ghost" onclick="abandon()">בטל משחק זה</button></div></div>`:''}
    <div class="stats" id="stats">
      <div class="stat"><b>…</b>צוותים שיחקו</div>
      <div class="stat"><b>…</b>בתי ספר</div>
      <div class="stat"><b>…</b>שיא נקודות</div>
    </div>
  </div></div></div>`;
  fetchBoard().then(board=>{
    const el=$('#stats');if(!el||screen!=='home')return;
    const best=board.reduce((m,r)=>Math.max(m,r.score),0);
    const schools=new Set(board.map(r=>r.school.trim())).size;
    el.innerHTML=`<div class="stat"><b>${board.length}</b>צוותים שיחקו</div><div class="stat"><b>${schools}</b>בתי ספר</div><div class="stat"><b>${best}</b>שיא נקודות</div>`;
  }).catch(e=>{
    const el=$('#stats');if(el)el.innerHTML=`<div class="offline">⚠️ ${esc(e.message)} אם אין רשת באולם — השתמשו בגרסה המקומית שבמחשב.</div>`;
  });
}
async function abandon(){
  if(await modal('ביטול משחק','המשחק הפתוח יבוטל במחשב הזה והתוצאה לא תיכנס לטבלה. להמשיך?','כן, בטל','חזרה',true)){
    game=null;del(KEY_CUR);render();
  }
}

/* ---------- 2. הנחיות ---------- */
function renderRules(app){
  app.innerHTML=cornerHTML()+`<div class="wrap" style="padding-top:60px"><div class="card">
    <h1>📜 הנחיות לפעילות</h1>
    <p class="muted" style="font-size:18px;line-height:1.7">כל צוות מקבל 10 שאלות בשלושה שלבים, 10 נקודות לכל שאלה — 100 נקודות בסך הכל. בשאלות הקוד שימו לב: <b style="color:var(--gold2)">שמות הפעולות אינם מרמזים על תפקידן</b> — עליכם לעקוב אחר הקוד בעצמכם!</p>
    <div class="steps">
      <div class="step"><div class="num">1–3</div><h3>🧠 מדעי המחשב — כללי</h3><div class="muted">3 שאלות ידע וחשיבה: ייצוג מידע, יעילות ומבני נתונים. ${settings.timerOn?'2 דקות לשאלה.':''}</div></div>
      <div class="step"><div class="num">4–7</div><h3>💻 שאלות קוד</h3><div class="muted">4 שאלות מעקב: רקורסיה, לולאות, מערכים ומחרוזות. לכל שאלה 3 סעיפים — מה יודפס, מה יוחזר ומה התפקיד. ${settings.timerOn?'5 דקות לשאלה.':''}</div></div>
      <div class="step"><div class="num">8–10</div><h3>🏰 אתגרי חשיבה</h3><div class="muted">3 חידות אלגוריתמיות לסיום — חשבו לפני שאתם עונים! ${settings.timerOn?'5 דקות לשאלה.':''}</div></div>
      <div class="step"><div class="num">✔</div><h3>הגישו ולמדו</h3><div class="muted">לאחר ההגשה תראו מה צדקתם, את הניקוד ואת הסבר הפתרון. אין חזרה לשאלה קודמת.</div></div>
    </div>
    <div class="steps" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
      <div class="step"><h3>🎯 ניקוד</h3>
        <table class="pts-table">
          <tr><td>שאלה כללית / אתגר — תשובה נכונה</td><td>10 נק'</td></tr>
          <tr><td>שאלת קוד — מה יודפס</td><td>3 נק'</td></tr>
          <tr><td>שאלת קוד — מה יוחזר / ערך המשתנה</td><td>3 נק'</td></tr>
          <tr><td>שאלת קוד — מה תפקיד הקוד</td><td>4 נק'</td></tr>
          <tr><td><b>סה"כ במשחק</b></td><td>100 נק'</td></tr>
        </table></div>
      <div class="step"><h3>⏱️ זמן ושוויון</h3>
        <div class="muted" style="line-height:1.7">${settings.timerOn?'לכל שאלה מוגבל זמן (מוצג בראש המסך). כשהזמן נגמר — התשובות שסומנו מוגשות אוטומטית.':'הגבלת הזמן כבויה.'}
        הניקוד שלכם מוצג כל הזמן בראש המסך. במקרה של שוויון בנקודות — מנצח הצוות שסיים בזמן הקצר יותר.</div>
        <label class="f">הגבלת זמן (למארגנים):</label>
        <div class="seg">
          <button class="${settings.timerOn?'on':''}" onclick="settings.timerOn=true;save(KEY_SET,settings);render()">פעילה</button>
          <button class="${settings.timerOn?'':'on'}" onclick="settings.timerOn=false;save(KEY_SET,settings);render()">כבויה</button>
        </div></div>
      <div class="step"><h3>🗺️ מפת השאלות</h3>
        <div class="qmap">${KINDS.map((k,i)=>`<div><b>${i+1}.</b> ${KIND_LABEL[k]}</div>`).join('')}</div></div>
    </div>
    <div class="row" style="justify-content:space-between;margin-top:10px">
      <button class="btn ghost" onclick="go('home')">→ חזרה</button>
      <button class="btn" onclick="sfx.click();go('register')">הבנו, ממשיכים ←</button>
    </div>
  </div></div>`;
}

/* ---------- 3. רישום צוות ---------- */
function renderRegister(app){
  if(game){go('game');return}
  let lang=settings.lang;
  app.innerHTML=cornerHTML()+`<div class="center"><div class="wrap" style="display:flex;justify-content:center">
    <div class="card form">
      <h1>👥 רישום הצוות</h1>
      <div class="muted">הפרטים יישמרו בטבלת המובילים המשותפת בסיום המשחק.</div>
      <label class="f" for="team">שם הצוות *</label>
      <input class="in" id="team" maxlength="40" placeholder="למשל: אבירי הלולאה" autocomplete="off">
      <label class="f" for="school">בית הספר *</label>
      <input class="in" id="school" maxlength="60" placeholder="למשל: תיכון עכו" autocomplete="off" list="schools">
      <datalist id="schools"></datalist>
      <label class="f" for="members">שמות חברי הצוות (לא חובה)</label>
      <input class="in" id="members" maxlength="120" placeholder="דנה, עלי, נועם, מאיה" autocomplete="off">
      <label class="f">שפת התכנות להצגת הקוד</label>
      <div class="seg" id="seg">
        <button data-l="java" class="${lang==='java'?'on':''}">Java</button>
        <button data-l="cs" class="${lang==='cs'?'on':''}">C#</button>
      </div>
      <div class="err" id="err"></div>
      <div class="row" style="justify-content:space-between;margin-top:8px">
        <button class="btn ghost" onclick="go('rules')">→ חזרה</button>
        <button class="btn" id="startBtn">🚀 התחל את האתגר</button>
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
    if(!team||!school){$('#err').textContent='יש למלא שם צוות ושם בית ספר.';sfx.bad();return}
    busy=true;const btn=$('#startBtn');btn.disabled=true;btn.textContent='⏳ מתחבר לשרת...';$('#err').textContent='';
    try{
      const r=await api('start',{team,school,members,lang});
      settings.lang=lang;save(KEY_SET,settings);
      game={id:r.id,team,school,members,lang,questions:r.questions,qIndex:0,score:0,
        results:[],answers:blankAnswers(r.questions[0]),qStart:Date.now(),submitted:false};
      save(KEY_CUR,game);sfx.win();go('game');
    }catch(e){
      $('#err').textContent=e.message;sfx.bad();btn.disabled=false;btn.textContent='🚀 התחל את האתגר';busy=false;
    }
  };
  $('#startBtn').onclick=start;
  app.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')start()});
}

/* ---------- 4. משחק ---------- */
let submitting=false;
const blankAnswers=q=>q.parts.map(()=>null);
const timeLimit=q=>settings.timerOn?(q.time||KIND_TIME[q.kind]||300):0;
function codeColumn(q,L){
  const code=toLang(q.code,L),call=q.call?toLang(q.call,L):null;
  const fileName=L==='cs'?q.file.replace('.java','.cs'):q.file;
  return `<div class="codebox">
      <div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span>${fileName}</span></div>
      <pre class="code">${highlight(code)}</pre>
    </div>
    ${call?`<div class="callbox"><h4>📞 הקריאה לפעולה</h4><pre>${highlight(call)}</pre>
      <div class="muted" style="margin-bottom:6px;font-size:14px">ערכי הפרמטרים בקריאה הראשונה:</div>
      <div class="params">${q.params.map(([n,v])=>`<span class="param"><b>${n}</b> = ${esc(v)}</span>`).join('')}</div></div>`
    :`<div class="callbox"><h4>▶ הרצה</h4><div class="muted">התוכנית הראשית מורצת פעם אחת. עקבו אחר ערכי המשתנים בכל סיבוב של הלולאה.</div></div>`}`;
}
function promptColumn(q){
  const icon=q.kind==='think'?'🏰':'🧠';
  return `<div class="prompt ${q.kind}"><div class="picon">${icon}</div><h3>${esc(q.title)}</h3>
    ${q.prompt.split('\n').map(l=>`<p>${esc(l)}</p>`).join('')}</div>`;
}
function renderGame(app){
  if(!game){go('home');return}
  const qi=game.qIndex,q=game.questions[qi],L=game.lang;
  const dots=game.questions.map((_,i)=>{
    const r=game.results[i];const cls=r?qScoreClass(r.earned):(i===qi?'cur':'');
    return `<div class="dot ${cls}">${i+1}</div>`}).join('');
  app.innerHTML=`
  <div class="topbar"><div class="wrap">
    <div class="team-chip"><b>${esc(game.team)}</b><span>${esc(game.school)}</span></div>
    <div class="dots">${dots}</div>
    <div class="row">
      ${timeLimit(q)?`<div class="timer" id="timer">--:--</div>`:''}
      <div class="score-box"><span class="lbl">ניקוד</span><span class="val" id="score">${game.score}</span><span class="lbl">/100</span></div>
      <button class="icon-btn" title="צלילים" data-snd onclick="toggleSound()">${settings.sound?'🔊':'🔇'}</button>
      <button class="icon-btn" title="מסך מלא" onclick="toggleFS()">⛶</button>
      <button class="icon-btn" title="יציאה לדף הבית (המשחק נשמר)" onclick="go('home')">🏠</button>
    </div>
  </div></div>
  <div class="wrap">
    <div class="qhead">
      <h2 style="margin:0">שאלה ${qi+1} <span class="muted" style="font-weight:400">מתוך 10</span></h2>
      <span class="badge ${q.kind}">${KIND_LABEL[q.kind]}</span>
      <span class="muted">${q.code?esc(q.title)+' · ':''}10 נק'${timeLimit(q)?' · '+fmtTime(timeLimit(q))+' דק\'':''}</span>
    </div>
    <div class="qgrid">
      <div>${q.code?codeColumn(q,L):promptColumn(q)}</div>
      <div id="parts">
        ${q.parts.map((p,pi)=>`<div class="part"><h4><span>${q.parts.length>1?(pi+1)+'. ':''}${p.q}</span><small>${p.pts} נק'</small></h4>
          <div class="opts">${p.o.map((txt,oi)=>`<button class="opt" data-p="${pi}" data-o="${oi}">
            <span class="let">${LETTERS[oi]}</span><span class="txt ${p.mono?'mono':''}">${esc(p.mono?toLang(txt,L):txt)}</span></button>`).join('')}</div></div>`).join('')}
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
    if(game.submitted){if(q.parts[p].o[o]===r.right[p])b.classList.add('right');else if(chosen)b.classList.add('wrong')}
    else if(chosen)b.classList.add('sel');
  });
  const row=$('#submitRow');if(!row)return;
  if(game.submitted){row.innerHTML='';return}
  const n=game.answers.filter(a=>a!=null).length,N=q.parts.length;
  if(errMsg){
    row.innerHTML=`<span class="offline" style="flex:1">⚠️ ${esc(errMsg)}</span><button class="btn" id="subBtn">🔄 נסו לשלוח שוב</button>`;
  }else{
    row.innerHTML=`<span class="muted">${N>1?`נבחרו ${n} מתוך ${N} סעיפים`:(n?'נבחרה תשובה':'בחרו תשובה')}</span>
      <button class="btn" id="subBtn" ${n<N||submitting?'disabled':''}>${submitting?'⏳ שולח...':'✔ הגש תשובה'}</button>`;
  }
  $('#subBtn').onclick=()=>submit(game.timedOut);
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
async function submit(timeout){
  if(game.submitted||submitting) return;
  clearInterval(tickHandle);
  if(timeout){game.timedOut=true;save(KEY_CUR,game)}
  submitting=true;paintAnswers();
  const qi=game.qIndex,q=game.questions[qi];
  const texts=q.parts.map((p,i)=>game.answers[i]==null?null:p.o[game.answers[i]]);
  let r;
  try{r=await api('answer',{id:game.id,q:qi,answers:texts})}
  catch(e){submitting=false;paintAnswers(e.message);sfx.bad();return}
  submitting=false;
  game.results[qi]={earned:r.earned,correct:r.correct,right:r.right,explain:r.explain,timeout:!!game.timedOut};
  game.score=r.score;game.submitted=true;game.done=r.done;save(KEY_CUR,game);
  r.earned===10?sfx.good():r.earned===0?sfx.bad():beep([523,659],.1);
  paintAnswers();showFeedback(true);
  const s=$('#score');if(s){s.textContent=game.score;s.classList.remove('bump');void s.offsetWidth;s.classList.add('bump')}
  const dot=document.querySelectorAll('.dot')[qi];if(dot){dot.className='dot '+qScoreClass(r.earned)}
}
function showFeedback(scroll){
  const r=game.results[game.qIndex];
  const last=game.qIndex===game.questions.length-1;
  const msg=r.earned===10?'🎉 מושלם!':r.earned>=6?'👏 יפה מאוד!':r.earned>0?'💪 כמעט...':'😬 לא הפעם';
  const color=r.earned===10?'var(--ok)':r.earned===0?'var(--bad)':'var(--gold2)';
  $('#fb').innerHTML=`<div class="feedback">
    ${r.timeout?`<div style="color:var(--bad);font-weight:700;margin-bottom:6px">⏰ הזמן נגמר — הוגשו התשובות שסומנו.</div>`:''}
    <div class="row" style="justify-content:space-between">
      <span class="big" style="color:${color}">${msg} +${r.earned} נק'</span>
      <span class="muted">${r.correct.map((c,i)=>`${i+1}: ${c?'✅':'❌'}`).join(' &nbsp; ')}</span>
    </div>
    <div class="exp"><b>הסבר:</b> ${esc(r.explain)}</div>
    <div class="row" style="justify-content:flex-start;margin-top:14px">
      <button class="btn" id="nextBtn">${last?'🏁 לסיכום התוצאות':'לשאלה הבאה ←'}</button>
    </div></div>`;
  $('#nextBtn').onclick=next;
  if(scroll) $('#fb').scrollIntoView({behavior:'smooth',block:'center'});
}
function next(){
  if(game.qIndex<game.questions.length-1){
    game.qIndex++;game.answers=blankAnswers(game.questions[game.qIndex]);game.submitted=false;game.timedOut=false;game.qStart=Date.now();
    save(KEY_CUR,game);go('game');
  }else finish();
}

/* ---------- 5. סיום (השרת כבר שמר את התוצאה בטבלה) ---------- */
function finish(){
  lastFinished={id:game.id,team:game.team,school:game.school,score:game.score,per:game.results.map(r=>r.earned)};
  game=null;del(KEY_CUR);
  go('result');
}
function renderResult(app){
  const r=lastFinished;
  if(!r){go('board');return}
  const title=r.score>=90?'אלופי הקוד! 🏆':r.score>=70?'עבודה מצוינת! 🌟':r.score>=40?'כל הכבוד על המאמץ! 💪':'תודה שהשתתפתם! 🙌';
  app.innerHTML=cornerHTML()+`<div class="center"><div class="wrap" style="max-width:820px"><div class="card" style="text-align:center">
    <div style="color:var(--sea);font-weight:500">${esc(r.team)} · ${esc(r.school)}</div>
    <h1 style="margin-top:8px">${title}</h1>
    <div class="final-score" id="fs">0</div>
    <div class="muted" style="font-size:20px" id="rtime">נקודות מתוך 100</div>
    <div style="font-size:22px;margin:16px 0;min-height:40px" id="rank">⏳ מחשב את המיקום שלכם...</div>
    <div class="dots" style="justify-content:center;margin:14px 0 24px">${r.per.map((e,i)=>`<div class="dot ${qScoreClass(e)}" title="${e} נק'">${i+1}</div>`).join('')}</div>
    <div class="row" style="justify-content:center">
      <button class="btn sea" onclick="go('board')">🏆 לטבלת המובילים</button>
      <button class="btn" onclick="go('home')">🏠 לדף הפתיחה</button>
    </div></div></div></div>`;
  let n=0;const el=$('#fs');const t=setInterval(()=>{n=Math.min(r.score,n+2);el.textContent=n;if(n>=r.score)clearInterval(t)},25);
  sfx.win();if(r.score>=50) confetti();
  fetchBoard().then(board=>{
    const idx=board.findIndex(x=>x.id===r.id);if(idx<0||screen!=='result')return;
    $('#rank').innerHTML=`מקום <b style="color:var(--gold2);font-size:32px">${idx+1}</b> מתוך ${board.length} צוותים`;
    $('#rtime').textContent=`נקודות מתוך 100 · זמן כולל ${fmtTime(board[idx].time)}`;
  }).catch(()=>{const el=$('#rank');if(el)el.textContent='התוצאה נשמרה בשרת.'});
}

/* ---------- 6. טבלת מובילים (מתעדכנת אוטומטית) ---------- */
let boardCache=null;
function renderBoard(app){
  app.innerHTML=cornerHTML()+`<div class="wrap" style="padding-top:60px"><div class="card">
    <div class="row" style="justify-content:space-between">
      <h1 style="margin:0">🏆 טבלת המובילים ${OFFLINE?'<span class="muted" style="font-size:14px">📴 גרסה מקומית</span>':'<span class="live">● חי</span>'}</h1>
      <div class="row">
        <button class="btn sm ghost" onclick="go('home')">🏠 דף הפתיחה</button>
        <button class="btn sm" onclick="go('rules')">▶ צוות חדש</button>
      </div>
    </div>
    <div id="boardBody">${boardCache?boardHTML(boardCache):'<div class="empty">⏳ טוען תוצאות...</div>'}</div>
    <details style="margin-top:24px" ${adminPass?'open':''}><summary class="muted" style="cursor:pointer">⚙️ כלי מארגנים</summary>
      <div class="row" style="margin-top:12px">
        <button class="btn sm sea" onclick="exportCSV()">⬇ ייצוא ל-Excel ‏(CSV)</button>
        <button class="btn sm ghost" onclick="exportJSON()">💾 גיבוי (JSON)</button>
        ${adminPass?`
        <button class="btn sm ghost" onclick="$('#imp').click()">📂 ${OFFLINE?'ייבוא ומיזוג גיבוי':'ייבוא תוצאות מהגרסה המקומית'}</button>
        <input type="file" id="imp" accept=".json,application/json" style="display:none" onchange="importJSON(this.files[0])">
        <button class="btn sm danger" onclick="clearBoard()">🗑 ניקוי הטבלה</button>
        <button class="btn sm ghost" onclick="adminPass=null;render()">🔒 יציאת מארגן</button>`
        :`<button class="btn sm ghost" onclick="adminLogin()">🔑 כניסת מארגן</button>`}
      </div>
      <p class="muted" style="font-size:14px;line-height:1.6">${OFFLINE
        ?'גרסה מקומית: התוצאות נשמרות רק בדפדפן של המחשב הזה. כשהרשת חוזרת — ייצאו "גיבוי (JSON)" וייבאו אותו בטבלה המקוונת דרך כלי המארגנים.'
        :'הטבלה משותפת לכל המחשבים ומתעדכנת אוטומטית כל 10 שניות. במצב מארגן אפשר למחוק תוצאה בודדת (🗑 בשורה), לנקות את הטבלה, ולייבא קובץ גיבוי שיוצא מהגרסה המקומית — למקרה שחלק מהצוותים שיחקו בלי רשת.'}</p>
    </details>
  </div></div>`;
  const refresh=()=>fetchBoard().then(b=>{boardCache=b;const el=$('#boardBody');if(el&&screen==='board')el.innerHTML=boardHTML(b)})
    .catch(e=>{const el=$('#boardBody');if(el&&screen==='board'&&!boardCache)el.innerHTML=`<div class="empty offline">⚠️ ${esc(e.message)}</div>`});
  refresh();
  tickHandle=setInterval(refresh,10000);
}
function boardHTML(board){
  if(!board.length) return `<div class="empty"><div style="font-size:50px">🏁</div>עדיין אין תוצאות. היו הצוות הראשון!</div>`;
  const medal=['🥇','🥈','🥉'];
  const top=board.slice(0,3);
  const podOrder=[1,0,2].filter(i=>top[i]);
  const heights={0:150,1:110,2:80},cols={0:'linear-gradient(180deg,#ffe08a,#f5b942)',1:'linear-gradient(180deg,#eef4ff,#a9bbd3)',2:'linear-gradient(180deg,#f0b68a,#c07a43)'};
  const meId=lastFinished&&lastFinished.id;
  return `<div class="podium">${podOrder.map(i=>`<div class="pod">
      <div style="font-size:34px">${medal[i]}</div><div class="nm">${esc(top[i].team)}</div><div class="sch">${esc(top[i].school)}</div>
      <div class="ps">${top[i].score} נק'</div><div class="blk" style="height:${heights[i]}px;background:${cols[i]}">${i+1}</div></div>`).join('')}</div>
    <div class="table-scroll"><table class="board">
      <thead><tr><th>מקום</th><th>צוות</th><th>בית ספר</th><th>ניקוד</th><th>זמן</th><th>לפי שאלות</th><th>תאריך</th></tr></thead>
      <tbody>${board.map((r,i)=>`<tr class="${r.id===meId?'me':''}">
        <td>${medal[i]||i+1}</td>
        <td><b>${esc(r.team)}</b>${r.offline?' <span class="muted" title="יובא מהגרסה המקומית">📴</span>':''}${r.members?`<div class="muted" style="font-size:13px">${esc(r.members)}</div>`:''}</td>
        <td>${esc(r.school)}</td><td class="sc">${r.score}</td><td style="direction:ltr;text-align:right">${fmtTime(r.time)}</td>
        <td><div class="mini">${r.per.map(e=>`<i class="${qScoreClass(e)}" title="${e}"></i>`).join('')}</div></td>
        <td class="muted" style="font-size:13px;white-space:nowrap">${fmtDate(r.date)}
          ${adminPass?`<button class="icon-btn" style="margin-right:8px" title="מחק תוצאה" data-id="${esc(r.id)}" data-team="${esc(r.team)}" onclick="deleteRow(this.dataset.id,this.dataset.team)">🗑</button>`:''}</td></tr>`).join('')}</tbody>
    </table></div>`;
}
async function adminCall(data){return api('admin',Object.assign({password:adminPass},data))}
async function adminLogin(){
  if(OFFLINE){adminPass='local';render();return}
  const p=await modal('כניסת מארגן','הזינו את סיסמת המארגנים (ADMIN_PASSWORD שהוגדרה ב-Vercel).','כניסה','ביטול',false,true);
  if(!p) return;
  try{await api('admin',{password:p,action:'verify'});adminPass=p;render()}
  catch(e){modal('שגיאה',esc(e.message),'סגור',null)}
}
async function deleteRow(id,team){
  if(!await modal('מחיקת תוצאה',`למחוק את התוצאה של "${esc(team)}"?`,'מחק','ביטול',true)) return;
  try{await adminCall({action:'delete',id});boardCache=null;render()}catch(e){modal('שגיאה',esc(e.message),'סגור',null)}
}
async function clearBoard(){
  if(!await modal('ניקוי טבלת המובילים','כל התוצאות בשרת יימחקו לצמיתות, בכל המחשבים. מומלץ לייצא גיבוי לפני כן. למחוק?','כן, מחק הכל','ביטול',true)) return;
  try{await adminCall({action:'clear'});boardCache=null;render()}catch(e){modal('שגיאה',esc(e.message),'סגור',null)}
}
function importJSON(file){
  if(!file) return;
  const fr=new FileReader();
  fr.onload=async()=>{
    try{
      const data=JSON.parse(fr.result);if(!Array.isArray(data)) throw new Error('הקובץ אינו גיבוי תקין של המשחק.');
      const r=await adminCall({action:'import',records:data});
      await modal('ייבוא הושלם',`נוספו ${r.added} תוצאות חדשות לטבלה.`,'סגור',null);boardCache=null;render();
    }catch(e){modal('שגיאה',esc(e.message||'הקובץ אינו גיבוי תקין של המשחק.'),'סגור',null)}
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
    const board=await fetchBoard();
    const rows=[['מקום','צוות','בית ספר','חברי צוות','ניקוד','זמן (שניות)',...KINDS.map((_,i)=>'שאלה '+(i+1)),'שפה','תאריך']];
    board.forEach((r,i)=>rows.push([i+1,r.team,r.school,r.members||'',r.score,r.time,...r.per,r.lang==='cs'?'C#':'Java',fmtDate(r.date)]));
    const csv='﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    download('akko-cs-results.csv',csv,'text/csv;charset=utf-8');
  }catch(e){modal('שגיאה',esc(e.message),'סגור',null)}
}
async function exportJSON(){
  try{download('akko-cs-backup.json',JSON.stringify(await fetchBoard(),null,1),'application/json')}
  catch(e){modal('שגיאה',esc(e.message),'סגור',null)}
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

render();
