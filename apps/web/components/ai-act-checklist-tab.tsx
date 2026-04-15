'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface AIActChecklistTabProps {
  classificationData: Record<string, any> | null;
}

// Map of field keys to human-readable labels
const fieldLabels: Record<string, string> = {
  systemType: 'Tipo de Sistema',
  p2_1: '2.1 — Manipulación o explotación de vulnerabilidades',
  p2_2: '2.2 — Puntuación social (social scoring)',
  p2_3: '2.3 — Identificación biométrica en tiempo real con fines policiales',
  p2_3a: '2.3a — Excepción por autorización judicial (víctimas, terrorismo, delitos graves)',
  p2_4: '2.4 — Inferencia de rasgos sensibles a partir de biometría',
  p2_5: '2.5 — Recopilación masiva de imágenes para bases de datos faciales',
  p2_6: '2.6 — Detección de emociones en contexto laboral o educativo',
  p3_1: '3.1 — Identificación biométrica remota en diferido',
  p3_2: '3.2 — Categorización biométrica para atributos sensibles',
  p3_3: '3.3 — Detección o reconocimiento de emociones',
  p3_3a: '3.3a — Excepción médica o de seguridad debidamente documentada',
  p3_4: '3.4 — Gestión de infraestructura crítica',
  p3_5: '3.5 — Componente de seguridad de producto regulado (Anexo I)',
  p3_6: '3.6 — Acceso a educación o evaluación académica',
  p3_7: '3.7 — Reclutamiento, selección o gestión en el empleo',
  p3_8: '3.8 — Elegibilidad para servicios esenciales, crédito o seguros',
  p3_9: '3.9 — Aplicación de la ley, migración, justicia o procesos democráticos',
  p4_1: '4.1 — Interacción directa con personas sin que sea evidente que es IA',
  p4_2: '4.2 — Generación de contenido sintético (deepfakes)',
  p4_3: '4.3 — Generación de textos de interés público sin declaración de origen IA',
  p4_4: '4.4 — Detección de emociones fuera del ámbito laboral/educativo',
};

// System type labels
const systemTypeLabels: Record<string, string> = {
  gpai_base: 'Modelo GPAI base (Art. 53)',
  gpai_systemic: 'Modelo GPAI de alto impacto (Art. 53 + 55)',
  specific: 'Sistema con finalidad definida',
  multipurpose: 'Sistema con múltiples usos',
};

// Category groupings for better organization
const questionCategories = [
  {
    title: 'Tipo de Sistema',
    fields: ['systemType'],
  },
  {
    title: 'Prácticas Prohibidas (Art. 5)',
    fields: ['p2_1', 'p2_2', 'p2_3', 'p2_3a', 'p2_4', 'p2_5', 'p2_6'],
  },
  {
    title: 'Sistemas de Alto Riesgo (Art. 6 y Anexo III)',
    fields: ['p3_1', 'p3_2', 'p3_3', 'p3_3a', 'p3_4', 'p3_5', 'p3_6', 'p3_7', 'p3_8', 'p3_9'],
  },
  {
    title: 'Obligaciones de Transparencia (Art. 50)',
    fields: ['p4_1', 'p4_2', 'p4_3', 'p4_4'],
  },
];

export function AIActChecklistTab({ classificationData }: AIActChecklistTabProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!classificationData || Object.keys(classificationData).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">Sin datos de clasificación</p>
            <p className="text-sm mt-2">
              Este sistema de IA aún no ha completado el cuestionario de clasificación AI Act.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderValue = (field: string, value: any): React.ReactNode => {
    if (field === 'systemType') {
      return (
        <Badge variant="secondary" className="text-sm">
          {systemTypeLabels[value] || value}
        </Badge>
      );
    }

    if (value === 'yes') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Sí</span>
        </div>
      );
    }

    if (value === 'no') {
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">No</span>
        </div>
      );
    }

    return <span className="text-gray-700">{String(value)}</span>;
  };

  const hasAnyDataInCategory = (fields: string[]) => {
    return fields.some(field => classificationData[field] !== undefined);
  };

  return (
    <div className="space-y-4">
      {questionCategories.map((category) => {
        if (!hasAnyDataInCategory(category.fields)) {
          return null;
        }

        return (
          <Card key={category.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.fields.map((field) => {
                  const value = classificationData[field];
                  if (value === undefined) return null;

                  return (
                    <div
                      key={field}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 flex-1 pr-4">
                        {fieldLabels[field] || field}
                      </span>
                      <div className="flex-shrink-0">
                        {renderValue(field, value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Show any additional fields not in categories */}
      {Object.entries(classificationData)
        .filter(([key]) => !Object.values(questionCategories).flatMap(c => c.fields).includes(key))
        .length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Otros Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(classificationData)
                .filter(([key]) => !Object.values(questionCategories).flatMap(c => c.fields).includes(key))
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-700 flex-1 pr-4">
                      {fieldLabels[key] || key}
                    </span>
                    <div className="flex-shrink-0">
                      {renderValue(key, value)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
