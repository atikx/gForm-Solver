console.log("An Extension by Atiksh Gupta!");

// ==================== CONSTANTS ====================
const CONFIG = {
  API_URL: "http://localhost:8000/api/get-answers",
  SELECTORS: {
    QUESTION_CARDS: ".geS5n",
    QUESTION_TEXT: ".M7eMe",
    OPTIONS: ".ulDsOb",
    RADIO: '[role="radio"]',
    CHECKBOX: '[role="checkbox"]',
    TEXT_INPUT: 'input[type="text"]',
    TEXTAREA: "textarea"
  },
  TOAST: {
    ID: "gform-solver-loader",
    STYLES_ID: "gform-solver-styles",
    DURATION: 4000,
    ANIMATION_DURATION: 300
  },
  QUESTION_TYPES: {
    SINGLE_SELECT: "single-select",
    MULTI_SELECT: "multi-select",
    SHORT_ANSWER: "short-answer",
    PARAGRAPH: "paragraph",
    UNKNOWN: "unknown"
  }
};

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  sanitizeText: (text) => text?.trim().toLowerCase() || "",
  
  dispatchInputEvents: (element, value) => {
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  },

  findMatchingCard: (questionCards, targetQuestion) => {
    return Array.from(questionCards).find(card => {
      const questionText = card.querySelector(CONFIG.SELECTORS.QUESTION_TEXT)?.innerText;
      return Utils.sanitizeText(questionText) === Utils.sanitizeText(targetQuestion);
    });
  }
};

// ==================== TOAST NOTIFICATION SYSTEM ====================
class ToastManager {
  static createStyles() {
    if (document.querySelector(`#${CONFIG.TOAST.STYLES_ID}`)) return;

    const style = document.createElement("style");
    style.id = CONFIG.TOAST.STYLES_ID;
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      #${CONFIG.TOAST.ID}:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }

  static getTheme(type) {
    const themes = {
      success: {
        background: "linear-gradient(135deg, #4caf50, #45a049)",
        border: "#4caf50"
      },
      error: {
        background: "linear-gradient(135deg, #f44336, #d32f2f)",
        border: "#f44336"
      },
      info: {
        background: "linear-gradient(135deg, #2196f3, #1976d2)",
        border: "#2196f3"
      }
    };
    return themes[type] || themes.info;
  }

  static createContainer(theme) {
    const container = document.createElement("div");
    container.id = CONFIG.TOAST.ID;
    
    Object.assign(container.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: "9999",
      minWidth: "280px",
      maxWidth: "400px",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflow: "hidden",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)",
      animation: "slideInRight 0.3s ease-out",
      background: theme.background,
      borderLeft: `4px solid ${theme.border}`,
      cursor: "pointer"
    });

    return container;
  }

  static createMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.innerText = text;
    
    Object.assign(messageDiv.style, {
      padding: "16px 20px 12px 20px",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "1.4",
      textShadow: "0 1px 2px rgba(0,0,0,0.1)"
    });

    return messageDiv;
  }

  static createWatermark() {
    const watermark = document.createElement("div");
    watermark.innerHTML = "Made with ❤️ by A";
    
    Object.assign(watermark.style, {
      padding: "8px 20px",
      fontSize: "11px",
      color: "rgba(255,255,255,0.8)",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(0,0,0,0.1)",
      textAlign: "center",
      fontWeight: "400",
      letterSpacing: "0.5px"
    });

    return watermark;
  }

  static show(message, type = "info") {
    // Remove existing toast
    const oldToast = document.querySelector(`#${CONFIG.TOAST.ID}`);
    if (oldToast) oldToast.remove();

    // Create styles
    this.createStyles();

    // Create toast elements
    const theme = this.getTheme(type);
    const container = this.createContainer(theme);
    const messageDiv = this.createMessage(message);
    const watermark = this.createWatermark();

    // Assemble toast
    container.appendChild(messageDiv);
    container.appendChild(watermark);
    document.body.appendChild(container);

    // Add click to dismiss
    container.addEventListener("click", () => {
      container.style.animation = `slideOutRight ${CONFIG.TOAST.ANIMATION_DURATION}ms ease-in`;
      setTimeout(() => container.remove(), CONFIG.TOAST.ANIMATION_DURATION);
    });

    // Auto remove
    setTimeout(() => {
      if (container.parentNode) {
        container.style.animation = `slideOutRight ${CONFIG.TOAST.ANIMATION_DURATION}ms ease-in`;
        setTimeout(() => container.remove(), CONFIG.TOAST.ANIMATION_DURATION);
      }
    }, CONFIG.TOAST.DURATION);
  }
}

// ==================== QUESTION DETECTOR ====================
class QuestionDetector {
  static detectType(card) {
    if (card.querySelector(CONFIG.SELECTORS.RADIO)) {
      return CONFIG.QUESTION_TYPES.SINGLE_SELECT;
    }
    if (card.querySelector(CONFIG.SELECTORS.CHECKBOX)) {
      return CONFIG.QUESTION_TYPES.MULTI_SELECT;
    }
    if (card.querySelector(CONFIG.SELECTORS.TEXTAREA)) {
      return CONFIG.QUESTION_TYPES.PARAGRAPH;
    }
    if (card.querySelector(CONFIG.SELECTORS.TEXT_INPUT)) {
      return CONFIG.QUESTION_TYPES.SHORT_ANSWER;
    }
    return CONFIG.QUESTION_TYPES.UNKNOWN;
  }

  static extractQuestions() {
    const questionCards = document.querySelectorAll(CONFIG.SELECTORS.QUESTION_CARDS);
    const questions = [];

    questionCards.forEach((card) => {
      const questionText = card.querySelector(CONFIG.SELECTORS.QUESTION_TEXT)?.innerText?.trim();
      if (!questionText) return;

      const options = Array.from(card.querySelectorAll(CONFIG.SELECTORS.OPTIONS))
        .map(option => option.innerText.trim());

      const type = this.detectType(card);

      questions.push({ question: questionText, options, type });
    });

    return questions;
  }
}

// ==================== FORM FILLER STRATEGIES ====================
class FormFillerStrategies {
  static fillSingleSelect(card, answer) {
    const options = card.querySelectorAll(CONFIG.SELECTORS.OPTIONS);
    let matched = false;

    options.forEach((el) => {
      const label = Utils.sanitizeText(el.innerText);
      
      // Skip "Other" option with input box
      if (el.querySelector(CONFIG.SELECTORS.TEXT_INPUT)) return;

      if (label === Utils.sanitizeText(answer)) {
        el.click();
        matched = true;
      }
    });

    // Fallback to "Other" input
    if (!matched) {
      const otherInput = card.querySelector(`${CONFIG.SELECTORS.OPTIONS} ${CONFIG.SELECTORS.TEXT_INPUT}`);
      if (otherInput) {
        Utils.dispatchInputEvents(otherInput, answer);
      }
    }
  }

  static fillMultiSelect(card, answers) {
    const options = card.querySelectorAll(CONFIG.SELECTORS.OPTIONS);
    
    // Uncheck all options first
    options.forEach((el) => {
      const checkbox = el.querySelector(CONFIG.SELECTORS.CHECKBOX);
      if (checkbox && checkbox.getAttribute("aria-checked") === "true") {
        el.click();
      }
    });

    // Check correct answers
    answers.forEach((correctAnswer) => {
      options.forEach((el) => {
        const label = Utils.sanitizeText(el.innerText);
        
        // Skip "Other" option with input box
        if (el.querySelector(CONFIG.SELECTORS.TEXT_INPUT)) return;

        if (label === Utils.sanitizeText(correctAnswer)) {
          el.click();
        }
      });
    });
  }

  static fillTextInput(card, answer) {
    const textInput = card.querySelector(CONFIG.SELECTORS.TEXT_INPUT);
    if (textInput) {
      Utils.dispatchInputEvents(textInput, answer);
    }
  }

  static fillTextarea(card, answer) {
    const textarea = card.querySelector(CONFIG.SELECTORS.TEXTAREA);
    if (textarea) {
      Utils.dispatchInputEvents(textarea, answer);
    }
  }
}

// ==================== MAIN FORM FILLER ====================
class FormFiller {
  static fillQuestion(answerObj) {
    const questionCards = document.querySelectorAll(CONFIG.SELECTORS.QUESTION_CARDS);
    const matchingCard = Utils.findMatchingCard(questionCards, answerObj.question);

    if (!matchingCard) {
      console.warn(`No matching card found for question: ${answerObj.question}`);
      return;
    }

    switch (answerObj.type) {
      case CONFIG.QUESTION_TYPES.SINGLE_SELECT:
        if (answerObj.answer) {
          FormFillerStrategies.fillSingleSelect(matchingCard, answerObj.answer);
        }
        break;

      case CONFIG.QUESTION_TYPES.MULTI_SELECT:
        if (Array.isArray(answerObj.answer)) {
          FormFillerStrategies.fillMultiSelect(matchingCard, answerObj.answer);
        }
        break;

      case CONFIG.QUESTION_TYPES.SHORT_ANSWER:
        if (answerObj.answer) {
          FormFillerStrategies.fillTextInput(matchingCard, answerObj.answer);
        }
        break;

      case CONFIG.QUESTION_TYPES.PARAGRAPH:
        if (answerObj.answer) {
          FormFillerStrategies.fillTextarea(matchingCard, answerObj.answer);
        }
        break;

      default:
        // Fallback for unknown types
        this.fillUnknownType(matchingCard, answerObj);
    }
  }

  static fillUnknownType(card, answerObj) {
    const options = card.querySelectorAll(CONFIG.SELECTORS.OPTIONS);
    if (options.length > 0 && answerObj.answer) {
      FormFillerStrategies.fillSingleSelect(card, answerObj.answer);
    }
  }

  static async fillForm(answersArray) {
    if (!Array.isArray(answersArray)) {
      throw new Error("Invalid answers array");
    }

    answersArray.forEach((answerObj) => {
      this.fillQuestion(answerObj);
    });
  }
}

// ==================== API SERVICE ====================
class APIService {
  static async getAnswers(questions) {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Error fetching answers:", error);
      throw error;
    }
  }
}

// ==================== MAIN APPLICATION ====================
class GFormSolver {
  static async run() {
    try {
      // Step 1: Extract questions
      ToastManager.show("🕵️ Extracting questions...");
      const questions = QuestionDetector.extractQuestions();

      if (questions.length === 0) {
        ToastManager.show("❌ No questions found on this page", "error");
        return;
      }

      // Step 2: Get answers from API
      ToastManager.show("🤖 Extracting Questions...");
      const answersArray = await APIService.getAnswers(questions);

      if (!answersArray || !Array.isArray(answersArray)) {
        ToastManager.show("❌ Invalid response from Gemini", "error");
        return;
      }

      // Step 3: Fill the form
      ToastManager.show("📝 Auto-filling form...");
      await FormFiller.fillForm(answersArray);

      // Step 4: Success message
      ToastManager.show("✅ Form auto-filled successfully!", "success");

    } catch (error) {
      console.error("Error in GFormSolver:", error);
      ToastManager.show("❌ An error occurred while processing", "error");
    }
  }
}

// ==================== EXECUTION ====================
// Run the application
GFormSolver.run();
