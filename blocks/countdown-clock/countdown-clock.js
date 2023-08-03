import { readBlockConfig } from '../../scripts/scripts.js';

function createCountdownTimer(targetDate) {
    const countdownElem = document.createElement('div');
    countdownElem.classList.add('countdown-timer');

    const countdownDisplay = document.createElement('div');
    countdownDisplay.classList.add('countdown-display');
    countdownElem.appendChild(countdownDisplay);
    
    const daysElem = document.createElement('div');
    daysElem.classList.add('countdown-value');
    const daysNum = document.createElement('div');
    daysNum.classList.add('countdown-number');
    daysElem.appendChild(daysNum);
    const daysText = document.createElement('div');
    daysText.classList.add('countdown-unit');
    daysText.classList.add('typ-small-info');
    daysText.textContent = 'DAYS';
    daysElem.appendChild(daysText);
    countdownDisplay.appendChild(daysElem);

    const semiColon1 = document.createElement('div');
    semiColon1.classList.add('countdown-semicolon');
    semiColon1.textContent = ':';
    countdownDisplay.appendChild(semiColon1);

    const hoursElem = document.createElement('div');
    hoursElem.classList.add('countdown-value');
    const hoursNum = document.createElement('div');
    hoursNum.classList.add('countdown-number');
    hoursElem.appendChild(hoursNum);
    const hoursText = document.createElement('div');
    hoursText.classList.add('countdown-unit');
    hoursText.classList.add('typ-small-info');
    hoursText.textContent = 'HOURS';
    hoursElem.appendChild(hoursText);
    countdownDisplay.appendChild(hoursElem);

    const semiColon2 = semiColon1.cloneNode(true);
    countdownDisplay.appendChild(semiColon2);

    const minutesElem = document.createElement('div');
    minutesElem.classList.add('countdown-value');
    const minutesNum = document.createElement('div');
    minutesNum.classList.add('countdown-number');
    minutesElem.appendChild(minutesNum);
    const minutesText = document.createElement('div');
    minutesText.classList.add('countdown-unit');
    minutesText.classList.add('typ-small-info');
    minutesText.textContent = 'MINUTES';
    minutesElem.appendChild(minutesText);
    countdownDisplay.appendChild(minutesElem);

    let countdownInterval;

    function updateCountdown() {
        const now = new Date().getTime();
        const timeDifference = targetDate - now;

        if (timeDifference <= 0) {
        clearInterval(countdownInterval);
        countdownElem.textContent = ""; // Display a blank text rather than the countdown clock
        } else {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

        daysNum.textContent = days.toString().padStart(2, '0');
        hoursNum.textContent = hours.toString().padStart(2, '0');
        minutesNum.textContent = minutes.toString().padStart(2, '0');
        }
    }

    // Initial call to update the countdown
    updateCountdown();

    // Set up interval for updating countdown every second
    countdownInterval = setInterval(updateCountdown, 1000);

    return countdownElem;
}

export default async function decorate(block) {
    const config = readBlockConfig(block);
    let countdownDate = '2023-12-31T23:39:59'; // Assuming the countdownDate is in ISO format (e.g., '2023-12-31T23:59:59')
    block.innerHTML = '';

    if (countdownDate) {
        const targetDate = new Date(countdownDate).getTime();
        if (isNaN(targetDate)) {
        // Invalid date, show an appropriate message
        block.textContent = "Invalid countdown date";
        } else {
        const countdownTimer = createCountdownTimer(targetDate);
        block.appendChild(countdownTimer);
        }
    } else {
        // Show a message when countdownDate is missing
        block.textContent = "Countdown date not provided";
    }
}
