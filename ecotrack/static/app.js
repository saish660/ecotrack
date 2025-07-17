// Main EcoTrack Application
class EcoTrackApp {
    constructor() {
        this.api = new EcoTrackAPI();
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Load dashboard data from API
            await this.loadDashboardData();

            // Initialize UI components
            this.initializeUI();
            this.bindEvents();

            // Load initial data
            await this.loadHabits();
            await this.loadAchievements();
        } catch (error) {
            console.error("Failed to initialize app:", error);
            this.showError("Failed to connect to server. Using offline mode.");
        }
    }

    async loadDashboardData() {
        try {
            const data = await this.api.getDashboardData();
            this.updateDashboardUI(data);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            // Fallback to default values
            this.updateDashboardUI({
                sustainability_score: 50,
                carbon_footprint: 150,
                habits_completed_today: 0,
                streak_count: 0,
            });
        }
    }

    updateDashboardUI(data) {
        // Update sustainability score
        const scoreElement = document.getElementById("sustainability-score");
        const scoreCircle = document.getElementById("score-circle");
        if (scoreElement && scoreCircle) {
            scoreElement.textContent = data.sustainability_score;
            const circumference = 2 * Math.PI * 45;
            const offset =
                circumference - (data.sustainability_score / 100) * circumference;
            scoreCircle.style.strokeDashoffset = offset;
        }

        // Update carbon footprint
        const carbonElement = document.getElementById("carbon-footprint");
        if (carbonElement) {
            carbonElement.textContent = `${data.carbon_footprint.toFixed(1)}`;
        }

        // Update habits completed
        const habitsElement = document.getElementById("habits-completed-today");
        if (habitsElement) {
            habitsElement.textContent = data.habits_completed_today;
        }

        // Update streak count
        const streakElement = document.getElementById("streak-count");
        if (streakElement) {
            streakElement.textContent = `${data.streak_count} days`;
        }
    }

    async loadHabits() {
        try {
            const data = await this.api.getDashboardData();
            this.renderHabits(data.habits || []);
        } catch (error) {
            console.error("Failed to load habits:", error);
            this.renderHabits([]);
        }
    }


    renderHabits(habits) {
        /* const habitList = document.getElementById("habit-items-list");
       if (!habitList) return;

       habitList.innerHTML = "";
       habits.forEach((habit) => {
         const listItem = document.createElement("li");
         listItem.className = "habit-item";
         listItem.innerHTML = `
                   <label>
                       <input type="checkbox" data-id="${habit.id}" ${
           habit.completed ? "checked" : ""
         }>
                       <span class="habit-text">${habit.text}</span>
                   </label>
                   <button class="delete-habit-btn" data-id="${habit.id}">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                       </svg>
                   </button>
               `;
         habitList.appendChild(listItem);
       });
   */
    }

    async loadAchievements() {
        try {
            const data = await this.api.getDashboardData();
            this.renderAchievements(data.achievements || []);
            this.renderProfileAchievementsPreview(data.achievements || []);
            this.lastAchievements = data.achievements || []; // Store for go-back
        } catch (error) {
            console.error("Failed to load achievements:", error);
            this.renderAchievements([]);
            this.renderProfileAchievementsPreview([]);
            this.lastAchievements = []; // Store for go-back
        }
    }

    // Render all achievements in the all-achievements tab
    renderAchievements(achievements) {
        const container = document.getElementById("achievements-container");
        if (!container) return;
        container.innerHTML = "";
        achievements.forEach((achievement) => {
            const element = document.createElement("div");
            element.className = `achievement-item ${
                achievement.unlocked ? "unlocked" : ""
            }`;
            element.innerHTML = `
        <span class="achievement-icon">${this.getAchievementIcon(
                achievement.achievement_type
            )}</span>
        <div class="achievement-title">${achievement.achievement_title}</div>
        <div class="achievement-desc">${this.getAchievementDescription(
                achievement.achievement_type
            )}</div>
      `;
            container.appendChild(element);
        });
    }

    // Render only a few achievements in the profile preview
    renderProfileAchievementsPreview(achievements) {
        const previewContainer = document.getElementById(
            "profile-achievements-preview"
        );
        if (!previewContainer) return;
        previewContainer.innerHTML = "";
        // Show up to 3 unlocked achievements, or fallback to first 3 if less than 3 unlocked
        const unlocked = achievements.filter((a) => a.unlocked);
        const toShow =
            unlocked.length >= 3 ? unlocked.slice(0, 3) : achievements.slice(0, 3);
        toShow.forEach((achievement) => {
            const element = document.createElement("div");
            element.className = `achievement-item ${
                achievement.unlocked ? "unlocked" : ""
            }`;
            element.innerHTML = `
        <span class="achievement-icon">${this.getAchievementIcon(
                achievement.achievement_type
            )}</span>
        <div class="achievement-title">${achievement.achievement_title}</div>
      `;
            previewContainer.appendChild(element);
        });
    }

    getAchievementIcon(type) {
        const icons = {
            first_checkin: "🌱",
            streak_3: "🔥",
            streak_7: "⚡",
            streak_30: "👑",
            habits_5: "✅",
            score_80: "🏆",
            carbon_reducer: "🌍",
            water_saver: "💧",
            energy_efficient: "⚡",
            waste_warrior: "🗑️",
            plant_based: "🥬",
            recycler: "♻️",
            composter: "🌱",
            bike_rider: "🚴",
            public_transport: "🚌",
            carpooler: "👥",
            solar_user: "☀️",
            local_eater: "🍎",
            seasonal_shopper: "🍂",
            plastic_free: "🚫",
            zero_waste: "♻️",
            tree_planter: "🌳",
            beach_cleaner: "🏖️",
            community_volunteer: "🤝",
            sustainable_shopper: "🛒",
            repair_master: "🔧",
            upcycler: "♻️",
            thrift_shopper: "👕",
            digital_nomad: "💻",
            paperless: "📱",
            smart_thermostat: "🏠",
            rainwater_collector: "🌧️",
            herb_gardener: "🌿",
            sustainable_fashion: "👗",
            minimalist: "📦",
            conscious_consumer: "🧠",
            carbon_neutral: "🌱",
            sustainability_educator: "📚",
            green_tech: "🔬",
            biodiversity_protector: "🦋",
            ocean_guardian: "🐋",
            climate_activist: "🌍",
            sustainable_traveler: "✈️",
            green_builder: "🏗️",
            renewable_energy: "⚡",
            sustainable_farmer: "👨‍🌾",
            wildlife_protector: "🦁",
            clean_air: "💨",
            water_conservation: "💧",
            soil_health: "🌱",
            pollution_fighter: "🛡️",
            sustainable_design: "🎨",
            green_innovation: "💡",
            circular_economy: "🔄",
            sustainable_future: "🔮",
        };
        return icons[type] || "🏆";
    }

    getAchievementDescription(type) {
        const descriptions = {
            first_checkin: "Complete your first daily check-in",
            streak_3: "Maintain a 3-day streak",
            streak_7: "Maintain a 7-day streak",
            streak_30: "Maintain a 30-day streak",
            habits_5: "Complete 5 habits in one day",
            score_80: "Reach 80+ sustainability score",
            carbon_reducer: "Reduce your carbon footprint by 20%",
            water_saver: "Save 1000 liters of water",
            energy_efficient: "Use 30% less energy",
            waste_warrior: "Reduce waste by 50%",
            plant_based: "Go plant-based for a week",
            recycler: "Recycle 100 items",
            composter: "Start composting at home",
            bike_rider: "Bike 50 miles this month",
            public_transport: "Use public transport 20 times",
            carpooler: "Carpool 10 times",
            solar_user: "Switch to solar energy",
            local_eater: "Eat local food for a month",
            seasonal_shopper: "Buy seasonal produce",
            plastic_free: "Go plastic-free for a week",
            zero_waste: "Achieve zero waste for a month",
            tree_planter: "Plant 10 trees",
            beach_cleaner: "Clean up a beach",
            community_volunteer: "Volunteer 20 hours",
            sustainable_shopper: "Buy only sustainable products",
            repair_master: "Repair 5 broken items",
            upcycler: "Upcycle 10 items",
            thrift_shopper: "Buy 20 second-hand items",
            digital_nomad: "Work remotely for a month",
            paperless: "Go paperless for 3 months",
            smart_thermostat: "Install smart home devices",
            rainwater_collector: "Collect rainwater",
            herb_gardener: "Grow your own herbs",
            sustainable_fashion: "Buy only sustainable fashion",
            minimalist: "Declutter 100 items",
            conscious_consumer: "Research all purchases",
            carbon_neutral: "Achieve carbon neutrality",
            sustainability_educator: "Teach 10 people about sustainability",
            green_tech: "Use green technology",
            biodiversity_protector: "Protect local biodiversity",
            ocean_guardian: "Protect marine life",
            climate_activist: "Participate in climate action",
            sustainable_traveler: "Travel sustainably",
            green_builder: "Build with sustainable materials",
            renewable_energy: "Use 100% renewable energy",
            sustainable_farmer: "Support sustainable farming",
            wildlife_protector: "Protect wildlife habitats",
            clean_air: "Improve air quality",
            water_conservation: "Conserve water resources",
            soil_health: "Improve soil health",
            pollution_fighter: "Reduce pollution",
            sustainable_design: "Design sustainable solutions",
            green_innovation: "Create green innovations",
            circular_economy: "Support circular economy",
            sustainable_future: "Build a sustainable future",
        };
        return descriptions[type] || "Achievement unlocked!";
    }

    initializeUI() {
        // Initialize navigation
        this.initializeNavigation();
        // Only render questionnaire if check-in tab is active
        if (document.getElementById("checkin").classList.contains("active")) {
            this.renderDailyQuestionnaire();
            this.initializeQuestionnaireProgress();
        }
        // Initialize suggestions
        this.renderSuggestions();
        // Initialize carbon graph
        this.initializeCarbonGraph();
        // Initialize go-back buttons
        this.initializeGoBackButtons();
        // Initialize daily habit checklist (dashboard)
        this.initializeDailyHabitChecklist();
        // Initialize 3D ecosystem visualization
        this.initializeEcosystem3D();
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll(".nav-item");
        const tabContents = document.querySelectorAll(".tab-content");
        navItems.forEach((item) => {
            item.addEventListener("click", () => {
                const targetTab = item.dataset.tab;
                navItems.forEach((nav) => nav.classList.remove("active"));
                tabContents.forEach((content) => content.classList.remove("active"));
                item.classList.add("active");
                document.getElementById(targetTab).classList.add("active");
                // Render carbon graph when profile tab is activated
                if (targetTab === "profile") {
                    this.renderCarbonGraph();
                }
                // Render all achievements when all-achievements tab is activated
                if (targetTab === "all-achievements") {
                    this.loadAchievements();
                }
                // Render questionnaire only when check-in tab is activated
                if (targetTab === "checkin") {
                    this.renderDailyQuestionnaire();
                    this.initializeQuestionnaireProgress();
                }
            });
        });
        // Also handle dashboard shortcut card for check-in
        const dashboardCheckinShortcut = document.getElementById(
            "dashboard-checkin-shortcut"
        );
        if (dashboardCheckinShortcut) {
            const btn = dashboardCheckinShortcut.querySelector(
                "button[data-tab='checkin']"
            );
            if (btn) {
                btn.addEventListener("click", () => {
                    navItems.forEach((nav) => nav.classList.remove("active"));
                    tabContents.forEach((content) => content.classList.remove("active"));
                    document
                        .querySelector(".nav-item[data-tab='checkin']")
                        .classList.add("active");
                    document.getElementById("checkin").classList.add("active");
                    this.renderDailyQuestionnaire();
                    this.initializeQuestionnaireProgress();
                });
            }
        }
        // Also handle profile preview "View All Badges" button
        const viewAllBadgesBtn = document.querySelector(
            "button[data-tab='all-achievements']"
        );
        if (viewAllBadgesBtn) {
            viewAllBadgesBtn.addEventListener("click", () => {
                navItems.forEach((nav) => nav.classList.remove("active"));
                tabContents.forEach((content) => content.classList.remove("active"));
                document
                    .querySelector(".nav-item[data-tab='profile']")
                    .classList.remove("active");
                document
                    .querySelector(".nav-item[data-tab='all-achievements']")
                    ?.classList.add("active");
                document.getElementById("all-achievements").classList.add("active");
                this.loadAchievements();
            });
        }
    }

    initializeCarbonGraph() {
        // Initialize the canvas for the carbon graph
        const canvas = document.getElementById("carbonGraph");
        if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
        }
    }

    renderCarbonGraph() {
        const canvas = document.getElementById("carbonGraph");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Sample data for the week (in kg CO2)
        const thisWeekData = [12.5, 15.2, 8.7, 11.3, 9.8, 13.1, 10.5];
        const lastWeekData = [14.2, 16.8, 12.1, 13.5, 11.9, 15.3, 12.8];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        // Chart dimensions
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        const maxValue = Math.max(...thisWeekData, ...lastWeekData);

        // Draw grid lines
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Helper function to draw line
        const drawLine = (data, color, lineWidth = 3) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.beginPath();
            data.forEach((value, index) => {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                const y = height - padding - (value / maxValue) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        };

        // Draw data points
        const drawPoints = (data, color) => {
            ctx.fillStyle = color;
            data.forEach((value, index) => {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                const y = height - padding - (value / maxValue) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        };

        // Draw lines
        drawLine(lastWeekData, "#3b82f6", 2);
        drawLine(thisWeekData, "#22c55e", 3);

        // Draw points
        drawPoints(lastWeekData, "#3b82f6");
        drawPoints(thisWeekData, "#22c55e");

        // Draw day labels
        ctx.fillStyle = "#222";
        ctx.font = "12px Outfit";
        ctx.textAlign = "center";
        days.forEach((day, index) => {
            const x = padding + (chartWidth / (days.length - 1)) * index;
            ctx.fillText(day, x, height - 10);
        });

        // Draw value labels on the left
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) {
            const value = (maxValue / 5) * (5 - i);
            const y = padding + (chartHeight / 5) * i + 4;
            ctx.fillText(`${value.toFixed(1)}kg`, padding - 10, y);
        }
    }

    renderDailyQuestionnaire() {
        const form = document.getElementById("daily-questionnaire-form");
        if (!form) return;

        const questions = [
            {
                id: "q1",
                question: "How did you commute today?",
                options: [
                    {text: "🚶 Walk/Cycle", value: "Walk/Cycle"},
                    {text: "🚌 Public Transport", value: "Public Transport"},
                    {text: "🚗 Car (single)", value: "Car (single)"},
                    {text: "👥 Car (carpool)", value: "Car (carpool)"},
                ],
            },
            {
                id: "q2",
                question: "Did you consume meat today?",
                options: [
                    {text: "🥩 Yes", value: true},
                    {text: "🥬 No (Plant-based)", value: false},
                ],
            },
            {
                id: "q3",
                question: "Did you unplug unused electronics?",
                options: [
                    {text: "✅ Yes, all", value: "Yes, all"},
                    {text: "⚡ Some", value: "Some"},
                    {text: "❌ No", value: "No"},
                ],
            },
        ];

        form.innerHTML = "";
        questions.forEach((q) => {
            const questionDiv = document.createElement("div");
            questionDiv.className = "questionnaire-item";

            const questionText = document.createElement("p");
            questionText.className = "question-text";
            questionText.textContent = q.question;
            questionDiv.appendChild(questionText);

            const optionsGrid = document.createElement("div");
            optionsGrid.className = "options-grid";

            q.options.forEach((option) => {
                const optionLabel = document.createElement("label");
                optionLabel.className = "option-card";
                optionLabel.innerHTML = `
                    <input type="radio" name="${q.id}" value="${option.value}" required>
                    <div class="option-content">
                        <span>${option.text}</span>
                    </div>
                `;
                optionsGrid.appendChild(optionLabel);
            });
            questionDiv.appendChild(optionsGrid);
            form.appendChild(questionDiv);
        });

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit Daily Check-in";
        submitButton.className = "btn btn-primary";
        submitButton.style.marginTop = "1rem";
        form.appendChild(submitButton);
    }

    initializeQuestionnaireProgress() {
        const progressFill = document.getElementById("questionnaire-progress");
        const progressText = document.getElementById("progress-text");
        if (progressFill && progressText) {
            progressFill.style.width = "0%";
            progressText.textContent = "0/3 questions answered";
        }
    }

    async renderSuggestions() {
        const container = document.getElementById("suggestion-cards-container");
        if (!container) return;

        let generatedSuggestions = await fetch("get_suggestions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: {}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok (${response.status})`);
                }
                return response.json();
            })
            .then(data => {
                return data;
            })

        console.log(generatedSuggestions);

        const suggestions = [
            {
                title: "Reduce Meat Consumption",
                reason:
                    "Producing meat requires significant resources. Opting for plant-based meals reduces your environmental impact.",
                carbonReduction: "5-10 kg CO2e/month",
            },
            {
                title: "Switch to LED Light Bulbs",
                reason:
                    "LEDs consume up to 85% less electricity than incandescent bulbs, lowering your carbon emissions and energy bills.",
                carbonReduction: "3-5 kg CO2e/month",
            },
            {
                title: "Compost Food Waste",
                reason:
                    "Composting diverts food from landfills, where it produces methane, a potent greenhouse gas.",
                carbonReduction: "2-4 kg CO2e/month",
            },
        ];

        container.innerHTML = "";
        suggestions.forEach((suggestion) => {
            const card = document.createElement("div");
            card.className = "suggestion-card";
            card.innerHTML = `
                <h3>${suggestion.title}</h3>
                <p>${suggestion.reason}</p>
                <div>
                    <span class="suggestion-reduction">${suggestion.carbonReduction}</span>
                </div>
                <button class="btn btn-secondary add-suggestion-to-habits-btn" data-title="${suggestion.title}">Start This Habit</button>
            `;
            container.appendChild(card);
        });
    }

    bindEvents() {
        // Questionnaire events
        this.bindQuestionnaireEvents();

        // Modal events
        this.bindModalEvents();
    }

    bindQuestionnaireEvents() {
        const form = document.getElementById("daily-questionnaire-form");
        if (form) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const formData = new FormData(form);
                const questionnaireData = {
                    commute_choice: formData.get("q1"),
                    meat_consumption: formData.get("q2") === "true",
                    electronics_unplugged: formData.get("q3"),
                };

                try {
                    await this.api.submitQuestionnaire(questionnaireData);
                    this.showSuccess("Daily check-in submitted successfully!");
                    await this.loadDashboardData();
                    await this.loadAchievements();
                } catch (error) {
                    console.error("Failed to submit questionnaire:", error);
                    this.showError("Failed to submit questionnaire");
                }
            });

            form.addEventListener("change", (event) => {
                if (event.target.type === "radio") {
                    this.updateQuestionnaireProgress();
                    this.updateOptionCardSelection(event.target);
                }
            });

            // Add click event listeners for option cards
            form.addEventListener("click", (event) => {
                const optionCard = event.target.closest(".option-card");
                if (optionCard) {
                    const radioInput = optionCard.querySelector('input[type="radio"]');
                    if (radioInput) {
                        radioInput.checked = true;
                        this.updateOptionCardSelection(radioInput);
                        this.updateQuestionnaireProgress();
                    }
                }
            });
        }
    }

    updateOptionCardSelection(radioInput) {
        // Remove selected class from all option cards in the same group
        const name = radioInput.name;
        const allOptions = document.querySelectorAll(`input[name="${name}"]`);
        allOptions.forEach((option) => {
            const optionCard = option.closest(".option-card");
            if (optionCard) {
                optionCard.classList.remove("selected");
            }
        });

        // Add selected class to the clicked option card
        const selectedOptionCard = radioInput.closest(".option-card");
        if (selectedOptionCard) {
            selectedOptionCard.classList.add("selected");
        }
    }

    updateQuestionnaireProgress() {
        const form = document.getElementById("daily-questionnaire-form");
        const progressFill = document.getElementById("questionnaire-progress");
        const progressText = document.getElementById("progress-text");

        if (!form || !progressFill || !progressText) return;

        const totalQuestions = 3;
        const answeredQuestions = new Set();

        ["q1", "q2", "q3"].forEach((qId) => {
            const selectedOption = form.querySelector(`input[name="${qId}"]:checked`);
            if (selectedOption) {
                answeredQuestions.add(qId);
            }
        });

        const progressPercentage = (answeredQuestions.size / totalQuestions) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        progressText.textContent = `${answeredQuestions.size}/${totalQuestions} questions answered`;
    }

    bindModalEvents() {
        // Note: All habit-related modal logic is now in script.js
        // This can be used for other modals if needed in the future.
    }

    initializeGoBackButtons() {
        document.querySelectorAll(".go-back-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-go-back");
                const navItems = document.querySelectorAll(".nav-item");
                const tabContents = document.querySelectorAll(".tab-content");
                navItems.forEach((nav) => nav.classList.remove("active"));
                tabContents.forEach((content) => content.classList.remove("active"));
                document
                    .querySelector(`.nav-item[data-tab='${target}']`)
                    .classList.add("active");
                document.getElementById(target).classList.add("active");
                // Special case: if going back to dashboard, re-render ecosystem and habits
                if (target === "dashboard") {
                    this.initializeEcosystemVisualization();
                    this.initializeDailyHabitChecklist();
                }
                if (target === "profile") {
                    this.renderProfileAchievementsPreview(this.lastAchievements || []);
                }
            });
        });
    }

    // --- Daily Habit Checklist (Dashboard) ---
    initializeDailyHabitChecklist() {
        const form = document.getElementById("daily-habit-checklist-form");
        const list = document.getElementById("dashboard-habit-list");
        const statusMsg = document.getElementById("habit-checklist-status-message");
        if (!form || !list) return;


        const habits =
            JSON.parse(localStorage.getItem("habitsDB") || "null") || defaultHabits;
        // Load state from localStorage
        const today = new Date().toDateString();
        const saved = JSON.parse(
            localStorage.getItem("habitChecklistState") || "{}"
        );
        const submittedDate = saved.date;
        const checked = saved.checked || [];
        // If already submitted today, disable form
        const isSubmitted = submittedDate === today;
        list.innerHTML = "";
        habits.forEach((habit) => {
            const li = document.createElement("li");
            li.className = "habit-item";
            li.innerHTML = `<label><input type="checkbox" value="${habit.id}" ${
                checked.includes(habit.id) ? "checked" : ""
            } ${isSubmitted ? "disabled" : ""}> ${habit.text}</label>`;
            list.appendChild(li);
        });
        form.querySelectorAll("input[type='checkbox']").forEach((cb) => {
            cb.addEventListener("change", () => {
                // Save checked state
                const checkedIds = Array.from(
                    form.querySelectorAll("input[type='checkbox']:checked")
                ).map((cb) => parseInt(cb.value));
                localStorage.setItem(
                    "habitChecklistState",
                    JSON.stringify({date: submittedDate, checked: checkedIds})
                );
            });
        });
        // Handle submit
        form.onsubmit = (e) => {
            e.preventDefault();
            // Save as submitted for today
            const checkedIds = Array.from(
                form.querySelectorAll("input[type='checkbox']:checked")
            ).map((cb) => parseInt(cb.value));
            localStorage.setItem(
                "habitChecklistState",
                JSON.stringify({date: today, checked: checkedIds})
            );
            // Disable all checkboxes and show message
            form
                .querySelectorAll("input[type='checkbox']")
                .forEach((cb) => (cb.disabled = true));
            form.querySelector("#submit-habit-checklist").disabled = true;
            statusMsg.classList.remove("hidden");
        };
        // If already submitted, disable and show message
        if (isSubmitted) {
            form
                .querySelectorAll("input[type='checkbox']")
                .forEach((cb) => (cb.disabled = true));
            form.querySelector("#submit-habit-checklist").disabled = true;
            statusMsg.classList.remove("hidden");
        } else {
            form.querySelector("#submit-habit-checklist").disabled = false;
            statusMsg.classList.add("hidden");
        }
    }

    // --- Habit Management (Habits Page Only) ---
    // Note: All habit management logic has been moved to script.js
    // to avoid conflicts and keep a single source of truth.

    showHabitInputDialog(habits, renderHabits, editIdx = null) {
        // This is now legacy and handled by script.js
    }

    initializeEcosystem3D() {
        const container = document.getElementById("ecosystem3d");
        if (!container) return;
        container.innerHTML = "";
        const width = container.offsetWidth || 400;
        const height = container.offsetHeight || 300;
        const scene = new THREE.Scene();
        // --- Dynamic sky and grass color based on score ---
        let skyColor, grassColor;
        const score = parseInt(document.getElementById("sustainability-score")?.textContent || "0");
        if (score < 20) {
            skyColor = 0xadb5bd; // grayish sky
            grassColor = 0xc2b280; // brown/yellow grass
        } else if (score > 70) {
            skyColor = 0x7ecbff; // bright blue sky
            grassColor = 0x3cb043; // lush green grass
        } else {
            // Interpolate between dead and lush
            const t = (score - 20) / 50;
            // Sky: 0xadb5bd (gray) to 0x7ecbff (blue)
            const skyDead = {r: 0xad, g: 0xb5, b: 0xbd};
            const skyLush = {r: 0x7e, g: 0xcb, b: 0xff};
            const skyR = Math.round(skyDead.r + (skyLush.r - skyDead.r) * t);
            const skyG = Math.round(skyDead.g + (skyLush.g - skyDead.g) * t);
            const skyB = Math.round(skyDead.b + (skyLush.b - skyDead.b) * t);
            skyColor = (skyR << 16) | (skyG << 8) | skyB;
            // Grass: 0xc2b280 (brown) to 0x3cb043 (green)
            const grassDead = {r: 0xc2, g: 0xb2, b: 0x80};
            const grassLush = {r: 0x3c, g: 0xb0, b: 0x43};
            const grassR = Math.round(grassDead.r + (grassLush.r - grassDead.r) * t);
            const grassG = Math.round(grassDead.g + (grassLush.g - grassDead.g) * t);
            const grassB = Math.round(grassDead.b + (grassLush.b - grassDead.b) * t);
            grassColor = (grassR << 16) | (grassG << 8) | grassB;
        }
        // Sky dome (large sphere)
        const skyGeo = new THREE.SphereGeometry(60, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({color: skyColor, side: THREE.BackSide});
        const sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);
        // Sun (large yellow sphere in the sky)
        const sunGeo = new THREE.SphereGeometry(2.2, 24, 24);
        const sunMat = new THREE.MeshBasicMaterial({color: 0xfff066});
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(-10, 18, -18);
        scene.add(sun);
        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 10, 28);
        // Renderer
        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);
        // Ground (dynamic grass color, larger land)
        const groundGeo = new THREE.CylinderGeometry(16, 16, 1.5, 40);
        const groundMat = new THREE.MeshLambertMaterial({color: grassColor});
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -1;
        scene.add(ground);
        // Add dirt patch
        const dirtGeo = new THREE.CircleGeometry(4, 24);
        const dirtMat = new THREE.MeshLambertMaterial({color: 0xc2b280});
        const dirt = new THREE.Mesh(dirtGeo, dirtMat);
        dirt.rotation.x = -Math.PI / 2;
        dirt.position.y = -0.7;
        scene.add(dirt);
        // Add rocks
        for (let i = 0; i < 5; i++) {
            const rockGeo = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.3);
            const rockMat = new THREE.MeshLambertMaterial({color: 0x888888});
            const rock = new THREE.Mesh(rockGeo, rockMat);
            const angle = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 4;
            rock.position.set(Math.cos(angle) * r, -0.2, Math.sin(angle) * r);
            rock.rotation.y = Math.random() * Math.PI;
            scene.add(rock);
        }
        // Add flowers
        for (let i = 0; i < 8; i++) {
            const flowerGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8);
            const flowerMat = new THREE.MeshLambertMaterial({color: 0x4caf50});
            const stem = new THREE.Mesh(flowerGeo, flowerMat);
            const angle = Math.random() * Math.PI * 2;
            const r = 5 + Math.random() * 5;
            stem.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
            // Petal
            const petalGeo = new THREE.SphereGeometry(0.18, 8, 8);
            const petalMat = new THREE.MeshLambertMaterial({color: 0xffc0cb});
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.set(0, 0.3, 0);
            stem.add(petal);
            scene.add(stem);
        }
        // Trees: more realistic, multi-cone, color/size/rotation variation
        const treeCount = Math.max(2, Math.floor(score / 20) + 2);
        let leafColor;
        if (score < 20) {
            leafColor = 0xaaaaaa; // dead/pale
        } else if (score > 70) {
            leafColor = 0x1fa72a; // vivid green
        } else {
            // Interpolate between pale and vivid green
            // 0xaaaaaa (pale) to 0x1fa72a (vivid)
            const t = (score - 20) / 50;
            // Linear interpolation for RGB
            const pale = {r: 0xaa, g: 0xaa, b: 0xaa};
            const vivid = {r: 0x1f, g: 0xa7, b: 0x2a};
            const r = Math.round(pale.r + (vivid.r - pale.r) * t);
            const g = Math.round(pale.g + (vivid.g - pale.g) * t);
            const b = Math.round(pale.b + (vivid.b - pale.b) * t);
            leafColor = (r << 16) | (g << 8) | b;
        }
        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2 + Math.random() * 0.2;
            const x = Math.cos(angle) * (8 + Math.random() * 4);
            const z = Math.sin(angle) * (8 + Math.random() * 4);
            // Trunk
            const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.5 + Math.random(), 8);
            const trunkMat = new THREE.MeshLambertMaterial({color: score < 20 ? 0x6b4f2a : 0x8b5a2b});
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(x, 0.5, z);
            trunk.rotation.y = Math.random() * Math.PI;
            scene.add(trunk);
            // Leaves (multi-cone)
            let leafTops = [];
            if (score < 20) {
                // Dead trees: sparse, pale cones or none
                if (Math.random() < 0.5) continue;
                for (let j = 0; j < 1; j++) {
                    const leavesGeo = new THREE.ConeGeometry(1.1 + Math.random() * 0.5, 2.2 + Math.random() * 0.5, 10);
                    const leavesMat = new THREE.MeshLambertMaterial({color: 0xcccccc});
                    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
                    leaves.position.set(x, 2.2 + j * 0.7, z);
                    leaves.rotation.y = Math.random() * Math.PI;
                    scene.add(leaves);
                    leafTops.push(leaves.position.clone());
                }
            } else {
                for (let j = 0; j < 2 + Math.floor(Math.random() * 2); j++) {
                    const leavesGeo = new THREE.ConeGeometry(1.1 + Math.random() * 0.5, 2.2 + score / 50 + Math.random() * 0.5, 10);
                    const leavesMat = new THREE.MeshLambertMaterial({color: leafColor});
                    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
                    leaves.position.set(x, 2.2 + j * 0.7, z);
                    leaves.rotation.y = Math.random() * Math.PI;
                    scene.add(leaves);
                    leafTops.push(leaves.position.clone());
                }
            }
            // Add fruits (more with higher score)
            if (score >= 20) {
                const fruitTypes = [
                    {color: 0xff2d2d, name: 'apple'},
                    {color: 0xffa500, name: 'orange'},
                    {color: 0xffe066, name: 'lemon'},
                ];
                const fruitCount = Math.floor(1 + (score / 100) * 4 + Math.random() * 2); // 1-6 fruits per tree
                for (let f = 0; f < fruitCount; f++) {
                    const fruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
                    const fruitGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.05, 8, 8);
                    const fruitMat = new THREE.MeshLambertMaterial({color: fruitType.color});
                    const fruit = new THREE.Mesh(fruitGeo, fruitMat);
                    // Place fruit near a random leaf top, with some random offset
                    if (leafTops.length > 0) {
                        const top = leafTops[Math.floor(Math.random() * leafTops.length)];
                        fruit.position.set(
                            top.x + (Math.random() - 0.5) * 0.7,
                            top.y - 0.5 + (Math.random() - 0.5) * 0.4,
                            top.z + (Math.random() - 0.5) * 0.7
                        );
                    } else {
                        fruit.position.set(x, 2.2, z);
                    }
                    scene.add(fruit);
                }
            }
        }
        // Animals: add birds and rabbits, animate them
        const animalCount = Math.max(0, Math.floor(score / 30) - Math.floor(parseFloat(document.getElementById("carbon-footprint")?.textContent || "0") / 50));
        const animals = [];
        for (let i = 0; i < animalCount; i++) {
            if (Math.random() < 0.5) {
                // Bird (sphere body, cone beak, wings)
                const bird = new THREE.Group();
                const bodyGeo = new THREE.SphereGeometry(0.25, 8, 8);
                const bodyMat = new THREE.MeshLambertMaterial({color: 0x2196f3});
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                bird.add(body);
                const beakGeo = new THREE.ConeGeometry(0.08, 0.18, 8);
                const beakMat = new THREE.MeshLambertMaterial({color: 0xffa726});
                const beak = new THREE.Mesh(beakGeo, beakMat);
                beak.position.set(0, 0, 0.28);
                beak.rotation.x = Math.PI / 2;
                bird.add(beak);
                // Wings
                for (let w = -1; w <= 1; w += 2) {
                    const wingGeo = new THREE.BoxGeometry(0.18, 0.05, 0.5);
                    const wingMat = new THREE.MeshLambertMaterial({color: 0x1976d2});
                    const wing = new THREE.Mesh(wingGeo, wingMat);
                    wing.position.set(w * 0.22, 0, 0);
                    wing.rotation.z = w * 0.3;
                    bird.add(wing);
                }
                bird.position.set(Math.random() * 10 - 5, 2.5 + Math.random() * 2, Math.random() * 10 - 5);
                scene.add(bird);
                animals.push({mesh: bird, type: 'bird', baseY: bird.position.y, phase: Math.random() * Math.PI * 2});
            } else {
                // Rabbit (body, head, ears)
                const rabbit = new THREE.Group();
                const bodyGeo = new THREE.SphereGeometry(0.28, 10, 10);
                const bodyMat = new THREE.MeshLambertMaterial({color: 0xf5f5dc});
                const body = new THREE.Mesh(bodyGeo, bodyMat);
                rabbit.add(body);
                const headGeo = new THREE.SphereGeometry(0.18, 10, 10);
                const head = new THREE.Mesh(headGeo, bodyMat);
                head.position.set(0, 0.22, 0.18);
                rabbit.add(head);
                // Ears
                for (let e = -1; e <= 1; e += 2) {
                    const earGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.32, 8);
                    const earMat = new THREE.MeshLambertMaterial({color: 0xf5f5dc});
                    const ear = new THREE.Mesh(earGeo, earMat);
                    ear.position.set(e * 0.08, 0.42, 0.18);
                    ear.rotation.x = Math.PI / 2.2;
                    rabbit.add(ear);
                }
                rabbit.position.set(Math.random() * 10 - 5, 0.2, Math.random() * 10 - 5);
                scene.add(rabbit);
                animals.push({
                    mesh: rabbit,
                    type: 'rabbit',
                    baseY: rabbit.position.y,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        // --- More land details ---
        // Bushes (green spheres)
        for (let i = 0; i < 7; i++) {
            const bushGeo = new THREE.SphereGeometry(0.6 + Math.random() * 0.3, 12, 12);
            const bushMat = new THREE.MeshLambertMaterial({color: 0x2e7d32 + Math.floor(Math.random() * 0x1000)});
            const bush = new THREE.Mesh(bushGeo, bushMat);
            const angle = Math.random() * Math.PI * 2;
            const r = 7 + Math.random() * 7;
            bush.position.set(Math.cos(angle) * r, -0.5, Math.sin(angle) * r);
            scene.add(bush);
        }
        // Small logs (brown cylinders)
        for (let i = 0; i < 4; i++) {
            const logGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2 + Math.random() * 0.7, 10);
            const logMat = new THREE.MeshLambertMaterial({color: 0x8b5a2b});
            const log = new THREE.Mesh(logGeo, logMat);
            const angle = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 8;
            log.position.set(Math.cos(angle) * r, -0.6, Math.sin(angle) * r);
            log.rotation.z = Math.random() * Math.PI * 2;
            scene.add(log);
        }
        // Flower patches (clusters of small colored spheres)
        const flowerColors = [0xffc0cb, 0xffe066, 0x8ecae6, 0xf08080, 0xb5e48c];
        for (let i = 0; i < 5; i++) {
            const patchAngle = Math.random() * Math.PI * 2;
            const patchR = 5 + Math.random() * 8;
            for (let j = 0; j < 5 + Math.floor(Math.random() * 4); j++) {
                const flowerGeo = new THREE.SphereGeometry(0.11 + Math.random() * 0.04, 8, 8);
                const flowerMat = new THREE.MeshLambertMaterial({color: flowerColors[Math.floor(Math.random() * flowerColors.length)]});
                const flower = new THREE.Mesh(flowerGeo, flowerMat);
                const offsetA = patchAngle + (Math.random() - 0.5) * 0.5;
                const offsetR = patchR + (Math.random() - 0.5) * 1.2;
                flower.position.set(Math.cos(offsetA) * offsetR, -0.4, Math.sin(offsetA) * offsetR);
                scene.add(flower);
            }
        }

        // Animate
        function animate(time) {
            requestAnimationFrame(animate);
            // Animate animals
            animals.forEach(obj => {
                if (obj.type === 'bird') {
                    obj.mesh.position.y = obj.baseY + Math.sin(time / 400 + obj.phase) * 0.3;
                    obj.mesh.position.x += Math.sin(time / 1000 + obj.phase) * 0.01;
                    obj.mesh.position.z += Math.cos(time / 1000 + obj.phase) * 0.01;
                } else if (obj.type === 'rabbit') {
                    obj.mesh.position.y = obj.baseY + Math.abs(Math.sin(time / 500 + obj.phase)) * 0.15;
                }
            });
            renderer.render(scene, camera);
        }

        animate();
    }

    showSuccess(message) {
        this.showMessage(message, "success");
    }

    showError(message) {
        this.showMessage(message, "error");
    }

    showMessage(message, type = "info") {
        const messageBox = document.getElementById("custom-message-box");
        const messageText = document.getElementById("message-box-text");

        if (messageBox && messageText) {
            messageText.textContent = message;
            messageBox.classList.remove("hidden");

            // Auto-hide after 3 seconds
            setTimeout(() => {
                messageBox.classList.add("hidden");
            }, 3000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new EcoTrackApp();
});


document.addEventListener("DOMContentLoaded", () => {
    window.app = new EcoTrackApp();
});