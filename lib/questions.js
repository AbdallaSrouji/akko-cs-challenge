// Question bank — server side only. The correct answer is always option 0;
// options are shuffled before being sent to the browser.
export const QUESTIONS = [
{
  kind:'loop', file:'Main.java',
  title:'מעקב אחר פעולה חיצונית עם לולאה',
  code:
`public static int what(int n) {
    int s = 0;
    while (n > 0) {
        int d = n % 10;
        s = s * 10 + d;
        System.out.print(d + " ");
        n = n / 10;
    }
    System.out.println();
    return s;
}`,
  call:`int x = what(4721);`,
  params:[['n','4721']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['1 2 7 4','4 7 2 1','1 12 127 1274','7 2 1 4']},
    {q:'מה תחזיר הפעולה (ערכו של x)?', pts:3, mono:true, o:['1274','4721','14','0']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['מחזירה את המספר n כשסדר ספרותיו הפוך','מחזירה את סכום הספרות של n','מחזירה את מספר הספרות של n','מחזירה את הספרה הגדולה ביותר ב-n']}
  ],
  explain:'הלולאה מפרקת את n לספרות החל מספרת האחדות: d = 1, 2, 7, 4 — וכל ספרה מודפסת. המשתנה s נבנה לפי s*10+d: 1 → 12 → 127 → 1274. לכן הפעולה מחזירה את המספר בסדר ספרות הפוך.'
},
{
  kind:'prog', file:'Program.java',
  title:'מעקב אחר תוכנית עם לולאה',
  code:
`public static void main(String[] args) {
    int[] arr = {3, 8, 2, 8, 5, 1, 8};
    int a = arr[0], b = 0;
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] > a) {
            a = arr[i];
            b = 1;
        } else if (arr[i] == a) {
            b++;
        }
    }
    System.out.println(a + " " + b);
}`,
  call:null, params:[],
  parts:[
    {q:'מה תדפיס התוכנית?', pts:3, mono:true, o:['8 3','8 2','3 1','8 1']},
    {q:'מה ערכו של המשתנה b בסוף התוכנית?', pts:3, mono:true, o:['3','2','1','7']},
    {q:'מה מבצעת התוכנית?', pts:4, o:['מוצאת את הערך הגדול ביותר במערך ואת מספר הפעמים שהוא מופיע','מוצאת את הערך הגדול ביותר במערך ואת המיקום (האינדקס) שלו','סופרת כמה איברים במערך גדולים מהאיבר הראשון','סופרת כמה פעמים מופיע האיבר הראשון במערך']}
  ],
  explain:'בהתחלה a=3, b=0. באיבר הראשון arr[0]==a ולכן b=1. בפגישה עם 8 מתעדכן a=8 ו-b מתאפס ל-1. כל 8 נוסף מגדיל את b. בסוף a=8 ו-b=3 — הערך המקסימלי ומספר מופעיו.'
},
{
  kind:'rec', file:'Main.java',
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
  kind:'loop', file:'Main.java',
  title:'מעקב אחר פעולה חיצונית עם לולאה',
  code:
`public static int proc(int x, int y) {
    while (y != 0) {
        int t = x % y;
        System.out.print(t + " ");
        x = y;
        y = t;
    }
    System.out.println();
    return x;
}`,
  call:`int g = proc(84, 36);`,
  params:[['x','84'],['y','36']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['12 0','48 12 0','12','36 12']},
    {q:'מה תחזיר הפעולה (ערכו של g)?', pts:3, mono:true, o:['12','0','2','36']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['מחזירה את המחלק המשותף הגדול ביותר של x ו-y','מחזירה את הכפולה המשותפת הקטנה ביותר של x ו-y','מחזירה את השארית של חלוקת x ב-y','בודקת אם y מחלק את x ללא שארית']}
  ],
  explain:'84 % 36 = 12 → (x,y) = (36,12). 36 % 12 = 0 → (x,y) = (12,0) והלולאה נעצרת. מודפס "12 0" ומוחזר 12. זהו אלגוריתם אוקלידס למציאת המחלק המשותף הגדול ביותר (gcd).'
},
{
  kind:'prog', file:'Program.java',
  title:'מעקב אחר תוכנית עם לולאה',
  code:
`public static void main(String[] args) {
    int num = 28;
    int s = 0;
    for (int k = 1; k < num; k++) {
        if (num % k == 0) {
            s = s + k;
            System.out.print(k + " ");
        }
    }
    System.out.println();
    if (s == num)
        System.out.println("YES");
    else
        System.out.println("NO");
}`,
  call:null, params:[],
  parts:[
    {q:'מה תדפיס התוכנית?', pts:3, mono:true, o:['1 2 4 7 14\nYES','1 2 4 7 14 28\nNO','1 2 4 7 14\nNO','2 4 7 14\nYES']},
    {q:'מה ערכו של המשתנה s בסוף התוכנית?', pts:3, mono:true, o:['28','56','27','5']},
    {q:'מה מבצעת התוכנית?', pts:4, o:['בודקת אם num הוא מספר מושלם (שווה לסכום מחלקיו הקטנים ממנו)','בודקת אם num הוא מספר ראשוני','מחשבת את מספר המחלקים של num','בודקת אם num הוא מספר זוגי']}
  ],
  explain:'המחלקים של 28 הקטנים ממנו: 1, 2, 4, 7, 14 — וכל אחד מהם מודפס. סכומם 28 = num, ולכן מודפס YES. התוכנית בודקת אם המספר "מושלם".'
},
{
  kind:'rec', file:'Main.java',
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
{
  kind:'loop', file:'Main.java',
  title:'מעקב אחר פעולה חיצונית עם לולאה',
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
  kind:'prog', file:'Program.java',
  title:'מעקב אחר תוכנית עם לולאה',
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
  kind:'rec', file:'Main.java',
  title:'מעקב אחר פעולה רקורסיבית על מערך',
  code:
`public static int find(int[] a, int n) {
    if (n == 1)
        return a[0];
    int m = find(a, n - 1);
    System.out.print(m + " ");
    if (a[n - 1] > m)
        return a[n - 1];
    return m;
}`,
  call:`int[] arr = {3, 9, 2, 11, 5};
int v = find(arr, 5);`,
  params:[['a','{3, 9, 2, 11, 5}'],['n','5']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['3 9 9 11','11 9 9 3','3 9 2 11 5','3 9 11']},
    {q:'מה תחזיר הפעולה (ערכו של v)?', pts:3, mono:true, o:['11','5','3','30']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['מחזירה את הערך הגדול ביותר מבין n האיברים הראשונים במערך','מחזירה את הערך הקטן ביותר במערך','מחזירה את האיבר האחרון במערך','מחזירה את סכום n האיברים הראשונים במערך']}
  ],
  explain:'הרקורסיה יורדת עד n=1 ומחזירה 3. בדרך חזרה מודפס המקסימום שנמצא עד כה, לפני ההשוואה לאיבר הבא: 3, 9, 9, 11. הערך המוחזר הוא המקסימום — 11.'
},
{
  kind:'rec', file:'Main.java',
  title:'מעקב אחר פעולה רקורסיבית על מערך',
  code:
`public static int seek(int[] a, int x, int lo, int hi) {
    if (lo > hi)
        return -1;
    int mid = (lo + hi) / 2;
    System.out.print(a[mid] + " ");
    if (a[mid] == x)
        return mid;
    if (a[mid] < x)
        return seek(a, x, mid + 1, hi);
    return seek(a, x, lo, mid - 1);
}`,
  call:`int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
int p = seek(arr, 23, 0, 9);`,
  params:[['a','{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}'],['x','23'],['lo','0'],['hi','9']],
  parts:[
    {q:'מה תדפיס הפעולה?', pts:3, mono:true, o:['16 56 23','16 23','2 5 8 12 16 23','16 8 23']},
    {q:'מה תחזיר הפעולה (ערכו של p)?', pts:3, mono:true, o:['5','23','6','-1']},
    {q:'מה תפקיד הפעולה?', pts:4, o:['חיפוש בינארי: מחזירה את מיקום x במערך ממוין, או 1- אם אינו קיים','חיפוש סדרתי: מחזירה את מיקום x מתחילת המערך','מחזירה את מספר הצעדים שנדרשו כדי למצוא את x','בודקת אם המערך ממוין בסדר עולה']}
  ],
  explain:'mid=4 → a[4]=16 < 23 → ממשיכים ימינה (lo=5). mid=7 → a[7]=56 > 23 → ממשיכים שמאלה (hi=6). mid=5 → a[5]=23 נמצא, מוחזר האינדקס 5. זהו חיפוש בינארי.'
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

// What the browser receives: code and shuffled options, no answers or explanations.
export function publicQuestions() {
  return QUESTIONS.map(({ explain, ...q }) => ({
    ...q,
    parts: q.parts.map(p => ({ ...p, o: shuffled(p.o) }))
  }));
}
