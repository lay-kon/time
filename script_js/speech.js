/* Reproduz frases em inglês com a Web Speech API disponível no navegador. */

/** Lê em voz alta a frase recebida usando uma voz inglesa instalada, se existir. */
export function speakEnglish(text, onUnavailable = () => {}) {
  const speechSynthesis = window.speechSynthesis;
  if (!speechSynthesis || !window.SpeechSynthesisUtterance) {
    onUnavailable('A leitura em voz alta não está disponível neste navegador.');
    return;
  }
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/’/g, "'"));
    utterance.lang = 'en-US';
    utterance.rate = .85;
    const availableVoices = speechSynthesis.getVoices();
    // Prefere uma voz local para permitir uso offline; online, aceita também vozes do navegador.
    const localEnglishVoice = availableVoices.find(voice => voice.localService && voice.lang === 'en-US')
      || availableVoices.find(voice => voice.localService && voice.lang.startsWith('en-'));
    const anyEnglishVoice = availableVoices.find(voice => voice.lang === 'en-US')
      || availableVoices.find(voice => voice.lang.startsWith('en-'));
    const selectedVoice = localEnglishVoice || (navigator.onLine ? anyEnglishVoice : null);
    if (selectedVoice) utterance.voice = selectedVoice;
    else if (!navigator.onLine && availableVoices.length > 0) {
      onUnavailable('Não há uma voz inglesa disponível sem internet.');
      return;
    }
    utterance.onerror = () => onUnavailable('O navegador não conseguiu reproduzir a voz.');
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error(error);
    onUnavailable('O navegador não conseguiu reproduzir a voz.');
  }
}
