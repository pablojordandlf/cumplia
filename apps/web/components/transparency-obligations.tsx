import Link from 'next/link';
import { AlertCircle, Clock, ShieldAlert, Shield, CheckCircle2, FileCheck, Info, Upload, Download, FileText, Image, FileVideo, FileAudio, Trash2, Paperclip, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface UseCase {
  id: string;
  ai_act_level: string;
  classification_data?: {
    isHumanInteraction?: string;
    generatesSyntheticContent?: string;
    isDeepfake?: string;
    isEmotionRecognition?: string;
    isBiometricCategorization?: string;
    generatesText?: string;
    systemType?: string;
  };
}

interface ObligationItem {
  key: string;
  title: string;
  description: string;
  isWarning?: boolean;
  warningText?: string;
  evidenceSuggestions: string[];
}

interface UseCaseObligation {
  id: string;
  use_case_id: string;
  obligation_key: string;
  obligation_title: string;
  is_completed: boolean;
  completed_at: string | null;
}

interface Evidence {
  id: string;
  obligation_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  description: string | null;
  created_at: string;
}

const OBLIGATIONS_BY_LEVEL: Record<string, ObligationItem[]> = {
  prohibited: [
    { key: 'prohibition_absolute', title: 'Prohibición absoluta', description: 'Este sistema no puede ser desplegado, puesto en servicio o utilizado en la UE.', evidenceSuggestions: ['Declaración firmada de no implementación del sistema', 'Documento de análisis de viabilidad legal que confirma la prohibición', 'Registro de decisión interna de cancelación del proyecto'] },
    { key: 'notify_authorities', title: 'Notificación a autoridades', description: 'Si se detecta un uso prohibido, debe notificarse inmediatamente a la autoridad nacional competente.', evidenceSuggestions: ['Copia del correo electrónico de notificación enviado', 'Acuse de recibo de la autoridad competente', 'Registro de fecha y hora de la notificación', 'Descripción detallada del sistema prohibido detectado'] },
  ],
  high_risk: [
    { key: 'eu_database_registration', title: 'Registro en base de datos UE', description: 'El sistema debe registrarse en la base de datos de sistemas de IA de alto riesgo de la UE (Art. 71).', isWarning: true, warningText: '⚠️ La base de datos de la Comisión Europea aún no está disponible. Se espera su apertura en los próximos meses.', evidenceSuggestions: ['Certificado de registro en la base de datos UE (cuando esté disponible)', 'Número de referencia del registro', 'Captura de pantalla del registro completado', 'Confirmación de registro por parte de la autoridad competente'] },
    { key: 'technical_documentation', title: 'Documentación técnica completa', description: 'Mantener documentación técnica actualizada conforme al Anexo IV (Art. 11).', evidenceSuggestions: ['Documento técnico completo según Anexo IV del AI Act', 'Especificaciones del sistema y arquitectura', 'Descripción de los datos de entrenamiento utilizados', 'Métricas de rendimiento y validación', 'Manual técnico del sistema de IA'] },
    { key: 'automatic_logs', title: 'Logs automáticos', description: 'Registro automático de eventos durante el funcionamiento del sistema (Art. 12).', evidenceSuggestions: ['Configuración del sistema de logging implementado', 'Ejemplo de logs generados (datos anonimizados)', 'Política de retención de logs', 'Procedimiento de auditoría de logs', 'Documentación de los eventos que se registran automáticamente'] },
    { key: 'human_oversight', title: 'Supervisión humana efectiva', description: 'Garantizar supervisión humana adecuada para prevenir o minimizar riesgos (Art. 14).', evidenceSuggestions: ['Procedimientos de supervisión humana documentados', 'Manuales de operación para supervisores', 'Certificados de formación del personal de supervisión', 'Registro de intervenciones humanas realizadas', 'Descripción de mecanismos de override/parada de emergencia'] },
    { key: 'user_transparency', title: 'Transparencia hacia usuarios', description: 'Información clara sobre que el sistema es IA, sus capacidades y limitaciones (Art. 13).', evidenceSuggestions: ['Capturas de pantalla de los avisos mostrados a usuarios', 'Textos de divulgación utilizados en la interfaz', 'Términos y condiciones actualizados', 'Política de transparencia del sistema', 'Ejemplos de comunicaciones a usuarios finales'] },
    { key: 'risk_management', title: 'Sistema de gestión de riesgos', description: 'Implementar y mantener un sistema de gestión de riesgos continuo (Art. 9).', evidenceSuggestions: ['Documento de gestión de riesgos del sistema', 'Evaluación de impacto en derechos fundamentales (FRIA)', 'Plan de mitigación de riesgos identificados', 'Registro de revisiones periódicas de riesgos', 'Procedimientos de respuesta a incidentes'] },
    { key: 'quality_assurance', title: 'Garantías de calidad', description: 'Asegurar la calidad de los datos de entrenamiento, validación y prueba (Art. 10).', evidenceSuggestions: ['Informes de calidad de datos de entrenamiento', 'Resultados de pruebas de validación', 'Métricas de rendimiento del modelo', 'Informes de sesgos detectados y mitigaciones', 'Documentación de procedimientos de testing'] },
    { key: 'conformity_assessment', title: 'Evaluación de conformidad', description: 'Realizar evaluación de conformidad antes de la puesta en el mercado (Art. 43).', evidenceSuggestions: ['Certificado de conformidad CE', 'Informe del organismo notificado', 'Declaración UE de conformidad', 'Documentación de la evaluación realizada', 'Registro de auditorías externas'] },
  ],
  limited_risk: [
    { key: 'inform_ai_interaction', title: 'Informar que se interactúa con IA', description: 'Los usuarios deben saber que están interactuando con un sistema de inteligencia artificial (chatbots, sistemas conversacionales).', evidenceSuggestions: ['Capturas de pantalla del aviso de IA en la interfaz', 'Flujos de usuario que muestran cuándo aparece el aviso', 'Textos exactos utilizados para informar a los usuarios', 'Ejemplos de conversaciones donde se disclose que es IA', 'Registro de cambios en los textos de divulgación'] },
    { key: 'disclose_synthetic_content', title: 'Divulgación de contenido sintético', description: 'Marcar claramente contenido generado por IA como artificialmente generado o manipulado. Se aplica a deepfakes, imágenes sintéticas, audio y video generado por IA (multimedia).', evidenceSuggestions: ['Ejemplos de marcas de agua o metadatos aplicados', 'Capturas de imágenes/videos etiquetados como IA-generated', 'Ejemplos de audio con disclaimers', 'Documentación del proceso de etiquetado', 'Muestras de deepfakes con divulgación visible'] },
    { key: 'inform_emotion_recognition', title: 'Informar sobre reconocimiento emocional/biométrico', description: 'Notificar a las personas cuando se utilice un sistema de reconocimiento de emociones o categorización biométrica.', evidenceSuggestions: ['Avisos mostrados a personas cuando se procesan sus emociones', 'Políticas de privacidad actualizadas con esta información', 'Formularios de consentimiento informado', 'Señalización física en lugares con reconocimiento biométrico', 'Procedimientos de opt-out para usuarios'] },
    { key: 'label_ai_text', title: 'Etiquetado de texto generado por IA', description: 'Divulgar que el texto ha sido generado por IA (exclusivamente texto escrito). Excepciones: cuando sea revisado por humanos, asistentes editoriales o contenido artístico/libre.', evidenceSuggestions: ['Ejemplos de textos generados con etiquetado visible', 'Capturas de emails/articles con disclaimer de IA', 'Política interna de etiquetado de contenido', 'Plantillas de disclaimers utilizados', 'Excepciones documentadas (contenido revisado por humanos)'] },
  ],
  minimal_risk: [
    { key: 'voluntary_code_conduct', title: 'Adhesión voluntaria a códigos de conducta', description: 'Posibilidad de adherirse a códigos de conducta voluntarios para demostrar compromiso ético.', evidenceSuggestions: ['Certificado de adhesión al código de conducta', 'Declaración firmada de compromiso ético', 'Código de conducta específico de la industria adherido', 'Registro de cumplimiento del código', 'Carta de adhesión de la organización promotora'] },
    { key: 'best_practices', title: 'Buenas prácticas recomendadas', description: 'Seguir las mejores prácticas y estándares de la industria para sistemas de IA.', evidenceSuggestions: ['Documentación de estándares seguidos (ISO, IEEE, etc.)', 'Certificaciones internas o externas obtenidas', 'Informes de auditorías de mejores prácticas', 'Documentación de políticas internas de IA responsable', 'Registros de formación del equipo en ética de IA'] },
  ],
  unclassified: [
    { key: 'classify_system', title: 'Clasificar el sistema', description: 'Realizar la clasificación del sistema de IA según el AI Act para determinar las obligaciones aplicables.', evidenceSuggestions: ['Resultado del cuestionario de clasificación completado', 'Análisis de la función del sistema según Anexos II y III', 'Documento de decisión sobre el nivel de riesgo', 'Fecha de realización de la clasificación', 'Revisión periódica programada de la clasificación'] },
  ],
};

const LEVEL_INFO: Record<string, { title: string; icon: any; reference: string }> = {
  prohibited: { title: 'Sistema Prohibido', icon: AlertCircle, reference: 'Art. 5 AI Act' },
  high_risk: { title: 'Obligaciones de Alto Riesgo', icon: ShieldAlert, reference: 'Arts. 6, 9-15 AI Act' },
  limited_risk: { title: 'Obligaciones de Transparencia', icon: Shield, reference: 'Art. 50 AI Act' },
  minimal_risk: { title: 'Riesgo Mínimo', icon: CheckCircle2, reference: 'Art. 95 AI Act' },
  unclassified: { title: 'Sin clasificar', icon: Clock, reference: 'AI Act' },
};

const MAX_EVIDENCES_PER_OBLIGATION = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - límite del bucket de Supabase

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return FileAudio;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function TransparencyObligations({ useCase }: { useCase: UseCase }) {
  const [obligationsStatus, setObligationsStatus] = useState<Record<string, UseCaseObligation>>({});
  const [evidences, setEvidences] = useState<Record<string, Evidence[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingObligation, setUploadingObligation] = useState<string | null>(null);
  const [expandedSuggestions, setExpandedSuggestions] = useState<string | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeDialogObligation, setActiveDialogObligation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const level = useCase.ai_act_level || 'unclassified';
  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO.unclassified;
  const obligations = OBLIGATIONS_BY_LEVEL[level] || OBLIGATIONS_BY_LEVEL.unclassified;
  const IconComponent = levelInfo.icon;

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: obligationsData, error: obligationsError } = await supabase
        .from('use_case_obligations')
        .select('*')
        .eq('use_case_id', useCase.id)
        .eq('user_id', session.user.id);

      if (obligationsError) throw obligationsError;

      const statusMap: Record<string, UseCaseObligation> = {};
      obligationsData?.forEach((item: UseCaseObligation) => {
        statusMap[item.obligation_key] = item;
      });
      setObligationsStatus(statusMap);

      const obligationIds = obligationsData?.map((o: UseCaseObligation) => o.id) || [];
      if (obligationIds.length > 0) {
        const { data: evidencesData, error: evidencesError } = await supabase
          .from('obligation_evidences')
          .select('*')
          .in('obligation_id', obligationIds)
          .eq('user_id', session.user.id);

        if (evidencesError) throw evidencesError;

        const evidencesMap: Record<string, Evidence[]> = {};
        evidencesData?.forEach((ev: Evidence) => {
          const obligation = obligationsData?.find((o: UseCaseObligation) => o.id === ev.obligation_id);
          if (obligation) {
            if (!evidencesMap[obligation.obligation_key]) {
              evidencesMap[obligation.obligation_key] = [];
            }
            evidencesMap[obligation.obligation_key].push(ev);
          }
        });
        setEvidences(evidencesMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [useCase.id, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleObligation = async (obligation: ObligationItem, checked: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({ title: 'Error', description: 'Debes iniciar sesión', variant: 'destructive' });
        return;
      }

      const existing = obligationsStatus[obligation.key];

      if (existing) {
        const { error } = await supabase
          .from('use_case_obligations')
          .update({
            is_completed: checked,
            completed_at: checked ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);

        if (error) throw error;

        setObligationsStatus(prev => ({
          ...prev,
          [obligation.key]: { ...existing, is_completed: checked, completed_at: checked ? new Date().toISOString() : null }
        }));
      } else {
        const { data, error } = await supabase
          .from('use_case_obligations')
          .insert({
            use_case_id: useCase.id,
            user_id: session.user.id,
            obligation_key: obligation.key,
            obligation_title: obligation.title,
            is_completed: checked,
            completed_at: checked ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        setObligationsStatus(prev => ({ ...prev, [obligation.key]: data }));
      }

      toast({
        title: checked ? 'Obligación completada' : 'Obligación pendiente',
        description: checked ? 'La obligación ha sido marcada como cumplida' : 'La obligación ha sido marcada como pendiente',
      });
    } catch (error) {
      console.error('Error updating obligation:', error);
      toast({ title: 'Error', description: 'Error al actualizar el estado', variant: 'destructive' });
    }
  };

  const handleFileUpload = async (obligationKey: string) => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Selecciona un archivo primero', variant: 'destructive' });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({ 
        title: 'Archivo demasiado grande', 
        description: 'El tamaño máximo permitido es 10MB. Por favor, comprime el archivo o sube una versión más ligera.', 
        variant: 'destructive' 
      });
      return;
    }

    const obligationEvidences = evidences[obligationKey] || [];
    if (obligationEvidences.length >= MAX_EVIDENCES_PER_OBLIGATION) {
      toast({ title: 'Límite alcanzado', description: `Máximo ${MAX_EVIDENCES_PER_OBLIGATION} evidencias por obligación`, variant: 'destructive' });
      return;
    }

    setUploadingObligation(obligationKey);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({ title: 'Error', description: 'Debes iniciar sesión', variant: 'destructive' });
        return;
      }

      let obligationId = obligationsStatus[obligationKey]?.id;
      if (!obligationId) {
        const obligation = obligations.find(o => o.key === obligationKey);
        const { data: newObligation, error: createError } = await supabase
          .from('use_case_obligations')
          .insert({
            use_case_id: useCase.id,
            user_id: session.user.id,
            obligation_key: obligationKey,
            obligation_title: obligation?.title || '',
            is_completed: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        obligationId = newObligation.id;
        setObligationsStatus(prev => ({ ...prev, [obligationKey]: newObligation }));
      }

      const filePath = `${session.user.id}/${useCase.id}/${obligationKey}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('obligation-evidences')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: evidenceData, error: evidenceError } = await supabase
        .from('obligation_evidences')
        .insert({
          obligation_id: obligationId,
          use_case_id: useCase.id,
          user_id: session.user.id,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_path: filePath,
          description: evidenceDescription || null,
        })
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      setEvidences(prev => ({
        ...prev,
        [obligationKey]: [...(prev[obligationKey] || []), evidenceData]
      }));

      setEvidenceDescription('');
      setSelectedFile(null);
      setActiveDialogObligation(null);
      toast({ title: 'Evidencia subida', description: 'El archivo se ha subido correctamente' });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Error al subir el archivo';
      
      if (error?.message?.includes('bucket')) {
        errorMessage = 'El bucket de almacenamiento no existe. Contacta al administrador.';
      } else if (error?.message?.includes('permission') || error?.message?.includes('policy')) {
        errorMessage = 'No tienes permisos para subir archivos. Verifica las políticas de storage.';
      } else if (error?.message?.includes('row-level security')) {
        errorMessage = 'Error de seguridad: las tablas de base de datos necesitan configuración RLS.';
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setUploadingObligation(null);
    }
  };

  const deleteEvidence = async (obligationKey: string, evidence: Evidence) => {
    try {
      await supabase.storage.from('obligation-evidences').remove([evidence.file_path]);
      const { error } = await supabase.from('obligation_evidences').delete().eq('id', evidence.id);
      if (error) throw error;

      setEvidences(prev => ({
        ...prev,
        [obligationKey]: prev[obligationKey]?.filter(e => e.id !== evidence.id) || []
      }));

      toast({ title: 'Evidencia eliminada', description: 'El archivo se ha eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast({ title: 'Error', description: 'Error al eliminar la evidencia', variant: 'destructive' });
    }
  };

  const downloadEvidence = async (evidence: Evidence) => {
    try {
      const { data, error } = await supabase.storage
        .from('obligation-evidences')
        .createSignedUrl(evidence.file_path, 60);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({ title: 'Error', description: 'Error al descargar el archivo', variant: 'destructive' });
    }
  };

  const completedCount = obligations.filter(o => obligationsStatus[o.key]?.is_completed).length;
  const totalCount = obligations.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-blue-600" />
            {levelInfo.title}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-blue-600">{completedCount}</span>
              <span className="text-gray-400">/{totalCount}</span>
              <span className="ml-1">completadas</span>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Obligaciones aplicables
          </h4>

          <div className="space-y-3">
            {obligations.map((obligation) => {
              const isCompleted = obligationsStatus[obligation.key]?.is_completed || false;
              const obligationEvidences = evidences[obligation.key] || [];
              const evidenceCount = obligationEvidences.length;
              const isUploading = uploadingObligation === obligation.key;
              const showSuggestions = expandedSuggestions === obligation.key;
              const isDialogOpen = activeDialogObligation === obligation.key;

              return (
                <div
                  key={obligation.key}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`obligation-${obligation.key}`}
                      checked={isCompleted}
                      onCheckedChange={(checked) => toggleObligation(obligation, checked as boolean)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`obligation-${obligation.key}`}
                        className={`font-medium text-sm cursor-pointer ${
                          isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}
                      >
                        {obligation.title}
                      </label>
                      <p className={`text-sm mt-1 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                        {obligation.description}
                      </p>
                      {obligation.isWarning && obligation.warningText && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700">{obligation.warningText}</p>
                        </div>
                      )}
                      {isCompleted && obligationsStatus[obligation.key]?.completed_at && (
                        <p className="text-xs text-green-500 mt-2">
                          Completado el {new Date(obligationsStatus[obligation.key].completed_at!).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 ml-7">
                    <button
                      onClick={() => setExpandedSuggestions(showSuggestions ? null : obligation.key)}
                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Lightbulb className="w-3 h-3" />
                      <span>¿Qué evidencias puedo adjuntar?</span>
                      {showSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showSuggestions && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs font-medium text-amber-800 mb-2">Sugerencias de evidencias recomendadas:</p>
                        <ul className="space-y-1">
                          {obligation.evidenceSuggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-xs text-amber-700 flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 ml-7">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Evidencias</span>
                        <span className="text-xs text-gray-500">({evidenceCount}/{MAX_EVIDENCES_PER_OBLIGATION})</span>
                      </div>
                      {evidenceCount < MAX_EVIDENCES_PER_OBLIGATION && (
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setActiveDialogObligation(open ? obligation.key : null);
                            if (!open) {
                              setSelectedFile(null);
                              setEvidenceDescription('');
                            }
                          }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Upload className="w-3 h-3 mr-1" />
                              Añadir evidencia
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Subir evidencia</DialogTitle>
                              <DialogDescription>
                                Adjunta documentos, imágenes o archivos que demuestren el cumplimiento de esta obligación.
                                <span className="block mt-1 text-amber-600 font-medium">⚠️ Tamaño máximo: 10MB por archivo</span>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Archivo (máx. 10MB)</label>
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setSelectedFile(file);
                                  }}
                                  disabled={isUploading}
                                />
                                {selectedFile && activeDialogObligation === obligation.key && (
                                  <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Archivo seleccionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción (opcional)</label>
                                <Textarea
                                  placeholder="Describe brevemente el contenido de la evidencia..."
                                  value={evidenceDescription}
                                  onChange={(e) => setEvidenceDescription(e.target.value)}
                                  rows={3}
                                  disabled={isUploading}
                                />
                              </div>
                              <Button
                                onClick={() => handleFileUpload(obligation.key)}
                                disabled={!selectedFile || isUploading}
                                className="w-full"
                              >
                                {isUploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Subiendo...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Cargar evidencia
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {evidenceCount > 0 && (
                      <div className="space-y-2">
                        {obligationEvidences.map((evidence) => {
                          const FileIcon = getFileIcon(evidence.file_type);
                          return (
                            <div
                              key={evidence.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{evidence.file_name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(evidence.file_size)}</p>
                                {evidence.description && (
                                  <p className="text-xs text-gray-600 mt-1">{evidence.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => downloadEvidence(evidence)}
                                >
                                  <Download className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => deleteEvidence(obligation.key, evidence)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-gray-500">Referencia: {levelInfo.reference}</span>
          <Link href={`/dashboard/inventory/${useCase.id}/classify`}>
            <Button variant="link" size="sm" className="text-blue-600 p-0">
              {level === 'unclassified' ? 'Clasificar ahora →' : 'Revisar clasificación →'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export async function getObligationsCount(useCaseId: string, supabase: any): Promise<{ completed: number; total: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { completed: 0, total: 0 };

    const { data: useCase } = await supabase
      .from('use_cases')
      .select('ai_act_level')
      .eq('id', useCaseId)
      .single();

    if (!useCase) return { completed: 0, total: 0 };

    const level = useCase.ai_act_level || 'unclassified';
    const obligations = OBLIGATIONS_BY_LEVEL[level] || OBLIGATIONS_BY_LEVEL.unclassified;
    const total = obligations.length;

    const { data: completedObligations } = await supabase
      .from('use_case_obligations')
      .select('obligation_key')
      .eq('use_case_id', useCaseId)
      .eq('user_id', session.user.id)
      .eq('is_completed', true);

    const completed = completedObligations?.length || 0;

    return { completed, total };
  } catch (error) {
    console.error('Error getting obligations count:', error);
    return { completed: 0, total: 0 };
  }
}
