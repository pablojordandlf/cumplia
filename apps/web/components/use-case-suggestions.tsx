'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronDown, ChevronUp, ArrowRight, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner'

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
  const [isExpanded, setIsExpanded] = useState(false);

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
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-amber-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (catalog.length === 0) {
    return null;
  }

  const displayedCases = isExpanded ? catalog : catalog.slice(0, 4);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg overflow-hidden">
      {/* Header - Clickable banner */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-amber-900 text-sm">¿Necesitas inspiración?</span>
          <span className="text-amber-700 text-xs hidden sm:inline">
            Haz clic para ver {catalog.length} ejemplos de sistemas de IA
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-amber-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayedCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => {
                  onSelectCase(useCase);
                  toast.success('Caso precargado', { description: `"${useCase.name}" cargado. Puedes modificarlo antes de guardar.` });
                }}
                className="text-left p-3 rounded-md border border-amber-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-amber-700">
                    {useCase.name}
                  </h4>
                  <ArrowRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                  {useCase.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1 py-0 ${riskLevelColors[useCase.ai_act_level] || riskLevelColors.unclassified}`}
                  >
                    {riskLevelLabels[useCase.ai_act_level] || 'Sin clasificar'}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                    <Building2 className="w-2.5 h-2.5" />
                    {sectorLabels[useCase.sector] || useCase.sector}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          
          {catalog.length > 6 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Mostrando {Math.min(displayedCases.length, catalog.length)} de {catalog.length} ejemplos
            </p>
          )}
        </div>
      )}
    </div>
  );
}
