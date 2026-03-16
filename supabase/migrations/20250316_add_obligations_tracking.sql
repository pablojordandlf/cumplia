-- Tabla para almacenar el estado de cumplimiento de obligaciones de transparencia
CREATE TABLE IF NOT EXISTS use_case_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  obligation_key TEXT NOT NULL,
  obligation_title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(use_case_id, obligation_key)
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_use_case_obligations_use_case_id ON use_case_obligations(use_case_id);
CREATE INDEX idx_use_case_obligations_user_id ON use_case_obligations(user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_use_case_obligations_updated_at ON use_case_obligations;
CREATE TRIGGER update_use_case_obligations_updated_at
  BEFORE UPDATE ON use_case_obligations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE use_case_obligations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own obligations"
  ON use_case_obligations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own obligations"
  ON use_case_obligations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own obligations"
  ON use_case_obligations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obligations"
  ON use_case_obligations FOR DELETE
  USING (auth.uid() = user_id);