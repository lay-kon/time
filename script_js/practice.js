/* Liga o relógio interativo, botões de ajuste e informação da hora atual. */

import { createClock, enableClockDragging } from './clock.js';
import { explainEnglishTime, formatAlternativeEnglishTime, formatDigitalTime, formatEnglishTime, formatPortugueseTime, formatSpokenEnglishTime, getDayPeriod, getMeridiem, getTimeParts } from './time-language.js';

/** Prepara a aba Praticar e devolve a função pública para escolher uma hora. */
export function initializePractice(speakEnglish) {
  const practiceClock = createClock(document.querySelector('#practice-clock'), true);
  let minutesSinceMidnight = 940;

  function renderPracticeTime() {
    practiceClock.update(minutesSinceMidnight);
    const { hour24, minute } = getTimeParts(minutesSinceMidnight);
    const meridiem = getMeridiem(minutesSinceMidnight);
    const alternativeEnglishTime = formatAlternativeEnglishTime(minutesSinceMidnight);
    document.querySelector('#digital-time').textContent = formatDigitalTime(minutesSinceMidnight);
    document.querySelector('#time-meta').textContent = meridiem + ' · ' + String(hour24).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + ' · ' + getDayPeriod(minutesSinceMidnight);
    document.querySelector('#ampm-note').textContent = meridiem === 'a.m.' ? 'a.m. — da meia-noite até antes do meio-dia.' : 'p.m. — do meio-dia até antes da meia-noite.';
    document.querySelector('#choose-am').setAttribute('aria-pressed', String(meridiem === 'a.m.'));
    document.querySelector('#choose-pm').setAttribute('aria-pressed', String(meridiem === 'p.m.'));
    document.querySelector('#english-time').textContent = 'It’s ' + formatEnglishTime(minutesSinceMidnight) + '.';
    document.querySelector('#alternative-english-time').textContent = alternativeEnglishTime ? 'Também se diz: It’s ' + alternativeEnglishTime + '.' : '';
    document.querySelector('#portuguese-time').textContent = 'Em português: ' + formatPortugueseTime(minutesSinceMidnight);
    document.querySelector('#time-explanation').textContent = explainEnglishTime(minutesSinceMidnight);
    document.querySelector('#time-output').style.setProperty('--side', !minute ? 'var(--ink)' : minute <= 30 ? 'var(--past)' : 'var(--to)');
  }

  /** Normaliza uma hora para o intervalo de minutos do dia e redesenha a aba. */
  function setPracticeTime(nextMinutesSinceMidnight) {
    minutesSinceMidnight = ((nextMinutesSinceMidnight % 1440) + 1440) % 1440;
    renderPracticeTime();
  }

  enableClockDragging(practiceClock, () => minutesSinceMidnight, setPracticeTime);
  document.querySelectorAll('[data-time-adjustment]').forEach(button => {
    button.addEventListener('click', () => setPracticeTime(minutesSinceMidnight + Number(button.dataset.timeAdjustment)));
  });
  document.querySelectorAll('[data-minute-setting]').forEach(button => {
    button.addEventListener('click', () => setPracticeTime(Math.floor(minutesSinceMidnight / 60) * 60 + Number(button.dataset.minuteSetting)));
  });
  function chooseMeridiem(isAfternoon) {
    const { hour12, minute } = getTimeParts(minutesSinceMidnight);
    setPracticeTime((isAfternoon ? 720 : 0) + (hour12 % 12) * 60 + minute);
  }
  document.querySelector('#choose-am').addEventListener('click', () => chooseMeridiem(false));
  document.querySelector('#choose-pm').addEventListener('click', () => chooseMeridiem(true));
  document.querySelector('#speak-time').addEventListener('click', () => speakEnglish(formatSpokenEnglishTime(minutesSinceMidnight)));
  renderPracticeTime();

  return setPracticeTime;
}
