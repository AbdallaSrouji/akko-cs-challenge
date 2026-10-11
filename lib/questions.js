// Question bank — server side only (also inlined into the offline build).
// The correct answer is always option 0; options are shuffled before being sent to the browser.
// kind: gen = general CS, loop/prog/rec = code tracing, think = challenge,
// cipher / lateral = the optional bonus stage (bonus.js). time = seconds per question.
// Text is either a plain string (code, numbers — same in every language) or {he, ar}.
import { BONUS_QUESTIONS } from './bonus.js';

export const QUESTIONS = [
/* ---------- שאלות כלליות במדעי המחשב / أسئلة عامة في علوم الحاسوب ---------- */
{
  kind:'gen', time:120,
  title:{he:'ייצוג מידע', ar:'تمثيل المعلومات'},
  prompt:{
    he:'במחשב, כל סיבית (bit) יכולה לקבל אחד משני ערכים: 0 או 1. בייט (byte) אחד מורכב מ-8 סיביות.',
    ar:'في الحاسوب، يمكن لكل بِت (bit) أن يأخذ إحدى قيمتين: 0 أو 1. البايت (byte) الواحد مكوّن من 8 بِتات.'
  },
  parts:[
    {q:{he:'כמה ערכים שונים אפשר לייצג באמצעות 8 סיביות?', ar:'كم قيمة مختلفة يمكن تمثيلها بواسطة 8 بِتات؟'}, pts:10, mono:true, o:['256','255','128','8']}
  ],
  explain:{
    he:'כל סיבית נוספת מכפילה פי 2 את מספר האפשרויות: 2⁸ = 256 ערכים שונים (למשל המספרים 0 עד 255).',
    ar:'كل بِت إضافي يضاعف عدد الاحتمالات: 2⁸ = 256 قيمة مختلفة (مثلًا الأعداد من 0 حتى 255).'
  }
},
{
  kind:'gen', time:120,
  title:{he:'יעילות אלגוריתמים', ar:'نجاعة الخوارزميات'},
  prompt:{
    he:'במערך ממוין יש 1,000,000 מספרים. מחפשים בו מספר באמצעות חיפוש בינארי: בכל שלב בודקים את האיבר האמצעי, וממשיכים לחפש רק בחצי שבו המספר יכול להימצא.',
    ar:'في مصفوفة مرتّبة يوجد 1,000,000 عدد. نبحث فيها عن عدد بواسطة البحث الثنائي: في كل خطوة نفحص العنصر الأوسط، ونواصل البحث فقط في النصف الذي قد يوجد فيه العدد.'
  },
  parts:[
    {q:{he:'בערך כמה השוואות יידרשו במקרה הגרוע ביותר?', ar:'تقريبًا، كم مقارنة نحتاج في أسوأ الحالات؟'}, pts:10,
     o:[{he:'כ-20', ar:'حوالي 20'},{he:'כ-1,000', ar:'حوالي 1,000'},{he:'כ-500,000', ar:'حوالي 500,000'},'1,000,000']}
  ],
  explain:{
    he:'כל השוואה מחלקת את טווח החיפוש בחצי. מכיוון ש-2²⁰ ≈ 1,000,000, אחרי כ-20 חלוקות נשאר איבר אחד בלבד. לשם השוואה, חיפוש סדרתי עלול לדרוש מיליון השוואות.',
    ar:'كل مقارنة تقسم مجال البحث إلى النصف. وبما أن 2²⁰ ≈ 1,000,000، يبقى بعد نحو 20 قسمة عنصر واحد فقط. للمقارنة، البحث التسلسلي قد يحتاج إلى مليون مقارنة.'
  }
},
{
  kind:'gen', time:120,
  title:{he:'מבני נתונים', ar:'مباني المعطيات'},
  prompt:{
    he:'מבנה נתונים מסוים פועל בשיטת LIFO — Last In, First Out: האיבר האחרון שהוכנס הוא הראשון שיוצא. כך בדיוק פועל כפתור "ביטול" (Undo) בעורך טקסט — הפעולה האחרונה מתבטלת ראשונה.',
    ar:'مبنى معطيات معيّن يعمل بطريقة LIFO — Last In, First Out: العنصر الأخير الذي أُدخل هو أول من يخرج. هكذا تمامًا يعمل زر "تراجع" (Undo) في محرّر النصوص — آخر عملية تُلغى أولًا.'
  },
  parts:[
    {q:{he:'איזה מבנה נתונים זה?', ar:'ما هو مبنى المعطيات هذا؟'}, pts:10,
     o:[{he:'מחסנית (Stack)', ar:'مكدّس (Stack)'},{he:'תור (Queue)', ar:'طابور (Queue)'},{he:'עץ בינארי (Binary Tree)', ar:'شجرة ثنائية (Binary Tree)'},{he:'טבלת גיבוב (Hash Table)', ar:'جدول تجزئة (Hash Table)'}]}
  ],
  explain:{
    he:'במחסנית מכניסים ומוציאים איברים מאותו קצה (push / pop), ולכן האחרון שנכנס יוצא ראשון. בתור (Queue) זה הפוך — FIFO: הראשון שנכנס יוצא ראשון.',
    ar:'في المكدّس نُدخل العناصر ونُخرجها من الطرف نفسه (push / pop)، لذلك آخر من يدخل هو أول من يخرج. في الطابور (Queue) العكس — FIFO: أول من يدخل هو أول من يخرج.'
  }
},

/* ---------- שאלות קוד / أسئلة برمجة ---------- */
{
  kind:'rec', time:300, file:'Main.java',
  title:{he:'מעקב אחר פעולה רקורסיבית על מערך', ar:'تتبّع عملية تعاوديّة على مصفوفة'},
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
    {q:{he:'מה תדפיס הפעולה?', ar:'ماذا ستطبع العملية؟'}, pts:3, mono:true, o:['6 10 4','4 10 6','5 7 3','3 7 5']},
    {q:{he:'מה תחזיר הפעולה (ערכו של res)?', ar:'ماذا ستُرجع العملية (قيمة res)؟'}, pts:3, mono:true, o:['20','18','35','3']},
    {q:{he:'מה תפקיד הפעולה?', ar:'ما وظيفة العملية؟'}, pts:4, o:[
      {he:'מחזירה את סכום האיברים הזוגיים במערך (ומדפיסה אותם מהסוף להתחלה)', ar:'تُرجع مجموع العناصر الزوجية في المصفوفة (وتطبعها من النهاية إلى البداية)'},
      {he:'מחזירה את סכום האיברים הנמצאים במקומות זוגיים במערך', ar:'تُرجع مجموع العناصر الموجودة في المواقع الزوجية في المصفوفة'},
      {he:'מחזירה את מספר האיברים הזוגיים במערך', ar:'تُرجع عدد العناصر الزوجية في المصفوفة'},
      {he:'מחזירה את סכום האיברים האי-זוגיים במערך', ar:'تُرجع مجموع العناصر الفردية في المصفوفة'}]}
  ],
  explain:{
    he:'הקריאה הרקורסיבית מתבצעת לפני ההדפסה, ולכן ההדפסות קורות "בדרך חזרה" — מסוף המערך להתחלה: 6, 10, 4. הערך המוחזר הוא סכום האיברים הזוגיים: 6+10+4 = 20.',
    ar:'الاستدعاء التعاودي يحدث قبل الطباعة، لذلك تحدث الطباعة "في طريق العودة" — من نهاية المصفوفة إلى بدايتها: 6، 10، 4. القيمة المُرجَعة هي مجموع العناصر الزوجية: 6+10+4 = 20.'
  }
},
{
  kind:'loop', time:300, file:'Main.java',
  title:{he:'מעקב אחר פעולה חיצונית עם לולאה ומחרוזת', ar:'تتبّع عملية خارجية مع حلقة وسلسلة نصية'},
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
    {q:{he:'מה תדפיס הפעולה?', ar:'ماذا ستطبع العملية؟'}, pts:3, mono:true, o:['6 3 1 0','1 0 1 1','13 6 3 1','6 3 1']},
    {q:{he:'מה תחזיר הפעולה (ערכו של r)?', ar:'ماذا ستُرجع العملية (قيمة r)؟'}, pts:3, mono:true, o:['"1101"','"1011"','"13"','"0110"']},
    {q:{he:'מה תפקיד הפעולה?', ar:'ما وظيفة العملية؟'}, pts:4, o:[
      {he:'מחזירה מחרוזת עם הייצוג הבינארי (בסיס 2) של n', ar:'تُرجع سلسلة نصية فيها التمثيل الثنائي (أساس 2) للعدد n'},
      {he:'מחזירה מחרוזת עם ספרות n בסדר הפוך', ar:'تُرجع سلسلة نصية فيها أرقام n بترتيب معكوس'},
      {he:'מחזירה את מספר הספרות 1 בייצוג של n', ar:'تُرجع عدد الأرقام 1 في تمثيل n'},
      {he:'מחזירה כמה פעמים אפשר לחלק את n ב-2', ar:'تُرجع كم مرة يمكن قسمة n على 2'}]}
  ],
  explain:{
    he:'n עובר 13 → 6 → 3 → 1 → 0 ואחרי כל חלוקה מודפס n: "6 3 1 0". השאריות 1, 0, 1, 1 מתווספות משמאל ל-res, ולכן res = "1101" — הייצוג הבינארי של 13.',
    ar:'تمرّ n بالقيم 13 → 6 → 3 → 1 → 0 وبعد كل قسمة تُطبع n: "6 3 1 0". البواقي 1، 0، 1، 1 تُضاف إلى يسار res، لذلك res = "1101" — التمثيل الثنائي للعدد 13.'
  }
},
{
  kind:'prog', time:300, file:'Program.java',
  title:{he:'מעקב אחר תוכנית עם לולאה על מערך', ar:'تتبّع برنامج مع حلقة على مصفوفة'},
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
    {q:{he:'מה תדפיס התוכנית?', ar:'ماذا سيطبع البرنامج؟'}, pts:3, mono:true, o:['3 4\n4','3 4\n3','3\n4','2 3\n4']},
    {q:{he:'מה ערכו של המשתנה best בסוף התוכנית?', ar:'ما قيمة المتغيّر best في نهاية البرنامج؟'}, pts:3, mono:true, o:['4','3','8','1']},
    {q:{he:'מה מבצעת התוכנית?', ar:'ماذا ينفّذ البرنامج؟'}, pts:4, o:[
      {he:'מוצאת את אורך הרצף הרציף העולה הארוך ביותר במערך', ar:'يجد طول أطول متتالية متّصلة تصاعدية في المصفوفة'},
      {he:'סופרת כמה פעמים הסדר העולה במערך "נשבר"', ar:'يعدّ كم مرة "ينكسر" الترتيب التصاعدي في المصفوفة'},
      {he:'מוצאת את הערך הגדול ביותר במערך', ar:'يجد أكبر قيمة في المصفوفة'},
      {he:'בודקת אם המערך ממוין בסדר עולה', ar:'يفحص إذا كانت المصفوفة مرتّبة تصاعديًا'}]}
  ],
  explain:{
    he:'הרצף 4, 6, 9 (אורך 3) נשבר ב-2 → מודפס 3. הרצף 2, 3, 5, 8 (אורך 4) נשבר ב-1 → מודפס 4. best שומר את האורך המקסימלי: 4.',
    ar:'المتتالية 4، 6، 9 (طولها 3) تنكسر عند 2 ← يُطبع 3. المتتالية 2، 3، 5، 8 (طولها 4) تنكسر عند 1 ← يُطبع 4. المتغيّر best يحفظ الطول الأكبر: 4.'
  }
},
{
  kind:'rec', time:300, file:'Main.java',
  title:{he:'מעקב אחר פעולה רקורסיבית על מערך', ar:'تتبّع عملية تعاوديّة على مصفوفة'},
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
    {q:{he:'מה תדפיס הפעולה?', ar:'ماذا ستطبع العملية؟'}, pts:3, mono:true, o:['2-2 7-7 4-4','2-2 7-7 4-4 9-9','2-7 4-9','2-2']},
    {q:{he:'מה תחזיר הפעולה (ערכו של ok)?', ar:'ماذا ستُرجع العملية (قيمة ok)؟'}, pts:3, mono:true, o:['true','false','3','-1']},
    {q:{he:'מה תפקיד הפעולה?', ar:'ما وظيفة العملية؟'}, pts:4, o:[
      {he:'בודקת אם המערך הוא פלינדרום (נקרא אותו דבר משני הכיוונים)', ar:'تفحص إذا كانت المصفوفة متناظرة (Palindrome) — تُقرأ بالشكل نفسه من الاتجاهين'},
      {he:'בודקת אם המערך ממוין בסדר עולה', ar:'تفحص إذا كانت المصفوفة مرتّبة تصاعديًا'},
      {he:'בודקת אם כל איברי המערך שונים זה מזה', ar:'تفحص إذا كانت جميع عناصر المصفوفة مختلفة عن بعضها'},
      {he:'בודקת אם סכום החצי הראשון שווה לסכום החצי השני', ar:'تفحص إذا كان مجموع النصف الأول يساوي مجموع النصف الثاني'}]}
  ],
  explain:{
    he:'הפעולה משווה זוגות מהקצוות פנימה: (2,2), (7,7), (4,4). כשמגיעים ל-lo=3, hi=3 מתקיים lo>=hi ומוחזר true. המערך הוא פלינדרום.',
    ar:'تقارن العملية أزواجًا من الطرفين نحو الداخل: (2,2)، (7,7)، (4,4). عندما نصل إلى lo=3، hi=3 يتحقّق الشرط lo>=hi وتُرجع true. المصفوفة متناظرة.'
  }
},

/* ---------- שאלות אתגר וחשיבה / أسئلة تحدٍّ وتفكير ---------- */
{
  kind:'think', time:300,
  title:{he:'אתגר המאזניים', ar:'تحدّي الميزان'},
  prompt:{
    he:'לפניכם 9 מטבעות שנראים זהים. 8 מהם שוקלים בדיוק אותו דבר, ומטבע אחד מזויף — והוא כבד יותר.\nיש לכם מאזני כפות בלי משקולות: הם מראים רק איזה צד כבד יותר, או שהצדדים שווים.',
    ar:'أمامكم 9 قطع نقدية تبدو متطابقة. 8 منها لها الوزن نفسه تمامًا، وقطعة واحدة مزيّفة — وهي أثقل.\nلديكم ميزان ذو كفّتين بدون أوزان: يُظهر فقط أيّ جهة أثقل، أو أن الجهتين متساويتان.'
  },
  parts:[
    {q:{he:'מהו המספר הקטן ביותר של שקילות שמבטיח למצוא את המטבע המזויף בכל מקרה?', ar:'ما أقلّ عدد من الوزنات يضمن إيجاد القطعة المزيّفة في كل الحالات؟'}, pts:10, mono:true, o:['2','3','4','1']}
  ],
  explain:{
    he:'מחלקים ל-3 קבוצות של 3 מטבעות ושוקלים שתיים מהן: אם צד אחד כבד — המזויף בו; אם יש שוויון — המזויף בקבוצה השלישית. מתוך 3 המטבעות שוקלים שניים באותה שיטה. כל שקילה מחלקת את האפשרויות ב-3: 9 → 3 → 1, ולכן מספיקות 2 שקילות.',
    ar:'نقسم القطع إلى 3 مجموعات من 3 قطع ونزن مجموعتين: إذا كانت إحدى الجهتين أثقل — فالمزيّفة فيها؛ وإذا تساوتا — فالمزيّفة في المجموعة الثالثة. من القطع الثلاث نزن قطعتين بالطريقة نفسها. كل وزنة تقسم الاحتمالات على 3: 9 ← 3 ← 1، لذلك تكفي وزنتان.'
  }
},
{
  kind:'think', time:300,
  title:{he:'אתגר הגשר', ar:'تحدّي الجسر'},
  prompt:{
    he:'ארבעה חברים צריכים לחצות גשר צר בלילה. יש להם פנס אחד בלבד, ואסור לחצות בלי פנס (מישהו צריך להחזיר אותו).\nעל הגשר יכולים ללכת לכל היותר שניים בבת אחת, וזוג הולך בקצב של האיטי מביניהם.\nזמני החצייה: א׳ — דקה אחת, ב׳ — 2 דקות, ג׳ — 5 דקות, ד׳ — 10 דקות.',
    ar:'أربعة أصدقاء يجب أن يعبروا جسرًا ضيّقًا في الليل. لديهم مصباح واحد فقط، ولا يُسمح بالعبور بدون مصباح (يجب أن يعيده أحدهم).\nيمكن أن يسير على الجسر شخصان على الأكثر في الوقت نفسه، والزوج يسير بسرعة الأبطأ بينهما.\nأزمنة العبور: أ — دقيقة واحدة، ب — دقيقتان، ج — 5 دقائق، د — 10 دقائق.'
  },
  parts:[
    {q:{he:'מהו הזמן הקצר ביותר שבו כל הארבעה יכולים להגיע לצד השני?', ar:'ما أقصر زمن يمكن فيه أن يصل الأربعة إلى الجهة الأخرى؟'}, pts:10,
     o:[{he:'17 דקות', ar:'17 دقيقة'},{he:'19 דקות', ar:'19 دقيقة'},{he:'18 דקות', ar:'18 دقيقة'},{he:'15 דקות', ar:'15 دقيقة'}]}
  ],
  explain:{
    he:'א+ב חוצים (2), א חוזר (1), ג+ד חוצים יחד (10), ב חוזר (2), א+ב חוצים (2): סה"כ 17 דקות. הטריק: לשלוח את שני האיטיים ביחד, כך ש-5 הדקות של ג׳ "נבלעות" בתוך 10 הדקות של ד׳. (הפתרון ה"טבעי" — א׳ מלווה את כולם — נותן 19.)',
    ar:'أ+ب يعبران (2)، أ يعود (1)، ج+د يعبران معًا (10)، ب يعود (2)، أ+ب يعبران (2): المجموع 17 دقيقة. الحيلة: إرسال الأبطأين معًا، فتختفي دقائق ج الخمس داخل دقائق د العشر. (الحلّ "الطبيعي" — أن يرافق أ الجميع — يعطي 19.)'
  }
},
{
  kind:'think', time:300,
  title:{he:'אתגר הלוקרים', ar:'تحدّي الخزائن'},
  prompt:{
    he:'במסדרון בית הספר יש 100 לוקרים סגורים, ממוספרים 1 עד 100. 100 תלמידים עוברים במסדרון בזה אחר זה.\nתלמיד מספר k משנה את המצב (פותח לוקר סגור / סוגר לוקר פתוח) של כל לוקר שמספרו מתחלק ב-k.\nכלומר: תלמיד 1 פותח את כולם, תלמיד 2 סוגר את 2, 4, 6, …, תלמיד 3 משנה את 3, 6, 9, … וכן הלאה עד תלמיד 100.',
    ar:'في ممرّ المدرسة 100 خزانة مغلقة، مرقّمة من 1 إلى 100. يمرّ 100 طالب في الممرّ واحدًا تلو الآخر.\nالطالب رقم k يغيّر حالة (يفتح المغلقة / يغلق المفتوحة) كل خزانة رقمها يقبل القسمة على k.\nأي: الطالب 1 يفتحها جميعًا، الطالب 2 يغلق 2، 4، 6، …، الطالب 3 يغيّر 3، 6، 9، … وهكذا حتى الطالب 100.'
  },
  parts:[
    {q:{he:'כמה לוקרים יהיו פתוחים בסוף?', ar:'كم خزانة ستكون مفتوحة في النهاية؟'}, pts:10, mono:true, o:['10','50','0','25']}
  ],
  explain:{
    he:'מצב לוקר משתנה פעם אחת עבור כל מחלק של מספרו. מחלקים באים בזוגות (12 = 3×4 = 2×6 = 1×12), ולכן לרוב המספרים יש מספר זוגי של מחלקים והלוקר חוזר להיות סגור. רק למספרים ריבועיים (16 = 4×4) יש מספר אי-זוגי של מחלקים. לכן נשארים פתוחים רק 1, 4, 9, …, 100 — 10 לוקרים.',
    ar:'تتغيّر حالة الخزانة مرة واحدة لكل قاسم من قواسم رقمها. القواسم تأتي أزواجًا (12 = 3×4 = 2×6 = 1×12)، لذلك لمعظم الأعداد عدد زوجي من القواسم فتعود الخزانة مغلقة. فقط للأعداد المربّعة (16 = 4×4) عدد فردي من القواسم. لذلك تبقى مفتوحة فقط 1، 4، 9، …، 100 — أي 10 خزائن.'
  }
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

// The game: the 10 main questions, then the optional bonus stage (encryption and out-of-the-box thinking).
export const MAIN_COUNT = QUESTIONS.length;
export const ALL_QUESTIONS = [...QUESTIONS, ...BONUS_QUESTIONS.map(q => ({ ...q, bonus: true }))];

// Language-neutral key of an option: plain strings as-is, translated options by their Hebrew text.
const optionKey = v => (typeof v === 'string' ? v : v.he);

// What the browser receives: question content (both languages) and shuffled options, no answers or explanations.
export function publicQuestions() {
  return ALL_QUESTIONS.map(({ explain, ...q }) => ({
    ...q,
    parts: q.parts.map(p => ({ ...p, o: shuffled(p.o) }))
  }));
}

const earnedAt = (game, i) => (game.results[i] ? game.results[i].earned : 0);
const totalScore = game => Object.values(game.results).reduce((s, x) => s + x.earned, 0);

// The leaderboard row of a game whose main questions are all scored.
// `time` is the time of the main questions only: the bonus is optional and does not count against a team.
function buildRecord(game) {
  if (!game.finished) game.finished = Date.now();
  const bonusPer = BONUS_QUESTIONS.map((_, i) => (game.results[MAIN_COUNT + i] ? earnedAt(game, MAIN_COUNT + i) : null));
  return {
    id: game.id, team: game.team, school: game.school, members: game.members, lang: game.lang,
    score: totalScore(game), time: Math.round((game.finished - game.started) / 1000), date: game.finished,
    per: QUESTIONS.map((_, i) => earnedAt(game, i)),
    bonus: bonusPer.reduce((s, e) => s + (e || 0), 0), bonusPer
  };
}

// Scores one answer into `game` (mutates it). `answers` are canonical option keys.
// A bonus question may be skipped (`skip`), which scores 0. A question is scored only once; repeats return the stored result.
// Once the main questions are all answered, `record` is the leaderboard row to save; every later bonus answer
// returns it again with the bonus added, so a team that stops in the middle of the bonus keeps what it earned.
export function applyAnswer(game, q, answers, skip) {
  const Q = ALL_QUESTIONS[q];
  let r = game.results[q], fresh = false;
  if (!r) {
    fresh = true;
    const skipped = !!(skip && Q.bonus);
    const a = !skipped && Array.isArray(answers) ? answers : [];
    const correct = Q.parts.map((p, i) => a[i] === optionKey(p.o[0]));
    const earned = Q.parts.reduce((s, p, i) => s + (correct[i] ? p.pts : 0), 0);
    r = game.results[q] = skipped ? { earned, correct, skipped } : { earned, correct };
  }
  const mainDone = QUESTIONS.every((_, i) => game.results[i]);
  const done = ALL_QUESTIONS.every((_, i) => game.results[i]);
  return {
    record: mainDone && fresh ? buildRecord(game) : null,
    result: { earned: r.earned, correct: r.correct, skipped: !!r.skipped, right: Q.parts.map(p => p.o[0]), explain: Q.explain, score: totalScore(game), mainDone, done }
  };
}

// Ends the game early (the school's time slot is over): every main question not answered yet scores 0,
// and the row is saved with whatever bonus was answered.
export function finishGame(game) {
  QUESTIONS.forEach((Q, i) => {
    if (!game.results[i]) game.results[i] = { earned: 0, correct: Q.parts.map(() => false), unanswered: true };
  });
  return { record: buildRecord(game), score: totalScore(game) };
}
