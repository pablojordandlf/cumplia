-- ============================================
-- CREAR BUCKET DE STORAGE PARA DOCUMENTOS
-- ============================================
-- Ejecutar en Supabase SQL Editor

-- Crear bucket 'documents' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuarios autenticados pueden subir a su propia carpeta de organización
DROP POLICY IF EXISTS "Allow authenticated uploads to own org folder" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to own org folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    (SELECT org_id FROM public.organization_members 
     WHERE user_id = auth.uid() 
     LIMIT 1)::text = (SPLIT_PART(name, '/', 1))
  );

-- Política: Usuarios autenticados pueden leer de su propia carpeta
DROP POLICY IF EXISTS "Allow authenticated reads from own org folder" ON storage.objects;
CREATE POLICY "Allow authenticated reads from own org folder" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents' AND
    (SELECT org_id FROM public.organization_members 
     WHERE user_id = auth.uid() 
     LIMIT 1)::text = (SPLIT_PART(name, '/', 1))
  );

-- Política: Eliminación permitida para miembros de la organización
DROP POLICY IF EXISTS "Allow authenticated deletes from own org folder" ON storage.objects;
CREATE POLICY "Allow authenticated deletes from own org folder" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents' AND
    (SELECT org_id FROM public.organization_members 
     WHERE user_id = auth.uid() 
     LIMIT 1)::text = (SPLIT_PART(name, '/', 1))
  );

-- Verificar que el bucket se creó
SELECT * FROM storage.buckets WHERE id = 'documents';
