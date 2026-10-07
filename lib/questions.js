// Question bank — server side only (also inlined into the offline build).
// The correct answer is always option 0; options are shuffled before being sent to the browser.
// kind: gen = general CS, loop/prog/rec = code tracing, think = challenge. time = seconds per question.
export const QUESTIONS = [
/* ---------- שאלות כלליות במדעי המחשב ---------- */
{
  kind:'gen', time:120,
  title:'ייצוג מידע',
  prompt:'במחשב, כל סיבית (bit) יכולה לקבל אחד משני ערכים: 0 או 1. בייט (byte) אחד מורכב מ-8 סיביות.',
  parts:[
    {q:'כמה ערכים שונים אפשר לייצג באמצעות 8 סיביות?', pts:10, mono:true, o:['256','255','128','8']}
  ],
  explain:'כל סיבית נוספת מכפילה פי 2 את מספר האפשרויות: 2⁸ = 256 ערכים שונים (למשל המספרים 0 עד 255).'
},
{
  kind:'gen', time:120,
  title:'יעילות אלגוריתמים',
  prompt:'במערך ממוין יש 1,000,000 מספרים. מחפשים בו מספר באמצעות חיפוש בינארי: בכל שלב בודקים את האיבר האמצעי, וממשיכים לחפש רק בחצי שבו המספר יכול להימצא.',
  parts:[
    {q:'בערך כמה השוואות יידרשו במקרה הגרוע ביותר?', pts:10, o:['כ-20','כ-1,000','כ-500,000','1,000,000']}
  ],
  explain:'כל השוואה מחלקת את טווח החיפוש בחצי. מכיוון ש-2²⁰ ≈ 1,000,000, אחרי כ-20 חלוקות נשאר איבר אחד בלבד. לשם השוואה, חיפוש סדרתי עלול לדרוש מיליון השוואות.'
},
{
  kind:'gen', time:120,
  title:'מבני נתונים',
  prompt:'מבנה נתונים מסוים פועל בשיטת LIFO — Last In, First Out: האיבר האחרון שהוכנס הוא הראשון שיוצא. כך בדיוק פועל כפתור "ביטול" (Undo) בעורך טקסט — הפעולה האחרונה מתבטלת ראשונה.',
  parts:[
    {q:'איזה מבנה נתונים זה?', pts:10, o:['מחסנית (Stack)','תור (Queue)','עץ בינארי (Binary Tree)','טבלת גיבוב (Hash Table)']}
  ],
  explain:'במחסנית מכניסים ומוציאים איברים מאותו קצה (push / pop), ולכן האחרון שנכנס יוצא ראשון. בתור (Queue) זה הפוך — FIFO: הראשון שנכנס יוצא ראשון.'
},

/* ---------- שאלות קוד ---------- */
{
  kind:'rec', time:300, file:'Main.java',
  title:'מעקב אחר פעולה רקורסיבית על מערך',
  code:
`public static int mystery(int[] a, int i) {
    if (i == a.length)
        return 0;
    int r = mystery(a, i + 1);
    if (a[i] % 2 == 0) {
        System.out.print(a[i] + " ");
        return r + a[i];
    }
    return r;
}`,
  call:`int[] arr = {5, 4, 7, 10, 6, 3};
int res = mystery(arr, 0);`,
  params:[['a','{5, 4, 7, 10, 6, 3}'],['i','0']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['6 10 4','4 10 6','5 7 3','3 7 5']},
    {q:'מה תחזיר הפעולה (ערכו של res)?', pts:3, mono:true, o:['20','18','35','3']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['מחזירה את סכום האיברים הזוגיים במערך (ומדפיסה אותם מהסוף להתחלה)','מחזירה את סכום האיברים הנמצאים במקומות זוגיים במערך','מחזירה את מספר האיברים הזוגיים במערך','מחזירה את סכום האיברים האי-זוגיים במערך']}
  ],
  explain:'הקריאה הרקורסיבית מתבצעת לפני ההדפסה, ולכן ההדפסות קורות "בדרך חזרה" — מסוף המערך להתחלה: 6, 10, 4. הערך המוחזר הוא סכום האיברים הזוגיים: 6+10+4 = 20.'
},
{
  kind:'loop', time:300, file:'Main.java',
  title:'מעקב אחר פעולה חיצונית עם לולאה ומחרוזת',
  code:
`public static String conv(int n) {
    String res = "";
    while (n > 0) {
        res = (n % 2) + res;
        n = n / 2;
        System.out.print(n + " ");
    }
    System.out.println();
    return res;
}`,
  call:`String r = conv(13);`,
  params:[['n','13']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['6 3 1 0','1 0 1 1','13 6 3 1','6 3 1']},
    {q:'מה תחזיר הפעולה (ערכו של r)?', pts:3, mono:true, o:['"1101"','"1011"','"13"','"0110"']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['מחזירה מחרוזת עם הייצוג הבינארי (בסיס 2) של n','מחזירה מחרוזת עם ספרות n בסדר הפוך','מחזירה את מספר הספרות 1 בייצוג של n','מחזירה כמה פעמים אפשר לחלק את n ב-2']}
  ],
  explain:'n עובר 13 → 6 → 3 → 1 → 0 ואחרי כל חלוקה מודפס n: "6 3 1 0". השאריות 1, 0, 1, 1 מתווספות משמאל ל-res, ולכן res = "1101" — הייצוג הבינארי של 13.'
},
{
  kind:'prog', time:300, file:'Program.java',
  title:'מעקב אחר תוכנית עם לולאה על מערך',
  code:
`public static void main(String[] args) {
    int[] arr = {4, 6, 9, 2, 3, 5, 8, 1};
    int len = 1, best = 1;
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > arr[i - 1]) {
            len++;
            if (len > best)
                best = len;
        } else {
            System.out.print(len + " ");
            len = 1;
        }
    }
    System.out.println();
    System.out.println(best);
}`,
  call:null, params:[],
  parts:[
    {q:'מה תדפיס התוכנית?', pts:3, mono:true, o:['3 4\n4','3 4\n3','3\n4','2 3\n4']},
    {q:'מה ערכו של המשתנה best בסוף התוכנית?', pts:3, mono:true, o:['4','3','8','1']},
    {q:'מה מבצעת התוכנית?', pts:4, o:['מוצאת את אורך הרצף הרציף העולה הארוך ביותר במערך','סופרת כמה פעמים הסדר העולה במערך "נשבר"','מוצאת את הערך הגדול ביותר במערך','בודקת אם המערך ממוין בסדר עולה']}
  ],
  explain:'הרצף 4, 6, 9 (אורך 3) נשבר ב-2 → מודפס 3. הרצף 2, 3, 5, 8 (אורך 4) נשבר ב-1 → מודפס 4. best שומר את האורך המקסימלי: 4.'
},
{
  kind:'rec', time:300, file:'Main.java',
  title:'מעקב אחר פעולה רקורסיבית על מערך',
  code:
`public static boolean check(int[] a, int lo, int hi) {
    if (lo >= hi)
        return true;
    System.out.print(a[lo] + "-" + a[hi] + " ");
    if (a[lo] != a[hi])
        return false;
    return check(a, lo + 1, hi - 1);
}`,
  call:`int[] arr = {2, 7, 4, 9, 4, 7, 2};
boolean ok = check(arr, 0, 6);`,
  params:[['a','{2, 7, 4, 9, 4, 7, 2}'],['lo','0'],['hi','6']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['2-2 7-7 4-4','2-2 7-7 4-4 9-9','2-7 4-9','2-2']},
    {q:'מה תחזיר הפעולה (ערכו של ok)?', pts:3, mono:true, o:['true','false','3','-1']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['בודקת אם המערך הוא פלינדרום (נקרא אותו דבר משני הכיוונים)','בודקת אם המערך ממוין בסדר עולה','בודקת אם כל איברי המערך שונים זה מזה','בודקת אם סכום החצי הראשון שווה לסכום החצי השני']}
  ],
  explain:'הפעולה משווה זוגות מהקצוות פנימה: (2,2), (7,7), (4,4). כשמגיעים ל-lo=3, hi=3 מתקיים lo>=hi ומוחזר true. המערך הוא פלינדרום.'
},

/* ---------- שאלות אתגר וחשיבה ---------- */
{
  kind:'think', time:300,
  title:'אתגר המאזניים',
  prompt:'לפניכם 9 מטבעות שנראים זהים. 8 מהם שוקלים בדיוק אותו דבר, ומטבע אחד מזויף — והוא כבד יותר.\nיש לכם מאזני כפות בלי משקולות: הם מראים רק איזה צד כבד יותר, או שהצדדים שווים.',
  parts:[
    {q:'מהו המספר הקטן ביותר של שקילות שמבטיח למצוא את המטבע המזויף בכל מקרה?', pts:10, mono:true, o:['2','3','4','1']}
  ],
  explain:'מחלקים ל-3 קבוצות של 3 מטבעות ושוקלים שתיים מהן: אם צד אחד כבד — המזויף בו; אם יש שוויון — המזויף בקבוצה השלישית. מתוך 3 המטבעות שוקלים שניים באותה שיטה. כל שקילה מחלקת את האפשרויות ב-3: 9 → 3 → 1, ולכן מספיקות 2 שקילות.'
},
{
  kind:'think', time:300,
  title:'אתגר הגשר',
  prompt:'ארבעה חברים צריכים לחצות גשר צר בלילה. יש להם פנס אחד בלבד, ואסור לחצות בלי פנס (מישהו צריך להחזיר אותו).\nעל הגשר יכולים ללכת לכל היותר שניים בבת אחת, וזוג הולך בקצב של האיטי מביניהם.\nזמני החצייה: א׳ — דקה אחת, ב׳ — 2 דקות, ג׳ — 5 דקות, ד׳ — 10 דקות.',
  parts:[
    {q:'מהו הזמן הקצר ביותר שבו כל הארבעה יכולים להגיע לצד השני?', pts:10, o:['17 דקות','19 דקות','18 דקות','15 דקות']}
  ],
  explain:'א+ב חוצים (2), א חוזר (1), ג+ד חוצים יחד (10), ב חוזר (2), א+ב חוצים (2): סה"כ 17 דקות. הטריק: לשלוח את שני האיטיים ביחד, כך ש-5 הדקות של ג׳ "נבלעות" בתוך 10 הדקות של ד׳. (הפתרון ה"טבעי" — א׳ מלווה את כולם — נותן 19.)'
},
{
  kind:'think', time:300,
  title:'אתגר הלוקרים',
  prompt:'במסדרון בית הספר יש 100 לוקרים סגורים, ממוספרים 1 עד 100. 100 תלמידים עוברים במסדרון בזה אחר זה.\nתלמיד מספר k משנה את המצב (פותח לוקר סגור / סוגר לוקר פתוח) של כל לוקר שמספרו מתחלק ב-k.\nכלומר: תלמיד 1 פותח את כולם, תלמיד 2 סוגר את 2, 4, 6, …, תלמיד 3 משנה את 3, 6, 9, … וכן הלאה עד תלמיד 100.',
  parts:[
    {q:'כמה לוקרים יהיו פתוחים בסוף?', pts:10, mono:true, o:['10','50','0','25']}
  ],
  explain:'מצב לוקר משתנה פעם אחת עבור כל מחלק של מספרו. מחלקים באים בזוגות (12 = 3×4 = 2×6 = 1×12), ולכן לרוב המספרים יש מספר זוגי של מחלקים והלוקר חוזר להיות סגור. רק למספרים ריבועיים (16 = 4×4) יש מספר אי-זוגי של מחלקים. לכן נשארים פתוחים רק 1, 4, 9, …, 100 — 10 לוקרים.'
}
];

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// What the browser receives: question content and shuffled options, no answers or explanations.
export function publicQuestions() {
  return QUESTIONS.map(({ explain, ...q }) => ({
    ...q,
    parts: q.parts.map(p => ({ ...p, o: shuffled(p.o) }))
  }));
}

// Scores one answer into `game` (mutates it). A question is scored only once; repeats return the
// stored result. When the last question is answered, `record` is the leaderboard row to save.
export function applyAnswer(game, q, answers) {
  const Q = QUESTIONS[q];
  let r = game.results[q];
  if (!r) {
    const a = Array.isArray(answers) ? answers : [];
    const correct = Q.parts.map((p, i) => a[i] === p.o[0]);
    const earned = Q.parts.reduce((s, p, i) => s + (correct[i] ? p.pts : 0), 0);
    r = game.results[q] = { earned, correct };
  }
  const score = Object.values(game.results).reduce((s, x) => s + x.earned, 0);
  const done = QUESTIONS.every((_, i) => game.results[i]);
  let record = null;
  if (done && !game.finished) {
    game.finished = Date.now();
    record = {
      id: game.id, team: game.team, school: game.school, members: game.members, lang: game.lang,
      score, time: Math.round((game.finished - game.started) / 1000), date: game.finished,
      per: QUESTIONS.map((_, i) => game.results[i].earned)
    };
  }
  return {
    record,
    result: { earned: r.earned, correct: r.correct, right: Q.parts.map(p => p.o[0]), explain: Q.explain, score, done }
  };
}
