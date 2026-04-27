'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  RiaFormTemplate,
  RiaFormStep,
  RiaFormSection,
  RiaFormQuestion,
  RiaFormStructure,
} from '@/types/ria-form-template';

interface Props {
  template: RiaFormTemplate;
  onSave: (structure: RiaFormStructure) => Promise<void>;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function RiaTemplateEditor({ template, onSave }: Props) {
  const [structure, setStructure] = useState<RiaFormStructure>(template.structure);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'section' | 'question';
    stepId: string;
    sectionId: string;
    questionId?: string;
  } | null>(null);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const updateStepTitle = useCallback((stepId: string, title: string) => {
    setStructure((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === stepId ? { ...s, title } : s)),
    }));
  }, []);

  const updateSectionTitle = useCallback((stepId: string, sectionId: string, title: string) => {
    setStructure((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id !== stepId
          ? s
          : {
              ...s,
              sections: s.sections?.map((sec) =>
                sec.id === sectionId ? { ...sec, title } : sec
              ),
            }
      ),
    }));
  }, []);

  const updateQuestion = useCallback(
    (stepId: string, sectionId: string, questionId: string, patch: Partial<RiaFormQuestion>) => {
      setStructure((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.id !== stepId
            ? s
            : {
                ...s,
                sections: s.sections?.map((sec) =>
                  sec.id !== sectionId
                    ? sec
                    : {
                        ...sec,
                        questions: sec.questions.map((q) =>
                          q.id === questionId ? { ...q, ...patch } : q
                        ),
                      }
                ),
              }
        ),
      }));
    },
    []
  );

  const addSection = useCallback((stepId: string) => {
    const newSection: RiaFormSection = {
      id: generateId('section'),
      title: 'Nueva sección',
      questions: [],
    };
    setStructure((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id !== stepId
          ? s
          : { ...s, sections: [...(s.sections ?? []), newSection] }
      ),
    }));
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  }, []);

  const addQuestion = useCallback((stepId: string, sectionId: string) => {
    const newQuestion: RiaFormQuestion = {
      id: generateId('q'),
      key: `custom_${Date.now()}`,
      label: 'Nueva pregunta',
      tooltip: '',
      affects_classification: false,
      parent_question_id: null,
      parent_answer_trigger: null,
    };
    setStructure((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id !== stepId
          ? s
          : {
              ...s,
              sections: s.sections?.map((sec) =>
                sec.id !== sectionId
                  ? sec
                  : { ...sec, questions: [...sec.questions, newQuestion] }
              ),
            }
      ),
    }));
  }, []);

  const deleteSection = useCallback((stepId: string, sectionId: string) => {
    setStructure((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id !== stepId
          ? s
          : { ...s, sections: s.sections?.filter((sec) => sec.id !== sectionId) }
      ),
    }));
  }, []);

  const deleteQuestion = useCallback((stepId: string, sectionId: string, questionId: string) => {
    setStructure((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id !== stepId
          ? s
          : {
              ...s,
              sections: s.sections?.map((sec) =>
                sec.id !== sectionId
                  ? sec
                  : { ...sec, questions: sec.questions.filter((q) => q.id !== questionId) }
              ),
            }
      ),
    }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(structure);
      toast.success('Plantilla guardada', { description: 'Los cambios se han guardado correctamente.' });
    } catch {
      toast.error('Error al guardar', { description: 'No se pudieron guardar los cambios.' });
    } finally {
      setIsSaving(false);
    }
  };

  const editableSteps = structure.steps.filter((s) => s.type === 'questions');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Edita las secciones y preguntas de esta plantilla.
        </p>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar cambios
        </Button>
      </div>

      <div className="space-y-3">
        {editableSteps.map((step) => {
          const isExpanded = expandedSteps.has(step.id);
          return (
            <Card key={step.id}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 rounded-t-lg py-3"
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {step.sections?.length ?? 0} secciones
                  </Badge>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Título del paso</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStepTitle(step.id, e.target.value)}
                      className="h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {step.sections?.map((section) => (
                    <SectionEditor
                      key={section.id}
                      step={step}
                      section={section}
                      expanded={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      onUpdateTitle={(title) => updateSectionTitle(step.id, section.id, title)}
                      onUpdateQuestion={(qId, patch) => updateQuestion(step.id, section.id, qId, patch)}
                      onAddQuestion={() => addQuestion(step.id, section.id)}
                      onDeleteSection={() =>
                        setDeleteTarget({ type: 'section', stepId: step.id, sectionId: section.id })
                      }
                      onDeleteQuestion={(qId) =>
                        setDeleteTarget({
                          type: 'question',
                          stepId: step.id,
                          sectionId: section.id,
                          questionId: qId,
                        })
                      }
                    />
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={() => addSection(step.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir sección
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === 'section' ? '¿Eliminar sección?' : '¿Eliminar pregunta?'}
            </AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!deleteTarget) return;
                if (deleteTarget.type === 'section') {
                  deleteSection(deleteTarget.stepId, deleteTarget.sectionId);
                } else if (deleteTarget.questionId) {
                  deleteQuestion(deleteTarget.stepId, deleteTarget.sectionId, deleteTarget.questionId);
                }
                setDeleteTarget(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface SectionEditorProps {
  step: RiaFormStep;
  section: RiaFormSection;
  expanded: boolean;
  onToggle: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateQuestion: (qId: string, patch: Partial<RiaFormQuestion>) => void;
  onAddQuestion: () => void;
  onDeleteSection: () => void;
  onDeleteQuestion: (qId: string) => void;
}

function SectionEditor({
  section,
  expanded,
  onToggle,
  onUpdateTitle,
  onUpdateQuestion,
  onAddQuestion,
  onDeleteSection,
  onDeleteQuestion,
}: SectionEditorProps) {
  return (
    <div className="border rounded-md">
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-t-md"
        onClick={onToggle}
      >
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
        )}
        <span className="text-sm font-medium flex-1 truncate">{section.title}</span>
        <Badge variant="secondary" className="text-xs shrink-0">
          {section.questions.length} preguntas
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSection();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Nombre de la sección</Label>
            <Input
              value={section.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {section.questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              onUpdate={(patch) => onUpdateQuestion(question.id, patch)}
              onDelete={() => onDeleteQuestion(question.id)}
            />
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs border border-dashed h-7"
            onClick={onAddQuestion}
          >
            <Plus className="w-3 h-3 mr-1" />
            Añadir pregunta
          </Button>
        </div>
      )}
    </div>
  );
}

interface QuestionEditorProps {
  question: RiaFormQuestion;
  onUpdate: (patch: Partial<RiaFormQuestion>) => void;
  onDelete: () => void;
}

function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded bg-gray-50">
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded((v) => !v)}
      >
        <GripVertical className="w-3 h-3 text-gray-300 shrink-0" />
        <span className="text-xs flex-1 truncate">{question.label}</span>
        {question.affects_classification && (
          <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 shrink-0">
            clasificación
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t space-y-3 pt-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Texto de la pregunta</Label>
            <Textarea
              value={question.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Tooltip / ayuda</Label>
            <Textarea
              value={question.tooltip ?? ''}
              onChange={(e) => onUpdate({ tooltip: e.target.value })}
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Clave de campo</Label>
            <Input
              value={question.key}
              onChange={(e) => onUpdate({ key: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`affects-${question.id}`}
              checked={question.affects_classification}
              onCheckedChange={(checked) => onUpdate({ affects_classification: checked })}
            />
            <Label htmlFor={`affects-${question.id}`} className="text-xs">
              Afecta a la clasificación de riesgo
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
