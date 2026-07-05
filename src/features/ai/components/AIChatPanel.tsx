import React, { useState } from 'react';
import { Send, Sparkles, MessageCircle, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  insights?: Array<{
    title: string;
    metricValue: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
  }>;
}

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your District Health Assistant. Ask me queries like: "Which hospitals are running low on insulin?" or "Show facilities with bed occupancy above 90%".',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          context: {
            facilities: [
              { name: 'City General Hospital', type: 'hospital', healthScore: 92, bedsAvailable: 85, bedsTotal: 300 },
              { name: 'West Block CHC', type: 'chc', healthScore: 45, bedsAvailable: 2, bedsTotal: 50 },
              { name: 'Metro PHC Center', type: 'phc', healthScore: 68, bedsAvailable: 4, bedsTotal: 15 },
            ],
            alerts: [
              { hospitalName: 'West Block CHC', message: 'ICU capacity has reached 100% occupancy.', severity: 'critical' },
              { hospitalName: 'Metro PHC Center', message: 'Depleted Insulin stock.', severity: 'critical' },
            ],
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.responseText,
          insights: data.structuredInsights,
        },
      ]);
    } catch {
      toast.error('Failed to obtain AI response.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I encountered an issue executing that command. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 h-[500px] flex flex-col justify-between overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4.5 w-4.5 text-blue-500" />
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wide">
            District Operations Assistant
          </h3>
        </div>
        <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Live Context
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-semibold">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-3 ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-850'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>

                {/* Structured Insights rendering */}
                {msg.insights && msg.insights.length > 0 && (
                  <div className="grid gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                    {msg.insights.map((insight, idx) => {
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850 flex items-center justify-between gap-3 text-[10px]"
                        >
                          <div className="flex items-center gap-1.5">
                            {insight.severity === 'critical' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                            {insight.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            {insight.severity === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                            {insight.severity === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                            <span className="font-bold text-slate-900 dark:text-slate-50">{insight.title}</span>
                          </div>
                          <span className="font-extrabold text-slate-500">{insight.metricValue}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-3.5 rounded-bl-none border border-slate-100 dark:border-slate-850 flex items-center gap-1 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex gap-2">
        <input
          type="text"
          placeholder="Ask about capacities, shortages, or summaries..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-blue-600 hover:bg-blue-750 text-white p-2.5 transition flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default AIChatPanel;
