'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  X,
  ChevronRight,
  CheckCircle2,
  Circle,
  Layers,
  Shield,
  ClipboardList,
  Users,
  FileDown,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  check: () => Promise<boolean>;
}

const STORAGE_KEY = 'cumplia_onboarding_dismissed';

const STEPS: OnboardingStep[] = [
  {
    id: 'add_system',
    title: 'Añade tu primer sistema de IA',
    description: 'Registra los sistemas de IA que usa tu organización.',
    href: '/dashboard/inventory/new',
    icon: Layers,
    check: async () => {
      const { count } = await supabase
        .from('use_cases')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null);
      return (count ?? 0) > 0;
    },
  },
  {
    id: 'classify',
    title: 'Clasifícalo según el AI Act',
    description: 'Completa el cuestionario de clasificación para conocer tu nivel de riesgo.',
    href: '/dashboard/inventory',
    icon: Shield,
    check: async () => {
      const { count } = await supabase
        .from('use_cases')
        .select('id', { count: 'exact', head: true })
        .not('ai_act_level', 'is', null)
        .neq('ai_act_level', 'unclassified')
        .is('deleted_at', null);
      return (count ?? 0) > 0;
    },
  },
  {
    id: 'obligations',
    title: 'Revisa tus obligaciones',
    description: 'Marca las obligaciones completadas para cada sistema.',
    href: '/dashboard/inventory',
    icon: ClipboardList,
    check: async () => {
      const { count } = await supabase
        .from('use_case_obligations')
        .select('id', { count: 'exact', head: true })
        .eq('is_completed', true);
      return (count ?? 0) > 0;
    },
  },
  {
    id: 'assign',
    title: 'Asigna responsables a riesgos',
    description: 'Delega la gestión de riesgos a miembros de tu equipo.',
    href: '/dashboard/inventory',
    icon: Users,
    check: async () => {
      const { count } = await supabase
        .from('use_case_risks')
        .select('id', { count: 'exact', head: true })
        .not('responsible_person', 'is', null);
      return (count ?? 0) > 0;
    },
  },
  {
    id: 'report',
    title: 'Descarga tu informe de cumplimiento',
    description: 'Genera el informe PDF de cumplimiento para un sistema clasificado.',
    href: '/dashboard/inventory',
    icon: FileDown,
    check: async () => false, // Manual step — user dismisses when done
  },
];

export function OnboardingWizard() {
  const [stepStatus, setStepStatus] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setDismissed(isDismissed);
    if (!isDismissed) {
      checkSteps();
    }
    setLoaded(true);
  }, []);

  async function checkSteps() {
    const results: Record<string, boolean> = {};
    await Promise.all(
      STEPS.map(async (step) => {
        results[step.id] = await step.check();
      })
    );
    setStepStatus(results);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  }

  if (!loaded || dismissed) return null;

  const completedCount = STEPS.filter(s => stepStatus[s.id]).length;
  const progress = Math.round((completedCount / STEPS.length) * 100);
  const allDone = completedCount === STEPS.length;

  return (
    <div className="mx-6 mb-6">
      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Primeros pasos con CumplIA</h3>
              <p className="text-xs text-gray-500">{completedCount} de {STEPS.length} pasos completados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">{progress}%</span>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-lg hover:bg-blue-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1.5 rounded-none" />

        {/* Steps */}
        <div className="p-4">
          {allDone ? (
            <div className="flex items-center gap-3 py-2 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">¡Configuración completada!</p>
                <p className="text-xs text-gray-500">Ya tienes todo listo para gestionar tu cumplimiento del AI Act.</p>
              </div>
              <Button size="sm" variant="outline" onClick={dismiss} className="ml-auto">
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const done = stepStatus[step.id] ?? false;
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      done ? 'opacity-50' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      done ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {done
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {step.title}
                      </p>
                      {!done && (
                        <p className="text-xs text-gray-500 truncate">{step.description}</p>
                      )}
                    </div>
                    {!done && (
                      <Link href={step.href}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 flex-shrink-0">
                          Ir
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
