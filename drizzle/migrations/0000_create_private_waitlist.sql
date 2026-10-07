CREATE TABLE public.waitlist_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE CHECK (length(email) <= 254),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.waitlist_entries TO service_role;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.waitlist_entries IS 'Private email waitlist. Server-only validated inserts; no public read access.';