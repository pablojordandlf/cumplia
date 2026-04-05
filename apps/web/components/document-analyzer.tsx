'use client';

import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'text/csv': 'CSV',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/gif': 'GIF',
};

const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(',');
const MAX_FILES = 5;
const MAX_FILE_MB = 10;

export interface ExtractedDocData {
  name: string | null;
  description: string | null;
  sector: string | null;
  ai_act_role: string | null;
  is_poc: boolean | null;
  provider: string | null;
  ai_owner: string | null;
  version: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface CurrentFormValues {
  name?: string;
  description?: string;
  sector?: string;
  ai_act_role?: string;
  is_poc?: boolean | null;
}

interface DocumentAnalyzerProps {
  onApply: (data: ExtractedDocData) => void;
  currentValues?: CurrentFormValues;
}

type SelectableField = 'name' | 'description' | 'sector' | 'ai_act_role' | 'is_poc' | 'provider' | 'ai_owner' | 'version';

type SelectedFields = Record<SelectableField, boolean>;

const SECTOR_LABELS: Record<string, string> = {
  finance: 'Finanzas', healthcare: 'Salud', education: 'Educación',
  government: 'Gobierno', retail: 'Comercio', technology: 'Tecnología',
  entertainment: 'Entretenimiento', manufacturing: 'Manufactura',
  transportation: 'Transporte', other: 'Otro',
};

const ROLE_LABELS: Record<string, string> = {
  provider: 'Proveedor', deployer: 'Usuario (Deployer)',
  distributor: 'Distribuidor', importer: 'Importador',
};

const CONFIDENCE_CONFIG: Record<string, { label: string; className: string }> = {
  high: { label: 'Alta confianza', className: 'bg-green-100 text-green-800' },
  medium: { label: 'Confianza media', className: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Baja confianza', className: 'bg-red-100 text-red-800' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasCurrentValue(value: string | boolean | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

interface FieldRowProps {
  label: string;
  extractedValue: string | null | undefined;
  currentValue?: string | boolean | null;
  selected: boolean;
  onToggle: () => void;
}

function FieldRow({ label, extractedValue, currentValue, selected, onToggle }: FieldRowProps) {
  if (!extractedValue) return null;
  const hasExisting = hasCurrentValue(currentValue);

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 w-28 shrink-0">{label}</span>
          <span className={`text-sm font-medium truncate ${selected ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
            {extractedValue}
          </span>
          {hasExisting && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
              sobreescribe valor actual
            </span>
          )}
        </div>
      </div>
    </label>
  );
}

function buildInitialSelection(extracted: ExtractedDocData): SelectedFields {
  return {
    name: extracted.name !== null,
    description: extracted.description !== null,
    sector: extracted.sector !== null,
    ai_act_role: extracted.ai_act_role !== null,
    is_poc: extracted.is_poc !== null,
    provider: extracted.provider !== null,
    ai_owner: extracted.ai_owner !== null,
    version: extracted.version !== null,
  };
}

export function DocumentAnalyzer({ onApply, currentValues }: DocumentAnalyzerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedDocData | null>(null);
  const [selectedFields, setSelectedFields] = useState<SelectedFields | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function addFiles(incoming: FileList | File[]) {
    const valid: File[] = [];
    const errors: string[] = [];

    Array.from(incoming).forEach((file) => {
      if (!ACCEPTED_TYPES[file.type]) {
        errors.push(`"${file.name}" no es un tipo soportado.`);
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" supera los ${MAX_FILE_MB} MB.`);
        return;
      }
      valid.push(file);
    });

    if (errors.length) {
      toast({ title: 'Archivos no válidos', description: errors.join(' '), variant: 'destructive' });
    }

    setFiles((prev) => {
      const merged = [...prev, ...valid];
      if (merged.length > MAX_FILES) {
        toast({ title: 'Límite alcanzado', description: `Máximo ${MAX_FILES} archivos.`, variant: 'destructive' });
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });

    setExtracted(null);
    setSelectedFields(null);
    setError(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setExtracted(null);
    setSelectedFields(null);
    setError(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  async function analyze() {
    if (!files.length) return;
    setIsAnalyzing(true);
    setError(null);
    setExtracted(null);
    setSelectedFields(null);

    try {
      const body = new FormData();
      files.forEach((f) => body.append('files', f));

      const res = await fetch('/api/v1/ai-systems/analyze-docs', { method: 'POST', body });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Error desconocido al analizar los documentos.');
      }

      setExtracted(json.data);
      setSelectedFields(buildInitialSelection(json.data));
    } catch (err: any) {
      setError(err.message ?? 'Error al conectar con el servidor.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function toggleField(field: SelectableField) {
    setSelectedFields((prev) => prev ? { ...prev, [field]: !prev[field] } : prev);
  }

  function selectAll() {
    if (!extracted) return;
    setSelectedFields(buildInitialSelection(extracted));
  }

  function deselectAll() {
    if (!selectedFields) return;
    const cleared = Object.fromEntries(
      Object.keys(selectedFields).map((k) => [k, false])
    ) as SelectedFields;
    setSelectedFields(cleared);
  }

  function handleApply() {
    if (!extracted || !selectedFields) return;

    const filtered: ExtractedDocData = {
      name: selectedFields.name ? extracted.name : null,
      description: selectedFields.description ? extracted.description : null,
      sector: selectedFields.sector ? extracted.sector : null,
      ai_act_role: selectedFields.ai_act_role ? extracted.ai_act_role : null,
      is_poc: selectedFields.is_poc ? extracted.is_poc : null,
      provider: selectedFields.provider ? extracted.provider : null,
      ai_owner: selectedFields.ai_owner ? extracted.ai_owner : null,
      version: selectedFields.version ? extracted.version : null,
      confidence: extracted.confidence,
    };

    const appliedCount = Object.values(selectedFields).filter(Boolean).length;
    onApply(filtered);
    toast({
      title: 'Campos aplicados',
      description: `Se han prerrellenado ${appliedCount} campo${appliedCount !== 1 ? 's' : ''} en el formulario.`,
    });
  }

  const confidenceCfg = extracted ? CONFIDENCE_CONFIG[extracted.confidence] : null;
  const anySelected = selectedFields ? Object.values(selectedFields).some(Boolean) : false;
  const allSelected = selectedFields
    ? Object.entries(selectedFields).every(([key, val]) => {
        const hasData = extracted?.[key as SelectableField] !== null && extracted?.[key as SelectableField] !== undefined;
        return !hasData || val;
      })
    : false;

  const hasUsefulData = extracted && (
    extracted.name || extracted.description || extracted.sector ||
    extracted.ai_act_role || extracted.is_poc !== null ||
    extracted.provider || extracted.ai_owner || extracted.version
  );

  const pocLabel = extracted?.is_poc === true
    ? 'Prueba de Concepto (PoC)'
    : extracted?.is_poc === false
    ? 'Sistema en Producción'
    : null;

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Cargar documentación</h3>
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">IA</Badge>
      </div>
      <p className="text-sm text-blue-700">
        Sube documentos técnicos, fichas del sistema o cualquier documentación relevante y CumplIA prerrellenará el formulario automáticamente.
      </p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-100' : 'border-blue-300 hover:border-blue-400 hover:bg-blue-100'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-blue-800">Arrastra archivos aquí o haz clic para seleccionar</p>
        <p className="text-xs text-blue-500 mt-1">PDF, TXT, MD, CSV, imágenes · Max {MAX_FILE_MB} MB por archivo · Hasta {MAX_FILES} archivos</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-blue-100">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm text-gray-800 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Analyze button */}
      {files.length > 0 && !extracted && (
        <Button
          type="button"
          onClick={analyze}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando documentación...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analizar documentación con IA
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {extracted && selectedFields && (
        <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-900">Información extraída</span>
            </div>
            {confidenceCfg && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceCfg.className}`}>
                {confidenceCfg.label}
              </span>
            )}
          </div>

          {hasUsefulData ? (
            <>
              <p className="text-xs text-gray-500">
                Selecciona los campos que quieres aplicar al formulario. Los campos marcados con
                {' '}<span className="text-amber-600 font-medium">sobreescribe valor actual</span>{' '}
                reemplazarán lo que ya hayas introducido.
              </p>

              <div className="space-y-2.5">
                <FieldRow
                  label="Nombre"
                  extractedValue={extracted.name}
                  currentValue={currentValues?.name}
                  selected={selectedFields.name}
                  onToggle={() => toggleField('name')}
                />
                <FieldRow
                  label="Descripción"
                  extractedValue={extracted.description}
                  currentValue={currentValues?.description}
                  selected={selectedFields.description}
                  onToggle={() => toggleField('description')}
                />
                <FieldRow
                  label="Sector"
                  extractedValue={extracted.sector ? SECTOR_LABELS[extracted.sector] ?? extracted.sector : null}
                  currentValue={currentValues?.sector}
                  selected={selectedFields.sector}
                  onToggle={() => toggleField('sector')}
                />
                <FieldRow
                  label="Rol AI Act"
                  extractedValue={extracted.ai_act_role ? ROLE_LABELS[extracted.ai_act_role] ?? extracted.ai_act_role : null}
                  currentValue={currentValues?.ai_act_role}
                  selected={selectedFields.ai_act_role}
                  onToggle={() => toggleField('ai_act_role')}
                />
                <FieldRow
                  label="Tipo"
                  extractedValue={pocLabel}
                  currentValue={currentValues?.is_poc}
                  selected={selectedFields.is_poc}
                  onToggle={() => toggleField('is_poc')}
                />
                <FieldRow
                  label="Proveedor"
                  extractedValue={extracted.provider}
                  selected={selectedFields.provider}
                  onToggle={() => toggleField('provider')}
                />
                <FieldRow
                  label="AI Owner"
                  extractedValue={extracted.ai_owner}
                  selected={selectedFields.ai_owner}
                  onToggle={() => toggleField('ai_owner')}
                />
                <FieldRow
                  label="Versión"
                  extractedValue={extracted.version}
                  selected={selectedFields.version}
                  onToggle={() => toggleField('version')}
                />
              </div>

              <div className="flex gap-2 text-xs pt-1 border-t border-gray-100">
                <button type="button" onClick={selectAll} disabled={allSelected} className="text-blue-600 hover:underline disabled:opacity-40">
                  Seleccionar todo
                </button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={deselectAll} disabled={!anySelected} className="text-blue-600 hover:underline disabled:opacity-40">
                  Deseleccionar todo
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" onClick={handleApply} size="sm" className="flex-1" disabled={!anySelected}>
                  Aplicar campos seleccionados
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setExtracted(null); setSelectedFields(null); setFiles([]); }}
                >
                  Descartar
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No se encontró información suficiente en los documentos. Intenta con documentación más detallada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
