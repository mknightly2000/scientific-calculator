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
const btnParenthesis = document.getElementById('btn-parenthesis') as HTMLButtonElement;
const btnPercentage = document.getElementById('btn-percentage') as HTMLButtonElement;
const btnReciprocal = document.getElementById('btn-reciprocal') as HTMLButtonElement;
const btnSwitchSign = document.getElementById('btn-switch-sign') as HTMLButtonElement;

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
 * Appends a number (1-9) to the input area.
 * Automatically inserts a multiplication sign if preceded by a constant or closing parenthesis.
 * Replaces standalone leading zeros to prevent octal evaluation errors.
 */
const handleNumberClick = (numStr: string): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];
    const secondToLastChar = currentStr[currentStr.length - 2];

    // Check if the last character is a standalone leading zero
    if (lastChar === '0' && secondToLastChar !== '.' && !isDigit(secondToLastChar)) {
        // Replace the standalone '0' with the new number
        inputTextArea.value = currentStr.slice(0, -1) + numStr;
        inputTextArea.scrollLeft = inputTextArea.scrollWidth;
        return;
    }

    // Characters that should trigger an automatic multiplication sign before a number
    const charsTriggeringMultiplication = ['π', 'e', '!', '%', ')'];

    if (charsTriggeringMultiplication.includes(lastChar)) {
        appendCharacterToInput('×' + numStr);
    } else {
        appendCharacterToInput(numStr);
    }
};

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
 * Removes the last character or complete token from the input area.
 */
const handleBackspaceClick = (): void => {
    if (!inputTextArea || inputTextArea.value.length === 0) return;

    let currentStr = inputTextArea.value;

    // Multi-character tokens that should be deleted as a single block.
    // Ordered by length descending so longer tokens (e.g. 'asinh(') match before shorter ones ('sinh(').
    const multiCharTokens = [
        'asinh(', 'acosh(', 'atanh(',
        'sinh(', 'cosh(', 'tanh(', 'asin(', 'acos(', 'atan(',
        'sin(', 'cos(', 'tan(', 'log(', 'abs(',
        'ln(', '√(', 'mod'
    ];

    let tokenRemoved = false;

    for (const token of multiCharTokens) {
        if (currentStr.endsWith(token)) {
            currentStr = currentStr.slice(0, -token.length);
            tokenRemoved = true;
            break;
        }
    }

    // If no multi-character token was at the end, remove just the single last character
    if (!tokenRemoved) {
        currentStr = currentStr.slice(0, -1);
    }

    inputTextArea.value = currentStr;
    inputTextArea.scrollLeft = inputTextArea.scrollWidth;
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

    // Characters that should trigger an automatic multiplication sign before a number
    const charsTriggeringMultiplication = ['π', 'e', '!', '%', ')'];

    if (charsTriggeringMultiplication.includes(lastChar)) {
        appendCharacterToInput('×0');
    } else {
        appendCharacterToInput('0');
    }
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
    }

    // Characters that should trigger an automatic multiplication sign
    const charsTriggeringMultiplication = ['π', 'e', '!', '%', ')'];

    if (charsTriggeringMultiplication.includes(lastChar)) {
        // If preceded by a constant or closed group, multiply by 0.
        appendCharacterToInput('×0.');
    } else if (!isDigit(lastChar)) {
        // If the last character is an operator or open parenthesis, append '0.'
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

    if (lastChar === '.') return;

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

    if (lastChar === '.') return;

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

    if (lastChar === '.') return;

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

    if (lastChar === '.') return;

    // Characters that are allowed to precede a factorial symbol
    const validPrecedingChars = ['π', 'e', '%', ')'];

    // Only append the factorial if the last character is a digit or in the valid list
    if (isDigit(lastChar) || validPrecedingChars.includes(lastChar)) {
        appendCharacterToInput('!');
    }
};

/**
 * Appends an open or close parenthesis based on the current input context.
 * Automatically inserts a multiplication sign before an open parenthesis if preceded by a digit or constant.
 */
const handleParenthesisClick = (): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    if (lastChar === '.') return;

    // Count existing open and close parentheses in the string
    const openCount = (currentStr.match(/\(/g) || []).length;
    const closeCount = (currentStr.match(/\)/g) || []).length;

    // Characters that allow closing a parenthesis or trigger auto-multiplication before an opening one
    const validPrecedingChars = ['π', 'e', '!', '%', ')'];

    // Determine if it is mathematically valid to close a parenthesis right now
    const canClose = openCount > closeCount && (isDigit(lastChar) || validPrecedingChars.includes(lastChar));

    if (canClose) {
        appendCharacterToInput(')');
    } else {
        // Opening a parenthesis. Check if we need a multiplication sign first.
        if (isDigit(lastChar) || validPrecedingChars.includes(lastChar)) {
            appendCharacterToInput('×(');
        } else {
            appendCharacterToInput('(');
        }
    }
};

/**
 * Appends mod, nPr (P), or nCr (C) to the input area.
 * Only allows appending if the preceding character is a digit, ), π, e, or %.
 */
const handleCombinatoricsClick = (operatorStr: string): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    if (lastChar === '.') return;

    // Characters that are allowed to precede mod, P, or C
    const validPrecedingChars = [')', 'π', 'e', '%'];

    // Only append if the last character is a digit or in the valid list
    if (isDigit(lastChar) || validPrecedingChars.includes(lastChar)) {
        appendCharacterToInput(operatorStr);
    }
};

/**
 * Appends a percentage symbol (%) to the input area.
 * Only allows appending if the preceding character is a digit, π, e, %, or a closing parenthesis.
 */
const handlePercentageClick = (): void => {
    const currentStr = inputTextArea.value;
    const lastChar = currentStr[currentStr.length - 1];

    if (lastChar === '.') return;

    // Characters that are allowed to precede a percentage symbol
    const validPrecedingChars = ['π', 'e', '%', ')'];

    // Only append the percentage if the last character is a digit or in the valid list
    if (isDigit(lastChar) || validPrecedingChars.includes(lastChar)) {
        appendCharacterToInput('%');
    }
};

/**
 * Appends a reciprocal operation (1÷) to the current term.
 * It intelligently finds the start of the last term by traversing backwards and inserts '(1÷' before it.
 */
const handleReciprocalClick = (): void => {
    const currentStr = inputTextArea.value;
    let depth = 0;
    let i = currentStr.length - 1;

    // Traverse backwards to find the start of the last term
    while (i >= 0) {
        const char = currentStr[i];

        if (char === ')') {
            depth++;
        } else if (char === '(') {
            depth--;
            // If depth drops below 0, we've hit an open parenthesis belonging to a function or group
            if (depth < 0) {
                break;
            }
        } else if (depth === 0) {
            // If we are outside of any parentheses, break at standard or combinatorics operators
            if (['+', '-', '×', '÷', 'P', 'C'].includes(char)) {
                break;
            }
            // Break if we hit the end of the 'mod' operator
            if (char === 'd' && i >= 2 && currentStr.slice(i - 2, i + 1) === 'mod') {
                break;
            }
        }
        i--;
    }

    // Split the string and insert '(1÷'
    const splitIndex = i + 1;
    const prefix = currentStr.slice(0, splitIndex);
    const term = currentStr.slice(splitIndex);

    inputTextArea.value = prefix + '(1÷' + term;
    inputTextArea.scrollLeft = inputTextArea.scrollWidth;
};

/**
 * Toggles the sign of the current term (+/-).
 * Intelligently parses backwards to determine the boundaries of the last term,
 * and either wraps it in (-...), removes existing wrap, or flips adjacent operators.
 */
const handleSwitchSignClick = (): void => {
    const currentStr = inputTextArea.value;

    const lastChar = currentStr[currentStr.length - 1];

    if (lastChar === '.') return;

    // If the input is completely empty, start with a negative sign
    if (!currentStr) {
        appendCharacterToInput('-');
        return;
    }

    // If the last character is a plus sign, replace it with a minus sign
    if (currentStr.endsWith('+')) {
        inputTextArea.value = currentStr.slice(0, -1) + '-';
        inputTextArea.scrollLeft = inputTextArea.scrollWidth;
        return;
    }

    let depth = 0;
    let i = currentStr.length - 1;

    // Traverse backwards to find the start of the last term
    while (i >= 0) {
        const char = currentStr[i];

        if (char === ')') {
            depth++;
        } else if (char === '(') {
            depth--;
            // If depth drops below 0, we've hit an open parenthesis belonging to a function or group
            if (depth < 0) {
                break;
            }
        } else if (depth === 0) {
            // If we are outside of any parentheses, break at standard or combinatorics operators
            if (['+', '-', '×', '÷', 'P', 'C'].includes(char)) {
                break;
            }
            // Break if we hit the end of the 'mod' operator
            if (char === 'd' && i >= 2 && currentStr.slice(i - 2, i + 1) === 'mod') {
                break;
            }
        }
        i--;
    }

    const splitIndex = i + 1;
    let prefix = currentStr.slice(0, splitIndex);
    let term = currentStr.slice(splitIndex);

    // 1) If the term is already safely wrapped in (- ... ), unwrap it
    if (term.startsWith('(-') && term.endsWith(')')) {
        term = term.slice(2, -1);
    }
    // 2) If the prefix ends with a minus sign
    else if (prefix.endsWith('-')) {
        if (prefix === '-') {
            // Unary minus at the very start: -100 => 100
            prefix = '';
        } else if (prefix.endsWith('(-')) {
            // Preceded by an open parenthesis: (-6 => (6
            prefix = prefix.slice(0, -1);
        } else {
            // Check if it's a binary minus (e.g., 25-6)
            const charBeforeMinus = prefix[prefix.length - 2];
            if (isDigit(charBeforeMinus) || ['π', 'e', '!', '%', ')'].includes(charBeforeMinus)) {
                prefix = prefix.slice(0, -1) + '+'; // Convert to 25+6
            } else {
                // Unary minus following an unexpected operator fallback
                term = term !== '' ? '(-' + term + ')' : '(-';
            }
        }
    }
    // 3) Default: Wrap the positive term in (- ... )
    else {
        term = term !== '' ? '(-' + term + ')' : '(-';
    }

    inputTextArea.value = prefix + term;
    inputTextArea.scrollLeft = inputTextArea.scrollWidth;
};

/* Event Listeners */
btnClear.addEventListener('click', handleClearClick);
btnBackspace.addEventListener('click', handleBackspaceClick);
btnMore.addEventListener('click', toggleFunctions);
btnZero.addEventListener('click', handleZeroClick);
btnDecimal.addEventListener('click', handleDecimalClick);
btnAngleType.addEventListener('click', handleAngleTypeClick);
btnFactorial.addEventListener('click', handleFactorialClick);
btnParenthesis.addEventListener('click', handleParenthesisClick);
btnPercentage.addEventListener('click', handlePercentageClick);
btnReciprocal.addEventListener('click', handleReciprocalClick);
btnSwitchSign.addEventListener('click', handleSwitchSignClick);

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
        handleNumberClick(numBtnMap[id]);
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


// Attach click event listeners to the mod, nPr, and nCr buttons
const combinatoricsBtnMap: Record<string, string> = {
    'btn-mod': 'mod',
    'btn-npr': 'P',
    'btn-ncr': 'C'
};
Object.keys(combinatoricsBtnMap).forEach(id => {
    const btn = document.getElementById(id) as HTMLButtonElement;
    btn.addEventListener('click', () => {
        handleCombinatoricsClick(combinatoricsBtnMap[id]);
    });
});