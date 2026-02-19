/**
 * Chat Component - AI-Powered Healthcare Assistant
 */
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Volume2, Pause, Play, Square } from 'lucide-react';
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
    ? "flex flex-col min-h-[680px] max-h-[85vh] rounded-2xl border border-gray-200/80 bg-white shadow-lg overflow-hidden"
    : "flex flex-col h-screen bg-gray-50";

  return (
    <div className={containerClass}>
      {/* Header - minimal */}
      <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot size={20} className="text-primary" />
          </div>
          <div>
            <h1 className={embedded ? "text-base font-semibold text-gray-900" : "text-lg font-semibold text-gray-900"}>
              MIA — Elderly Care AI
            </h1>
            <p className="text-xs text-gray-500">Powered by Vertex AI</p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          New chat
        </button>
      </div>
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Language</span>
            <select
              value={selectedLanguageCode}
              onChange={handleLanguageChange}
              className="h-9 pl-3 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white min-w-[160px] transition-colors"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setSpeechEnabled((on) => !on)}
            className={`h-9 inline-flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-all ${
              speechEnabled
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <Volume2 size={17} />
            Speech {speechEnabled ? 'On' : 'Off'}
          </button>
          {speechEnabled && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Speed</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(Number(e.target.value))}
                    className="w-20 h-2 accent-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem] tabular-nums">{playbackRate.toFixed(2)}x</span>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={autoPlayReplies}
                  onChange={(e) => setAutoPlayReplies(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-gray-700">Autoplay</span>
              </label>
            </>
          )}
        </div>
      </div>

        {speakingMessageIndex !== null && (
          <div className="mx-5 mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
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

      {/* Messages Container */}
      <div className="flex-1 min-h-[320px] overflow-y-auto px-6 py-6 pb-32 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              <div className={`flex items-center justify-between gap-3 mt-2 pt-2 ${msg.role === 'user' ? 'border-t border-white/20' : 'border-t border-gray-200/60'}`}>
                <span className="text-[11px] opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                {msg.role === 'assistant' && !msg.isError && (
                  <button
                    type="button"
                    onClick={() => speechEnabled && speakMessage(msg.content, index)}
                    disabled={!speechEnabled}
                    className={`text-[11px] flex items-center gap-1 ${speechEnabled ? 'text-gray-600 hover:text-primary' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    <Volume2 size={12} />
                    {speakingMessageIndex === index ? (isAudioPaused ? 'Paused' : 'Playing') : 'Speak'}
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={16} className="text-primary" />
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.15s'}} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.3s'}} />
              </div>
            </div>
          </div>
        )}

        <div className="h-24" aria-hidden="true" />
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - search-bar style */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about medications, appointments, or wellness..."
              disabled={isLoading}
              className="flex-1 bg-transparent py-2.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;