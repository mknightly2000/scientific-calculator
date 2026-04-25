const isDigit = (char: string | undefined): boolean => {
    return char !== undefined && /[0-9]/.test(char);
};

// --- Constants ---
// Characters that should trigger an automatic multiplication sign before a number
const AUTO_MULTIPLY_TRIGGERS = ['π', 'e', '!', '%', ')'];
// Characters that represent the end of a mathematical term
const VALID_TERM_ENDINGS = [')', 'π', 'e', '%', '!'];

// --- State ---
let angleType: string = "deg"

// --- Areas ---
const inputTextArea = document.getElementById('output-operation-input') as HTMLTextAreaElement;
const outputResult = document.getElementById('output-result') as HTMLDivElement;

// --- Buttons ---
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
const btnEquals = document.getElementById('btn-equals') as HTMLButtonElement;

// --- Helpers ---
const getInput = () => inputTextArea.value;
const getLastChar = () => {
    const val = getInput();
    return val[val.length - 1];
};
const setInput = (newVal: string) => {
    inputTextArea.value = newVal;
    inputTextArea.scrollLeft = inputTextArea.scrollWidth;
};
const appendStringToInput = (str: string): void => {
    if (inputTextArea) {
        setInput(getInput() + str);
    }
};
/**
 * Traverses backwards through the string to find the starting index of the last term.
 */
const findLastTermSplitIndex = (str: string): number => {
    let depth = 0;
    let i = str.length - 1;

    while (i >= 0) {
        const char = str[i];
        if (char === ')') {
            depth++;
        } else if (char === '(') {
            depth--;
            if (depth < 0) break;
        } else if (depth === 0) {
            if (['+', '-', '×', '÷', '^', 'P', 'C'].includes(char)) break;
            if (char === 'd' && i >= 2 && str.slice(i - 2, i + 1) === 'mod') break;
        }
        i--;
    }
    return i + 1;
};

// --- Click Handlers ---
/**
 * Appends a number (1-9) to the input area.
 * Automatically inserts a multiplication sign if preceded by a constant or closing parenthesis.
 * Replaces standalone leading zeros to prevent octal evaluation errors.
 */
const handleNumberClick = (numStr: string): void => {
    const currentStr = getInput();
    const lastChar = getLastChar();
    const secondToLastChar = currentStr[currentStr.length - 2];

    // Check if the last character is a standalone leading zero
    if (lastChar === '0' && secondToLastChar !== '.' && !isDigit(secondToLastChar)) {
        // Replace the standalone '0' with the new number
        setInput(currentStr.slice(0, -1) + numStr);
        return;
    }

    if (AUTO_MULTIPLY_TRIGGERS.includes(lastChar)) {
        appendStringToInput('×' + numStr);
    } else {
        appendStringToInput(numStr);
    }
};

/**
 * Clears the entire input operation area and the result area.
 */
const handleClearClick = (): void => {
    if (inputTextArea) {
        setInput('');
    }
    if (outputResult) {
        outputResult.innerText = '';
    }
};

/**
 * Removes the last character or complete token from the input area.
 */
const handleBackspaceClick = (): void => {
    const currentStr = getInput();
    if (!currentStr) return;

    // Matches any of the specific multi-char tokens exactly at the end of the string ($)
    const tokenRegex = /(asinh\(|acosh\(|atanh\(|sinh\(|cosh\(|tanh\(|asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|abs\(|ln\(|√\(|mod)$/;

    const match = currentStr.match(tokenRegex);

    if (match) {
        // Remove the matched token
        setInput(currentStr.slice(0, -match[0].length));
    } else {
        // Remove a single character
        setInput(currentStr.slice(0, -1));
    }
};

/**
 * Appends a zero to the input area, preventing multiple leading zeros.
 */
const handleZeroClick = (): void => {
    const currentStr = getInput();
    const lastChar = getLastChar();
    const secondToLastChar = currentStr[currentStr.length - 2];

    // Prevent multiple leading zeros
    if (lastChar === '0' && secondToLastChar !== '.' && !isDigit(secondToLastChar)) {
        return;
    }

    if (AUTO_MULTIPLY_TRIGGERS.includes(lastChar)) {
        appendStringToInput('×0');
    } else {
        appendStringToInput('0');
    }
};

/**
 * Appends a decimal to the input, preventing multiple decimals in a single number.
 */
const handleDecimalClick = (): void => {
    const currentStr = getInput();
    const lastChar = getLastChar();

    // Handle empty input case
    if (!currentStr) {
        appendStringToInput('0.');
        return;
    }

    if (lastChar === '.') {
        // Prevent consecutive decimals
        return;
    }

    if (AUTO_MULTIPLY_TRIGGERS.includes(lastChar)) {
        // If preceded by a constant or closed group, multiply by 0.
        appendStringToInput('×0.');
    } else if (!isDigit(lastChar)) {
        // If the last character is an operator or open parenthesis, append '0.'
        appendStringToInput('0.');
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

        appendStringToInput('.');
    }
};

/**
 * Appends an operator to the input if the preceding character is valid.
 */
const handleBasicOperatorClick = (operator: string): void => {
    const currentStr = getInput();
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    // Exception: Allow a minus sign at the very beginning or after an opening parenthesis
    if (operator === '-' && (!currentStr || lastChar === '(')) {
        appendStringToInput(operator);
        return;
    }

    // If the last character is already an operator, replace it
    if (['+', '-', '×', '÷', '^'].includes(lastChar)) {
        // Prevent replacing a minus sign if it's the only character or follows an open parenthesis
        if (lastChar === '-' && (currentStr.length === 1 || currentStr[currentStr.length - 2] === '(')) {
            return;
        }

        // Allow a minus sign after ×, ÷, and ^
        if (['×', '÷', '^'].includes(lastChar) && operator === '-') {
            appendStringToInput('(' + operator);
            return;
        }

        setInput(currentStr.slice(0, -1) + operator);
        return;
    }

    // Only append the operator if the last character is a digit or in the valid list
    if (isDigit(lastChar) || VALID_TERM_ENDINGS.includes(lastChar)) {
        appendStringToInput(operator);
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
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    const operatorsRequiringParenthesis = ['P', 'C', 'd', '^']; // 'd' matches the end of 'mod'

    if (operatorsRequiringParenthesis.includes(lastChar)) {
        // Enforce boundary after combinatorics and exponents: 5P => 5P(sin(
        appendStringToInput('(' + funcStr);
    } else if (isDigit(lastChar) || AUTO_MULTIPLY_TRIGGERS.includes(lastChar)) {
        appendStringToInput('×' + funcStr);
    } else {
        appendStringToInput(funcStr);
    }
};

/**
 * Appends a mathematical constant (π, e) to the input area.
 * Automatically inserts a multiplication sign if preceded by a digit, constant, factorial, percent, or closing parenthesis.
 */
const handleConstantClick = (constantStr: string): void => {
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    const operatorsRequiringParenthesis = ['P', 'C', 'd'];

    if (operatorsRequiringParenthesis.includes(lastChar)) {
        // Enforce boundary after combinatorics and exponents: 5P => 5P(π
        appendStringToInput('(' + constantStr);
    } else if (isDigit(lastChar) || AUTO_MULTIPLY_TRIGGERS.includes(lastChar)) {
        appendStringToInput('×' + constantStr);
    } else {
        appendStringToInput(constantStr);
    }
};

/**
 * Appends a factorial symbol (!) to the input area.
 * Only allows appending if the preceding character is a digit, π, e, %, or a closing parenthesis.
 */
const handleFactorialClick = (): void => {
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    // Only append the factorial if the last character is a digit or in the valid list
    if (isDigit(lastChar) || VALID_TERM_ENDINGS.includes(lastChar)) {
        appendStringToInput('!');
    }
};

/**
 * Appends an open or close parenthesis based on the current input context.
 * Automatically inserts a multiplication sign before an open parenthesis if preceded by a digit or constant.
 */
const handleParenthesisClick = (): void => {
    const currentStr = getInput();
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    // Count existing open and close parentheses in the string
    const openCount = (currentStr.match(/\(/g) || []).length;
    const closeCount = (currentStr.match(/\)/g) || []).length;

    // Determine if it is mathematically valid to close a parenthesis right now
    const canClose = openCount > closeCount && (isDigit(lastChar) || VALID_TERM_ENDINGS.includes(lastChar));

    if (canClose) {
        appendStringToInput(')');
    } else {
        // Opening a parenthesis. Check if we need a multiplication sign first.
        if (isDigit(lastChar) || VALID_TERM_ENDINGS.includes(lastChar)) {
            appendStringToInput('×(');
        } else {
            appendStringToInput('(');
        }
    }
};

/**
 * Appends mod, nPr (P), or nCr (C) to the input area.
 * Only allows appending if the preceding character is a digit, ), π, e, or %.
 */
const handleCombinatoricsClick = (operatorStr: string): void => {
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    // Only append if the last character is a digit or in the valid list
    if (isDigit(lastChar) || VALID_TERM_ENDINGS.includes(lastChar)) {
        appendStringToInput(operatorStr);
    }
};

/**
 * Appends a percentage symbol (%) to the input area.
 * Only allows appending if the preceding character is a digit, π, e, %, or a closing parenthesis.
 */
const handlePercentageClick = (): void => {
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    // Only append the percentage if the last character is a digit or in the valid list
    if (isDigit(lastChar) || VALID_TERM_ENDINGS.includes(lastChar)) {
        appendStringToInput('%');
    }
};

/**
 * Appends a reciprocal operation (1÷) to the current term.
 * It intelligently finds the start of the last term, wraps it in (1÷...),
 * or removes the wrapper if it already exists.
 */
const handleReciprocalClick = (): void => {
    const currentStr = getInput();

    // Split the string into the prefix and the target term
    const splitIndex = findLastTermSplitIndex(currentStr);
    const prefix = currentStr.slice(0, splitIndex);
    let term = currentStr.slice(splitIndex);

    // 1) If the term is already safely wrapped in (1÷ ... ), unwrap it
    if (term.startsWith('(1÷') && term.endsWith(')')) {
        term = term.slice(3, -1);
    }
    // 2) If the term is just an open wrapper (e.g., clicked immediately after an operator), remove it
    else if (term === '(1÷') {
        term = '';
    }
    // 3) Default: Wrap the term in (1÷ ... )
    else {
        term = term !== '' ? '(1÷' + term + ')' : '(1÷';
    }

    setInput(prefix + term);
};

/**
 * Toggles the sign of the current term (+/-).
 * Intelligently parses backwards to determine the boundaries of the last term,
 * and either wraps it in (-...), removes existing wrap, or flips adjacent operators.
 */
const handleSwitchSignClick = (): void => {
    const currentStr = getInput();
    const lastChar = getLastChar();

    if (lastChar === '.') return;

    // If the input is completely empty, start with a negative sign
    if (!currentStr) {
        appendStringToInput('-');
        return;
    }

    // If the last character is a plus sign, replace it with a minus sign
    if (currentStr.endsWith('+')) {
        setInput(currentStr.slice(0, -1) + '-');
        return;
    }

    const splitIndex = findLastTermSplitIndex(currentStr);
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

    setInput(prefix + term);
};

/**
 * Evaluates the mathematical expression in the input area.
 * Converts display tokens to JavaScript-compatible operators and functions.
 */
const handleCalculate = (): void => {
    let expression = getInput();

    if (!expression) return;

    outputResult.innerText = "123";
};

// --- Event Listeners ---
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
btnEquals.addEventListener('click', handleCalculate);

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
    'btn-divide': '÷',
    'btn-power': '^'
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

