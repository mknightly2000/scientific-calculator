const isDigit = (char: string | undefined): boolean => {
    return char !== undefined && /[0-9]/.test(char);
};

/* Areas */
const inputTextArea = document.getElementById('output-operation-input') as HTMLTextAreaElement;

/* Buttons */
const btnMore = document.getElementById('btn-more') as HTMLButtonElement;
const btnZero = document.getElementById('btn-zero') as HTMLButtonElement;
const btnDecimal = document.getElementById('btn-decimal') as HTMLButtonElement;
const funcButtons = document.querySelectorAll('.func');

/**
 * Appends a character to the output operation text area.
 */
const appendCharacterToInput = (char: string): void => {
    if (inputTextArea) {
        inputTextArea.value += char;
        // Scroll to the far right to keep the newest input in view
        inputTextArea.scrollLeft = inputTextArea.scrollWidth;
    }
};

/**
 * Appends a zero to the input area, preventing multiple leading zeros.
 */
const handleZeroClick = (): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];
    const secondToLastChar = currentStr[currentStr.length - 2];

    // Prevent multiple leading zeros
    if (lastChar === '0' && secondToLastChar !== '.' && !isDigit(secondToLastChar)) {
        return;
    }

    appendCharacterToInput('0');
};

/**
 * Appends a decimal to the input, preventing multiple decimals in a single number.
 */
const handleDecimalClick = (): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    // Handle empty input case
    if (!currentStr) {
        appendCharacterToInput('0.');
        return;
    }

    if (lastChar === '.') {
        // Prevent consecutive decimals
        return;
    } else if (!isDigit(lastChar)) {
        // If the last character is an operator or parenthesis, append '0.'
        appendCharacterToInput('0.');
    } else {
        // Look backwards to see if the current number already has a decimal
        for (let i = currentStr.length - 1; i >= 0; i--) {
            const char = currentStr[i];

            if (char === '.') {
                return; // Decimal already exists in the current number
            } else if (!isDigit(char)) {
                break; // Reached an operator, meaning we are safe to add a decimal
            }
        }

        appendCharacterToInput('.');
    }
};

/**
 * Toggles the visibility of primary and secondary function buttons.
 * Since we have two buttons for each slot (one visible, one hidden),
 * we simply flip the 'hidden' class on all of them.
 */
const toggleFunctions = (): void => {
    funcButtons.forEach(btn => {
        btn.classList.toggle('hidden');
    });

    // Update the "more" indicator in the display
    const moreSpan = document.getElementById('more-span');
    if (moreSpan) {
        const isShifted = !document.getElementById('btn-sin')?.classList.contains('hidden');
        moreSpan.innerHTML = isShifted ? "" : "&#8644;";
    }
};

/* Event Listeners */
btnMore.addEventListener('click', toggleFunctions);
btnZero.addEventListener('click', handleZeroClick);
btnDecimal.addEventListener('click', handleDecimalClick);

// Attach click event listeners to the number buttons
const numBtnMap: Record<string, string> = {
    'btn-one': '1',
    'btn-two': '2',
    'btn-three': '3',
    'btn-four': '4',
    'btn-five': '5',
    'btn-six': '6',
    'btn-seven': '7',
    'btn-eight': '8',
    'btn-nine': '9'
};
Object.keys(numBtnMap).forEach(id => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    if (btn) {
        btn.addEventListener('click', () => {
            appendCharacterToInput(numBtnMap[id]);
        });
    }
});


