'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Sparkles, CheckCircle2, AlertTriangle, AlertCircle, Shield, Clock } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClassificationResult {
  level: 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk';
  confidence: 'high' | 'medium' | 'low';
  articles: string[];
  obligations: string[];
}

interface AIClassificationAssistantProps {
  systemName?: string;
  systemDescription?: string;
  initialQuestions?: string[];
  onClassificationSuggested?: (result: ClassificationResult) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  prohibited: { label: 'Prohibido', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertCircle },
  high_risk: { label: 'Alto Riesgo', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle },
  limited_risk: { label: 'Riesgo Limitado', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Shield },
  minimal_risk: { label: 'Riesgo Mínimo', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Confianza alta',
  medium: 'Confianza media',
  low: 'Confianza baja',
};

const STARTER_PROMPTS = [
  'Tenemos un chatbot de atención al cliente que responde preguntas frecuentes.',
  'Usamos IA para filtrar CVs y preseleccionar candidatos en nuestros procesos de selección.',
  'Tenemos un sistema que analiza el riesgo crediticio de clientes para aprobar préstamos.',
  'Usamos un modelo de lenguaje para generar contenido de marketing personalizado.',
];

function parseClassification(text: string): ClassificationResult | null {
  const match = text.match(/<classification>([\s\S]*?)<\/classification>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

function renderMessageContent(content: string): { text: string; classification: ClassificationResult | null } {
  const classification = parseClassification(content);
  const text = content.replace(/<classification>[\s\S]*?<\/classification>/, '').trim();
  return { text, classification };
}

// ── Component ────────────────────────────────────────────────────────────────

export function AIClassificationAssistant({
  systemName,
  systemDescription,
  initialQuestions,
  onClassificationSuggested,
}: AIClassificationAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start with initial questions from AI autofill unclear fields
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0 && !started) {
      setStarted(true);
      const questionsText = initialQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      setMessages([{
        role: 'assistant',
        content: `Para completar la clasificación de "${systemName ?? 'tu sistema'}", necesito que me aclares lo siguiente:\n\n${questionsText}\n\nResponde a estas preguntas y podré completar el cuestionario automáticamente.`,
      }]);
    }
  }, [initialQuestions, started, systemName]);

  function buildInitialPrompt() {
    if (systemName || systemDescription) {
      const parts: string[] = [];
      if (systemName) parts.push(`Nombre del sistema: ${systemName}`);
      if (systemDescription) parts.push(`Descripción: ${systemDescription}`);
      return parts.join('\n') + '\n\n¿Cómo lo clasificarías según el AI Act?';
    }
    return '';
  }

  async function sendMessage(userContent: string) {
    if (!userContent.trim() || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userContent }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const res = await fetch('/api/v1/classify/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('Error al contactar con el asistente');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }

      // Notify parent if classification was produced
      const classification = parseClassification(accumulated);
      if (classification && onClassificationSuggested) {
        onClassificationSuggested(classification);
      }
    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error. Por favor inténtalo de nuevo.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function handleStart() {
    setStarted(true);
    const initial = buildInitialPrompt();
    if (initial) {
      sendMessage(initial);
    } else {
      setMessages([{
        role: 'assistant',
        content: 'Hola, soy tu asistente de clasificación AI Act. Descríbeme el sistema de IA que quieres clasificar: ¿para qué sirve, qué datos procesa y en qué contexto se usa?',
      }]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!started) {
    return (
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/40">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Sparkles className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Clasificar con IA</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Describe tu sistema en lenguaje natural y Claude te ayudará a clasificarlo según el AI Act con justificación legal.
          </p>

          {!systemName && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 text-left max-w-lg mx-auto">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setStarted(true); sendMessage(prompt); }}
                  className="text-xs text-left p-3 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            {systemName ? `Clasificar "${systemName}" con IA` : 'Iniciar asistente de clasificación'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Messages */}
      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end gap-2">
                <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
                  {msg.content}
                </div>
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            );
          }

          const { text, classification } = renderMessageContent(msg.content);
          const cfg = classification ? LEVEL_CONFIG[classification.level] : null;
          const LevelIcon = cfg?.icon ?? Clock;

          return (
            <div key={i} className="flex gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-3">
                {text && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
                    {text}
                    {isStreaming && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-gray-400 animate-pulse rounded-sm" />
                    )}
                  </div>
                )}

                {classification && cfg && (
                  <div className={`rounded-xl border-2 p-4 ${cfg.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <LevelIcon className={`w-5 h-5 ${cfg.color}`} />
                      <span className={`font-semibold text-sm ${cfg.color}`}>
                        Clasificación: {cfg.label}
                      </span>
                      <Badge variant="outline" className={`ml-auto text-xs ${cfg.color} border-current`}>
                        {CONFIDENCE_LABELS[classification.confidence]}
                      </Badge>
                    </div>

                    {classification.articles.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Referencias legales</p>
                        <div className="flex flex-wrap gap-1.5">
                          {classification.articles.map((art, j) => (
                            <span key={j} className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-700">
                              {art}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {classification.obligations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Obligaciones principales</p>
                        <ul className="space-y-1">
                          {classification.obligations.map((ob, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-gray-700">
                              <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                              {ob}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {onClassificationSuggested && (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => onClassificationSuggested(classification)}
                      >
                        Aplicar esta clasificación
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta o proporciona más información..."
          className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm"
          disabled={isStreaming}
          rows={1}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          size="icon"
          className="h-11 w-11 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Enter para enviar · Shift+Enter para nueva línea
      </p>
    </div>
  );
}
