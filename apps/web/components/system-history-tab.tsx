'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  RotateCcw, 
  FileText, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UseCaseVersion {
  id: string;
  version_number: number;
  name: string;
  description: string | null;
  sector: string | null;
  ai_act_level: string | null;
  ai_act_role: string | null;
  classification_data: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
  version_notes: string | null;
  notes: string | null;
}

interface UseCaseHistoryEvent {
  id: string;
  type: 'version_created' | 'status_changed' | 'classification_updated' | 'obligation_completed' | 'risk_updated';
  title: string;
  description: string;
  created_at: string;
  created_by?: string;
  metadata?: Record<string, any>;
}

interface SystemHistoryTabProps {
  useCaseId: string;
  currentVersionId?: string | null;
}

export function SystemHistoryTab({ useCaseId, currentVersionId }: SystemHistoryTabProps) {
  const [versions, setVersions] = useState<UseCaseVersion[]>([]);
  const [events, setEvents] = useState<UseCaseHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    fetchHistory();
  }, [useCaseId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('use_case_versions')
        .select('*')
        .eq('use_case_id', useCaseId)
        .order('version_number', { ascending: false });

      if (versionsError) throw versionsError;

      setVersions(versionsData || []);

      // TODO: Fetch additional events from audit log table when available
      // For now, we'll generate events from versions
      const generatedEvents: UseCaseHistoryEvent[] = (versionsData || []).map(v => ({
        id: v.id,
        type: 'version_created',
        title: `Versión ${v.version_number} creada`,
        description: v.version_notes || v.notes || 'Sin notas',
        created_at: v.created_at,
        created_by: v.created_by || undefined,
        metadata: {
          version_number: v.version_number,
          ai_act_level: v.ai_act_level,
          name: v.name,
        }
      }));

      setEvents(generatedEvents);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const toggleVersion = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (aiActLevel: string | null) => {
    const colors: Record<string, string> = {
      prohibited: 'bg-red-100 text-red-800',
      high_risk: 'bg-orange-100 text-orange-800',
      limited_risk: 'bg-yellow-100 text-yellow-800',
      minimal_risk: 'bg-green-100 text-green-800',
      unclassified: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      prohibited: 'Prohibido',
      high_risk: 'Alto Riesgo',
      limited_risk: 'Riesgo Limitado',
      minimal_risk: 'Riesgo Mínimo',
      unclassified: 'Sin Clasificar',
    };

    return (
      <Badge className={colors[aiActLevel || 'unclassified'] || colors.unclassified}>
        {labels[aiActLevel || 'unclassified'] || aiActLevel}
      </Badge>
    );
  };

  const getRoleLabel = (role: string | null) => {
    const labels: Record<string, string> = {
      provider: 'Proveedor',
      deployer: 'Usuario (Deployer)',
      distributor: 'Distribuidor',
      importer: 'Importador',
    };
    return labels[role || ''] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Resumen del Historial
          </CardTitle>
          <CardDescription>
            {versions.length} versión{versions.length !== 1 ? 'es' : ''} guardada{versions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{versions.length}</div>
              <div className="text-sm text-blue-600">Versiones</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {versions.filter(v => v.ai_act_level && v.ai_act_level !== 'unclassified').length}
              </div>
              <div className="text-sm text-green-600">Clasificadas</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">
                {versions[0]?.version_number || 0}
              </div>
              <div className="text-sm text-purple-600">Última Versión</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-700">
                {versions[0]?.created_at 
                  ? format(new Date(versions[0].created_at), 'dd/MM/yy', { locale: es })
                  : '-'}
              </div>
              <div className="text-sm text-gray-600">Última Actualización</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Versiones del Sistema
          </CardTitle>
          <CardDescription>
            Historial de cambios y versiones guardadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">Sin versiones</p>
              <p className="text-sm mt-2">
                Este sistema de IA aún no tiene versiones guardadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => {
                const isExpanded = expandedVersions.has(version.id);
                const isCurrent = version.id === currentVersionId;

                return (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isCurrent ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isCurrent ? "default" : "secondary"}>
                            v{version.version_number}
                          </Badge>
                          {isCurrent && (
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              Actual
                            </Badge>
                          )}
                          {getStatusBadge(version.ai_act_level)}
                        </div>
                        <h4 className="font-medium text-gray-900">{version.name}</h4>
                        {version.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {version.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(version.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                          </span>
                          {version.sector && (
                            <span className="capitalize">{version.sector}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVersion(version.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {version.ai_act_role && (
                            <div>
                              <span className="text-gray-500">Rol AI Act:</span>
                              <span className="ml-2 font-medium">
                                {getRoleLabel(version.ai_act_role)}
                              </span>
                            </div>
                          )}
                          {version.version_notes && (
                            <div className="md:col-span-2">
                              <span className="text-gray-500">Notas de versión:</span>
                              <p className="mt-1 text-gray-700">{version.version_notes}</p>
                            </div>
                          )}
                          {version.notes && (
                            <div className="md:col-span-2">
                              <span className="text-gray-500">Notas adicionales:</span>
                              <p className="mt-1 text-gray-700">{version.notes}</p>
                            </div>
                          )}
                          {version.classification_data && Object.keys(version.classification_data).length > 0 && (
                            <div className="md:col-span-2">
                              <span className="text-gray-500">Datos de clasificación:</span>
                              <div className="mt-2 bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                                {JSON.stringify(version.classification_data, null, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isCurrent}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restaurar esta versión
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Cambios y acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">
              El registro de actividad detallado estará disponible próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
