/* Desenha o relógio SVG e liga o arrasto dos ponteiros à hora da aplicação. */

const svgNamespace = 'http://www.w3.org/2000/svg';

/** Cria um elemento SVG, define atributos e devolve o elemento criado. */
function appendSvgElement(parentElement, tagName, attributes, textContent = null) {
  const element = document.createElementNS(svgNamespace, tagName);
  for (const [attributeName, attributeValue] of Object.entries(attributes)) element.setAttribute(attributeName, attributeValue);
  if (textContent !== null) element.textContent = textContent;
  parentElement.appendChild(element);
  return element;
}

/** Constrói um relógio visual e devolve uma função para atualizar os ponteiros. */
export function createClock(clockSvg, showInteractiveHandle = false) {
  clockSvg.setAttribute('viewBox', '-190 -190 380 380');
  clockSvg.setAttribute('role', 'img');
  const clockRadius = 150;
  appendSvgElement(clockSvg, 'circle', { r: 176, fill: 'var(--panel)', stroke: 'var(--line)', 'stroke-width': 2 });
  const halfLabels = appendSvgElement(clockSvg, 'g', {});
  const pastHalf = appendSvgElement(halfLabels, 'path', { d: `M0 ${-clockRadius}A${clockRadius} ${clockRadius} 0 0 1 0 ${clockRadius}Z`, fill: 'var(--pastbg)' });
  const toHalf = appendSvgElement(halfLabels, 'path', { d: `M0 ${-clockRadius}A${clockRadius} ${clockRadius} 0 0 0 0 ${clockRadius}Z`, fill: 'var(--tobg)' });
  const halfLabelStyle = { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600 };
  appendSvgElement(halfLabels, 'text', { ...halfLabelStyle, x: 50, y: -34, fill: 'var(--past)' }, 'past');
  appendSvgElement(halfLabels, 'text', { ...halfLabelStyle, x: -50, y: -34, fill: 'var(--to)' }, 'to');

  // Marca cada minuto e destaca os doze números principais do mostrador.
  for (let minuteMark = 0; minuteMark < 60; minuteMark++) {
    const angle = minuteMark * Math.PI / 30;
    const horizontalPosition = Math.sin(angle);
    const verticalPosition = -Math.cos(angle);
    const markLength = minuteMark % 5 ? 6 : 14;
    appendSvgElement(clockSvg, 'line', {
      x1: horizontalPosition * clockRadius, y1: verticalPosition * clockRadius,
      x2: horizontalPosition * (clockRadius - markLength), y2: verticalPosition * (clockRadius - markLength),
      stroke: 'var(--ink)', 'stroke-width': minuteMark % 5 ? 1 : 2.5, opacity: minuteMark % 5 ? .45 : 1
    });
  }
  for (let hourNumber = 1; hourNumber <= 12; hourNumber++) {
    const angle = hourNumber * Math.PI / 6;
    const horizontalPosition = Math.sin(angle);
    const verticalPosition = -Math.cos(angle);
    const centeredText = { 'text-anchor': 'middle', 'dominant-baseline': 'central' };
    appendSvgElement(clockSvg, 'text', { ...centeredText, x: horizontalPosition * 112, y: verticalPosition * 112, 'font-size': 24, 'font-weight': 600, fill: 'var(--ink)' }, hourNumber);
    appendSvgElement(clockSvg, 'text', { ...centeredText, x: horizontalPosition * 163, y: verticalPosition * 163, 'font-size': 10, fill: 'var(--muted)' }, hourNumber * 5);
  }

  const hourHand = appendSvgElement(clockSvg, 'g', {});
  appendSvgElement(hourHand, 'line', { y2: -78, stroke: 'var(--ink)', 'stroke-width': 10, 'stroke-linecap': 'round' });
  const minuteHand = appendSvgElement(clockSvg, 'g', {});
  const minuteHandLine = appendSvgElement(minuteHand, 'line', { y2: -132, 'stroke-width': 6, 'stroke-linecap': 'round' });
  const interactiveHandle = showInteractiveHandle ? appendSvgElement(minuteHand, 'circle', { cy: -132, r: 10, stroke: 'var(--panel)', 'stroke-width': 3 }) : null;
  appendSvgElement(clockSvg, 'circle', { r: 8, fill: 'var(--ink)' });

  return {
    svg: clockSvg,
    /** Atualiza os ponteiros e, opcionalmente, as metades past/to. */
    update(minutesSinceMidnight, showHalfLabels = true) {
      const minute = minutesSinceMidnight % 60;
      const handColor = !showHalfLabels || !minute ? 'var(--ink)' : minute <= 30 ? 'var(--past)' : 'var(--to)';
      hourHand.setAttribute('transform', `rotate(${(minutesSinceMidnight % 720) / 2})`);
      minuteHand.setAttribute('transform', `rotate(${minute * 6})`);
      minuteHandLine.setAttribute('stroke', handColor);
      if (interactiveHandle) interactiveHandle.setAttribute('fill', handColor);
      halfLabels.style.display = showHalfLabels ? '' : 'none';
      pastHalf.setAttribute('opacity', minute >= 1 && minute <= 30 ? 1 : .3);
      toHalf.setAttribute('opacity', minute > 30 ? 1 : .3);
    }
  };
}

/** Permite arrastar a zona exterior para ajustar minutos e o centro para ajustar horas. */
export function enableClockDragging(clock, getCurrentTime, setCurrentTime) {
  const clockSvg = clock.svg;
  let draggedHand = null;

  // Converte o ponto do ecrã para distância e ângulo dentro do relógio.
  function getClockPosition(pointerEvent) {
    const bounds = clockSvg.getBoundingClientRect();
    const horizontalPosition = (pointerEvent.clientX - bounds.left) / bounds.width * 380 - 190;
    const verticalPosition = (pointerEvent.clientY - bounds.top) / bounds.height * 380 - 190;
    return {
      distanceFromCenter: Math.hypot(horizontalPosition, verticalPosition),
      angle: (Math.atan2(horizontalPosition, -verticalPosition) * 180 / Math.PI + 360) % 360
    };
  }

  function updateTimeFromPointer(pointerEvent) {
    if (!draggedHand) return;
    const pointerPosition = getClockPosition(pointerEvent);
    let minutesSinceMidnight = getCurrentTime();
    if (draggedHand === 'minute') {
      const selectedMinute = Math.round(pointerPosition.angle / 6) % 60;
      const previousMinute = minutesSinceMidnight % 60;
      let hour24 = Math.floor(minutesSinceMidnight / 60);
      if (previousMinute >= 45 && selectedMinute <= 15) hour24++;
      else if (previousMinute <= 15 && selectedMinute >= 45) hour24--;
      minutesSinceMidnight = ((hour24 * 60 + selectedMinute) % 1440 + 1440) % 1440;
    } else {
      const minute = minutesSinceMidnight % 60;
      const selectedHour = Math.round((((pointerPosition.angle - minute / 2) % 360 + 360) % 360) / 30) % 12;
      minutesSinceMidnight = (minutesSinceMidnight >= 720 ? 720 : 0) + selectedHour * 60 + minute;
    }
    setCurrentTime(minutesSinceMidnight);
  }

  clockSvg.addEventListener('pointerdown', pointerEvent => {
    draggedHand = getClockPosition(pointerEvent).distanceFromCenter > 88 ? 'minute' : 'hour';
    clockSvg.setPointerCapture(pointerEvent.pointerId);
    updateTimeFromPointer(pointerEvent);
  });
  clockSvg.addEventListener('pointermove', updateTimeFromPointer);
  clockSvg.addEventListener('pointerup', () => { draggedHand = null; });
  clockSvg.addEventListener('pointercancel', () => { draggedHand = null; });
}
