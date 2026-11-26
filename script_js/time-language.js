/* Funções puras que convertem minutos do dia em frases e formatos de hora. */

const numberWordsUnderTwenty = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

/** Devolve os componentes de uma hora representada como minutos desde a meia-noite. */
export function getTimeParts(minutesSinceMidnight) {
  const hour24 = Math.floor(minutesSinceMidnight / 60) % 24;
  const minute = minutesSinceMidnight % 60;
  return { hour24, minute, hour12: hour24 % 12 || 12, nextHour12: (hour24 + 1) % 12 || 12 };
}

/** Converte um número entre zero e 59 para palavras inglesas. */
export function numberToEnglish(number) {
  return number < 20
    ? numberWordsUnderTwenty[number]
    : tensWords[Math.floor(number / 10)] + (number % 10 ? '-' + numberWordsUnderTwenty[number % 10] : '');
}

/** Produz a expressão principal para dizer uma hora em inglês. */
export function formatEnglishTime(minutesSinceMidnight) {
  const { minute, hour12, nextHour12 } = getTimeParts(minutesSinceMidnight);
  if (!minute) return minutesSinceMidnight === 720 ? 'noon' : minutesSinceMidnight === 0 ? 'midnight' : numberToEnglish(hour12) + ' o’clock';
  if (minute <= 30) {
    const minutePhrase = minute === 15 ? 'quarter' : minute === 30 ? 'half' : numberToEnglish(minute) + (minute % 5 ? (minute > 1 ? ' minutes' : ' minute') : '');
    return minutePhrase + ' past ' + numberToEnglish(hour12);
  }
  const remainingMinutes = 60 - minute;
  const minutePhrase = remainingMinutes === 15 ? 'quarter' : numberToEnglish(remainingMinutes) + (remainingMinutes % 5 ? ' minutes' : '');
  return minutePhrase + ' to ' + numberToEnglish(nextHour12);
}

/** Produz a forma digital de 12 horas, por exemplo 3:05. */
export function formatDigitalTime(minutesSinceMidnight) {
  const { hour12, minute } = getTimeParts(minutesSinceMidnight);
  return hour12 + ':' + String(minute).padStart(2, '0');
}

/** Devolve a indicação a.m. ou p.m. correspondente. */
export function getMeridiem(minutesSinceMidnight) {
  return getTimeParts(minutesSinceMidnight).hour24 < 12 ? 'a.m.' : 'p.m.';
}

/** Devolve o período do dia para a hora indicada. */
export function getDayPeriod(minutesSinceMidnight) {
  const hour24 = getTimeParts(minutesSinceMidnight).hour24;
  return hour24 < 5 ? 'at night' : hour24 < 12 ? 'in the morning' : hour24 < 18 ? 'in the afternoon' : hour24 < 21 ? 'in the evening' : 'at night';
}

/** Produz uma forma alternativa de leitura digital falada em inglês. */
export function formatAlternativeEnglishTime(minutesSinceMidnight) {
  const { minute, hour12 } = getTimeParts(minutesSinceMidnight);
  return minute ? numberToEnglish(hour12) + ' ' + (minute < 10 ? 'oh ' + numberToEnglish(minute) : numberToEnglish(minute)) : null;
}

/** Monta a frase completa que será enviada à leitura por voz. */
export function formatSpokenEnglishTime(minutesSinceMidnight) {
  if (minutesSinceMidnight === 0) return 'It is midnight.';
  if (minutesSinceMidnight === 720) return 'It is noon.';
  return 'It is ' + formatEnglishTime(minutesSinceMidnight) + ', ' + getMeridiem(minutesSinceMidnight) + '.';
}

/** Produz uma tradução simples da hora para português. */
export function formatPortugueseTime(minutesSinceMidnight) {
  const { minute, hour12, nextHour12 } = getTimeParts(minutesSinceMidnight);
  if (!minute) return minutesSinceMidnight === 720 ? 'Meio-dia' : minutesSinceMidnight === 0 ? 'Meia-noite' : hour12 === 1 ? 'É 1 hora' : 'São ' + hour12 + ' horas';
  if (minute <= 30) return (hour12 === 1 ? 'É 1' : 'São ' + hour12) + ' e ' + (minute === 30 ? 'meia' : minute);
  return 'Faltam ' + (60 - minute) + ' para ' + (nextHour12 === 1 ? 'a 1' : 'as ' + nextHour12);
}

/** Explica em português porque a expressão usa past, to ou uma forma especial. */
export function explainEnglishTime(minutesSinceMidnight) {
  const { minute, hour12, nextHour12 } = getTimeParts(minutesSinceMidnight);
  if (!minute) return 'Ponteiro grande no 12: só dizes a hora e acrescentas o’clock.';
  const currentHour = hour12 === 1 ? 'da 1' : 'das ' + hour12;
  const followingHour = nextHour12 === 1 ? 'a 1' : 'as ' + nextHour12;
  if (minute === 15) return 'Passou um quarto de hora depois ' + currentHour + ': quarter past ' + numberToEnglish(hour12) + '.';
  if (minute === 45) return 'Falta um quarto de hora para ' + followingHour + ': quarter to ' + numberToEnglish(nextHour12) + '.';
  if (minute === 30) return 'Passou meia hora depois ' + currentHour + ': half past ' + numberToEnglish(hour12) + '. Aos 30, a forma convencional é half past.';
  if (minute < 30) return (minute === 1 ? 'Passou 1 minuto' : 'Passaram ' + minute + ' minutos') + ' depois ' + currentHour + ': past. Dizes o que passou.';
  const minutesRemaining = 60 - minute;
  return (minutesRemaining === 1 ? 'Falta 1 minuto' : 'Faltam ' + minutesRemaining + ' minutos') + ' para ' + followingHour + ': to. Dizes o que falta, em contagem decrescente.';
}
