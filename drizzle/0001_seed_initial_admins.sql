-- The first two people on the allowlist (decided 2026-10-08). Everyone after
-- them is added from /admin/users, which logs who added whom.
INSERT INTO "admin_users" ("email", "role") VALUES
	('jesus@kibadvisors.com', 'admin'),
	('ariel@kibadvisors.com', 'editor')
ON CONFLICT ("email") DO NOTHING;
--> statement-breakpoint
-- Belt and braces on top of RLS-with-no-policies: Supabase's API roles get no
-- table privileges at all. Skipped where those roles don't exist (plain Postgres).
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
		REVOKE ALL ON "admin_users", "audit_log" FROM anon, authenticated;
	END IF;
END $$;
