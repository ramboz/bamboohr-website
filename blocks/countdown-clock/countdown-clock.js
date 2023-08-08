import { readBlockConfig, createElem } from '../../scripts/scripts.js';
  
function createCountdownTimer(targetDate) {
    const countdownElem = createElem('div', 'countdown-timer');
    const countdownDisplay = createElem('div', 'countdown-display');
    countdownElem.appendChild(countdownDisplay);

    const daysElem = createElem('div', 'countdown-value', 'countdown-unit', 'typ-small-info', 'days-unit');
    const daysNum = createElem('div', 'countdown-number');
    daysElem.appendChild(daysNum);
    const daysText = createElem('div', 'countdown-unit', 'typ-small-info');
    daysText.textContent = 'DAYS';
    daysElem.appendChild(daysText);
    countdownDisplay.appendChild(daysElem);

    countdownDisplay.appendChild(createElem('div', 'countdown-semicolon')).textContent = ':';

    const hoursElem = createElem('div', 'countdown-value', 'countdown-unit', 'typ-small-info', 'hours-unit');
    const hoursNum = createElem('div', 'countdown-number');
    hoursElem.appendChild(hoursNum);
    const hoursText = createElem('div', 'countdown-unit', 'typ-small-info');
    hoursText.textContent = 'HOURS';
    hoursElem.appendChild(hoursText);
    countdownDisplay.appendChild(hoursElem);

    countdownDisplay.appendChild(createElem('div', 'countdown-semicolon')).textContent = ':';

    const minutesElem = createElem('div', 'countdown-value', 'countdown-unit', 'typ-small-info', 'minutes-unit');
    const minutesNum = createElem('div', 'countdown-number');
    minutesElem.appendChild(minutesNum);
    const minutesText = createElem('div', 'countdown-unit', 'typ-small-info');
    minutesText.textContent = 'MINUTES';
    minutesElem.appendChild(minutesText);
    countdownDisplay.appendChild(minutesElem);

    let countdownInterval;

    function updateCountdown() {
        const now = new Date().getTime();
        const timeDifference = targetDate - now;

        if (timeDifference <= 0) {
            clearInterval(countdownInterval);
            daysNum.textContent = '00';
            hoursNum.textContent = '00';
            minutesNum.textContent = '00';
        } else {
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

            daysNum.textContent = days.toString().padStart(2, '0');
            hoursNum.textContent = hours.toString().padStart(2, '0');
            minutesNum.textContent = minutes.toString().padStart(2, '0');
        }
    }

    updateCountdown();

    countdownInterval = setInterval(updateCountdown, 1000);

    return countdownElem;
}

export default async function decorate(block) {
    const blockConfig = readBlockConfig(block);
    const countdownDate = blockConfig['start-time'];
    block.innerHTML = '';

    if (countdownDate) {
        const targetDate = new Date(countdownDate).getTime();
        if (isNaN(targetDate)) {
            block.textContent = "Invalid countdown date";
        } else {
            const countdownTimer = createCountdownTimer(targetDate);
            block.appendChild(countdownTimer);
        }
    } else {
        block.textContent = "Countdown date not provided";
    }
}
  