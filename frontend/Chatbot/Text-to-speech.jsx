import { useEffect, useRef, useState } from 'react';
import { textToSpeechAPI } from '../services/textToSpeech';

export const LANGUAGE_OPTIONS = [
  { label: 'English (US)', value: 'en-US', flag: '🇺🇸' },
  { label: 'English (UK)', value: 'en-GB', flag: '🇬🇧' },
  { label: 'Hindi (India)', value: 'hi-IN', flag: '🇮🇳' },
  { label: 'German (Germany)', value: 'de-DE', flag: '🇩🇪' },
  { label: 'Spanish (Spain)', value: 'es-ES', flag: '🇪🇸' },
  { label: 'French (France)', value: 'fr-FR', flag: '🇫🇷' },
];

export const VOICE_OPTIONS = {
  'en-US': [
    { label: 'Default Voice', value: '' },
    { label: 'en-US-Neural2-F', value: 'en-US-Neural2-F' },
    { label: 'en-US-Neural2-D', value: 'en-US-Neural2-D' },
  ],
  'en-GB': [
    { label: 'Default Voice', value: '' },
    { label: 'en-GB-Neural2-A', value: 'en-GB-Neural2-A' },
    { label: 'en-GB-Neural2-B', value: 'en-GB-Neural2-B' },
  ],
  'hi-IN': [
    { label: 'Default Voice', value: '' },
    { label: 'hi-IN-Neural2-A', value: 'hi-IN-Neural2-A' },
    { label: 'hi-IN-Neural2-B', value: 'hi-IN-Neural2-B' },
  ],
  'de-DE': [
    { label: 'Default Voice', value: '' },
    { label: 'de-DE-Neural2-B', value: 'de-DE-Neural2-B' },
    { label: 'de-DE-Neural2-C', value: 'de-DE-Neural2-C' },
  ],
  'es-ES': [
    { label: 'Default Voice', value: '' },
    { label: 'es-ES-Neural2-A', value: 'es-ES-Neural2-A' },
    { label: 'es-ES-Neural2-B', value: 'es-ES-Neural2-B' },
  ],
  'fr-FR': [
    { label: 'Default Voice', value: '' },
    { label: 'fr-FR-Neural2-A', value: 'fr-FR-Neural2-A' },
    { label: 'fr-FR-Neural2-B', value: 'fr-FR-Neural2-B' },
  ],
};

export const formatAudioTime = (value) => {
  if (!Number.isFinite(value)) return '0:00';
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const useTextToSpeech = () => {
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('en-US');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [autoPlayReplies, setAutoPlayReplies] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  const resetAudioState = () => {
    setSpeakingMessageIndex(null);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setIsAudioPaused(false);
  };

  const stopCurrentAudio = () => {
    if (!audioRef.current) {
      resetAudioState();
      return;
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
    resetAudioState();
  };

  const speakMessage = async (messageText, messageIndex) => {
    if (!messageText?.trim()) return;
    if (audioRef.current) {
      stopCurrentAudio();
    }

    setSpeakingMessageIndex(messageIndex);
    try {
      const response = await textToSpeechAPI.speak({
        text: messageText,
        languageCode: selectedLanguageCode,
        voiceName: selectedVoiceName || null,
      });
      const { audio_base64: audioBase64, mime_type: mimeType } = response.data;
      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;

      audio.onended = () => {
        audioRef.current = null;
        resetAudioState();
      };
      audio.onerror = () => {
        audioRef.current = null;
        resetAudioState();
      };
      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime || 0);
      };
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || 0);
      };

      await audio.play();
      setIsAudioPaused(false);
    } catch (error) {
      console.error('TTS error:', error);
      resetAudioState();
    }
  };

  const pauseResumeAudio = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
      setIsAudioPaused(false);
      return;
    }
    audioRef.current.pause();
    setIsAudioPaused(true);
  };

  const seekAudio = (nextValue) => {
    const parsed = Number(nextValue);
    setAudioCurrentTime(parsed);
    if (audioRef.current) {
      audioRef.current.currentTime = parsed;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return {
    speakingMessageIndex,
    audioCurrentTime,
    audioDuration,
    isAudioPaused,
    selectedLanguageCode,
    selectedVoiceName,
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
  };
};
