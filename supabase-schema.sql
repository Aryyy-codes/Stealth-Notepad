-- 1. App Settings Table (Master Developer Control)
CREATE TABLE IF NOT EXISTS stealth_settings (
  id text PRIMARY KEY DEFAULT 'primary_config',
  active_daily_code text NOT NULL DEFAULT 'AUTO',
  custom_daily_override text,
  permanent_room_code text NOT NULL DEFAULT 'TECH-COMM-ALPHA',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

INSERT INTO stealth_settings (id, active_daily_code, permanent_room_code)
VALUES ('primary_config', 'AUTO', 'TECH-COMM-ALPHA')
ON CONFLICT (id) DO NOTHING;

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS stealth_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  is_permanent boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_activity timestamptz DEFAULT now() NOT NULL
);

INSERT INTO stealth_rooms (room_code, is_permanent)
VALUES ('TECH-COMM-ALPHA', true)
ON CONFLICT (room_code) DO NOTHING;

-- 3. Notes Table
CREATE TABLE IF NOT EXISTS stealth_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text NOT NULL REFERENCES stealth_rooms(room_code) ON DELETE CASCADE,
  author_tag text NOT NULL DEFAULT 'Author',
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stealth_notes_room ON stealth_notes(room_code, created_at ASC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE stealth_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stealth_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE stealth_notes ENABLE ROW LEVEL SECURITY;

-- 5. Public Policies (Drop then recreate to prevent duplicate policy errors)
DROP POLICY IF EXISTS "Allow all public read to stealth_settings" ON stealth_settings;
DROP POLICY IF EXISTS "Allow all public update to stealth_settings" ON stealth_settings;

DROP POLICY IF EXISTS "Allow public select stealth_rooms" ON stealth_rooms;
DROP POLICY IF EXISTS "Allow public insert stealth_rooms" ON stealth_rooms;
DROP POLICY IF EXISTS "Allow public update stealth_rooms" ON stealth_rooms;
DROP POLICY IF EXISTS "Allow public delete stealth_rooms" ON stealth_rooms;

DROP POLICY IF EXISTS "Allow public select stealth_notes" ON stealth_notes;
DROP POLICY IF EXISTS "Allow public insert stealth_notes" ON stealth_notes;
DROP POLICY IF EXISTS "Allow public update stealth_notes" ON stealth_notes;
DROP POLICY IF EXISTS "Allow public delete stealth_notes" ON stealth_notes;

CREATE POLICY "Allow all public read to stealth_settings" ON stealth_settings FOR SELECT USING (true);
CREATE POLICY "Allow all public update to stealth_settings" ON stealth_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public select stealth_rooms" ON stealth_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert stealth_rooms" ON stealth_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stealth_rooms" ON stealth_rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete stealth_rooms" ON stealth_rooms FOR DELETE USING (true);

CREATE POLICY "Allow public select stealth_notes" ON stealth_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert stealth_notes" ON stealth_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stealth_notes" ON stealth_notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete stealth_notes" ON stealth_notes FOR DELETE USING (true);

-- 6. Set REPLICA IDENTITY FULL (Required for Realtime DELETE filters)
ALTER TABLE stealth_notes REPLICA IDENTITY FULL;
ALTER TABLE stealth_rooms REPLICA IDENTITY FULL;

-- 7. Register Tables with Supabase Realtime (Safe duplicate check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stealth_notes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.stealth_notes';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stealth_settings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.stealth_settings';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'stealth_rooms'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.stealth_rooms';
  END IF;
END
$$;