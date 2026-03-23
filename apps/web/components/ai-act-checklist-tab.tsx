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
  isSubliminal: '¿Utiliza técnicas subliminales?',
  isSocialScoring: '¿Realiza puntuación social?',
  isRealTimeBiometric: '¿Usa biometría en tiempo real en espacios públicos?',
  exploitsVulnerabilities: '¿Aprovecha vulnerabilidades de grupos vulnerables?',
  isBiometricIdentification: '¿Es sistema de identificación biométrica?',
  isCriticalInfrastructure: '¿Opera en infraestructura crítica?',
  isEducationVocational: '¿Usado en educación o formación profesional?',
  isEmployment: '¿Usado en gestión de empleo o trabajo?',
  isAccessToServices: '¿Gestiona acceso a servicios esenciales?',
  isLawEnforcement: '¿Usado por fuerzas del orden?',
  isMigrationAsylum: '¿Usado en migración o asilo?',
  isJusticeDemocratic: '¿Administra justicia o procesos democráticos?',
  isSafetyComponent: '¿Es componente de seguridad de producto?',
  interactsWithHumans: '¿Interactúa con humanos?',
  isEmotionRecognition: '¿Reconoce emociones?',
  isBiometricCategorization: '¿Categoriza personas por características biométricas?',
  generatesDeepfakes: '¿Genera deepfakes?',
};

// System type labels
const systemTypeLabels: Record<string, string> = {
  gpai_model: 'Modelo de IA de Propósito General (GPAI Model)',
  gpai_sr: 'Modelo GPAI con Riesgo Sistémico (GPAI-SR)',
  gpai_system: 'Sistema de IA de Propósito General (GPAI System)',
  specific_purpose: 'Sistema de IA de Finalidad Específica',
};

// Category groupings for better organization
const questionCategories = [
  {
    title: 'Tipo de Sistema',
    fields: ['systemType'],
  },
  {
    title: 'Prácticas Prohibidas (Art. 5)',
    fields: ['isSubliminal', 'isSocialScoring', 'isRealTimeBiometric', 'exploitsVulnerabilities'],
  },
  {
    title: 'Sistemas de Alto Riesgo (Anexo III)',
    fields: ['isBiometricIdentification', 'isCriticalInfrastructure', 'isEducationVocational', 'isEmployment', 'isAccessToServices', 'isLawEnforcement', 'isMigrationAsylum', 'isJusticeDemocratic', 'isSafetyComponent'],
  },
  {
    title: 'Riesgo Limitado (Art. 50)',
    fields: ['interactsWithHumans', 'isEmotionRecognition', 'isBiometricCategorization', 'generatesDeepfakes'],
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
