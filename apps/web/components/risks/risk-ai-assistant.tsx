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
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  reason: string;
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
  onApply: (applicable: ProposedRisk[]) => void;
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

function MessageContent({ content }: { content: string }) {
  // Hide the raw JSON block from the chat
  const display = content.replace(/<risk_analysis>[\s\S]*?<\/risk_analysis>/, '').trim();
  if (!display) return null;
  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">{display}</p>
  );
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
  const [showAll, setShowAll] = useState(false);
  const [applying, setApplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      setInput('');
      setShowAll(false);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function startAnalysis(conversationMessages: Message[]) {
    setIsStreaming(true);
    const assistantMsgIndex = conversationMessages.length;
    const newMessages: Message[] = [...conversationMessages, { role: 'assistant', content: '', isStreaming: true }];
    setMessages(newMessages);

    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages }),
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

      // Mark as done streaming
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantMsgIndex] = { role: 'assistant', content: fullText, isStreaming: false };
        return updated;
      });

      // Check for completed analysis
      const result = parseRiskAnalysis(fullText);
      if (result) {
        setAnalysis(result);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo conectar con el asistente', variant: 'destructive' });
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
    if (!analysis?.applicable.length) return;
    setApplying(true);
    try {
      // Create risks: first create all as "identified" with applicable=true
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalog_risk_ids: analysis.applicable.map(r => r.catalog_risk_id),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al aplicar riesgos');
      }

      onApply(analysis.applicable);
      onOpenChange(false);
      toast({
        title: 'Análisis aplicado',
        description: `Se han añadido ${analysis.applicable.length} factores de riesgo al sistema.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo aplicar el análisis',
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  }

  const displayedApplicable = showAll ? analysis?.applicable : analysis?.applicable.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E8ECEB]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F5DFB3]/60 rounded-lg">
              <Sparkles className="w-4 h-4 text-[#E09E50]" />
            </div>
            <DialogTitle className="text-[#2D3E4E]">Asistente de Análisis de Riesgos IA</DialogTitle>
          </div>
          <DialogDescription className="text-[#7a8a92]">
            Analizando <span className="font-medium text-[#2D3E4E]">{systemName}</span> para identificar factores de riesgo AI Act aplicables
          </DialogDescription>
        </DialogHeader>

        {/* Chat area */}
        <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef as any}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.role === 'assistant' ? 'bg-[#F5DFB3]/60' : 'bg-[#E8ECEB]'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-3.5 h-3.5 text-[#E09E50]" />
                    : <User className="w-3.5 h-3.5 text-[#7a8a92]" />
                  }
                </div>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  msg.role === 'assistant'
                    ? 'bg-[#F8FAFB] border border-[#E8ECEB] text-[#2D3E4E]'
                    : 'bg-[#2D3E4E] text-white ml-auto'
                }`}>
                  {msg.content ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E09E50]" />
                      <span className="text-xs text-[#7a8a92]">Analizando...</span>
                    </div>
                  )}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-0.5 h-3.5 bg-[#E09E50] animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Analysis results */}
        {analysis && (
          <div className="px-6 py-4 border-t border-[#E8ECEB] bg-white space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-[#2D3E4E]">
                  Análisis completado · {analysis.applicable.length} riesgos aplicables
                </span>
              </div>
              {analysis.not_applicable.length > 0 && (
                <span className="text-xs text-[#7a8a92]">
                  {analysis.not_applicable.length} descartados
                </span>
              )}
            </div>

            <div className="space-y-2">
              {displayedApplicable?.map((risk, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-green-50 border border-green-100">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-[#2D3E4E] truncate">{risk.risk_name}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${PROB_COLORS[risk.probability] ?? 'bg-gray-100 text-gray-600'}`}>
                        P: {risk.probability}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 ${PROB_COLORS[risk.impact] ?? 'bg-gray-100 text-gray-600'}`}>
                        I: {risk.impact}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#7a8a92] mt-0.5 line-clamp-2">{risk.reason}</p>
                  </div>
                </div>
              ))}

              {analysis.applicable.length > 5 && (
                <button
                  onClick={() => setShowAll(prev => !prev)}
                  className="w-full text-xs text-[#E09E50] hover:underline flex items-center justify-center gap-1 py-1"
                >
                  {showAll ? (
                    <><ChevronUp className="w-3 h-3" /> Mostrar menos</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Ver {analysis.applicable.length - 5} más</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-6 py-4 border-t border-[#E8ECEB] bg-white space-y-3">
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
                className="self-end bg-[#E09E50] hover:bg-[#D9885F]"
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
                  className="text-[#7a8a92]"
                >
                  Reiniciar análisis
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applying || !analysis.applicable.length}
                  className="bg-[#E09E50] hover:bg-[#D9885F] text-white"
                  size="sm"
                >
                  {applying ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Aplicando...</>
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Aplicar {analysis.applicable.length} factores</>
                  )}
                </Button>
              </>
            ) : (
              <p className="text-xs text-[#7a8a92] flex items-center gap-1">
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
