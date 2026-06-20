import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

// Cache voices at module load time so they are ready on the first user click.
// Chrome loads voices asynchronously; calling speak() before voices are cached
// with a lang that has no matching voice causes a silent no-op.
let _webVoices: SpeechSynthesisVoice[] = [];

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
  const load = () => { _webVoices = window.speechSynthesis.getVoices(); };
  load();
  window.speechSynthesis.addEventListener('voiceschanged', load);
}

const _webSpeak = (text: string): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.pitch = 1.0;

  const zhVoice = _webVoices.find(
    (v) => v.lang.startsWith('zh') || v.lang.startsWith('cmn')
  );

  if (zhVoice) {
    utterance.voice = zhVoice;
    utterance.lang = zhVoice.lang;
  }

  window.speechSynthesis.speak(utterance);
};

export const speakChinese = (text: string): void => {
  if (Platform.OS === 'web') {
    if (_webVoices.length > 0) {
      _webSpeak(text);
    } else {
      // Voices haven't loaded yet — wait once then speak.
      // By this point the user has already clicked so the gesture context
      // remains active long enough for the async callback to work.
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        () => { _webSpeak(text); },
        { once: true }
      );
    }
    return;
  }
  Speech.speak(text, { language: 'zh-CN', rate: 0.8, pitch: 1.0 });
};

export const stopSpeaking = (): void => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return;
  }
  Speech.stop();
};
