// Select the toggle button
const btnMore = document.getElementById('btn-more') as HTMLButtonElement;

// Select all function buttons
const funcButtons = document.querySelectorAll('.func');

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

// Event Listeners
btnMore.addEventListener('click', toggleFunctions);