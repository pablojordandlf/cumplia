-- Tabla para almacenar evidencias de cumplimiento de obligaciones
CREATE TABLE IF NOT EXISTS obligation_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_id UUID NOT NULL REFERENCES use_case_obligations(id) ON DELETE CASCADE,
  use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_obligation_evidences_obligation_id ON obligation_evidences(obligation_id);
CREATE INDEX idx_obligation_evidences_use_case_id ON obligation_evidences(use_case_id);
CREATE INDEX idx_obligation_evidences_user_id ON obligation_evidences(user_id);

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_obligation_evidences_updated_at ON obligation_evidences;
CREATE TRIGGER update_obligation_evidences_updated_at
  BEFORE UPDATE ON obligation_evidences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE obligation_evidences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own evidences"
  ON obligation_evidences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evidences"
  ON obligation_evidences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidences"
  ON obligation_evidences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidences"
  ON obligation_evidences FOR DELETE
  USING (auth.uid() = user_id);

-- Función para contar evidencias por obligación
CREATE OR REPLACE FUNCTION get_evidence_count(p_obligation_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM obligation_evidences WHERE obligation_id = p_obligation_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
