# CLAUDE.md — הוראות לסוכן AI

> קובץ זה מספק הקשר מלא לסוכן Claude (או כל סוכן AI אחר) הפועל על פרויקט Hairacolous. קרא אותו במלואו לפני כל פעולה בקוד.

---

## מה הפרויקט הזה?

**Hairacolous** הוא אפליקציית Web (React + Vite) שמיועדת לתת המלצות טיפוח שיער תלתל (2C/3A) מותאמות למזג האוויר בחיפה, ישראל. האפליקציה:

1. שולפת (או אמורה לשלוף) נתוני מזג אוויר לחיפה
2. מגדירה "מצב יום" (CONDITION_ID) לפי טמפרטורה, לחות, רוח ונקודת טל
3. ממפה את המצב להמלצות שיער ספציפיות בעברית
4. מציגה את ההמלצות ב-UI מעוצב

---

## מבנה קבצים

```
Hairacolous/
├── src/
│   ├── App.jsx                    # קומפוננטת ראשית — ניהול state, routing בין פריודות
│   ├── data.js                    # WEATHER_DATA — נתוני demo (fallback בלבד)
│   ├── utils.js                   # פונקציות עזר: getGradientClass, getDoseLevel, classifyCondition
│   ├── hooks/
│   │   └── useHairData.js         # Custom hook — קורא ל-getHairForecast ומנהל loading/error state
│   ├── services/
│   │   ├── dataService.js         # לוגיקת Cache (Supabase) + Orchestration של שליפת נתונים
│   │   ├── geminiService.js       # קריאה ל-Gemini API לייצור טקסט המלצות
│   │   └── supabaseClient.js      # אתחול Supabase client
│   ├── components/
│   │   ├── Background.jsx         # רקע גרדיאנט (כרגע קשיח — צריך לקבל conditionId כ-prop)
│   │   ├── TimeCapsule.jsx        # Tab bar: היום / מחר / השבוע
│   │   ├── MainStatusCard.jsx     # כרטיס מרכזי: אנימציית שיער, נתוני מזג אוויר, typewriter text
│   │   ├── RoutineToggle.jsx      # Toggle: יום חפיפה / רענון
│   │   ├── ProtocolStack.jsx      # רשימת מוצרים עם Dose Meter
│   │   ├── FooterQuote.jsx        # ציטוט הומוריסטי בתחתית
│   │   ├── LoadingSpinner.jsx     # מסך טעינה
│   │   ├── ErrorDisplay.jsx       # מסך שגיאה
│   │   └── ErrorBoundary.jsx      # React Error Boundary
│   └── assets/
│       └── prompt.txt             # הפרומפט המלא שנשלח ל-Gemini (גם ה"content library")
├── CRITIQUE.md                    # ביקורת לוגיקה מלאה עם הוראות תיקון (קרא לפני שינויים!)
├── INSTRUCTIONS.md                # הוראות הגדרת סביבה (Supabase, Gemini)
└── .env                           # משתני סביבה (לא מועלה ל-Git)
```

---

## משתני סביבה נדרשים

```env
VITE_SUPABASE_URL=         # URL של פרויקט Supabase
VITE_SUPABASE_ANON_KEY=    # Anon Key של Supabase (בטוח לחשיפה ציבורית)
VITE_GEMINI_API_KEY=       # ⚠️ Gemini API Key — חשוף בצד לקוח! (ראה פגם #10 ב-CRITIQUE.md)
```

---

## Data Flow — זרימת נתונים

```
useHairData()
    └── getHairForecast() [dataService.js]
            ├── getTodayDateString() → "YYYY-MM-DD" (חשוב! ראה פגם #2)
            ├── loadFromCache(date) [Supabase query]
            │       ├── נמצא → return cached data
            │       └── לא נמצא ↓
            ├── fetchRealWeather() [weatherService.js] ← צריך להיות מומש (ראה פגם #1)
            ├── classifyCondition(humidity, dewPoint, wind) [utils.js] ← צריך להיות מומש (ראה פגם #4)
            ├── fetchDailyInsight(weatherData) [geminiService.js]
            │       └── שולח prompt.txt + נתוני מזג אוויר → מקבל JSON עם המלצות
            └── saveToCache(date, result) [Supabase insert/upsert]
```

---

## CONDITION_IDs — מפה מלאה

| ID | תנאים | משמעות |
|----|--------|--------|
| `SAUNA_STORM` | לחות גבוהה (DP>16°C או RH>65%) + רוח חזקה (>18 km/h) | לח + סוער |
| `SAUNA_CALM` | לחות גבוהה + רוח חלשה | לח + רגוע |
| `DESERT_STORM` | יובש (DP<5°C או RH<35%) + רוח חזקה | יבש + סוער |
| `DESERT_CALM` | יובש + רוח חלשה | יבש + רגוע |
| `PERFECT_DAY` | כל שאר המקרים (לחות ו-DP ממוצעים) | אידיאלי |

**חשוב:** החישוב חייב להתבצע בקוד (JavaScript), לא על ידי Gemini. ראה `classifyCondition()` ב-`utils.js`.

---

## פגמים פתוחים — לעולם אל תדלג עליהם

> **לפני כל שינוי בקוד, קרא את `CRITIQUE.md`** לגבי הפגמים שרלוונטיים לאזור שאתה עובד עליו.

| קובץ | פגמים ידועים |
|------|-------------|
| `dataService.js` | פגם #2 (פורמט תאריך), פגם #7 (Cache שבור), פגם #15 (אין retry) |
| `utils.js` | פגם #3 (getDoseLevel הפוך), פגם #4 (classifyCondition חסר) |
| `geminiService.js` | פגם #1 (אין מזג אוויר אמיתי), פגם #9 (prompt שגויה), פגם #10 (API key חשוף) |
| `Background.jsx` | פגם #5 (רקע קבוע) |
| `MainStatusCard.jsx` | פגם #6 (uvAlert), פגם #12 (parseInt), פגם #13 (badge סטטי) |
| `data.js` | פגם #8 (תאריכים קשיחים) |

---

## הגדרות ה-Supabase Table

```sql
create table daily_insights (
  id         uuid default gen_random_uuid() primary key,
  date       text not null unique,   -- פורמט: YYYY-MM-DD (לא DD/MM/YYYY!)
  content    jsonb not null,         -- האובייקט המלא שמוחזר מ-Gemini
  created_at timestamptz default now()
);
```

**שים לב:** הטבלה משתמשת ב-`text` ל-date, ולא ב-`date` type. הסיבה: גמישות בפורמט. אבל זה גם אומר שחייב להיות עקבי עם הפורמט — תמיד `YYYY-MM-DD`.

---

## קונבנציות קוד

- **שפה:** JSX/JavaScript (לא TypeScript)
- **Styling:** Tailwind CSS v4
- **אנימציות:** Framer Motion
- **אייקונים:** Lucide React
- **State Management:** React hooks בלבד (אין Redux/Zustand)
- **Build Tool:** Vite 7
- **Deploy:** GitHub Pages דרך GitHub Actions

---

## Branch Strategy

- `master` — ה-branch הראשי (deploy לייצור)
- `claude/fix-*` — branches לתיקונים ספציפיים שמבוצעים על ידי סוכן AI
- תמיד צור PR ל-`master`, אל תעלה ישירות

---

## הנחיות לסוכן AI

### לפני כל task:
1. קרא את `CRITIQUE.md` — הבן אילו פגמים קיימים באזור שאתה עובד עליו
2. בדוק שאתה על ה-branch הנכון (`git branch`)
3. הרץ `git status` לפני כל commit

### בעת כתיבת קוד:
- **אל תשנה את פורמט הנתונים** מבלי לעדכן גם את ה-Supabase schema וגם את כל הקומפוננטות שמשתמשות בו
- **שמור על עקביות פורמט תאריך** — תמיד `YYYY-MM-DD` לכל לוגיקת Cache, `DD/MM/YYYY` רק להצגה ב-UI
- **אל תשנה את מבנה ה-JSON** שמוחזר מ-Gemini בלי לעדכן את ה-prompt.txt בהתאם
- **אל תגע ב-`.env`** — הוסף משתנים חדשים רק אם הם נחוצים, תעד אותם ב-INSTRUCTIONS.md
- **בדוק תמיד** שלאחר שינוי ב-`dataService.js` — זרימת ה-Cache עדיין עובדת

### טיפול בשגיאות — מדיניות:
```
שגיאת Supabase read → המשך לשלוף מ-Gemini (non-fatal)
שגיאת Supabase write → log + המשך (non-fatal)
שגיאת Gemini → fallback ל-WEATHER_DATA עם _isDemo: true
שגיאת Weather API (עתידי) → fallback ל-Gemini עם אזהרה
```

### בדיקות לפני commit:
```bash
npm run lint          # בדיקת ESLint
npm run build         # בדיקת שה-build עובר
# אין טסטים אוטומטיים כרגע — זה גם פגם שיש לטפל בו
```

---

## תכנית פיתוח (Roadmap)

לפי סדר עדיפות, על בסיס `CRITIQUE.md`:

### Phase 1 — תיקוני Critical (ללא שינוי ארכיטקטורה)
- [ ] תקן `getTodayDateString()` לפורמט `YYYY-MM-DD` — פגם #2
- [ ] תקן את סדר הבדיקות ב-`getDoseLevel()` — פגם #3
- [ ] הפעל `getGradientClass()` ב-`Background.jsx` — פגם #5
- [ ] תקן `uvAlert` rendering ב-`MainStatusCard.jsx` — פגם #6
- [ ] עדכן `prompt.txt` — JSON template תקין — פגם #9
- [ ] תקן `WEATHER_DATA` לתאריכים דינמיים — פגם #8

### Phase 2 — שיפורים מרכזיים
- [ ] הוסף `weatherService.js` עם Open-Meteo API — פגם #1
- [ ] הוסף `classifyCondition()` ל-`utils.js` — פגם #4
- [ ] שנה את `geminiService.js` לקבל conditionId ולא לחשב אותו — פגם #4
- [ ] עדכן Cache לשימוש ב-upsert + TTL — פגם #7
- [ ] הוסף `computeWeeklyCondition()` — פגם #11

### Phase 3 — אבטחה וארכיטקטורה
- [ ] העבר `GEMINI_API_KEY` ל-Supabase Edge Function — פגם #10
- [ ] הוסף טסטים ל-`classifyCondition()` ו-`getDoseLevel()`
- [ ] הוסף monitoring/logging לשגיאות ייצור

---

## שאלות נפוצות לסוכן

**ש: האם Gemini באמת מביא מזג אוויר?**
ת: לא. זה הפגם הקריטי #1. Gemini מהמר/מנחש. יש להוסיף Open-Meteo API.

**ש: מדוע ה-Cache לא עובד?**
ת: פגם #2 — פורמט תאריך שגוי. `getTodayDateString()` מחזיר `DD/MM/YYYY` אבל Supabase מצפה ל-`YYYY-MM-DD`.

**ש: האם אני יכול לשנות את ה-Hebrew strings?**
ת: זהירות. הם מוגדרים ב-`prompt.txt` (Section 3) ונוצרים על ידי Gemini. `getDoseLevel()` ב-`utils.js` מסתמך על מילות מפתח ספציפיות. שינוי הטקסט עלול לשבור את ה-Dose Meter.

**ש: מה ה-`_isDemo` flag?**
ת: field שיש להוסיף לנתוני Demo כדי להציג תיוג מתאים ב-UI ("מצב דמו — נתונים לא אמיתיים").

**ש: האם הכרטיסיה "השבוע" היא ממוצע אמיתי?**
ת: לא. כרגע Gemini מנחש. ראה פגם #11 ו-`computeWeeklyCondition()` כפתרון.
