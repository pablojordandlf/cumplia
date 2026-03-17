'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface UseCaseCatalog {
  id: string;
  name: string;
  description: string;
  sector: string;
  ai_act_level: string;
  typical_purpose?: string;
}

interface UseCaseSuggestionsProps {
  onSelectCase: (useCase: UseCaseCatalog) => void;
}

const riskLevelColors: Record<string, string> = {
  prohibited: 'bg-red-100 text-red-800 border-red-200',
  high_risk: 'bg-orange-100 text-orange-800 border-orange-200',
  limited_risk: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  minimal_risk: 'bg-green-100 text-green-800 border-green-200',
  unclassified: 'bg-gray-100 text-gray-800 border-gray-200',
};

const riskLevelLabels: Record<string, string> = {
  prohibited: 'Prohibido',
  high_risk: 'Alto Riesgo',
  limited_risk: 'Riesgo Limitado',
  minimal_risk: 'Riesgo Mínimo',
  unclassified: 'Sin clasificar',
};

const sectorLabels: Record<string, string> = {
  finance: 'Finanzas',
  healthcare: 'Salud',
  education: 'Educación',
  government: 'Gobierno',
  retail: 'Retail',
  technology: 'Tecnología',
  entertainment: 'Entretenimiento',
  manufacturing: 'Manufactura',
  transportation: 'Transporte',
  employment: 'Empleo',
  security: 'Seguridad',
  other: 'Otros',
  general: 'General',
  customer_service: 'Atención al Cliente',
  media: 'Medios',
  ecommerce: 'E-commerce',
  border: 'Fronteras',
  justice: 'Justicia',
  infrastructure: 'Infraestructura',
};

export function UseCaseSuggestions({ onSelectCase }: UseCaseSuggestionsProps) {
  const [catalog, setCatalog] = useState<UseCaseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    try {
      const { data, error } = await supabase
        .from('use_case_catalog')
        .select('id, name, description, sector, ai_act_level, typical_purpose')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setCatalog(data || []);
    } catch (error: any) {
      console.error('Error loading catalog:', error);
      // Silently fail - don't show error toast to user, just log it
      // The examples are optional enhancement, not critical functionality
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  }

  const displayedCases = showAll ? catalog : catalog.slice(0, 4);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-amber-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (catalog.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-900">¿Necesitas inspiración?</h3>
          <p className="text-sm text-amber-700">
            Selecciona un sistema de IA típico para empezar rápidamente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedCases.map((useCase) => (
          <button
            key={useCase.id}
            onClick={() => {
              setSelectedId(useCase.id);
              onSelectCase(useCase);
            }}
            className={`text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
              selectedId === useCase.id
                ? 'border-amber-500 bg-amber-100'
                : 'border-amber-200 bg-white hover:border-amber-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                  {useCase.name}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {useCase.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge 
                variant="outline" 
                className={`text-xs ${riskLevelColors[useCase.ai_act_level] || riskLevelColors.unclassified}`}
              >
                {riskLevelLabels[useCase.ai_act_level] || 'Sin clasificar'}
              </Badge>
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {sectorLabels[useCase.sector] || useCase.sector}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {catalog.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full text-amber-700 hover:text-amber-800 hover:bg-amber-100"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Ver más ({catalog.length - 4} casos adicionales)
            </>
          )}
        </Button>
      )}

      <div className="mt-4 pt-4 border-t border-amber-200">
        <div className="flex items-center gap-2 text-sm text-amber-700">
          <Sparkles className="w-4 h-4" />
          <span>
            <strong>Consejo:</strong> CumplIA calculará automáticamente el nivel de riesgo después de completar el cuestionario de clasificación.
          </span>
        </div>
      </div>
    </div>
  );
}
