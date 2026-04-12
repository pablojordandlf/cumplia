'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Bot,
  User,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner'

interface ProposedRisk {
  catalog_risk_id: string;
  risk_name: string;
  reason: string;
  probability: string;
  impact: string;
  notes?: string;
}

interface NotApplicableRisk {
  catalog_risk_id: string;
  risk_name: string;
  reason: string;
}

interface DisplayRisk {
  catalog_risk_id: string;
  risk_name: string;
  reason: string;
  probability?: string;
  impact?: string;
  notes?: string;
  aiRecommendation: 'applicable' | 'not_applicable';
}

interface RiskAnalysisResult {
  complete: boolean;
  applicable: ProposedRisk[];
  not_applicable: NotApplicableRisk[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface RiskAIAssistantProps {
  aiSystemId: string;
  systemName: string;
  aiActLevel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
}

const PROB_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function parseRiskAnalysis(text: string): RiskAnalysisResult | null {
  const match = text.match(/<risk_analysis>([\s\S]*?)<\/risk_analysis>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed.complete && Array.isArray(parsed.applicable)) {
      return parsed as RiskAnalysisResult;
    }
  } catch {
    return null;
  }
  return null;
}

// Strip the raw JSON block and return only the human-readable part
function MessageContent({ content }: { content: string }) {
  const display = content.replace(/<risk_analysis>[\s\S]*?(<\/risk_analysis>|$)/, '').trim();
  if (!display) return null;
  return <p className="text-sm whitespace-pre-wrap leading-relaxed">{display}</p>;
}

export function RiskAIAssistant({
  aiSystemId,
  systemName,
  aiActLevel,
  open,
  onOpenChange,
  onApply,
}: RiskAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [analysis, setAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [selectedRiskIds, setSelectedRiskIds] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Start analysis when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      startAnalysis([]);
    }
  }, [open]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setAnalysis(null);
      setSelectedRiskIds(new Set());
      setInput('');
    }
  }, [open]);

  // Initialize selected IDs from analysis result
  useEffect(() => {
    if (analysis) {
      setSelectedRiskIds(new Set(analysis.applicable.map(r => r.catalog_risk_id)));
    }
  }, [analysis]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function toggleRisk(riskId: string) {
    setSelectedRiskIds(prev => {
      const next = new Set(prev);
      if (next.has(riskId)) {
        next.delete(riskId);
      } else {
        next.add(riskId);
      }
      return next;
    });
  }

  async function startAnalysis(conversationMessages: Message[]) {
    setIsStreaming(true);
    const assistantMsgIndex = conversationMessages.length;
    setMessages([...conversationMessages, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Error en la respuesta del servidor');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantMsgIndex] = { role: 'assistant', content: fullText, isStreaming: true };
          return updated;
        });
      }

      if (!fullText.trim()) {
        throw new Error('El asistente no devolvió respuesta. Inténtalo de nuevo.');
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[assistantMsgIndex] = { role: 'assistant', content: fullText, isStreaming: false };
        return updated;
      });

      const result = parseRiskAnalysis(fullText);
      if (result) {
        setAnalysis(result);
      }
    } catch {
      toast.error('Error', { description: 'No se pudo conectar con el asistente' });
      setMessages(prev => prev.slice(0, assistantMsgIndex));
    } finally {
      setIsStreaming(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await startAnalysis(updatedMessages);
  }

  async function handleApply() {
    if (!analysis) return;
    setApplying(true);
    try {
      // Build per-risk detail data from the AI's applicable recommendations
      const analysisResults = analysis.applicable.map(r => ({
        catalog_risk_id: r.catalog_risk_id,
        probability: r.probability,
        impact: r.impact,
        notes: r.notes,
      }));

      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send the user's final selection (may differ from AI recommendation)
          applicable_catalog_risk_ids: Array.from(selectedRiskIds),
          analysis_results: analysisResults,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al aplicar riesgos');
      }

      onApply();
      onOpenChange(false);
      toast.success('Análisis aplicado', { description: `${selectedRiskIds.size} factor(es) marcado(s) como aplicables.` });
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'No se pudo aplicar el análisis' });
    } finally {
      setApplying(false);
    }
  }

  function buildAllRisks(result: RiskAnalysisResult): DisplayRisk[] {
    return [
      ...result.applicable.map(r => ({ ...r, aiRecommendation: 'applicable' as const })),
      ...result.not_applicable.map(r => ({
        catalog_risk_id: r.catalog_risk_id,
        risk_name: r.risk_name,
        reason: r.reason,
        aiRecommendation: 'not_applicable' as const,
      })),
    ];
  }

  const allRisks = analysis ? buildAllRisks(analysis) : [];

  // During the final streaming the message may contain the opening <risk_analysis> tag —
  // hide the streaming text in that case and show a "Generando análisis..." spinner instead.
  const isGeneratingFinalAnalysis = isStreaming &&
    messages.some(m => m.isStreaming && m.content.includes('<risk_analysis>'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E3DFD5]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F5DFB3]/60 rounded-lg">
              <Sparkles className="w-4 h-4 text-[#E8FF47]" />
            </div>
            <DialogTitle className="text-[#0B1C3D]">Asistente de Análisis de Riesgos IA</DialogTitle>
          </div>
          <DialogDescription className="text-[#8B9BB4]">
            {analysis
              ? `Análisis completado · ${analysis.applicable.length} aplican · ${analysis.not_applicable.length} no aplican`
              : <>Analizando <span className="font-medium text-[#0B1C3D]">{systemName}</span> para identificar factores de riesgo AI Act</>
            }
          </DialogDescription>
        </DialogHeader>

        {/* Main content area: chat OR results */}
        {analysis ? (
          /* ── Results panel ────────────────────────────────── */
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Summary bar */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E3DFD5]">
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4" />
                {selectedRiskIds.size} aplican
              </div>
              <span className="text-[#E3DFD5]">|</span>
              <div className="flex items-center gap-1.5 text-sm text-[#8B9BB4]">
                <XCircle className="w-4 h-4" />
                {allRisks.length - selectedRiskIds.size} no aplican
              </div>
              <span className="text-xs text-[#8B9BB4] ml-auto italic">
                Puedes ajustar la selección antes de aplicar
              </span>
            </div>

            {/* Risk list */}
            <div className="space-y-2">
              {allRisks.map(risk => {
                const isSelected = selectedRiskIds.has(risk.catalog_risk_id);
                return (
                  <button
                    key={risk.catalog_risk_id}
                    type="button"
                    onClick={() => toggleRisk(risk.catalog_risk_id)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-green-50 border-green-200'
                        : 'bg-[#F8FAFB] border-[#E3DFD5] opacity-55 hover:opacity-80'
                    }`}
                  >
                    {/* Toggle indicator */}
                    <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-green-500' : 'bg-[#D0CFC8]'
                    }`}>
                      {isSelected
                        ? <Check className="w-3 h-3 text-white" />
                        : <X className="w-3 h-3 text-white" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[#0B1C3D]">{risk.risk_name}</span>
                        {/* AI recommendation badge */}
                        {risk.aiRecommendation === 'applicable' ? (
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-0">
                            IA: Aplica
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-500 border-0">
                            IA: No aplica
                          </Badge>
                        )}
                        {/* Probability/impact only for applicable risks */}
                        {risk.probability && (
                          <>
                            <Badge className={`text-[10px] px-1.5 py-0 border-0 ${PROB_COLORS[risk.probability] ?? 'bg-gray-100 text-gray-600'}`}>
                              P: {risk.probability}
                            </Badge>
                            <Badge className={`text-[10px] px-1.5 py-0 border-0 ${PROB_COLORS[risk.impact!] ?? 'bg-gray-100 text-gray-600'}`}>
                              I: {risk.impact}
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8B9BB4] mt-0.5 line-clamp-2">{risk.reason}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Chat area ────────────────────────────────────── */
          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef as any}>
            <div className="space-y-4">
              {isGeneratingFinalAnalysis ? (
                // Final analysis in progress: show spinner instead of raw JSON
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F5DFB3]/60 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-[#E8FF47]" />
                  </div>
                  <div className="bg-[#F8FAFB] border border-[#E3DFD5] rounded-xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E8FF47]" />
                    <span className="text-sm text-[#8B9BB4]">Generando análisis de riesgos...</span>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      msg.role === 'assistant' ? 'bg-[#F5DFB3]/60' : 'bg-[#E3DFD5]'
                    }`}>
                      {msg.role === 'assistant'
                        ? <Bot className="w-3.5 h-3.5 text-[#E8FF47]" />
                        : <User className="w-3.5 h-3.5 text-[#8B9BB4]" />
                      }
                    </div>
                    <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === 'assistant'
                        ? 'bg-[#F8FAFB] border border-[#E3DFD5] text-[#0B1C3D]'
                        : 'bg-[#0B1C3D] text-white ml-auto'
                    }`}>
                      {msg.content ? (
                        <MessageContent content={msg.content} />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8FF47]" />
                          <span className="text-xs text-[#8B9BB4]">Analizando...</span>
                        </div>
                      )}
                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-0.5 h-3.5 bg-[#E8FF47] animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input + action bar */}
        <div className="px-6 py-4 border-t border-[#E3DFD5] bg-white space-y-3">
          {!analysis && (
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Responde las preguntas del asistente o añade información sobre el sistema..."
                className="text-sm resize-none min-h-[60px] max-h-[120px]"
                disabled={isStreaming}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="self-end bg-[#0B1C3D] hover:bg-[#0B1C3D]/85 text-white"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {analysis ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAnalysis(null); setMessages([]); startAnalysis([]); }}
                  className="text-[#8B9BB4]"
                >
                  Reiniciar análisis
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  className="bg-[#0B1C3D] hover:bg-[#0B1C3D]/85 text-white"
                  size="sm"
                >
                  {applying ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Aplicando...</>
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Aplicar ({selectedRiskIds.size} aplican)</>
                  )}
                </Button>
              </>
            ) : (
              <p className="text-xs text-[#8B9BB4] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                El asistente propone factores de riesgo. Revisa y confirma antes de aplicar.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
