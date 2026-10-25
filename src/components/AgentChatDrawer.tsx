import React, { useState, useRef, useEffect } from 'react';
import { CustomerProfile, GhostRecord } from '../types/audit';
import { askAgentChat } from '../services/api';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  Check, 
  Copy,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  ghostRecords: GhostRecord[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  customer,
  ghostRecords,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Data Deletion Audit Agent. I'm actively monitoring the system topology for **${customer.canonicalName}** (Ticket: ${customer.deletionRequest.ticketId}).\n\nI have identified **${ghostRecords.length} lingering ghost data locations** across PostgreSQL, MongoDB, Cassandra, AWS S3, and a critical **zombie data recreation in the Kafka Dead Letter Queue**.\n\nAsk me about forensic root causes, safe zero-downtime database purge scripts, S3 WORM lock legal overrides, or statutory retention under GDPR Art. 17.`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await askAgentChat(updatedMessages, {
        customerName: customer.canonicalName,
        auditStatus: `${ghostRecords.length} Ghost Records Found`,
        ghostCount: ghostRecords.length,
        preservedCount: 2,
      });

      setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content:
            'I encountered an issue querying the forensic model. As a priority recommendation: execute Kafka topic compaction with a null payload for the customer UUID to suppress zombie data re-injection immediately.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Explain the Kafka zombie data replay bug in detail',
    'How do we safely alter PostgreSQL foreign keys to CASCADE?',
    'Can we purge AWS S3 Glacier objects with WORM lock active?',
    'What PII attributes must be scrubbed from VAT invoices?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Forensic Privacy Audit Agent
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Gemini 3.8 Flash • Real-Time Consultation</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Audit Context Pill */}
      <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Auditing: <strong className="text-slate-200">{customer.canonicalName}</strong></span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
          {ghostRecords.length} Ghost Leaks Active
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {m.content}
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
              {m.role === 'user' ? 'Security Engineer' : 'AI Privacy Auditor'}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 w-max">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Analyzing system topologies and regulatory directives...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/70">
        <p className="text-[10px] font-mono text-slate-400 uppercase mb-1.5">Suggested Forensic Queries:</p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors text-left truncate max-w-full"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask agent about root causes, purge scripts, or law..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
