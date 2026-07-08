import { useLanguage } from "@/providers/LanguageProvider";import React, { useState } from 'react';
import { Send, Sparkles, MessageCircle, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  insights?: Array<{
    title: string;
    metricValue: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
  }>;
  mode?: 'live' | 'demo' | 'fallback';
}

export function AIChatPanel() {const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
  {
    role: 'assistant',
    text: t("common.hello_i_am_your_district_health_assistant_ask_me_queries_like_which_hospitals_are_running_low_on_insulin_or_show_facilities_with_bed_occupancy_above_90")
  }]
  );
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage,
          context: {
            facilities: [
            { name: 'City General Hospital', type: 'hospital', healthScore: 92, bedsAvailable: 85, bedsTotal: 300 },
            { name: 'West Block CHC', type: 'chc', healthScore: 45, bedsAvailable: 2, bedsTotal: 50 },
            { name: 'Metro PHC Center', type: 'phc', healthScore: 68, bedsAvailable: 4, bedsTotal: 15 }],

            alerts: [
            { hospitalName: 'West Block CHC', message: 'ICU capacity has reached 100% occupancy.', severity: 'critical' },
            { hospitalName: 'Metro PHC Center', message: 'Depleted Insulin stock.', severity: 'critical' }]

          }
        })
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
        mode: data.mode
      }]
      );
    } catch {
      toast.error(t("common.failed_to_obtain_ai_response"));
      setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: t("common.sorry_i_encountered_an_issue_executing_that_command_please_try_again")
      }]
      );
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
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wide">{t("common.district_operations_assistant")}

          </h3>
        </div>
        <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="h-3 w-3" />{t("common.live_context")}
        </span>
      </div>

      {/* Messages area */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-semibold"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t("common.chat_history", "Chat History")}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-3 ${
              isUser ?
              'bg-blue-600 text-white rounded-br-none' :
              'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-850'}`
              }>
                <p className="leading-relaxed">{msg.text}</p>
                {!isUser && msg.mode && (
                  <div className="text-[8px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 select-none">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      msg.mode === 'live' ? 'bg-emerald-500' :
                      msg.mode === 'demo' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    {msg.mode === 'live' ? 'Live AI' : msg.mode === 'demo' ? 'Demo Mode' : 'AI Fallback'}
                  </div>
                )}

                {/* Structured Insights rendering */}
                {msg.insights && msg.insights.length > 0 &&
                <div className="grid gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                    {msg.insights.map((insight, idx) => {
                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850 flex items-center justify-between gap-3 text-[10px]">
                        
                          <div className="flex items-center gap-1.5">
                            <span className="sr-only">[{insight.severity}] </span>
                            {insight.severity === 'critical' && <ShieldAlert className="h-4 w-4 text-red-500" aria-hidden="true" />}
                            {insight.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />}
                            {insight.severity === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden="true" />}
                            {insight.severity === 'info' && <Info className="h-4 w-4 text-blue-500" aria-hidden="true" />}
                            <span className="font-bold text-slate-900 dark:text-slate-50">{insight.title}</span>
                          </div>
                          <span className="font-extrabold text-slate-500">{insight.metricValue}</span>
                        </div>);

                  })}
                  </div>
                }
              </div>
            </div>);

        })}

        {isLoading &&
        <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-3.5 rounded-bl-none border border-slate-100 dark:border-slate-850 flex items-center gap-1 text-slate-400">
              <span className="sr-only">{t("common.ai_is_typing", "AI is typing...")}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        }
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex gap-2">
        <input
          type="text"
          placeholder={t("common.ask_about_capacities_shortages_or_summaries")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label={t("common.message_assistant", "Message Assistant")}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-50 focus:outline-none" />
        
        <button
          type="submit"
          disabled={isLoading}
          aria-label={t("common.send_message", "Send message")}
          className="rounded-xl bg-blue-600 hover:bg-blue-750 text-white p-2.5 transition flex items-center justify-center shrink-0">
          
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>);

}

export default AIChatPanel;