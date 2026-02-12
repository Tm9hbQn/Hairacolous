# Setup Instructions for Hair Forecast App

This project uses **Supabase** for caching daily forecasts and **Google Gemini** for generating hair insights.

## 1. Environment Variables

Create a `.env` file in the root directory of your project (same level as `package.json`) and add the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** Do not commit `.env` to Git. It is already in `.gitignore`.

## 2. Supabase Setup

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Create a new project.
3.  Go to the **SQL Editor** in the left sidebar.
4.  Run the following SQL query to create the `daily_insights` table:

```sql
create table daily_insights (
  id uuid default gen_random_uuid() primary key,
  date text not null unique,
  content jsonb not null,
  created_at timestamptz default now()
);

-- Optional: Enable Row Level Security (RLS) if you want to restrict access
-- For this public app, you might want to allow read access to everyone:
alter table daily_insights enable row level security;

create policy "Enable read access for all users"
on daily_insights for select
using (true);

create policy "Enable insert access for all users"
on daily_insights for insert
with check (true);
```

> **Important:** The `date` column is text-based to store dates in `YYYY-MM-DD` format (e.g., `2023-10-27`).

## 3. Google Gemini Setup

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Get an API Key.
3.  Paste it into `VITE_GEMINI_API_KEY` in your `.env` file.

## 4. Running the App

After setting up the keys and database:

```bash
npm install
npm run dev
```

The app will now:
1.  Check Supabase for today's forecast.
2.  If found, display it.
3.  If not found, call Gemini to generate it, save it to Supabase, and then display it.
