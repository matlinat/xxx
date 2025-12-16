-- Creator Profiles Datenbank-Schema
-- Diese Migration erstellt die creator_profiles Tabelle und alle notwendigen Strukturen

CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(auth_user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basis-Informationen
  nickname TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  is_online BOOLEAN DEFAULT false,
  available_for TEXT CHECK (available_for IN ('live-chat', 'live-video', 'offline')) DEFAULT 'offline',
  fans_count INTEGER DEFAULT 0,
  
  -- Über mich (HTML)
  about TEXT,
  
  -- Profil-Details
  gender TEXT,
  age INTEGER,
  location TEXT,
  languages TEXT[], -- Array von Sprachen
  relationship_status TEXT,
  sexual_orientation TEXT,
  height INTEGER, -- in cm
  weight INTEGER, -- in kg
  hair_color TEXT,
  eye_color TEXT,
  zodiac_sign TEXT,
  tattoos TEXT,
  piercings TEXT,
  intimate_shaving TEXT,
  body_type TEXT,
  penis_size TEXT, -- nullable für weibliche Creator
  sexual_preferences TEXT[], -- Array von Vorlieben
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_is_online ON creator_profiles(is_online);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_creator_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_profiles_updated_at ON creator_profiles;
CREATE TRIGGER trigger_update_creator_profiles_updated_at
BEFORE UPDATE ON creator_profiles
FOR EACH ROW
EXECUTE FUNCTION update_creator_profiles_updated_at();

-- RLS Policies
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

-- Entferne alte Policies falls vorhanden
DROP POLICY IF EXISTS "Creators can view their own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Creators can update their own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Creators can insert their own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON creator_profiles;

-- Creator können ihr eigenes Profil lesen/bearbeiten
CREATE POLICY "Creators can view their own profile"
ON creator_profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Creators can update their own profile"
ON creator_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators can insert their own profile"
ON creator_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Öffentliche Profile können von allen gelesen werden
CREATE POLICY "Public profiles are viewable by everyone"
ON creator_profiles FOR SELECT
USING (true);

-- WICHTIG: Für öffentlichen Zugriff auf Creator-Profile muss auch die users-Tabelle
-- eine öffentliche RLS-Policy haben. Diese Policy muss manuell in Supabase ausgeführt werden:
--
-- CREATE POLICY "Public can view creator usernames"
-- ON users FOR SELECT
-- USING (role = 'creator');
--
-- Diese Policy erlaubt anonymen und eingeloggten Nutzern, die username und auth_user_id
-- von Creators zu lesen, was für die Profil-Anzeige unter /creator/[username] notwendig ist.
