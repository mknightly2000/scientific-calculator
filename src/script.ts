const isDigit = (char: string | undefined): boolean => {
    return char !== undefined && /[0-9]/.test(char);
};

/* State */
let angleType: string = "deg"

/* Areas */
const inputTextArea = document.getElementById('output-operation-input') as HTMLTextAreaElement;
const outputResult = document.getElementById('output-result') as HTMLDivElement;

/* Buttons */
const btnClear = document.getElementById('btn-c') as HTMLButtonElement;
const btnBackspace = document.getElementById('btn-backspace') as HTMLButtonElement;
const btnMore = document.getElementById('btn-more') as HTMLButtonElement;
const btnZero = document.getElementById('btn-zero') as HTMLButtonElement;
const btnDecimal = document.getElementById('btn-decimal') as HTMLButtonElement;
const btnAngleType = document.getElementById('btn-angle-type') as HTMLButtonElement;
const angleTypeSpan = document.getElementById('angle-type-span') as HTMLSpanElement;
const funcButtons = document.querySelectorAll('.func');
const btnFactorial = document.getElementById('btn-factorial') as HTMLButtonElement;

/**
 * Clears the entire input operation area and the result area.
 */
const handleClearClick = (): void => {
    if (inputTextArea) {
        inputTextArea.value = '';
    }
    if (outputResult) {
        outputResult.innerText = '';
    }
};

/**
 * Removes the last character from the input area.
 */
const handleBackspaceClick = (): void => {
    if (inputTextArea && inputTextArea.value.length > 0) {
        inputTextArea.value = inputTextArea.value.slice(0, -1);
        inputTextArea.scrollLeft = inputTextArea.scrollWidth;
    }
};

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
 * Appends an operator to the input if the preceding character is valid.
 */
const handleBasicOperatorClick = (operator: string): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    // Characters that are allowed to precede a basic math operator
    const validPrecedingChars = ['π', 'e', '!', '%', ')'];

    // Exception: Allow a minus sign at the very beginning or after an opening parenthesis
    if (operator === '-' && (!currentStr || lastChar === '(')) {
        appendCharacterToInput(operator);
        return;
    }

    // If the last character is already an operator, replace it
    if (['+', '-', '×', '÷'].includes(lastChar)) {
        // Prevent replacing a minus sign if it's the only character or follows an open parenthesis
        if (lastChar === '-' && (currentStr.length === 1 || currentStr[currentStr.length - 2] === '(')) {
            return;
        }

        inputTextArea.value = currentStr.slice(0, -1) + operator;
        inputTextArea.scrollLeft = inputTextArea.scrollWidth;
        return;
    }

    // Only append the operator if the last character is a digit or in the valid list
    if (isDigit(lastChar) || validPrecedingChars.includes(lastChar)) {
        appendCharacterToInput(operator);
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

/**
 * Cycles the angle type between Degrees, Radians, and Gradians.
 * Updates both the active state display and the button text for the next state.
 */
const handleAngleTypeClick = (): void => {
    if (!btnAngleType || !angleTypeSpan) return;

    const currentBtnText = btnAngleType.innerText;

    if (currentBtnText === 'Rad') {
        angleType = 'rad'
        angleTypeSpan.innerText = 'Rad';
        btnAngleType.innerText = 'Grad';
    } else if (currentBtnText === 'Grad') {
        angleType = "grad"
        angleTypeSpan.innerText = 'Grad';
        btnAngleType.innerText = 'Deg';
    } else if (currentBtnText === 'Deg') {
        angleType = 'deg'
        angleTypeSpan.innerText = 'Deg';
        btnAngleType.innerText = 'Rad';
    }
};

/**
 * Appends a math function to the input area.
 * Automatically inserts a multiplication sign if preceded by a digit or constant.
 */
const handleMathFunctionClick = (funcStr: string): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    // Characters that should trigger an automatic multiplication sign before a function
    const charsTriggeringMultiplication = ['π', 'e', '!', '%', ')'];

    // If the preceding character is a digit or a specific constant/symbol, add '×'
    if (isDigit(lastChar) || charsTriggeringMultiplication.includes(lastChar)) {
        appendCharacterToInput('×' + funcStr);
    } else {
        appendCharacterToInput(funcStr);
    }
};

/**
 * Appends a mathematical constant (π, e) to the input area.
 * Automatically inserts a multiplication sign if preceded by a digit, constant, factorial, percent, or closing parenthesis.
 */
const handleConstantClick = (constantStr: string): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    // Characters that should trigger an automatic multiplication sign before a constant
    const charsTriggeringMultiplication = ['π', 'e', '!', '%', ')'];

    // If the preceding character is a digit or a specific constant/symbol, add '×'
    if (isDigit(lastChar) || charsTriggeringMultiplication.includes(lastChar)) {
        appendCharacterToInput('×' + constantStr);
    } else {
        appendCharacterToInput(constantStr);
    }
};

/**
 * Appends a factorial symbol (!) to the input area.
 * Only allows appending if the preceding character is a digit, π, e, %, or a closing parenthesis.
 */
const handleFactorialClick = (): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    // Characters that are allowed to precede a factorial symbol
    const validPrecedingChars = ['π', 'e', '%', ')'];

    // Only append the factorial if the last character is a digit or in the valid list
    if (isDigit(lastChar) || validPrecedingChars.includes(lastChar)) {
        appendCharacterToInput('!');
    }
};

/* Event Listeners */
btnClear.addEventListener('click', handleClearClick);
btnBackspace.addEventListener('click', handleBackspaceClick);
btnMore.addEventListener('click', toggleFunctions);
btnZero.addEventListener('click', handleZeroClick);
btnDecimal.addEventListener('click', handleDecimalClick);
btnAngleType.addEventListener('click', handleAngleTypeClick);
btnFactorial.addEventListener('click', handleFactorialClick);
  
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
    btn.addEventListener('click', () => {
            appendCharacterToInput(numBtnMap[id]);
    });
});

// Attach click event listeners to the operator buttons
const basicOperatorBtnMap: Record<string, string> = {
    'btn-plus': '+',
    'btn-minus': '-',
    'btn-times': '×',
    'btn-divide': '÷'
};
Object.keys(basicOperatorBtnMap).forEach(id => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    btn.addEventListener('click', () => {
        handleBasicOperatorClick(basicOperatorBtnMap[id]);
    });
});

// Attach click event listeners to the math function buttons
const mathFuncMap: Record<string, string> = {
    'btn-sin': 'sin(',
    'btn-cos': 'cos(',
    'btn-tan': 'tan(',
    'btn-ln': 'ln(',
    'btn-log': 'log(',
    'btn-sinh': 'sinh(',
    'btn-cosh': 'cosh(',
    'btn-tanh': 'tanh(',
    'btn-asin': 'asin(',
    'btn-acos': 'acos(',
    'btn-atan': 'atan(',
    'btn-asinh': 'asinh(',
    'btn-acosh': 'acosh(',
    'btn-atanh': 'atanh(',
    'btn-square-root': '√(',
    'btn-abs': 'abs('
};
Object.keys(mathFuncMap).forEach(id => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    btn.addEventListener('click', () => {
        handleMathFunctionClick(mathFuncMap[id]);
    });
});

// Attach click event listeners to the constant buttons
const constantBtnMap: Record<string, string> = {
    'btn-pi': 'π',
    'btn-e': 'e'
};
Object.keys(constantBtnMap).forEach(id => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    btn.addEventListener('click', () => {
        handleConstantClick(constantBtnMap[id]);
    });
});