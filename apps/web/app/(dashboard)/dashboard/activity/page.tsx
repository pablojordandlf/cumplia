'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  History,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Shield,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  Inbox,
  User,
} from 'lucide-react';

interface AuditEntry {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_name: string | null;
  details: Record<string, any>;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  create: { label: 'Creó', icon: Plus, color: 'text-green-600 bg-green-50' },
  update: { label: 'Actualizó', icon: Pencil, color: 'text-blue-600 bg-blue-50' },
  delete: { label: 'Eliminó', icon: Trash2, color: 'text-red-600 bg-red-50' },
  invite: { label: 'Invitó a', icon: UserPlus, color: 'text-purple-600 bg-purple-50' },
  classify: { label: 'Clasificó', icon: Shield, color: 'text-orange-600 bg-orange-50' },
  complete_obligation: { label: 'Completó obligación en', icon: CheckSquare, color: 'text-green-600 bg-green-50' },
  assign_risk: { label: 'Asignó riesgo en', icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
};

const ENTITY_LABELS: Record<string, string> = {
  ai_system: 'sistema de IA',
  risk: 'riesgo',
  obligation: 'obligación',
  member: 'miembro',
  invitation: 'invitación',
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'ahora mismo';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/v1/audit?limit=100');
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries ?? []);
    }
    setLoading(false);
  }

  const filtered = filter
    ? entries.filter(e => e.entity_type === filter || e.action === filter)
    : entries;

  const entityTypes = [...new Set(entries.map(e => e.entity_type))];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <History className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registro de actividad</h1>
            <p className="text-sm text-gray-500">Historial de cambios en tu organización</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      {entityTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${!filter ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            Todo
          </button>
          {entityTypes.map(et => (
            <button
              key={et}
              onClick={() => setFilter(et)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${filter === et ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {ENTITY_LABELS[et] ?? et}
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Sin actividad registrada</p>
          <p className="text-xs text-gray-400 mt-1">
            Los cambios en sistemas, riesgos y obligaciones aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((entry, i) => {
            const actionCfg = ACTION_CONFIG[entry.action] ?? { label: entry.action, icon: Pencil, color: 'text-gray-600 bg-gray-50' };
            const ActionIcon = actionCfg.icon;

            return (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${actionCfg.color}`}>
                  <ActionIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium text-gray-900">
                      {entry.user_email?.split('@')[0] ?? 'Usuario'}
                    </span>
                    {' '}
                    <span className="text-gray-600">{actionCfg.label}</span>
                    {entry.entity_name && (
                      <span className="font-medium text-gray-900"> "{entry.entity_name}"</span>
                    )}
                    {!entry.entity_name && entry.entity_type && (
                      <span className="text-gray-500"> {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}</span>
                    )}
                  </p>
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400 mt-0.5">
                  {formatRelativeTime(entry.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
