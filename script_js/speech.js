/* Reproduz frases em inglês com a Web Speech API disponível no navegador. */

/** Lê em voz alta a frase recebida usando uma voz inglesa instalada, se existir. */
export function speakEnglish(text, onUnavailable = () => {}) {
  const speechSynthesis = window.speechSynthesis;
  if (!speechSynthesis || !window.SpeechSynthesisUtterance) {
    onUnavailable();
    return;
  }
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/’/g, "'"));
    utterance.lang = 'en-US';
    utterance.rate = .85;
    const availableVoices = speechSynthesis.getVoices();
    // Algumas vozes do sistema usam serviços online; esta aplicação só usa vozes locais.
    const usableVoices = availableVoices.filter(voice => voice.localService);
    const englishVoice = usableVoices.find(voice => voice.lang === 'en-US') || usableVoices.find(voice => voice.lang.startsWith('en-'));
    if (!englishVoice) {
      onUnavailable();
      return;
    }
    if (englishVoice) utterance.voice = englishVoice;
    utterance.onerror = onUnavailable;
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error(error);
    onUnavailable();
  }
}
