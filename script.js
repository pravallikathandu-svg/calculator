/**
 * ==============================================================================
 * MODERN CALCULATOR LOGIC
 * ==============================================================================
 * This script manages the state of our calculator and handles:
 * 1. Button click detection
 * 2. Storing current numbers and chosen operations
 * 3. Performing arithmetic calculations
 * 4. Updating the screen display dynamically
 */

// ==============================================================================
// 1. SELECT DOM ELEMENTS
// We query the HTML elements we need to read from or update.
// ==============================================================================
const previousOperandText = document.getElementById("previous-operand");
const currentOperandText = document.getElementById("current-operand");

// We select groups of buttons by their data-attributes for clean code organization
const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operation]");
const actionButtons = document.querySelectorAll("[data-action]");

// ==============================================================================
// 2. STATE VARIABLES
// These variables store the calculator's current memory/status.
// ==============================================================================
let currentOperand = "0";      // The number currently being entered or viewed
let previousOperand = "";     // The previous number saved before choosing an operator
let operation = null;         // The selected operator (+, −, ×, ÷)
let shouldResetScreen = false; // Flag: should the next digit typed replace the display?

// ==============================================================================
// 3. CORE CALCULATOR FUNCTIONS
// ==============================================================================

/**
 * Resets the calculator back to its default initial state (AC button).
 */
function clearAll() {
  currentOperand = "0";
  previousOperand = "";
  operation = null;
  shouldResetScreen = false;
  updateDisplay();
}

/**
 * Deletes the last digit typed (DEL button / Backspace).
 */
function deleteLastDigit() {
  // If an error message is showing or screen is flagged to reset, just clear to 0
  if (shouldResetScreen || currentOperand === "Error") {
    currentOperand = "0";
    shouldResetScreen = false;
    updateDisplay();
    return;
  }

  // If there's only 1 character left, reset to "0" instead of an empty string
  if (currentOperand.length === 1) {
    currentOperand = "0";
  } else {
    // Remove the last character using slice
    currentOperand = currentOperand.slice(0, -1);
  }
  updateDisplay();
}

/**
 * Appends a digit or decimal point to the current number on screen.
 * @param {string} number - The digit ("0"-"9") or "." clicked by the user
 */
function appendNumber(number) {
  // If the user just completed a calculation, typing a new number starts fresh
  if (shouldResetScreen) {
    currentOperand = "";
    shouldResetScreen = false;
  }

  // Prevent entering multiple decimal points in one number (e.g., prevents "3.14.5")
  if (number === "." && currentOperand.includes(".")) {
    return;
  }

  // If current screen is just "0" and the user types a digit (not "."), replace the "0"
  if (currentOperand === "0" && number !== ".") {
    currentOperand = number;
  } else {
    // Otherwise, append the digit to the end of the current string
    currentOperand += number;
  }

  updateDisplay();
}

/**
 * Stores the chosen mathematical operation (+, −, ×, ÷).
 * @param {string} selectedOperation - The operator symbol
 */
function chooseOperation(selectedOperation) {
  if (currentOperand === "Error") return;

  // If the user already entered a previous number and an operation,
  // we calculate that intermediate result first (e.g., 5 + 5 + ... becomes 10 + ...)
  if (operation !== null && !shouldResetScreen) {
    calculate();
  }

  operation = selectedOperation;
  previousOperand = currentOperand;
  shouldResetScreen = true; // The next digit typed will start a new number
  updateDisplay();
}

/**
 * Converts the current number into a percentage (divides by 100).
 */
function calculatePercentage() {
  if (currentOperand === "Error") return;

  const current = parseFloat(currentOperand);
  if (isNaN(current)) return;

  // Divide by 100 and clean up floating-point inaccuracies
  currentOperand = (current / 100).toString();
  updateDisplay();
}

/**
 * Performs the actual arithmetic calculation when '=' is clicked
 * or when chaining operators.
 */
function calculate() {
  // If there is no stored operation or previous number, we have nothing to calculate
  if (operation === null || shouldResetScreen) return;

  // Convert string inputs to floating point numbers
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  // If either value is invalid, exit early
  if (isNaN(prev) || isNaN(current)) return;

  let computation;

  // Execute the matching arithmetic operation
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "−":
    case "-":
      computation = prev - current;
      break;
    case "×":
    case "*":
      computation = prev * current;
      break;
    case "÷":
    case "/":
      // Handle division by zero edge-case
      if (current === 0) {
        currentOperand = "Error";
        previousOperand = "";
        operation = null;
        shouldResetScreen = true;
        updateDisplay();
        return;
      }
      computation = prev / current;
      break;
    default:
      return;
  }

  // Round floating point errors (e.g. 0.1 + 0.2 = 0.30000000000000004 -> 0.3)
  computation = Math.round(computation * 1e10) / 1e10;

  // Store the result back into currentOperand
  currentOperand = computation.toString();
  operation = null;
  previousOperand = "";
  shouldResetScreen = true;

  updateDisplay();
}

/**
 * Formats a raw number string with commas for better readability (e.g., 1000 -> 1,000)
 * while preserving decimals being actively typed.
 * @param {string} numberString
 */
function formatDisplayNumber(numberString) {
  if (numberString === "Error" || numberString === "") return numberString;

  const [integerPart, decimalPart] = numberString.split(".");
  const parsedInteger = parseFloat(integerPart);

  let formattedInteger = "";
  if (isNaN(parsedInteger)) {
    formattedInteger = "";
  } else {
    formattedInteger = parsedInteger.toLocaleString("en");
  }

  // If a decimal part exists, append it back
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  }

  return formattedInteger;
}

/**
 * Updates the text displayed in the HTML elements.
 */
function updateDisplay() {
  currentOperandText.innerText = formatDisplayNumber(currentOperand);

  if (operation !== null) {
    // Show the previous number and the selected operator on the top line
    previousOperandText.innerText = `${formatDisplayNumber(previousOperand)} ${operation}`;
  } else {
    // Clear top line if no operation is active
    previousOperandText.innerText = "";
  }
}

// ==============================================================================
// 4. EVENT LISTENERS (CONNECTING BUTTONS TO JAVASCRIPT)
// ==============================================================================

// Number buttons: 0-9 and "."
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    appendNumber(button.dataset.number);
  });
});

// Operator buttons: +, −, ×, ÷
operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Check if the operator button has a data-operation attribute
    if (button.dataset.operation) {
      chooseOperation(button.dataset.operation);
    }
  });
});

// Action buttons: AC, DEL, %, =
actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    switch (action) {
      case "all-clear":
        clearAll();
        break;
      case "delete":
        deleteLastDigit();
        break;
      case "percent":
        calculatePercentage();
        break;
      case "calculate":
        calculate();
        break;
    }
  });
});

// ==============================================================================
// 5. BONUS: KEYBOARD SUPPORT
// Enables using the physical keyboard to type numbers and operators!
// ==============================================================================
window.addEventListener("keydown", (e) => {
  if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
    appendNumber(e.key);
  } else if (e.key === "+" || e.key === "-") {
    chooseOperation(e.key === "-" ? "−" : "+");
  } else if (e.key === "*") {
    chooseOperation("×");
  } else if (e.key === "/") {
    e.preventDefault(); // Prevents browser search shortcut
    chooseOperation("÷");
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculate();
  } else if (e.key === "Backspace") {
    deleteLastDigit();
  } else if (e.key === "Escape") {
    clearAll();
  } else if (e.key === "%") {
    calculatePercentage();
  }
});

