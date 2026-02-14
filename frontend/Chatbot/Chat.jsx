/**
 * Chat Component - AI-Powered Healthcare Assistant
 */
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles, Volume2, Pause, Play, Square } from 'lucide-react';
import { chatAPI } from '../services/api';
import {
  LANGUAGE_OPTIONS,
  formatAudioTime,
  useTextToSpeech,
} from './Text-to-speech';

const Chat = ({ embedded = false }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m MIA, your elderly care assistant. I can help with medications, appointments, exercises, and daily wellness. What would you like help with today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const {
    speakingMessageIndex,
    audioCurrentTime,
    audioDuration,
    isAudioPaused,
    selectedLanguageCode,
    autoPlayReplies,
    playbackRate,
    setSelectedLanguageCode,
    setSelectedVoiceName,
    setAutoPlayReplies,
    setPlaybackRate,
    speakMessage,
    pauseResumeAudio,
    seekAudio,
    stopCurrentAudio,
  } = useTextToSpeech();

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setSelectedLanguageCode(nextLanguage);
    setSelectedVoiceName('');
  };

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

      let newAssistantIndex = null;
      setMessages(prev => {
        newAssistantIndex = prev.length;
        return [...prev, aiMessage];
      });

      if (speechEnabled && autoPlayReplies && newAssistantIndex !== null) {
        await speakMessage(aiMessage.content, newAssistantIndex);
      }
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
          content: 'New conversation started. I\'m here for your medications, appointments, and health questions. How can I help you?',
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  };

  const containerClass = embedded
    ? "flex flex-col min-h-[680px] max-h-[85vh] rounded-2xl border border-secondary bg-white shadow-xl overflow-hidden"
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
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex flex-col text-xs text-textmain/80">
            Language
            <select
              value={selectedLanguageCode}
              onChange={handleLanguageChange}
              className="mt-1 px-3 py-2 rounded-xl border border-secondary text-sm bg-white flex items-center gap-2 min-w-[180px]"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setSpeechEnabled((on) => !on)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              speechEnabled
                ? 'border-primary bg-primary text-white'
                : 'border-secondary bg-white text-textmain/70 hover:bg-secondary/30'
            }`}
            title={speechEnabled ? 'Speech on – click to turn off' : 'Speech off – click to turn on'}
          >
            <Volume2 size={18} />
            Speech {speechEnabled ? 'On' : 'Off'}
          </button>

          {speechEnabled && (
            <>
              <label className="flex flex-col text-xs text-textmain/80">
                Speed
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={playbackRate}
                    onChange={(event) => setPlaybackRate(Number(event.target.value))}
                    className="w-24"
                  />
                  <span className="text-[11px]">{playbackRate.toFixed(2)}x</span>
                </div>
              </label>
              <label className="flex items-center gap-2 text-xs text-textmain/80">
                <input
                  type="checkbox"
                  checked={autoPlayReplies}
                  onChange={(event) => setAutoPlayReplies(event.target.checked)}
                />
                Autoplay assistant replies
              </label>
            </>
          )}
        </div>

        {speakingMessageIndex !== null && (
          <div className="mt-3 p-3 rounded-lg border border-secondary bg-secondary/20">
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={pauseResumeAudio}
                className="px-3 py-1 rounded-md bg-primary text-white text-xs flex items-center gap-1"
              >
                {isAudioPaused ? <Play size={12} /> : <Pause size={12} />}
                {isAudioPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={stopCurrentAudio}
                className="px-3 py-1 rounded-md bg-red-500 text-white text-xs flex items-center gap-1"
              >
                <Square size={12} />
                Stop
              </button>
              <span className="text-xs text-textmain/70">Now speaking message #{speakingMessageIndex + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-textmain/70 w-10">{formatAudioTime(audioCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={Math.max(audioDuration, 0)}
                step="0.1"
                value={Math.min(audioCurrentTime, audioDuration || 0)}
                onChange={(event) => seekAudio(event.target.value)}
                className="flex-1"
              />
              <span className="text-xs text-textmain/70 w-10">{formatAudioTime(audioDuration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-[320px] overflow-y-auto px-4 py-6 pb-40 space-y-4">
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
                {msg.role === 'assistant' && !msg.isError && (
                  <button
                    type="button"
                    onClick={() => speechEnabled && speakMessage(msg.content, index)}
                    disabled={!speechEnabled}
                    className={`text-xs flex items-center gap-1 ${speechEnabled ? 'opacity-80 hover:opacity-100' : 'opacity-50 cursor-not-allowed'}`}
                    title={speechEnabled ? 'Play voice response' : 'Turn Speech on to listen'}
                  >
                    <Volume2 size={12} />
                    {speakingMessageIndex === index ? (isAudioPaused ? 'Paused' : 'Playing...') : 'Speak'}
                  </button>
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

        {/* Empty space for next conversation */}
        <div className="h-48 flex-shrink-0" aria-hidden="true" />
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