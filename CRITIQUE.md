# ביקורת לוגית מלאה — Hairacolous

> מסמך זה מתעד את כל פערי הלוגיקה שזוהו בפרויקט, החל משליפת הנתונים, דרך עיבודם, ועד הצגתם. לכל פגם מצורפות הוראות מפורשות לתיקון: תיאור האלגוריתם, הלוגיקה הנכונה, וקוד להטמעה.

---

## תוכן עניינים

1. [פגם קריטי #1 — אין שליפת מזג אוויר אמיתית](#1-אין-שליפת-מזג-אוויר-אמיתית)
2. [פגם קריטי #2 — חוסר התאמה בפורמט התאריך](#2-חוסר-התאמה-בפורמט-תאריך)
3. [פגם קריטי #3 — היפוך לוגי ב־getDoseLevel](#3-היפוך-לוגי-ב-getdoselevel)
4. [פגם #4 — CONDITION_ID לא נגזר מחישוב — נוצר "מהדמיון"](#4-condition_id-לא-נגזר-מחישוב)
5. [פגם #5 — רקע האפליקציה לא מגיב לתנאי מזג האוויר](#5-רקע-קבוע-לא-דינמי)
6. [פגם #6 — בדיקת uvAlert כנגד המחרוזת "null"](#6-בדיקת-uvalert-שגויה)
7. [פגם #7 — מנגנון הזיכרון (Cache) ב-Supabase שבור לחלוטין](#7-cache-supabase-שבור)
8. [פגם #8 — נתוני Demo מיושנים עם תאריכים קשוחים](#8-demo-data-מיושן)
9. [פגם #9 — תבנית ה-JSON ב-prompt.txt שגויה תחבירית](#9-json-template-שגויה)
10. [פגם #10 — מפתח ה-API חשוף בצד הלקוח](#10-חשיפת-api-keys-לצד-הלקוח)
11. [פגם #11 — לא ניתן לסמוך על ה"ממוצע השבועי"](#11-ממוצע-שבועי-לא-מוגדר)
12. [פגם #12 — parseInt של wind שביר](#12-parsein-של-wind-שביר)
13. [פגם #13 — ה-UV badge לא מציג את הטקסט האמיתי](#13-uv-badge-מציג-טקסט-סטטי)
14. [פגם #14 — CONDITION_ID לא מאומת בצד הלקוח](#14-condition_id-לא-מאומת)
15. [פגם #15 — אין Retry לשמירה ב-Supabase לאחר כשל](#15-אין-retry-לשמירת-supabase)

---

## 1. אין שליפת מזג אוויר אמיתית

### תיאור הפגם
**זהו הפגם היסודי ביותר בפרויקט.** הפרומפט שנשלח ל-Gemini מבקש ממנו "לשלוף" נתוני מזג אוויר עבור חיפה:

```
Step A: Retrieve weather for Haifa (Today, Tomorrow, Weekly Forecast).
```

אך Gemini הוא מודל שפה (LLM) — אין לו גישה לאינטרנט בזמן אמת ואין לו כלי לשליפת מידע חיצוני. כל הנתונים שהוא מחזיר (טמפרטורה, לחות, רוח) הם **המצאה** של המודל ("הזיה"), לא נתוני מזג אוויר אמיתיים. המשתמש מקבל מידע שמוצג כנתון מדעי אך הוא בדיוי.

### אלגוריתם התיקון

```
1. קרא את נתוני מזג האוויר מ-API חיצוני ואמין (Open-Meteo, OpenWeatherMap וכדומה)
2. שמור את הנתונים הגולמיים כנפרד מהמלצות השיער
3. חשב את CONDITION_ID על בסיס הנתונים האמיתיים (ראה פגם #4)
4. שלח ל-Gemini רק את CONDITION_ID + נתוני מזג אוויר (כקונטקסט) וביקש ממנו רק את ההמלצות הטקסטואליות
```

### קוד להטמעה

**א. שירות שליפת מזג אוויר אמיתי — `src/services/weatherService.js`:**

```javascript
// Open-Meteo הוא API חינמי, ללא צורך במפתח API
const HAIFA_LAT = 32.794;
const HAIFA_LON = 34.9896;

export const fetchRealWeather = async () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', HAIFA_LAT);
  url.searchParams.set('longitude', HAIFA_LON);
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'relative_humidity_2m_max',
    'wind_speed_10m_max',
    'uv_index_max',
    'dew_point_2m_max'
  ].join(','));
  url.searchParams.set('timezone', 'Asia/Jerusalem');
  url.searchParams.set('start_date', dateStr);
  url.searchParams.set('end_date', endDateStr);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const json = await response.json();
  return parseWeatherResponse(json);
};

const parseWeatherResponse = (json) => {
  const { daily } = json;
  return daily.time.map((date, i) => ({
    date,                         // YYYY-MM-DD
    temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
    humidity: daily.relative_humidity_2m_max[i],
    wind: daily.wind_speed_10m_max[i],
    uvIndex: daily.uv_index_max[i],
    dewPoint: daily.dew_point_2m_max[i],
  }));
};
```

**ב. עדכון `dataService.js` לשימוש בנתונים אמיתיים:**

```javascript
import { fetchRealWeather } from './weatherService';
import { classifyCondition } from '../utils'; // ראה פגם #4

export const getHairForecast = async () => {
  const today = getTodayDateString(); // YYYY-MM-DD

  // 1. בדוק Cache
  const cached = await loadFromCache(today);
  if (cached) return cached;

  // 2. שלוף מזג אוויר אמיתי
  const weatherDays = await fetchRealWeather();

  // 3. חשב CONDITION_ID מהנתונים האמיתיים
  const periodsWithConditions = weatherDays.slice(0, 8).map(day => ({
    ...day,
    conditionId: classifyCondition(day.humidity, day.dewPoint, day.wind),
  }));

  // 4. שלח ל-Gemini רק את ה-conditionId + context לכתיבת טקסט
  const result = await fetchDailyInsight(periodsWithConditions);

  // 5. שמור ב-Cache
  await saveToCache(today, result);
  return result;
};
```

---

## 2. חוסר התאמה בפורמט תאריך

### תיאור הפגם

בקובץ `dataService.js`, הפונקציה `getTodayDateString()` מחזירה תאריך בפורמט `DD/MM/YYYY` (כגון `"26/02/2026"`) באמצעות `en-GB` locale:

```javascript
const formatter = new Intl.DateTimeFormat('en-GB', options); // מחזיר DD/MM/YYYY
return formatter.format(date); // => "26/02/2026"
```

אך בקובץ `INSTRUCTIONS.md` כתוב במפורש:
> The `date` column is text-based to store dates in `YYYY-MM-DD` format (e.g., `2023-10-27`).

כלומר, ה-query לסופאבייס מחפש `date = "26/02/2026"` בעוד שהנתונים נשמרים כ-`"2026-02-26"`. **התוצאה: ה-Cache לעולם לא מוצא התאמה**, ו-Gemini נקרא מחדש בכל טעינת עמוד.

### אלגוריתם התיקון

```
1. קבע פורמט תאריך אחיד לכל הפרויקט: YYYY-MM-DD (תקן ISO 8601)
2. עדכן את getTodayDateString() להחזיר YYYY-MM-DD
3. ודא שהנתונים הנשמרים ב-Supabase גם הם ב-YYYY-MM-DD
```

### קוד להטמעה

**בקובץ `dataService.js` — החלף את הפונקציה:**

```javascript
// לפני (שגוי):
const getTodayDateString = () => {
  const date = new Date();
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jerusalem' };
  const formatter = new Intl.DateTimeFormat('en-GB', options); // מחזיר DD/MM/YYYY
  return formatter.format(date); // "26/02/2026" — שגוי!
};

// אחרי (נכון):
const getTodayDateString = () => {
  // מחזיר YYYY-MM-DD תוך שמירה על אזור הזמן הישראלי
  const now = new Date();
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jerusalem' };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
  // en-CA מחזיר YYYY-MM-DD
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`; // => "2026-02-26"
};
```

---

## 3. היפוך לוגי ב־getDoseLevel

### תיאור הפגם

בקובץ `utils.js`, הפונקציה `getDoseLevel()` בודקת מילות מפתח בסדר לא נכון:

```javascript
// בדיקת "HIGH" לפני "NONE"
if (lowerText.includes('חובה') || ...) return 'high';        // ← בדיקה ראשונה
if (lowerText.includes('לא חובה') || ...) return 'none';     // ← לעולם לא מגיעים לכאן!
```

המחרוזת `"לא חובה"` מכילה את `"חובה"`, אז היא תמיד תחזיר `'high'` במקום `'none'`.

**דוגמה קונקרטית מהנתונים:**
- שמן ב-PERFECT_DAY: `"רק אם בא לך אקסטרה ברק בקצוות. לא חובה. ✨"` — אמורה להיות `none`, מוחזרת כ-`high`
- ה-Dose Meter יציג פס מלא עם אנימציית pulse — ההפך המוחלט מהמשמעות האמיתית

### אלגוריתם התיקון

```
1. בדוק תחילה ביטויי שלילה מורכבים (לא חובה, לא צריך, לוותר, לא היום)
2. רק לאחר מכן בדוק מילות חיוב (חובה, הרבה, בנדיבות)
3. לאחר מכן בדוק מילות מינון נמוך (טיפה, מעט, קליל)
4. ברירת מחדל: normal
```

### קוד להטמעה

**בקובץ `utils.js` — החלף את הפונקציה כולה:**

```javascript
export const getDoseLevel = (text) => {
  if (!text) return 'normal';
  const t = text.toLowerCase();

  // 1. בדוק תחילה ביטויי שלילה/דילוג — הם גוברים על כל השאר
  const nonePatterns = [
    'לא צריך', 'לא היום', 'לוותר', 'none', 'אין צורך', 'לא חובה',
    'לא חייב', 'skip', 'אפשר לוותר'
  ];
  if (nonePatterns.some(p => t.includes(p))) return 'none';

  // 2. ביטויי מינון נמוך
  const lowPatterns = ['טיפה', 'מעט', 'קליל', 'דק', 'עדין', 'ממש מעט'];
  if (lowPatterns.some(p => t.includes(p))) return 'low';

  // 3. ביטויי מינון גבוה (רק אחרי שלילה נבדקה)
  const highPatterns = ['בנדיבות', 'להעמיס', 'חובה', 'הרבה', 'חזק', 'מלא'];
  if (highPatterns.some(p => t.includes(p))) return 'high';

  return 'normal';
};
```

---

## 4. CONDITION_ID לא נגזר מחישוב

### תיאור הפגם

הפרומפט מגדיר אלגוריתם לחישוב CONDITION_ID על בסיס נקודת הטל (Dew Point) ומהירות הרוח. אך מכיוון ש-Gemini אינו מבצע חישוב מדעי אמיתי (ובוודאי לא שולף נתוני מזג אוויר, כמפורט בפגם #1), הוא בסופו של דבר **מנחש** את ה-ID על בסיס ניסיון, לא חישוב.

בנוסף, ה-ELSE האחרון בפרומפט שגוי לוגית:
```
ELSE (Dew Point 5-16°C) -> PERFECT_DAY
```
אך אם לחות > 65% ונקודת טל 5-16°C, תנאי ה-SAUNA לא מתקיים (כי נקודת טל < 16), אך זה עדיין יום לח — לא "PERFECT_DAY". הלוגיקה חלקית.

### אלגוריתם התיקון — חישוב CONDITION_ID בצד הלקוח

```
INPUT: humidity (%), dewPoint (°C), windSpeed (km/h)
OUTPUT: CONDITION_ID (string)

ALGORITHM:
1. isHumid = (dewPoint > 16) OR (humidity > 65)
2. isDry   = (dewPoint < 5)  OR (humidity < 35)
3. isWindy = windSpeed > 18

IF isHumid AND isWindy  → SAUNA_STORM
IF isHumid AND NOT isWindy → SAUNA_CALM
IF isDry AND isWindy    → DESERT_STORM
IF isDry AND NOT isWindy → DESERT_CALM
ELSE                    → PERFECT_DAY  ← עכשיו רק מקרים "ממוצעים" באמת
```

### קוד להטמעה

**הוסף ל-`utils.js`:**

```javascript
export const classifyCondition = (humidity, dewPoint, windSpeed) => {
  const isHumid = dewPoint > 16 || humidity > 65;
  const isDry   = dewPoint < 5  || humidity < 35;
  const isWindy = windSpeed > 18;

  if (isHumid && isWindy)  return 'SAUNA_STORM';
  if (isHumid && !isWindy) return 'SAUNA_CALM';
  if (isDry   && isWindy)  return 'DESERT_STORM';
  if (isDry   && !isWindy) return 'DESERT_CALM';
  return 'PERFECT_DAY';
};
```

**עדכון `geminiService.js` — Gemini מקבל conditionId ורק כותב טקסט:**

```javascript
// הפרומפט החדש לא מבקש מ-Gemini לחשב — הוא מקבל את החישוב כ-input
export const fetchDailyInsight = async (periodsWithConditions) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const inputContext = periodsWithConditions.map(p => ({
    date: p.date,
    conditionId: p.conditionId,
    temp: p.temp,
    humidity: p.humidity,
    wind: p.wind,
    uvIndex: p.uvIndex,
  }));

  const prompt = `
Given the following REAL weather data and pre-computed CONDITION_IDs for Haifa, Israel,
generate the Hebrew hair advice JSON. DO NOT change the conditionId values — they are
calculated from real data. Only fill in the text fields from the content library.

Weather data: ${JSON.stringify(inputContext, null, 2)}

${promptText}
  `;

  // ... rest of the API call
};
```

---

## 5. רקע קבוע — לא דינמי

### תיאור הפגם

קיימת פונקציה `getGradientClass(conditionId)` ב-`utils.js` שממפה תנאי מזג אוויר לגרדיאנטים ויזואליים. אך הפונקציה **לא נקראת בשום מקום**. ב-`Background.jsx` יש גרדיאנט קשיח:

```javascript
// Background.jsx — גרדיאנט קבוע לעולם
const gradientClass = 'from-sky-400 via-purple-400 to-pink-400';
```

תנאי מזג האוויר אינם משפיעים כלל על הויזואל של האפליקציה.

### אלגוריתם התיקון

```
1. העבר את selectedPeriod.weather_data.condition_id_detected ל-Background
2. קרא ל-getGradientClass(conditionId) כדי לקבל את כיתת ה-CSS הנכונה
3. השתמש בה כ-className דינמי
```

### קוד להטמעה

**בקובץ `App.jsx` — העבר conditionId:**

```jsx
<Background conditionId={selectedPeriod?.weather_data?.condition_id_detected} />
```

**בקובץ `Background.jsx` — הפוך לדינמי:**

```jsx
import { getGradientClass } from '../utils';

const Background = ({ conditionId }) => {
  const gradientClass = getGradientClass(conditionId); // עכשיו דינמי
  return (
    <div className={`fixed inset-0 z-[-1] w-full h-full transition-colors duration-1000 bg-gradient-to-br ${gradientClass} ...`}>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
    </div>
  );
};
```

**בקובץ `utils.js` — הרחב את מיפוי הגרדיאנטים:**

```javascript
export const getGradientClass = (conditionId) => {
  switch (conditionId) {
    case 'SAUNA_STORM':  return 'from-slate-700 via-purple-700 to-slate-800'; // כהה וסוער
    case 'SAUNA_CALM':   return 'from-teal-500 via-cyan-600 to-blue-600';     // לח ועמוס
    case 'DESERT_STORM': return 'from-orange-600 via-amber-500 to-red-600';   // יבש וסוערתa
    case 'DESERT_CALM':  return 'from-amber-400 via-yellow-400 to-orange-400';// יבש ורגוע
    case 'PERFECT_DAY':  return 'from-sky-400 via-purple-400 to-pink-400';    // מושלם
    default:             return 'from-sky-400 via-purple-400 to-pink-400';
  }
};
```

---

## 6. בדיקת uvAlert שגויה

### תיאור הפגם

ב-`MainStatusCard.jsx`:

```jsx
{uvAlert && (uvAlert !== 'Low' && uvAlert !== 'null') && (
    <div>UV HIGH</div>
)}
```

**בעיה א':** `uvAlert !== 'null'` בודקת מול המחרוזת `"null"` (string), לא מול הערך `null`. לאחר `JSON.parse`, ערך `null` ב-JSON הופך ל-`null` של JavaScript (לא מחרוזת). הבדיקה `uvAlert !== 'null'` מיותרת — אם `uvAlert` הוא `null`, התנאי `uvAlert &&` כבר ידאג לזה.

**בעיה ב':** ה-badge תמיד מציג `"UV HIGH"` — לא מציג את הטקסט האמיתי שנשלח מ-Gemini (כמו `"שימי כובע! השמש תשרוף לך את הגוון 🧢"`).

**בעיה ג':** `uvAlert !== 'Low'` — מניין הגיע הערך `'Low'`? הפרומפט אומר שהערכים הם רק `null` או טקסט עברי. `'Low'` אינו ערך מוגדר.

### קוד להטמעה

```jsx
// לפני:
{uvAlert && (uvAlert !== 'Low' && uvAlert !== 'null') && (
    <div>UV HIGH</div>
)}

// אחרי:
{uvAlert && typeof uvAlert === 'string' && uvAlert.length > 0 && (
    <div className="absolute top-4 left-4 bg-orange-500/20 border border-orange-500/50 text-orange-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 z-10">
        <AlertTriangle className="w-3 h-3" />
        {uvAlert}  {/* ← מציג את הטקסט האמיתי */}
    </div>
)}
```

---

## 7. Cache Supabase שבור

### תיאור הפגם

בנוסף לבעיית פורמט התאריך (פגם #2), מנגנון ה-Cache שבור גם לוגית:

1. **אין Cache Invalidation:** פעם אחת שהנתונים נשמרו ל-Supabase, לעולם לא יתעדכנו, גם אם מזג האוויר השתנה דרמטית.
2. **כשל שקט ב-insert:** אם ה-insert נכשל (שגיאת רשת, הרשאות), הקוד מחזיר את הנתונים עם `console.error`. בביקור הבא — Gemini יופעל שוב.
3. **אין TTL (Time-To-Live):** נתונים שנשמרו ב-Supabase נשארים לנצח אפילו אם הפריסה של גרסה חדשה מצריכה רענון.
4. **אין fallback לנתוני Demo:** כאשר Supabase זמין אך Gemini נכשל, האפליקציה זורקת שגיאה במקום להחזיר WEATHER_DATA.

### אלגוריתם התיקון

```
Cache Flow נכון:
1. בדוק Supabase לתאריך היום (YYYY-MM-DD) ב-created_at <= 6 שעות
2. אם קיים ותקף → החזר
3. אם לא קיים / פג תוקף → שלוף מהמקורות
4. אם שמירה נכשלה → log + המשך עם הנתונים בזיכרון
5. אם הכל נכשל → החזר WEATHER_DATA עם תיוג "demo mode"
```

### קוד להטמעה

```javascript
// dataService.js
const CACHE_TTL_HOURS = 6; // נתונים תקינים ל-6 שעות

const loadFromCache = async (dateStr) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('daily_insights')
      .select('content, created_at')
      .eq('date', dateStr)   // dateStr הוא YYYY-MM-DD
      .single();

    if (error || !data) return null;

    // בדוק אם הנתונים עדיין תקינים (TTL)
    const ageHours = (Date.now() - new Date(data.created_at).getTime()) / 3_600_000;
    if (ageHours > CACHE_TTL_HOURS) {
      console.log(`Cache expired (${Math.round(ageHours)}h old). Fetching fresh.`);
      return null;
    }

    return data.content;
  } catch (e) {
    console.warn('Cache read failed:', e);
    return null;
  }
};

const saveToCache = async (dateStr, content) => {
  if (!supabase) return;
  try {
    await supabase
      .from('daily_insights')
      .upsert([{ date: dateStr, content, created_at: new Date().toISOString() }], {
        onConflict: 'date',
      });
  } catch (e) {
    console.warn('Cache write failed (non-fatal):', e);
  }
};

export const getHairForecast = async () => {
  const today = getTodayDateString(); // YYYY-MM-DD

  const cached = await loadFromCache(today);
  if (cached) return cached;

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn('No Gemini key. Using demo data.');
    return { ...WEATHER_DATA, _isDemo: true };
  }

  try {
    const weatherDays = await fetchRealWeather(); // ראה פגם #1
    const generated = await fetchDailyInsight(weatherDays);
    await saveToCache(today, generated);
    return generated;
  } catch (err) {
    console.error('Full pipeline failed. Falling back to demo data.', err);
    return { ...WEATHER_DATA, _isDemo: true };
  }
};
```

---

## 8. Demo Data מיושן

### תיאור הפגם

בקובץ `data.js`, נתוני ה-Demo הם:

```javascript
"date": "12/02/2026",  // תאריך עבר קשיח
"date": "13/02/2026",  // תאריך עבר קשיח
"date": "14/02 - 20/02", // טווח עבר קשיח
```

כאשר Supabase ו-Gemini אינם זמינים, המשתמש רואה תאריכים מהעבר המוצגים כ"היום", "מחר", "השבוע" — מטעה מאוד.

### קוד להטמעה

```javascript
// data.js — שנה לנתוני Demo עם תאריכים דינמיים
import { getTodayDateString } from './services/dataService'; // ייצא את הפונקציה

const buildDemoData = () => {
  const today = new Date();
  const fmt = (d) => d.toLocaleDateString('en-GB').replace(/\//g, '/'); // DD/MM/YYYY
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const weekStart = new Date(today); weekStart.setDate(today.getDate() + 2);
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 8);

  return {
    "location": "Haifa, Israel",
    "_isDemo": true,  // סיווג לתצוגה
    "periods": [
      { "period_name": "היום (Today)", "date": fmt(today), /* ... */ },
      { "period_name": "מחר (Tomorrow)", "date": fmt(tomorrow), /* ... */ },
      { "period_name": "השבוע (Weekly Vibe)", "date": `${fmt(weekStart)} - ${fmt(weekEnd)}`, /* ... */ }
    ]
  };
};

export const WEATHER_DATA = buildDemoData();
```

---

## 9. JSON Template שגויה בפרומפט

### תיאור הפגם

בקובץ `prompt.txt`, תבנית ה-JSON שנשלחת ל-Gemini מכילה שגיאות תחביר:

```json
// שגיאה א': חסר פסיק לפני "protection"
"styling_tip": "Insert 'styling_tip' string"   ← אין פסיק!
"protection": "..."

// שגיאה ב': תגובות JavaScript בתוך JSON
{
  "period_name": "מחר (Tomorrow)",
  // Repeat structure for Tomorrow  ← JSON לא תומך ב-comments
}
```

Gemini מנסה להסיק את הפורמט הנכון מה-prompt, אך תבנית שגויה יכולה לגרום לפלט שגוי.

### קוד להטמעה — החלף את חלק ה-OUTPUT ב-`prompt.txt`:

```
### 4. OUTPUT GENERATION
Generate a valid JSON object strictly following this structure:

{
  "location": "Haifa, Israel",
  "periods": [
    {
      "period_name": "היום (Today)",
      "date": "DD/MM/YYYY",
      "weather_data": {
        "temp": "XX°C",
        "humidity": "XX%",
        "wind": "XX km/h",
        "uv_index": "XX",
        "condition_id_detected": "CONDITION_ID_HERE"
      },
      "summary_text": "weather_summary from selected database",
      "funny_quote": "funny_quote from selected database",
      "wash_day_routine": {
        "shampoo": "...",
        "conditioner": "...",
        "mask": "...",
        "leave_in": "...",
        "gel": "...",
        "oil": "...",
        "styling_tip": "..."
      },
      "refresh_day_routine": {
        "conditioner": "אם מקלחת ללא חפיפה, אז [conditioner string]",
        "mask": "...",
        "leave_in": "...",
        "gel": "...",
        "oil": "...",
        "styling_tip": "...",
        "protection": "IF wind > 15 THEN לאסוף לקוקו נמוך מוגן ELSE לפזר בכיף אבל לשים לב לקצוות"
      },
      "uv_alert": "IF UV > 7 THEN שימי כובע! השמש תשרוף לך את הגוון 🧢 ELSE null"
    },
    {
      "period_name": "מחר (Tomorrow)",
      "date": "DD/MM/YYYY",
      [same structure as above]
    },
    {
      "period_name": "השבוע (Weekly Vibe)",
      "date": "DD/MM - DD/MM",
      [same structure, using weekly averages]
    }
  ]
}

CRITICAL: Output ONLY valid JSON. No markdown code fences, no comments, no explanation.
```

---

## 10. חשיפת API Keys לצד הלקוח

### תיאור הפגם

מפתחות ה-API מוגדרים ב-`.env` עם קידומת `VITE_`:

```
VITE_GEMINI_API_KEY=AIzaSy...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_SUPABASE_URL=https://...
```

כל משתנה עם קידומת `VITE_` מוטמע ב-bundle JavaScript הציבורי. **כל משתמש יכול לראות את מפתח ה-Gemini API בכלי הפיתוח של הדפדפן**, להשתמש בו לגבייה על חשבון הבעלים.

מפתח Supabase Anon Key מותאם לחשיפה ציבורית (כך הוא מתוכנן), אבל Gemini API Key הוא **סוד שאסור לחשוף**.

### אלגוריתם התיקון

```
1. צור Serverless Function (Vercel/Netlify/Supabase Edge Function)
2. שמור את GEMINI_API_KEY כ-Secret בצד השרת בלבד (ללא קידומת VITE_)
3. הלקוח יקרא לפונקציה הזו במקום לקרוא ל-Gemini ישירות
4. הפונקציה מחזירה את הנתון שהתקבל מ-Gemini
```

### קוד להטמעה

**`supabase/functions/generate-forecast/index.ts`:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { date, weatherData } = await req.json();

  // GEMINI_API_KEY מוגדר כ-Secret בצד Supabase Edge Functions — לא חשוף ללקוח
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/...`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ /* prompt */ }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**עדכון `geminiService.js` בצד הלקוח:**

```javascript
// במקום לקרוא ל-Gemini ישירות, קרא ל-Edge Function
export const fetchDailyInsight = async (weatherData) => {
  const { data, error } = await supabase.functions.invoke('generate-forecast', {
    body: { weatherData },
  });
  if (error) throw error;
  return data;
};
```

---

## 11. ממוצע שבועי לא מוגדר

### תיאור הפגם

ה"תקופה" השלישית היא `"השבוע (Weekly Vibe)"`. הפרומפט מבקש "Weekly Average" אבל לא מגדיר כיצד לחשב:
- האם ממוצע הטמפרטורות? הטמפרטורה הגבוהה ביותר?
- CONDITION_ID השבועי — האם הנפוץ ביותר? הגרוע ביותר?
- UV — האם המקסימום? הממוצע?

Gemini מנחש, ולעיתים קרובות CONDITION_ID השבועי לא עולה בקנה אחד עם ממוצע ימות השבוע האמיתי.

### אלגוריתם התיקון

```
WEEKLY_CONDITION חישוב:
1. קבל את כל CONDITION_ID לימים 2-8 (מחרתיים עד 8 ימים קדימה)
2. ספור כמה פעמים כל תנאי מופיע
3. אם >50% מהימים הם SAUNA_STORM → SAUNA_STORM
4. אחרת: בחר את ה-CONDITION_ID הנפוץ ביותר (mode)
5. UV שבועי: מקסימום UV אצל כל הימים
6. טמפרטורה שבועית: ממוצע ה-max של כל ימי השבוע
7. לחות שבועית: ממוצע לחות מקסימלית שבועית
```

### קוד להטמעה

```javascript
// utils.js
export const computeWeeklyCondition = (dailyPeriods) => {
  // dailyPeriods = 7 ימים של נתוני מזג אוויר אמיתיים
  const conditionCounts = {};
  for (const day of dailyPeriods) {
    const cond = classifyCondition(day.humidity, day.dewPoint, day.wind);
    conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
  }
  // ה-mode (הנפוץ ביותר)
  const dominantCondition = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  const avgTemp = Math.round(dailyPeriods.reduce((s, d) => s + d.temp, 0) / dailyPeriods.length);
  const avgHumidity = Math.round(dailyPeriods.reduce((s, d) => s + d.humidity, 0) / dailyPeriods.length);
  const avgWind = Math.round(dailyPeriods.reduce((s, d) => s + d.wind, 0) / dailyPeriods.length);
  const maxUV = Math.max(...dailyPeriods.map(d => d.uvIndex));

  return { dominantCondition, avgTemp, avgHumidity, avgWind, maxUV };
};
```

---

## 12. parseInt של wind שביר

### תיאור הפגם

ב-`MainStatusCard.jsx` שורה 65:

```javascript
parseInt(data.wind) || 5  // data.wind = "22 km/h"
```

`parseInt("22 km/h")` מחזיר `22` — זה עובד בגלל ש-`parseInt` מעצר בתו הראשון שאינו ספרה. אבל:
- אם ה-format הוא `" 22 km/h"` (עם רווח מוביל) → עדיין עובד
- אם ה-format הוא `"~22"` → לא עובד
- אם `data.wind` הוא `undefined` → מחזיר `5` (ה-fallback), ואנימציית השיער לא תזוהה כשגיאה

### קוד להטמעה

```javascript
// utils.js — הוסף
export const parseNumericValue = (str, fallback = 0) => {
  if (str == null) return fallback;
  const match = String(str).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : fallback;
};

// MainStatusCard.jsx — שנה
import { parseNumericValue } from '../utils';
// ...
animation: `threadFlutter ${Math.max(0.2, 20 / (parseNumericValue(data.wind, 5))}s ease-in-out infinite`,
```

---

## 13. UV Badge מציג טקסט סטטי

### תיאור הפגם

ה-badge מציג תמיד `"UV HIGH"` במקום להציג את הטקסט שחזר מ-Gemini. הפרומפט מגדיר שה-`uv_alert` יכיל את ההודעה המלאה `"שימי כובע! השמש תשרוף לך את הגוון 🧢"`.

ראה תיקון בפגם #6 — הצגת `{uvAlert}` במקום הטקסט הסטטי.

---

## 14. CONDITION_ID לא מאומת

### תיאור הפגם

הנתון `condition_id_detected` מגיע ממקור חיצוני (Gemini/Supabase) ולא מאומת בצד הלקוח. אם Gemini יחזיר ערך לא מוכר (כגון `"PERFECT_STORM"` או `"HUMID"`) — האפליקציה תשתמש בגרדיאנט ברירת המחדל בשקט, ללא שגיאה גלויה.

### קוד להטמעה

```javascript
// utils.js — הוסף
const VALID_CONDITIONS = new Set(['SAUNA_STORM', 'SAUNA_CALM', 'DESERT_STORM', 'DESERT_CALM', 'PERFECT_DAY']);

export const validateConditionId = (id) => {
  if (!VALID_CONDITIONS.has(id)) {
    console.warn(`Unknown condition_id: "${id}". Defaulting to PERFECT_DAY.`);
    return 'PERFECT_DAY';
  }
  return id;
};

// שימוש ב-dataService.js לאחר JSON.parse
data.periods.forEach(p => {
  p.weather_data.condition_id_detected = validateConditionId(p.weather_data.condition_id_detected);
});
```

---

## 15. אין Retry לשמירת Supabase

### תיאור הפגם

בקובץ `dataService.js`:

```javascript
if (insertError) {
  console.error("Error saving to Supabase:", insertError);
  // We still return the data even if save failed
}
```

אם השמירה נכשלה (בעיית רשת זמנית), הנתונים לא יישמרו. בביקור הבא, Gemini יופעל שוב, מה שמבזבז quota ומוסיף latency.

### קוד להטמעה

```javascript
// dataService.js — saveToCache עם retry
const saveToCache = async (dateStr, content, retries = 2) => {
  if (!supabase) return;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase
        .from('daily_insights')
        .upsert([{ date: dateStr, content, created_at: new Date().toISOString() }], {
          onConflict: 'date',
        });
      if (!error) return; // הצלחה
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // backoff
      } else {
        console.warn('Cache save failed after retries (non-fatal):', error);
      }
    } catch (e) {
      console.warn(`Cache save attempt ${attempt + 1} failed:`, e);
    }
  }
};
```

---

## סיכום — טבלת פגמים ועדיפויות

| # | פגם | חומרה | השפעה על המשתמש | קושי תיקון |
|---|-----|-------|-----------------|------------|
| 1 | אין מזג אוויר אמיתי | 🔴 קריטי | נתוני מזג אוויר מזויפים | בינוני |
| 2 | פורמט תאריך שגוי | 🔴 קריטי | Cache לא עובד, Gemini נקרא תמיד | נמוך |
| 3 | היפוך getDoseLevel | 🔴 קריטי | Dose meter מציג הפוך | נמוך |
| 4 | CONDITION_ID לא מחושב | 🟠 גבוה | המלצות לא מדויקות | בינוני |
| 5 | רקע קבוע | 🟡 בינוני | UX חסר | נמוך |
| 6 | uvAlert בדיקה שגויה | 🟡 בינוני | Alert לא מוצג נכון | נמוך |
| 7 | Cache שבור | 🟠 גבוה | ביצועים גרועים, quota מבוזבז | בינוני |
| 8 | Demo data מיושן | 🟡 בינוני | תאריכים מבלבלים | נמוך |
| 9 | JSON template שגויה | 🟡 בינוני | פלט Gemini עלול להיות שגוי | נמוך |
| 10 | API Key חשוף | 🔴 קריטי | סיכון אבטחה | גבוה |
| 11 | ממוצע שבועי לא מוגדר | 🟡 בינוני | נתון שבועי לא מהימן | בינוני |
| 12 | parseInt שביר | 🟢 נמוך | אנימציה עלולה לשבש | נמוך |
| 13 | UV badge סטטי | 🟢 נמוך | UX | נמוך |
| 14 | CONDITION_ID לא מאומת | 🟡 בינוני | שגיאות שקטות | נמוך |
| 15 | אין Retry לשמירה | 🟡 בינוני | Cache לא אמין | נמוך |

### סדר תיקון מומלץ

1. **פגם #2** — תיקון מיידי, נמוך מאמץ, השפעה גדולה על Cache
2. **פגם #3** — תיקון מיידי, שגיאת לוגיקה ברורה
3. **פגם #1 + #4** — יחד: הוספת API מזג אוויר אמיתי + חישוב CONDITION_ID בקוד
4. **פגם #7** — תיקון Cache בשיטת upsert + TTL
5. **פגם #5** — הפעלת הגרדיאנט הדינמי
6. **פגם #6, #9, #8, #12, #13, #14, #15** — תיקונים קטנים
7. **פגם #10** — ארכיטקטורה: מעבר ל-Edge Function (ארוך יותר, חשוב לייצור)
