-- Table pour stocker les notes et feedback des messages
CREATE TABLE IF NOT EXISTS message_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_numero TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('accompagne', 'accompagnant')),
  rating TEXT CHECK (rating IN ('like', 'dislike')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique : un utilisateur ne peut noter qu'une fois par message
  UNIQUE(message_id, user_numero)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_ratings_message_id ON message_ratings(message_id);
CREATE INDEX IF NOT EXISTS idx_message_ratings_user ON message_ratings(user_numero, user_type);
CREATE INDEX IF NOT EXISTS idx_message_ratings_rating ON message_ratings(rating);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_message_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_ratings_updated_at
  BEFORE UPDATE ON message_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_message_ratings_updated_at();

-- RLS (Row Level Security)
ALTER TABLE message_ratings ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres notes
CREATE POLICY "Users can view their own ratings" ON message_ratings
  FOR SELECT USING (user_numero = current_setting('request.jwt.claims', true)::json->>'user_numero');

-- Politique : les utilisateurs peuvent insérer leurs propres notes
CREATE POLICY "Users can insert their own ratings" ON message_ratings
  FOR INSERT WITH CHECK (user_numero = current_setting('request.jwt.claims', true)::json->>'user_numero');

-- Politique : les utilisateurs peuvent mettre à jour leurs propres notes
CREATE POLICY "Users can update their own ratings" ON message_ratings
  FOR UPDATE USING (user_numero = current_setting('request.jwt.claims', true)::json->>'user_numero');

-- Politique : les utilisateurs peuvent supprimer leurs propres notes
CREATE POLICY "Users can delete their own ratings" ON message_ratings
  FOR DELETE USING (user_numero = current_setting('request.jwt.claims', true)::json->>'user_numero');
