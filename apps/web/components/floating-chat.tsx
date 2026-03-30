'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, X, MessageSquare, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  '¿Cuántos sistemas de alto riesgo tenemos?',
  '¿Cuál es nuestro estado de cumplimiento?',
  '¿Qué obligaciones están pendientes?',
  '¿Qué riesgos están sin mitigar?',
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  async function sendMessage(userContent: string) {
    if (!userContent.trim() || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userContent }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/v1/chat', {
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
    } catch {
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-scale">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">Asistente CumplIA</span>
            </div>
            <Badge variant="outline" className="text-white/80 border-white/30 text-[10px]">
              AI Act
            </Badge>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[360px]">
            {messages.length === 0 ? (
              <div className="text-center py-4">
                <div className="p-3 bg-blue-50 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pregúntame sobre tus sistemas de IA, riesgos, obligaciones o cumplimiento.
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs text-left p-2.5 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200 transition-colors text-gray-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                    {isStreaming && msg.role === 'assistant' && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-gray-400 animate-pulse rounded-sm" />
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                      <User className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre tu organización..."
                className="flex-1 min-h-[40px] max-h-[80px] resize-none text-sm"
                disabled={isStreaming}
                rows={1}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                size="icon"
                className="h-10 w-10 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
