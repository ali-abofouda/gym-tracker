# Arabic Gym Tracker

Production-ready Next.js 14 App Router conversion of `gym_tracker.html` with Supabase Postgres, custom PIN auth, signed httpOnly sessions, and the exact extracted 7-day workout program.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and set:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SESSION_SECRET=...
   ```

3. Run Supabase migrations:

   ```bash
   supabase db push
   ```

   For local Supabase dev only, reseed the five profiles:

   ```bash
   supabase db seed
   ```

4. Start Next.js:

   ```bash
   npm run dev
   ```

## Supabase Notes

- `exercises` is public read so `/program` works without login.
- `profiles.pin_hash` stores bcrypt hashes only. First login sets the PIN when it is `null`.
- The app uses a signed httpOnly cookie containing `profile_id`.
- The service-role key is used only in Server Components and Server Actions.
- Tracker writes are scoped server-side to the current session profile.
- Leaderboard reads all profiles/logs server-side for friendly competition.
- Direct anon access to `profiles` and `workout_logs` is blocked by RLS; the app reads them through the server-only service client.

## Vercel Deploy

1. Push this folder to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Add the same env vars from `.env.example` in Vercel Project Settings.
4. Run the SQL migrations against the Supabase project.
5. Deploy. Users choose their profile, set a 4-digit PIN on first login, then reuse it later.

Your Supabase project URL should use the API host form, not the dashboard URL:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tplzendkdbccfaddxkho.supabase.co
```
