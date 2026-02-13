import api from './Api';

export const textToSpeechAPI = {
  speak: ({ text, languageCode = 'en-US', voiceName = null }) =>
    api.post('/api/tts/speak', {
      text,
      language_code: languageCode,
      voice_name: voiceName,
    }),
};

export default textToSpeechAPI;
