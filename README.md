# ASWB Clinical Exam Prep

A local React/Vite study app for students preparing for the ASWB Clinical Social Work Licensing Examination.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Supabase Backend

The app works in local-only mode by default. To enable real user accounts and cross-device
progress sync, create a Supabase project and add these variables to `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For public deployments that should require sign-in before showing the app, also set:

```bash
VITE_REQUIRE_AUTH=true
```

Then run the SQL migration in `supabase/migrations/202605140001_create_learner_profiles.sql`
from the Supabase SQL editor or Supabase CLI. The migration creates a `learner_profiles`
table with Row Level Security so each authenticated user can only access their own learner
profiles and saved progress.

Run `supabase/migrations/202605140002_create_account_entitlements.sql` as well to enable
free and paid access. New accounts start on the free plan and can answer 25 questions. Paid
access is stored in `account_entitlements`, and only the backend service role can promote an
account to paid.

In Supabase Auth settings, set the site URL and redirect URLs to the app URL you are using,
for example `http://127.0.0.1:5173/` locally and the production URL after deployment. Email
confirmation and password reset links use those URLs to return students to the app.

## Payments

The app supports Stripe Checkout through Supabase Edge Functions:

- `supabase/functions/create-checkout-session` creates a Stripe Checkout Session for the
  signed-in user.
- `supabase/functions/stripe-webhook` verifies Stripe webhook signatures and updates the
  user's entitlement after checkout or subscription changes.

Set these Supabase Edge Function secrets before deploying the functions:

```bash
supabase secrets set \
  SITE_URL=https://idrissenayat.github.io/ASWB-Clinical-Prep-Studio/ \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_PRICE_ID=price_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  SUPABASE_SERVICE_ROLE_KEY=...
```

Then deploy:

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

For a quick manual payment-link test, set `VITE_STRIPE_PAYMENT_LINK` in GitHub Pages secrets.
That redirects users to Stripe, but the secure entitlement change should still happen through
the webhook or an admin update.

Note: the current GitHub Pages build still ships the question bank in the frontend bundle, so
this is a product access gate for normal app use. A stronger content paywall would move question
delivery into Supabase functions that only return full-bank questions to paid users.

## Features

- Blueprint-weighted readiness dashboard
- Dashboard knowledge map by domain and study area
- 2,500 original exam-style Clinical practice questions with rationales
- Switch between testing on/after August 3, 2026 and testing before August 3, 2026
- Free account access for the first 25 answered questions, with a paid upgrade path for the full bank
- Focused practice by 2026 exam area or pre-2026 Clinical study area, including IA through IVC
- Timed simulation sprints using the selected ASWB model's question count and pacing
- The 2,500-question practice bank is mapped to both the 2026 blueprint and the 2018 pre-transition outline
- Flashcards for high-yield clinical judgment
- Study planner with saved progress
- Bookmarks, attempt history, accuracy, and coverage saved locally or synced through Supabase when configured
- Account sign-up, sign-in, password reset, and signed-in password management when Supabase is configured

## Exam References

This app is independently created and is not affiliated with or endorsed by ASWB. It uses original practice content and public ASWB information about the 2026 exam transition:

- [ASWB 2026 exam changes](https://www.aswb.org/2026exams/)
- [ASWB content outlines](https://www.aswb.org/exam/readiness-to-practice/content-outlines/)
- [ASWB exam scoring](https://www.aswb.org/exam/exam-scoring/)

ASWB states that exams change on August 3, 2026. Testing before that date uses the 2018 exam content outlines with 170 total questions, 20 unscored pretest questions, and a four-hour time limit. Testing on or after that date uses the 2026 content outlines with 122 total questions, 12 unscored pretest questions, and a four-hour time limit.
