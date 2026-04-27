'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle2, Sparkles, Brain, Cpu, Bot } from 'lucide-react';
import type {
  RiaFormTemplate,
  RiaFormStep,
  RiaFormQuestion,
  RiaFormAnswers,
  SystemTypeValue,
} from '@/types/ria-form-template';

// ── InfoTooltip ───────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 150 && window.innerHeight - rect.bottom > 150) setPosition('bottom');
      else setPosition('top');
    }
  }, [show]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center ml-2"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
      {show && (
        <div
          className={`absolute ${position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} left-1/2 -translate-x-1/2 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl z-[9999] w-80 leading-relaxed pointer-events-none`}
        >
          {text}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent ${position === 'top' ? 'top-full border-t-8 border-t-gray-900' : 'bottom-full border-b-8 border-b-gray-900'}`}
          />
        </div>
      )}
    </div>
  );
}

// ── SectionDivider ────────────────────────────────────────────────────────────

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

// ── YesNoQuestion ─────────────────────────────────────────────────────────────

function YesNoQuestion({
  question,
  value,
  onChange,
  isAiFilling,
  aiFilled,
}: {
  question: RiaFormQuestion;
  value: string;
  onChange: (key: string, val: 'yes' | 'no') => void;
  isAiFilling?: boolean;
  aiFilled?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer ${
        aiFilled
          ? 'border-blue-300 bg-blue-50/50'
          : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
      }`}
      onClick={() => onChange(question.key, value === 'yes' ? 'no' : 'yes')}
    >
      {isAiFilling && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="h-full bg-gradient-to-r from-blue-100/0 via-blue-200/60 to-blue-100/0 animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      )}
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-medium text-gray-900 text-sm">{question.label}</span>
          {question.tooltip && <InfoTooltip text={question.tooltip} />}
        </div>
        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onChange(question.key, 'yes')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              value === 'yes'
                ? 'bg-green-500 text-white shadow-md ring-2 ring-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => onChange(question.key, 'no')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              value === 'no'
                ? 'bg-gray-500 text-white shadow-md ring-2 ring-gray-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>
      {aiFilled && (
        <div className="flex items-center gap-1 mt-2 relative z-10">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-blue-600 font-medium">Completado por IA</span>
        </div>
      )}
    </div>
  );
}

// ── System type icons ─────────────────────────────────────────────────────────

const SYSTEM_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  gpai: Brain,
  gpai_base: Brain,
  gpai_systemic: Brain,
  non_gpai_standalone: Cpu,
  specific: Cpu,
  non_gpai_embedded: Bot,
  multipurpose: Bot,
  unsure: HelpCircle,
};

// ── SystemTypeStep ────────────────────────────────────────────────────────────

function SystemTypeStep({
  step,
  answers,
  onChange,
}: {
  step: RiaFormStep;
  answers: RiaFormAnswers;
  onChange: (key: string, value: string) => void;
}) {
  const current = answers['systemType'] ?? '';

  return (
    <div className="space-y-3">
      {(step.options ?? []).map((option) => {
        const Icon = SYSTEM_TYPE_ICONS[option.value] ?? Cpu;
        const isSelected = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange('systemType', option.value)}
            className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left w-full transition-all hover:shadow-md ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-base">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-gray-600">{option.description}</span>
                )}
              </div>
            </div>
            {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ── QuestionsStep ─────────────────────────────────────────────────────────────

function QuestionsStep({
  step,
  answers,
  onChange,
  aiFilledFields,
  isAiFilling,
}: {
  step: RiaFormStep;
  answers: RiaFormAnswers;
  onChange: (key: string, value: string) => void;
  aiFilledFields: Set<string>;
  isAiFilling: boolean;
}) {
  return (
    <div className="space-y-6">
      {(step.sections ?? []).map((section) => {
        const visibleQuestions = section.questions.filter((q) => {
          if (!q.parent_question_id) return true;
          return answers[q.parent_question_id] === q.parent_answer_trigger;
        });

        if (visibleQuestions.length === 0) return null;

        return (
          <div key={section.id} className="space-y-3">
            <SectionDivider title={section.title} />
            {visibleQuestions.map((question) => (
              <YesNoQuestion
                key={question.id}
                question={question}
                value={answers[question.key] ?? 'no'}
                onChange={onChange}
                isAiFilling={isAiFilling}
                aiFilled={aiFilledFields.has(question.key)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── RiaFormRenderer ───────────────────────────────────────────────────────────

interface Props {
  template: RiaFormTemplate;
  answers: RiaFormAnswers;
  currentStep: number;
  aiFilledFields: Set<string>;
  isAiFilling: boolean;
  onChange: (key: string, value: string) => void;
}

export function RiaFormRenderer({
  template,
  answers,
  currentStep,
  aiFilledFields,
  isAiFilling,
  onChange,
}: Props) {
  const systemTypeValue = answers['systemType'] as SystemTypeValue | undefined;
  const isGpai = systemTypeValue === 'gpai';

  const steps = template.structure.steps.filter((step) => {
    if (!step.applies_to || step.applies_to === 'all') return true;
    if (step.applies_to === 'non_gpai') return !isGpai;
    if (step.applies_to === 'gpai') return isGpai;
    return true;
  });

  const step = steps[currentStep - 1];
  if (!step) return null;

  if (step.type === 'system_type') {
    return <SystemTypeStep step={step} answers={answers} onChange={onChange} />;
  }

  return (
    <QuestionsStep
      step={step}
      answers={answers}
      onChange={onChange}
      aiFilledFields={aiFilledFields}
      isAiFilling={isAiFilling}
    />
  );
}

export function getRiaStepCount(template: RiaFormTemplate, answers: RiaFormAnswers): number {
  const systemTypeValue = answers['systemType'] as SystemTypeValue | undefined;
  const isGpai = systemTypeValue === 'gpai';

  return template.structure.steps.filter((step) => {
    if (!step.applies_to || step.applies_to === 'all') return true;
    if (step.applies_to === 'non_gpai') return !isGpai;
    if (step.applies_to === 'gpai') return isGpai;
    return true;
  }).length;
}

export function getRiaStepTitle(
  template: RiaFormTemplate,
  answers: RiaFormAnswers,
  stepIndex: number
): string {
  const systemTypeValue = answers['systemType'] as SystemTypeValue | undefined;
  const isGpai = systemTypeValue === 'gpai';

  const steps = template.structure.steps.filter((step) => {
    if (!step.applies_to || step.applies_to === 'all') return true;
    if (step.applies_to === 'non_gpai') return !isGpai;
    if (step.applies_to === 'gpai') return isGpai;
    return true;
  });

  return steps[stepIndex - 1]?.title ?? '';
}
