'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles } from 'lucide-react';
import { RiskBadge } from '@/components/risk-badge';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  sector: string;
  typical_ai_act_level: string;
  template_data?: Record<string, unknown>;
}

interface UseCaseSuggestionsProps {
  onSelectSuggestion: (suggestion: CatalogItem) => void;
  selectedSector?: string;
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

const levelMap: Record<string, 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified'> = {
  prohibited: 'prohibited',
  high_risk: 'high',
  limited_risk: 'limited',
  minimal_risk: 'minimal',
  unclassified: 'unclassified',
};

export function UseCaseSuggestions({ onSelectSuggestion, selectedSector }: UseCaseSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadSuggestions();
    setShowAll(false); // Reset when sector changes
  }, [selectedSector]);

  // Cargar sugerencias al montar el componente (para mostrar globales inicialmente)
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const params = selectedSector && selectedSector !== '__unset__' 
        ? `?sector=${encodeURIComponent(selectedSector)}` 
        : '';
      const response = await fetch(`/api/catalog${params}`);
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        throw new Error('Error loading suggestions');
      }
      const data = await response.json();
      console.log('Catalog API response:', data);
      // API returns { catalog: [...] } or directly [...]
      const items = data.catalog || data || [];
      console.log('Loaded suggestions:', items.length, items);
      setSuggestions(items);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, 4);
  const hasMore = suggestions.length > 4;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    console.log('No suggestions to display');
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">
            Casos de uso sugeridos
          </CardTitle>
        </div>
        <p className="text-sm text-blue-700">
          Selecciona uno para empezar con una plantilla, o crea uno desde cero
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleSuggestions.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 hover:border-blue-300 bg-white"
              onClick={() => onSelectSuggestion(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {sectorLabels[item.sector] || item.sector}
                      </Badge>
                      <RiskBadge
                        level={levelMap[item.typical_ai_act_level] || 'unclassified'}
                        size="sm"
                        showIcon={false}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Ver menos' : `Ver más (${suggestions.length - 4} restantes)`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
