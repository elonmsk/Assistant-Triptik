-- Tables pour le système de chat
-- Adaptées à la structure existante avec table 'info'

-- Table des conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_numero BIGINT NOT NULL, -- Référence vers info.numero (type corrigé: BIGINT)
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('accompagne', 'accompagnant')),
  theme VARCHAR(100), -- Catégorie/thème de la conversation (Santé, Emploi, etc.)
  title VARCHAR(200), -- Titre auto-généré ou premier message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte de clé étrangère vers la table info
  CONSTRAINT fk_user_numero FOREIGN KEY (user_numero) REFERENCES info(numero) ON DELETE CASCADE
);

-- Table des messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices pour optimiser les performances
CREATE INDEX idx_conversations_user ON conversations(user_numero, updated_at DESC);
CREATE INDEX idx_conversations_theme ON conversations(user_numero, theme);
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres conversations
CREATE POLICY "Users can view own conversations" ON conversations
    FOR ALL USING (user_numero::text = current_setting('app.current_user_numero', true));

-- Politique : les utilisateurs ne peuvent voir que les messages de leurs conversations
CREATE POLICY "Users can view own messages" ON messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_numero::text = current_setting('app.current_user_numero', true)
        )
    );

-- Commentaires pour documentation
COMMENT ON TABLE conversations IS 'Table stockant les conversations de chat par utilisateur';
COMMENT ON TABLE messages IS 'Table stockant les messages individuels de chaque conversation';
COMMENT ON COLUMN conversations.user_numero IS 'Référence vers info.numero - identifiant unique utilisateur (BIGINT)';
COMMENT ON COLUMN conversations.user_type IS 'Type utilisateur: accompagne ou accompagnant';
COMMENT ON COLUMN conversations.theme IS 'Catégorie thématique de la conversation'; 