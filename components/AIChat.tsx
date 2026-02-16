import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Activity } from '../types';
import { generateItinerarySuggestion } from '../services/geminiService';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Activity[];
  onUpdateItinerary: (newActivities: Activity[]) => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, itinerary, onUpdateItinerary }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'HEY! Ready to shake up your plans? I can find cool spots or reroute your trip!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call AI
    const suggestedActivities = await generateItinerarySuggestion(itinerary, input);
    
    setIsTyping(false);

    if (suggestedActivities) {
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: 'BOOM! Itinerary updated. Check out your new plan!' 
        }]);
        onUpdateItinerary(suggestedActivities);
    } else {
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: 'OOF. Brain freeze. Can you say that again differently?' 
        }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-pop-dark/60 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>

      {/* Chat Window */}
      <div className="pointer-events-auto bg-white w-full sm:w-[400px] h-[85vh] sm:h-[600px] rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-slide-up relative border-t-4 sm:border-4 border-pop-dark">
        
        {/* Header */}
        <div className="p-6 bg-pop-blue border-b-4 border-pop-dark flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border-2 border-pop-dark rounded-full flex items-center justify-center shadow-pop-sm">
                    <Sparkles size={24} className="text-pop-yellow fill-pop-yellow" strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="font-black text-white text-xl uppercase italic tracking-wider">AI Assistant</h3>
                    <p className="text-[10px] font-bold text-blue-200 uppercase">Powered by Gemini</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 bg-pop-dark rounded-lg hover:bg-stone-800 transition-colors group">
                <X size={20} className="text-white group-hover:rotate-90 transition-transform" strokeWidth={3} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-blue-50" ref={scrollRef}>
            {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[85%] p-4 text-sm font-bold leading-relaxed relative border-2 border-pop-dark shadow-pop-sm
                        ${msg.role === 'user' 
                            ? 'bg-pop-dark text-white rounded-2xl rounded-br-none' 
                            : 'bg-white text-pop-dark rounded-2xl rounded-bl-none'
                        }
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-pop-sm border-2 border-pop-dark">
                        <div className="flex gap-2">
                            <span className="w-2 h-2 bg-pop-dark rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-pop-dark rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-pop-dark rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t-4 border-pop-dark">
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-2 py-2 border-2 border-pop-dark focus-within:bg-white focus-within:shadow-pop-sm transition-all">
                <input 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-pop-dark px-2 placeholder:text-gray-400"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input || isTyping}
                    className="w-10 h-10 bg-pop-yellow border-2 border-pop-dark rounded-lg flex items-center justify-center text-pop-dark hover:-translate-y-1 hover:shadow-pop-sm active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                    <Send size={18} strokeWidth={3} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;