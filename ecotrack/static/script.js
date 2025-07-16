document.addEventListener("DOMContentLoaded", () => {
  // --- UI Elements ---
  const navItems = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".tab-content");
  const sustainabilityScoreElement = document.getElementById(
    "sustainability-score"
  );
  const scoreCircle = document.getElementById("score-circle");
  const carbonFootprintElement = document.getElementById("carbon-footprint");
  const habitsCompletedTodayElement = document.getElementById(
    "habits-completed-today"
  );
  const habitList = document.getElementById("habit-list");
  const suggestionCardsContainer = document.getElementById(
    "suggestion-cards-container"
  );
  const addHabitBtn = document.getElementById("add-habit-btn");
  const addHabitModal = document.getElementById("add-habit-modal");
  const newHabitInput = document.getElementById("new-habit-input");
  const cancelAddHabitBtn = document.getElementById("cancel-add-habit");
  const confirmAddHabitBtn = document.getElementById("confirm-add-habit");
  const profileButton = document.getElementById("profileButton");

  const dailyQuestionnaireForm = document.getElementById(
    "daily-questionnaire-form"
  );
  const formStatusMessage = document.getElementById("form-status-message");

  const ecoChallengeText = document.getElementById("eco-challenge-text");
  const generateChallengeBtn = document.getElementById(
    "generate-challenge-btn"
  );

  const openActivityModalBtn = document.getElementById(
    "open-activity-modal-btn"
  );
  const dailyActivityModal = document.getElementById("daily-activity-modal");
  const closeActivityModalBtn = document.getElementById("close-activity-modal");
  const activityInputForm = document.getElementById("activity-input-form");
  const getAiInsightBtn = document.getElementById("get-ai-insight-btn");
  const aiInsightOutput = document.getElementById("ai-insight-output");
  const insightText = document.getElementById("insight-text");

  const customMessageBox = document.getElementById("custom-message-box");
  const messageBoxText = document.getElementById("message-box-text");
  const messageBoxOk = document.getElementById("message-box-ok");

  // --- Data (Simulated) ---
  let sustainabilityScore =
    parseInt(localStorage.getItem("sustainabilityScore")) || 50;
  let carbonFootprint =
    parseFloat(localStorage.getItem("carbonFootprint")) || 150;
  let habitsCompletedToday =
    parseInt(localStorage.getItem("habitsCompletedToday")) || 0;
  let lastQuestionnaireSubmissionDate =
    localStorage.getItem("lastQuestionnaireSubmissionDate") || null;
  let lastChallengeDate = localStorage.getItem("lastChallengeDate") || null;
  let currentEcoChallenge =
    localStorage.getItem("currentEcoChallenge") ||
    'Click "Generate New Challenge" to get started!';

  // --- Rebuilt Habits Section Logic (NEW, persistent with localStorage) ---
  let habitsDB = [];
  // Load from localStorage if available
  if (localStorage.getItem("habitsDB")) {
    try {
      habitsDB = JSON.parse(localStorage.getItem("habitsDB"));
    } catch (e) {
      habitsDB = [];
    }
  }
  // If habitsDB is empty, populate with demo habits
  if (!habitsDB || habitsDB.length === 0) {
    habitsDB = [
      { id: Date.now(), text: "Use reusable water bottle" },
      { id: Date.now() + 1, text: "Take public transport" },
      { id: Date.now() + 2, text: "Turn off lights when leaving room" },
    ];
    localStorage.setItem("habitsDB", JSON.stringify(habitsDB));
  }

  function saveHabitsDB() {
    localStorage.setItem("habitsDB", JSON.stringify(habitsDB));
  }

  function renderHabitsV2() {
    const habitList = document.getElementById("habit-items-list");
    if (!habitList) return;
    habitList.innerHTML = "";
    console.log("[Habits] Rendering habits:", habitsDB);
    if (!habitsDB || habitsDB.length === 0) {
      habitList.innerHTML =
        '<li style="color: #888; text-align: center;">No habits yet. Add your first habit above!</li>';
      return;
    }
    habitsDB.forEach((habit, idx) => {
      const li = document.createElement("li");
      li.className = "habit-item";
      if (habit.editing) {
        li.innerHTML = `
        <input type='text' class='add-habit-input' value="${habit.text}" style="flex:1;max-width:60%;margin-right:0.5rem;" />
        <span class="habit-actions">
          <button class="habit-action-btn save-edit" title="Save">💾</button>
          <button class="habit-action-btn cancel-edit" title="Cancel">✖️</button>
        </span>
      `;
      } else {
        li.innerHTML = `
        <span class="habit-text">${habit.text}</span>
        <span class="habit-actions">
          <button class="habit-action-btn edit-habit" title="Edit">✏️</button>
          <button class="habit-action-btn delete-habit" title="Delete">🗑️</button>
        </span>
      `;
      }
      habitList.appendChild(li);
    });
  }

  function setupHabitsSectionV2() {
    const addHabitInput = document.getElementById("habit-input");
    const addHabitBtn = document.getElementById("habit-add-btn");
    const habitList = document.getElementById("habit-items-list");
    console.log("[Habits] Initializing setupHabitsSectionV2");
    if (!addHabitInput || !addHabitBtn || !habitList) {
      console.error("[Habits] Missing required element:", {
        addHabitInput,
        addHabitBtn,
        habitList,
      });
      // Optionally show a message in the UI
      const habitsCard = document.querySelector("#habits .card");
      if (habitsCard) {
        habitsCard.insertAdjacentHTML(
          "beforeend",
          '<div style="color:red;">Error: Habits section failed to initialize. Check element IDs.</div>'
        );
      }
      return;
    }

    renderHabitsV2();

    addHabitBtn.onclick = () => {
      console.log("[Habits] Add button clicked");
      const val = addHabitInput.value.trim();
      if (val) {
        habitsDB.push({ id: Date.now(), text: val });
        saveHabitsDB();
        addHabitInput.value = "";
        renderHabitsV2();
      }
    };
    addHabitInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addHabitBtn.click();
    });
    habitList.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      const idx = Array.from(habitList.children).indexOf(li);
      if (e.target.closest(".edit-habit")) {
        habitsDB = habitsDB.map((h, i) => ({ ...h, editing: i === idx }));
        renderHabitsV2();
      } else if (e.target.closest(".delete-habit")) {
        if (confirm("Delete this habit?")) {
          habitsDB.splice(idx, 1);
          saveHabitsDB();
          renderHabitsV2();
        }
      } else if (e.target.closest(".save-edit")) {
        const input = li.querySelector("input[type='text']");
        const newText = input.value.trim();
        if (newText) {
          habitsDB[idx].text = newText;
          delete habitsDB[idx].editing;
          saveHabitsDB();
          renderHabitsV2();
        }
      } else if (e.target.closest(".cancel-edit")) {
        delete habitsDB[idx].editing;
        renderHabitsV2();
      }
    });
  }

  function renderSuggestions() {
    suggestionCardsContainer.innerHTML = "";
    suggestions.forEach((suggestion) => {
      const card = document.createElement("div");
      card.className = "suggestion-card";
      card.innerHTML = `
                <h3>${suggestion.title}</h3>
                <p>${suggestion.reason}</p>
                <div>
                    <span class="suggestion-reduction">${suggestion.carbonReduction}</span>
                </div>
                <button class="btn btn-secondary add-suggestion-to-habits-btn" data-title="${suggestion.title}" data-carbon-reduction="${suggestion.carbonReduction}">Start This Habit</button>
            `;
      suggestionCardsContainer.appendChild(card);
    });
  }

  function renderDailyQuestionnaire() {
    console.log("[Check-in] renderDailyQuestionnaire called");
    if (typeof dailyQuestions === "undefined") {
      console.error("[Check-in] dailyQuestions is undefined!");
    } else if (!Array.isArray(dailyQuestions)) {
      console.error(
        "[Check-in] dailyQuestions is not an array:",
        dailyQuestions
      );
    } else if (dailyQuestions.length === 0) {
      console.warn("[Check-in] dailyQuestions is empty!");
    } else {
      console.log("[Check-in] dailyQuestions:", dailyQuestions);
    }
    if (!dailyQuestionnaireForm) {
      console.error("[Check-in] dailyQuestionnaireForm not found!");
    }
    if (!formStatusMessage) {
      console.error("[Check-in] formStatusMessage not found!");
    }
    dailyQuestionnaireForm.innerHTML = ""; // Clear existing questions
    if (!dailyQuestions || dailyQuestions.length === 0) {
      dailyQuestionnaireForm.innerHTML =
        '<div style="color:red;">No daily questions configured.</div>';
      return;
    }
    dailyQuestions.forEach((q) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "questionnaire-item";

      const questionText = document.createElement("p");
      questionText.className = "question-text";
      questionText.textContent = q.question;
      questionDiv.appendChild(questionText);

      if (q.type === "mcq") {
        const optionsGrid = document.createElement("div");
        optionsGrid.className = "options-grid";

        q.options.forEach((option, index) => {
          const optionLabel = document.createElement("label");
          optionLabel.className = "option-card";

          optionLabel.innerHTML = `
                        <input type="radio" name="${q.id}" value="${option.impact}" required>
                        <div class="option-content">
                            <span>${option.text}</span>
                        </div>
                    `;
          optionsGrid.appendChild(optionLabel);
        });
        questionDiv.appendChild(optionsGrid);
      }
      dailyQuestionnaireForm.appendChild(questionDiv);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit Daily Check-in";
    submitButton.className = "btn btn-primary";
    submitButton.style.marginTop = "1rem";
    dailyQuestionnaireForm.appendChild(submitButton);
  }

  function updateQuestionnaireStatus() {
    const today = new Date().toDateString();
    if (lastQuestionnaireSubmissionDate === today) {
      dailyQuestionnaireForm.classList.add("disabled");
      formStatusMessage.classList.remove("hidden");
    } else {
      dailyQuestionnaireForm.classList.remove("disabled");
      formStatusMessage.classList.add("hidden");
      if (
        lastQuestionnaireSubmissionDate !== null &&
        lastQuestionnaireSubmissionDate !== today
      ) {
        habitsCompletedToday = 0;
        habitsDB.forEach((habit) => (habit.completed = false));
        saveData();
        renderHabits();
        updateDashboardUI();
      }
    }
  }

  async function generateEcoChallenge() {
    ecoChallengeText.textContent = "Generating...";
    generateChallengeBtn.disabled = true;

    const prompt =
      "Generate a short, actionable, and encouraging daily eco-challenge for someone looking to reduce their carbon footprint. Focus on simple, everyday actions. The challenge should be no more than 2-3 sentences.";
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    const apiKey = ""; // Provided by Canvas at runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        currentEcoChallenge = result.candidates[0].content.parts[0].text;
        lastChallengeDate = new Date().toDateString();
        saveData();
        ecoChallengeText.textContent = currentEcoChallenge;
      } else {
        ecoChallengeText.textContent = "Failed to generate. Please try again.";
      }
    } catch (error) {
      ecoChallengeText.textContent = "Error generating challenge.";
      console.error("Error calling Gemini API:", error);
    } finally {
      generateChallengeBtn.disabled = false;
    }
  }

  async function getAICarbonInsight(
    milesDriven,
    showerMinutes,
    meatMeals,
    electricityKWH
  ) {
    insightText.textContent = "Analyzing...";
    aiInsightOutput.classList.remove("hidden");
    getAiInsightBtn.disabled = true;

    const prompt = `Analyze these daily activities for carbon impact and provide 2-3 concise, actionable reduction tips:
        - Car: ${milesDriven} miles
        - Shower: ${showerMinutes} mins
        - Meat meals: ${meatMeals}
        - Electricity: ${electricityKWH} KWH
        Keep it brief and encouraging.`;

    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    const apiKey = ""; // Provided by Canvas at runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        insightText.textContent = result.candidates[0].content.parts[0].text;
      } else {
        insightText.textContent = "Failed to get insight. Please try again.";
      }
    } catch (error) {
      insightText.textContent = "Error getting insight.";
      console.error("Error calling Gemini API:", error);
    } finally {
      getAiInsightBtn.disabled = false;
    }
  }

  // --- Event Handlers ---
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetTab = item.dataset.tab;
      navItems.forEach((nav) => nav.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  habitList.addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
      const habitId = parseInt(event.target.dataset.id);
      const habit = habits.find((h) => h.id === habitId);
      if (habit) {
        habit.completed = event.target.checked;
        habitsCompletedToday += habit.completed ? 1 : -1;
        carbonFootprint = Math.max(
          0,
          carbonFootprint +
            (habit.completed ? -habit.carbonReduction : habit.carbonReduction)
        );
        sustainabilityScore = Math.min(
          100,
          Math.max(0, sustainabilityScore + (habit.completed ? 2 : -2))
        );
        saveData();
        renderHabits();
        updateDashboardUI();
      }
    }
  });

  habitList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-habit-btn");
    if (button) {
      const habitId = parseInt(button.dataset.id);
      habits = habits.filter((h) => h.id !== habitId);
      saveData();
      renderHabits();
    }
  });

  addHabitBtn.addEventListener("click", () =>
    addHabitModal.classList.remove("hidden")
  );
  cancelAddHabitBtn.addEventListener("click", () =>
    addHabitModal.classList.add("hidden")
  );
  confirmAddHabitBtn.addEventListener("click", () => {
    const newHabitText = newHabitInput.value.trim();
    if (newHabitText) {
      const newId =
        habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1;
      habits.push({
        id: newId,
        text: newHabitText,
        completed: false,
        carbonReduction: 5,
      });
      saveData();
      renderHabits();
      addHabitModal.classList.add("hidden");
      newHabitInput.value = "";
    } else {
      showAlert("Please enter a habit description.");
    }
  });

  suggestionCardsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".add-suggestion-to-habits-btn");
    if (button) {
      const title = button.dataset.title;
      const newId =
        habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1;
      habits.push({
        id: newId,
        text: title,
        completed: false,
        carbonReduction: 5,
      });
      saveData();
      renderHabits();
      showAlert(`"${title}" added to your habits!`);
      document.querySelector('.nav-item[data-tab="habits"]').click();
    }
  });

  profileButton.addEventListener("click", () =>
    document.querySelector('.nav-item[data-tab="profile"]').click()
  );

  dailyQuestionnaireForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let totalImpact = 0;
    const formData = new FormData(dailyQuestionnaireForm);
    if (
      formData.getAll("q1").length === 0 ||
      formData.getAll("q2").length === 0 ||
      formData.getAll("q4").length === 0
    ) {
      showAlert("Please answer all questions before submitting.");
      return;
    }
    for (const value of formData.values()) {
      totalImpact += parseInt(value);
    }
    carbonFootprint = Math.max(0, carbonFootprint + totalImpact);
    sustainabilityScore = Math.min(
      100,
      Math.max(0, sustainabilityScore - Math.round(totalImpact / 2))
    );
    lastQuestionnaireSubmissionDate = new Date().toDateString();
    saveData();
    updateDashboardUI();
    updateQuestionnaireStatus();
    // Hide/disable the form and show the completion message
    dailyQuestionnaireForm.classList.add("disabled");
    formStatusMessage.classList.remove("hidden");
    showAlert("Daily check-in submitted!");
  });

  // Add event listener to handle the 'selected' class on questionnaire cards
  dailyQuestionnaireForm.addEventListener("change", (event) => {
    if (event.target.type === "radio") {
      const questionName = event.target.name;
      const allOptionsForQuestion = dailyQuestionnaireForm.querySelectorAll(
        `input[name="${questionName}"]`
      );

      allOptionsForQuestion.forEach((radio) => {
        radio.parentElement.classList.remove("selected");
      });

      event.target.parentElement.classList.add("selected");
    }
  });

  generateChallengeBtn.addEventListener("click", generateEcoChallenge);
  openActivityModalBtn.addEventListener("click", () =>
    dailyActivityModal.classList.remove("hidden")
  );
  closeActivityModalBtn.addEventListener("click", () =>
    dailyActivityModal.classList.add("hidden")
  );
  activityInputForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const miles = parseFloat(document.getElementById("milesDriven").value) || 0;
    const shower =
      parseFloat(document.getElementById("showerMinutes").value) || 0;
    const meat = parseFloat(document.getElementById("meatMeals").value) || 0;
    const kwh =
      parseFloat(document.getElementById("electricityKWH").value) || 0;
    getAICarbonInsight(miles, shower, meat, kwh);
  });

  messageBoxOk.addEventListener("click", () =>
    customMessageBox.classList.add("hidden")
  );

  // --- Initial Load ---
  updateDashboardUI();
  renderSuggestions();
  renderDailyQuestionnaire();
  updateQuestionnaireStatus();
  const today = new Date().toDateString();
  if (lastChallengeDate !== today) {
    generateEcoChallenge();
  } else {
    ecoChallengeText.textContent = currentEcoChallenge;
  }
  setupHabitsSectionV2();
});
