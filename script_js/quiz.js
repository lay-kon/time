/* Gera perguntas, opções, respostas e pontuação inteiramente no dispositivo. */

import { createClock } from './clock.js';
import { explainEnglishTime, formatDigitalTime, formatEnglishTime, formatSpokenEnglishTime, getMeridiem, getTimeParts } from './time-language.js';

const possibleTimes = Array.from({ length: 1440 }, (_, minute) => minute);
const specialMinutes = [0, 15, 30, 45];
const fiveMinuteMarks = [5, 10, 20, 25, 35, 40, 50, 55];
const otherMinutes = Array.from({ length: 60 }, (_, minute) => minute).filter(minute => minute % 5 !== 0);

/** Escolhe um elemento aleatório e devolve uma cópia baralhada de uma lista. */
function chooseRandomItem(items) { return items[Math.floor(Math.random() * items.length)]; }
function shuffleItems(items) {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
  }
  return shuffledItems;
}

/** Cria uma ronda de dez perguntas sem repetir minutos nem horas de 12 horas. */
function createQuizRound() {
  const selectedMinutes = shuffleItems([
    ...shuffleItems(specialMinutes).slice(0, 3),
    ...shuffleItems(fiveMinuteMarks).slice(0, 4),
    ...shuffleItems(otherMinutes).slice(0, 3)
  ]);
  const selectedHours = shuffleItems([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const selectedQuestionTypes = shuffleItems([0, 1, 2, 0, 1, 2, 0, 1, 2, chooseRandomItem([0, 1, 2])]);
  return selectedMinutes.map((minute, index) => ({
    minutesSinceMidnight: chooseRandomItem(possibleTimes.filter(time => getTimeParts(time).hour12 === selectedHours[index] && time % 60 === minute)),
    questionType: selectedQuestionTypes[index]
  }));
}

/** Produz uma opção correta e três horas alternativas plausíveis. */
function createAnswerOptions(minutesSinceMidnight) {
  const answerKey = time => formatDigitalTime(time) + ' ' + getMeridiem(time);
  const answerLabel = time => formatDigitalTime(time) + '  ' + getMeridiem(time);
  const meridiemOffset = minutesSinceMidnight >= 720 ? 720 : 0;
  const timeWithinTwelveHours = minutesSinceMidnight % 720;
  const hourWithinTwelveHours = Math.floor(timeWithinTwelveHours / 60);
  const minute = timeWithinTwelveHours % 60;
  const candidateTimes = [
    hourWithinTwelveHours * 60 + 60 - minute,
    hourWithinTwelveHours * 60 - minute,
    (hourWithinTwelveHours + 1) * 60 + minute,
    (hourWithinTwelveHours - 1) * 60 + minute,
    timeWithinTwelveHours + 5, timeWithinTwelveHours - 5,
    timeWithinTwelveHours + 15, timeWithinTwelveHours - 15,
    timeWithinTwelveHours + 30
  ].map(time => meridiemOffset + ((time % 720) + 720) % 720);
  candidateTimes.push((minutesSinceMidnight + 720) % 1440);

  const usedAnswerKeys = new Set([answerKey(minutesSinceMidnight)]);
  const distractorTimes = [];
  const orderedCandidates = [
    ...shuffleItems(candidateTimes.slice(0, 4)).slice(0, 2),
    ...shuffleItems(candidateTimes.slice(4)),
    ...shuffleItems(candidateTimes.slice(0, 4))
  ];
  orderedCandidates.forEach(candidateTime => {
    const candidateKey = answerKey(candidateTime);
    if (!usedAnswerKeys.has(candidateKey) && distractorTimes.length < 3) {
      usedAnswerKeys.add(candidateKey);
      distractorTimes.push(candidateTime);
    }
  });
  return shuffleItems([minutesSinceMidnight, ...distractorTimes]).map(time => ({
    minutesSinceMidnight: time,
    label: answerLabel(time),
    isCorrect: time === minutesSinceMidnight
  }));
}

/** Liga o teste à interface e gere o progresso no navegador, sem pedidos de rede. */
export function initializeQuiz(speakEnglish) {
  const quizClock = createClock(document.querySelector('#question-clock'));
  let quizRound = createQuizRound();
  let questionIndex = 0;
  let correctAnswerCount = 0;
  let currentQuestion = null;
  let hasAnsweredCurrentQuestion = false;

  function displayQuestion() {
    const roundQuestion = quizRound[questionIndex];
    currentQuestion = { ...roundQuestion, answerOptions: createAnswerOptions(roundQuestion.minutesSinceMidnight) };
    hasAnsweredCurrentQuestion = false;
    const { minutesSinceMidnight, questionType, answerOptions } = currentQuestion;
    document.querySelector('#question-number').textContent = 'Pergunta ' + (questionIndex + 1) + ' de 10';
    document.querySelector('#question-score').textContent = 'Certas: ' + correctAnswerCount;
    document.querySelector('#question-progress-fill').style.width = ((questionIndex + 1) * 10) + '%';
    document.querySelector('#question-clock').toggleAttribute('hidden', questionType !== 0);
    document.querySelector('#speak-question').hidden = questionType !== 2;
    document.querySelector('#answer-feedback').hidden = true;
    document.querySelector('#next-question').hidden = true;

    if (questionType === 0) {
      quizClock.update(minutesSinceMidnight, false);
    document.querySelector('#question-prompt').textContent = 'Lê o relógio e escolhe a hora e o período correctos.';
    } else if (questionType === 1) {
      document.querySelector('#question-prompt').textContent = 'A expressão é “It’s ' + formatEnglishTime(minutesSinceMidnight) + '.”. Qual é a hora e o período?';
    } else {
      document.querySelector('#question-prompt').textContent = 'Ouve com atenção e escolhe a hora e o período.';
    }

    const answerContainer = document.querySelector('#answer-options');
    answerContainer.replaceChildren();
    answerOptions.forEach(answerOption => {
      const answerButton = document.createElement('button');
      answerButton.className = 'answer-option';
      answerButton.textContent = answerOption.label;
      answerButton.addEventListener('click', () => submitAnswer(answerButton, answerOption));
      answerOption.button = answerButton;
      answerContainer.appendChild(answerButton);
    });
  }

  /** Mostra se a resposta está certa, atualiza a pontuação e revela o avanço. */
  function submitAnswer(selectedButton, selectedOption) {
    if (hasAnsweredCurrentQuestion) return;
    hasAnsweredCurrentQuestion = true;
    if (selectedOption.isCorrect) correctAnswerCount++;
    currentQuestion.answerOptions.forEach(answerOption => {
      answerOption.button.disabled = true;
      if (answerOption.isCorrect) answerOption.button.classList.add('ok');
    });
    if (!selectedOption.isCorrect) selectedButton.classList.add('bad');
    document.querySelector('#question-score').textContent = 'Certas: ' + correctAnswerCount;

    const correctTime = currentQuestion.minutesSinceMidnight;
    const feedback = document.querySelector('#answer-feedback');
    feedback.className = 'answer-feedback ' + (selectedOption.isCorrect ? 'ok' : 'bad');
    feedback.textContent = (selectedOption.isCorrect ? 'Certo! ' : 'Não é essa. ')
      + formatDigitalTime(correctTime) + ' ' + getMeridiem(correctTime)
      + ' → It’s ' + formatEnglishTime(correctTime) + '. ' + explainEnglishTime(correctTime);
    feedback.hidden = false;

    const nextButton = document.querySelector('#next-question');
    nextButton.textContent = questionIndex === 9 ? 'Ver resultado' : 'Seguinte';
    nextButton.hidden = false;
  }

  /** Exibe o resultado final e a recomendação adequada à pontuação. */
  function displayFinalScore() {
    document.querySelector('#question-box').hidden = true;
    document.querySelector('#quiz-result').hidden = false;
    document.querySelector('#final-score').textContent = correctAnswerCount + ' de 10';
    document.querySelector('#final-message').textContent = correctAnswerCount >= 9
      ? 'Excelente. Já dominas a hora em inglês.'
      : correctAnswerCount >= 6
        ? 'Bom resultado. Revê os Truques e tenta outra vez.'
        : 'Volta ao relógio em Praticar e repete o teste.';
  }

  document.querySelector('#speak-question').addEventListener('click', () => {
    const spokenQuestion = formatSpokenEnglishTime(currentQuestion.minutesSinceMidnight);
    speakEnglish(spokenQuestion, () => {
      document.querySelector('#question-prompt').textContent = 'A voz offline não está disponível neste dispositivo. Lê a frase: “' + spokenQuestion + '” Qual é a hora e o período?';
    });
  });
  document.querySelector('#next-question').addEventListener('click', () => {
    questionIndex++;
    if (questionIndex >= 10) displayFinalScore();
    else displayQuestion();
  });
  document.querySelector('#restart-quiz').addEventListener('click', () => {
    questionIndex = 0;
    correctAnswerCount = 0;
    quizRound = createQuizRound();
    document.querySelector('#quiz-result').hidden = true;
    document.querySelector('#question-box').hidden = false;
    displayQuestion();
  });
  displayQuestion();
}
