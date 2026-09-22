-- Hosted/public-schema hardening for the reviewer deployment.
-- The application uses a server-side Postgres connection string and does not
-- use the Supabase Data API from the browser. Enabling RLS with no public
-- policies therefore makes anon/authenticated Data API access deny-by-default
-- without changing the server-side application path.

alter table public.templates enable row level security;
alter table public.sections enable row level security;
alter table public.items enable row level security;
alter table public.comments enable row level security;
alter table public.import_runs enable row level security;
alter table public.import_warnings enable row level security;
