'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Calendar, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface UseCase {
  id: string;
  name: string;
  description: string | null;
  sector: string;
  status: string;
  ai_act_level: string;
  confidence_score: number | null;
  classification_reason: string | null;
  classification_data: {
    articles?: string[];
    obligations?: string[];
    answers?: Record<string, boolean>;
  } | null;
  created_at: string;
  updated_at: string;
}

const sectorLabels: Record<string, string> = {
  healthcare: 'Salud',
  education: 'Educación',
  security: 'Seguridad Pública',
  employment: 'Empleo',
  transport: 'Transporte',
  finance: 'Finanzas',
  justice: 'Justicia',
  other: 'Otro',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  classified: 'Clasificado',
  in_review: 'En revisión',
  compliant: 'Conforme',
  non_compliant: 'No conforme',
};

const statusBadgeClass: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  classified: 'bg-blue-100 text-blue-700',
  in_review: 'bg-yellow-100 text-yellow-700',
  compliant: 'bg-green-100 text-green-700',
  non_compliant: 'bg-red-100 text-red-700',
};

export default function UseCaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const useCaseId = params.id as string;

  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUseCase();
  }, [useCaseId]);

  const loadUseCase = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (error) throw error;
      setUseCase(data);
    } catch (error: any) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Caso de uso no encontrado</p>
            <Link href="/dashboard/inventory">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inventario
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{useCase.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusBadgeClass[useCase.status]}>
                {statusLabels[useCase.status] || useCase.status}
              </Badge>
              <span className="text-sm text-gray-500">
                ID: {useCase.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/inventory/${useCaseId}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          {useCase.ai_act_level === 'unclassified' && (
            <Link href={`/dashboard/inventory/${useCaseId}/classify`}>
              <Button size="sm">Clasificar</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Descripción</p>
              <p className="mt-1 text-gray-900">
                {useCase.description || 'Sin descripción'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Sector</p>
                <p className="mt-1 text-gray-900">
                  {sectorLabels[useCase.sector] || useCase.sector}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <p className="mt-1 text-gray-900">
                  {statusLabels[useCase.status] || useCase.status}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Creado
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatDate(useCase.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Última modificación
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatDate(useCase.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clasificación AI Act */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clasificación AI Act</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <RiskBadge
                level={
                  useCase.ai_act_level === 'high_risk'
                    ? 'high'
                    : useCase.ai_act_level === 'limited_risk'
                    ? 'limited'
                    : useCase.ai_act_level === 'minimal_risk'
                    ? 'minimal'
                    : useCase.ai_act_level === 'prohibited'
                    ? 'prohibited'
                    : 'unclassified'
                }
                size="lg"
                showIcon
              />
              {useCase.confidence_score !== null && (
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Confianza</span>
                    <span className="font-medium">
                      {Math.round(useCase.confidence_score * 100)}%
                    </span>
                  </div>
                  <Progress value={useCase.confidence_score * 100} className="h-2" />
                </div>
              )}
            </div>

            {useCase.classification_reason && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Razonamiento</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{useCase.classification_reason}</p>
                </div>
              </div>
            )}

            {useCase.classification_data?.articles &&
              useCase.classification_data.articles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Artículos Aplicables</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.classification_data.articles.map((article) => (
                      <Badge key={article} variant="outline" className="bg-blue-50">
                        {article}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Obligaciones de Cumplimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Obligaciones de Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            {useCase.classification_data?.obligations &&
            useCase.classification_data.obligations.length > 0 ? (
              <ul className="space-y-3">
                {useCase.classification_data.obligations.map((obligation, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{obligation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                {useCase.ai_act_level === 'unclassified'
                  ? 'Clasifica el caso de uso para ver las obligaciones aplicables.'
                  : 'No hay obligaciones específicas para este nivel de riesgo.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
