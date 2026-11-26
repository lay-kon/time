/* Gera os exemplos clicáveis e a secção de expressões da aba Truques. */

import { formatDigitalTime, formatEnglishTime, formatPortugueseTime } from './time-language.js';

const exampleTimes = [900, 905, 915, 930, 940, 945];
const quickReferenceMinutes = [5, 10, 15, 20, 25];
const commonExpressionCorrections = [
  { label: 'Mais natural', original: 'What hour is it?', corrected: 'What time is it?', explanation: 'Para perguntar as horas, “What time is it?” é a expressão habitual. “What hour…?” pode aparecer noutros contextos, quando se pergunta especificamente qual é a hora.' },
  { label: 'Correção gramatical', original: 'They are three o’clock', corrected: 'It’s three o’clock', explanation: 'Usamos “it” como sujeito impessoal para dizer as horas: “It is…” ou “It’s…”. “They are…” não funciona nesta expressão.' },
  { label: 'Forma convencional', original: 'Half to four', corrected: 'Half past three', explanation: 'Às 3:30, a forma convencional em inglês é “half past three”. “Half to four” comunica a ideia de que faltam 30 minutos para as quatro, mas não é a forma habitual de dizer esta hora.' }
];

/** Cria um elemento HTML e define texto e classe sem interpretar conteúdo como marcação. */
function createTextElement(tagName, textContent, className = '') {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  if (className) element.className = className;
  return element;
}

/** Preenche exemplos e atalhos; cada exemplo abre o relógio na hora selecionada. */
export function initializeLesson(setPracticeTime, showTab) {
  const examplesContainer = document.querySelector('#time-examples');
  exampleTimes.forEach(minutesSinceMidnight => {
    const exampleButton = document.createElement('button');
    exampleButton.append(
      createTextElement('span', formatDigitalTime(minutesSinceMidnight), 'digital-time-label'),
      createTextElement('span', 'It’s ' + formatEnglishTime(minutesSinceMidnight) + '.'),
      createTextElement('small', formatPortugueseTime(minutesSinceMidnight))
    );
    exampleButton.addEventListener('click', () => {
      setPracticeTime(minutesSinceMidnight);
      showTab('praticar');
    });
    examplesContainer.appendChild(exampleButton);
  });

  const quickReference = document.querySelector('#quick-reference');
  quickReference.append(
    createTextElement('div', 'Passou: past', 'mh cp'),
    createTextElement('div', 'Falta: to', 'mh ct')
  );
  function createQuickReferenceButton(minutesSinceMidnight, styleClass) {
    const button = document.createElement('button');
    button.className = styleClass;
    button.append(
      createTextElement('b', formatEnglishTime(minutesSinceMidnight)),
      createTextElement('small', formatDigitalTime(minutesSinceMidnight))
    );
    button.addEventListener('click', () => {
      setPracticeTime(minutesSinceMidnight);
      showTab('praticar');
    });
    return button;
  }
  quickReferenceMinutes.forEach(minute => {
    quickReference.append(
      createQuickReferenceButton(900 + minute, 'p'),
      createQuickReferenceButton(960 - minute, 't')
    );
  });
  quickReference.appendChild(createQuickReferenceButton(930, 'full'));

  const correctionsContainer = document.querySelector('#common-corrections');
  commonExpressionCorrections.forEach(({ label, original, corrected, explanation }) => {
    const correctionCard = document.createElement('div');
    const correctionLabel = createTextElement('span', label, 'hack-label');
    const examples = createTextElement('div', '', 'hack-example');
    const originalExpression = createTextElement('code', original);
    const arrow = createTextElement('span', '→');
    arrow.setAttribute('aria-hidden', 'true');
    const correctedExpression = createTextElement('code', corrected);
    const explanationText = createTextElement('p', explanation, 'hack-explain');
    examples.append(originalExpression, arrow, correctedExpression);
    correctionCard.append(correctionLabel, examples, explanationText);
    correctionsContainer.appendChild(correctionCard);
  });
}
