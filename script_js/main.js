/* Ponto de entrada: inicia abas, prática, lição, teste e suporte offline. */

import { initializeLesson } from './lesson.js';
import { initializePractice } from './practice.js';
import { initializeQuiz } from './quiz.js';
import { speakEnglish } from './speech.js';
import { initializeTabs, showTab } from './tabs.js';

// Depois de carregados os módulos, as interações não fazem pedidos à rede.
initializeTabs();
const setPracticeTime = initializePractice(speakEnglish);
initializeLesson(setPracticeTime, showTab);
initializeQuiz(speakEnglish);

// Service workers só funcionam em HTTPS ou em localhost durante desenvolvimento.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      const offlineStatus = document.querySelector('#offline-status');
      if (offlineStatus) offlineStatus.textContent = 'Modo offline pronto neste dispositivo.';
    })
    .catch(error => console.warn('Não foi possível preparar o modo offline:', error));
}
