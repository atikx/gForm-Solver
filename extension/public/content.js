const showFloatingMessage = (message, type = "info") => {
  const oldMsg = document.querySelector("#gform-solver-loader");
  if (oldMsg) oldMsg.remove();

  const div = document.createElement("div");
  div.id = "gform-solver-loader";
  div.innerText = message;

  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.zIndex = "9999";
  div.style.padding = "10px 16px";
  div.style.background =
    type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#333";
  div.style.color = "#fff";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  div.style.fontSize = "14px";
  div.style.fontFamily = "sans-serif";

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 4000);
};

const getAnswers = async (questions) => {
  try {
    const res = await fetch("http://localhost:8000/api/get-answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    });

    const data = await res.json();
    return data.answer;
  } catch (error) {
    console.error("Error fetching answers:", error);
    showFloatingMessage("❌ Failed to fetch answers", "error");
  }
};

const autoFillForm = (answersArray) => {
  const questionCards = document.querySelectorAll(".geS5n");

  answersArray.forEach((answerObj) => {
    const matchingCard = Array.from(questionCards).find(
      (card) =>
        card.querySelector(".M7eMe")?.innerText.trim().toLowerCase() ===
        answerObj.question.toLowerCase()
    );

    if (!matchingCard) return;

    const options = matchingCard.querySelectorAll(".ulDsOb");

    // ✅ CASE 1: Multiple Choice / Checkbox
    if (options.length > 0 && answerObj.answer) {
      let matched = false;

      options.forEach((el) => {
        const label = el.innerText.trim().toLowerCase();

        // 🚫 Skip "Other" option with input box
        if (el.querySelector("input[type='text']")) return;

        if (label === answerObj.answer.toLowerCase()) {
          el.click();
          matched = true;
        }
      });

      // ✅ Fallback to typing into "Other" input
      if (!matched) {
        const otherInput = matchingCard.querySelector(
          ".ulDsOb input[type='text']"
        );
        if (otherInput) {
          otherInput.focus();
          otherInput.value = answerObj.answer;
          otherInput.dispatchEvent(new Event("input", { bubbles: true }));
          otherInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      return;
    }

    // ✅ CASE 2: Text Input
    const textInput = matchingCard.querySelector("input[type='text']");
    if (textInput && answerObj.answer) {
      textInput.focus();
      textInput.value = answerObj.answer;
      textInput.dispatchEvent(new Event("input", { bubbles: true }));
      textInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
};

const getQuestions = async () => {
  showFloatingMessage("🕵️ Extracting questions...");

  const questionCards = document.querySelectorAll(".geS5n");
  const questions = [];

  questionCards.forEach((card) => {
    const questionText = card.querySelector(".M7eMe")?.innerText?.trim();
    if (!questionText) return;

    const options = Array.from(card.querySelectorAll(".ulDsOb")).map((option) =>
      option.innerText.trim()
    );

    questions.push({ question: questionText, options });
  });

  showFloatingMessage("🤖 Sending to Gemini AI...");
  const questionsWithAnswers = await getAnswers(questions);

  if (!questionsWithAnswers || !Array.isArray(questionsWithAnswers)) {
    showFloatingMessage("❌ Invalid response from Gemini", "error");
    return;
  }

  showFloatingMessage("📝 Auto-filling form...");
  autoFillForm(questionsWithAnswers);

  showFloatingMessage("✅ Form auto-filled successfully!", "success");
};

// 👇 Only run when injected by button (not on load)
getQuestions();
