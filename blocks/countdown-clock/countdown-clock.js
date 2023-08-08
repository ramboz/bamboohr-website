import { readBlockConfig } from '../../scripts/scripts.js';

function createElementWithClass(className) {
    const element = document.createElement('div');
    element.classList.add(className);
    return element;
}

function createCountdownValueElement(unitText) {
    const valueElem = createElementWithClass('countdown-value');

    const numberElem = createElementWithClass('countdown-number');
    valueElem.appendChild(numberElem);

    const unitElem = createElementWithClass('countdown-unit');
    unitElem.classList.add('typ-small-info');
    unitElem.textContent = unitText;
    valueElem.appendChild(unitElem);

    return valueElem;
}

function createSemicolonElement() {
    const semicolonElem = createElementWithClass('countdown-semicolon');
    semicolonElem.textContent = ':';
    return semicolonElem;
}

function createCountdownTimer(targetDate) {
    const countdownElem = createElementWithClass('countdown-timer');
    const countdownDisplay = createElementWithClass('countdown-display');
    countdownElem.appendChild(countdownDisplay);

    countdownDisplay.appendChild(createCountdownValueElement('DAYS'));
    countdownDisplay.appendChild(createSemicolonElement());
    countdownDisplay.appendChild(createCountdownValueElement('HOURS'));
    countdownDisplay.appendChild(createSemicolonElement());
    countdownDisplay.appendChild(createCountdownValueElement('MINUTES'));

    const daysNum = countdownDisplay.querySelector('.countdown-value:nth-child(1) .countdown-number');
    const hoursNum = countdownDisplay.querySelector('.countdown-value:nth-child(3) .countdown-number');
    const minutesNum = countdownDisplay.querySelector('.countdown-value:nth-child(5) .countdown-number');

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
    const blockConfig = readBlockConfig(block);
    let countdownDate = blockConfig['start-time']; // Assuming the countdownDate is in ISO format (e.g., '2023-12-31T23:59:59')
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
