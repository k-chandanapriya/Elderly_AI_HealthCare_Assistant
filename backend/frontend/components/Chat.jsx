/**
 * Chat Component - AI-Powered Healthcare Assistant
 */
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { chatAPI } from '../services/api';

const Chat = ({ embedded = false }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI healthcare assistant powered by Google Vertex AI. I\'m here to help with your health questions, medication reminders, and wellness tips. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to AI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to Vertex AI
      const response = await chatAPI.sendMessage(inputMessage);
      
      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        model: response.data.model
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Error message
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please make sure the backend server is running and try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to start a new conversation?')) {
      try {
        await chatAPI.clearSession();
        setMessages([{
          role: 'assistant',
          content: 'New conversation started! How can I help you today?',
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  };

  const containerClass = embedded
    ? "flex flex-col min-h-[520px] max-h-[75vh] rounded-2xl border border-secondary bg-white shadow-xl overflow-hidden"
    : "flex flex-col h-screen bg-gradient-to-b from-surface to-secondary/30";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot size={embedded ? 28 : 36} className="text-primary" />
              <Sparkles size={embedded ? 12 : 16} className="text-secondary absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className={embedded ? "text-lg font-bold text-textmain" : "text-2xl font-bold text-textmain"}>
                AI Healthcare Assistant
              </h1>
              <p className="text-sm text-textmain/70">Powered by Vertex AI</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-2 px-4 py-2 text-sm text-textmain/70 hover:text-accent hover:bg-secondary/40 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot size={22} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-2xl px-6 py-4 rounded-2xl shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary to-purple-700 text-surface'
                  : msg.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-white text-textmain'
              }`}
            >
              <p className="text-lg whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                {msg.model && (
                  <span className="text-xs opacity-70 flex items-center gap-1">
                    <Sparkles size={12} />
                    AI
                  </span>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                <User size={28} className="text-white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-md">
              <Bot size={22} className="text-white" />
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-md">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                <span className="ml-2 text-sm text-textmain/70">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-secondary px-4 py-4 shadow-sm">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your health..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 text-base border-2 border-secondary rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-secondary/30 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-primary text-surface px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Send size={24} />
              Send
            </button>
          </div>
          <p className="text-xs text-textmain/60 mt-2 text-center">
            💡 Tip: Ask about medications, appointments, exercises, or general health questions
          </p>
        </form>
      </div>
    </div>
  );
};

export default Chat;