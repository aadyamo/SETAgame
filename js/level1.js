(function () {
    const questions = [
        {
            prompt: "A visitor badge is found unattended outside the secure lab. What is the safest immediate action?",
            options: [
                { text: "Use it to enter the lab and return it later.", correct: false, rationale: "Never reuse an unknown badge; someone else may be exploiting access." },
                { text: "Bring the badge directly to the security desk.", correct: true, rationale: "Hand the badge to security so it can be deactivated and the owner verified." },
                { text: "Leave the badge in place in case the owner returns.", correct: false, rationale: "Leaving credentials unattended creates an ongoing risk." }
            ]
        },
        {
            prompt: "Your workstation prompts for a software update during a briefing. What is the correct approach?",
            options: [
                { text: "Install the update immediately to stay current.", correct: false, rationale: "Interrupting critical duties can cause downtime; verify first." },
                { text: "Ignore the prompt and disable updates so it does not return.", correct: false, rationale: "Updates are vital; disabling them increases exposure." },
                { text: "Verify the source after the briefing, then schedule the update.", correct: true, rationale: "Confirm authenticity, then update at an approved maintenance window." }
            ]
        },
        {
            prompt: "During orientation you receive a USB drive labeled “training deck.” How should you proceed?",
            options: [
                { text: "Insert it into a secure laptop to check the contents.", correct: false, rationale: "Unknown media can contain malware; do not connect it yourself." },
                { text: "Hand it to the instructor so they can verify and distribute it.", correct: true, rationale: "Only approved staff should scan and distribute removable media." },
                { text: "Ignore it; training materials are optional.", correct: false, rationale: "Reporting suspicious media ensures the organization can investigate safely." }
            ]
        },
        {
            prompt: "Someone tailgates behind you at a badge reader saying they forgot their ID. What is your response?",
            options: [
                { text: "Hold the door since the person looks familiar.", correct: false, rationale: "Visual familiarity is not authentication; this bypasses controls." },
                { text: "Ask them to badge in and report the incident.", correct: true, rationale: "Tailgating attempts must be stopped and reported." },
                { text: "Let them in, but notify security afterward.", correct: false, rationale: "Allowing entry still creates an immediate security gap." }
            ]
        },
        {
            prompt: "You spot a social media post revealing your team’s deployment schedule. Best action?",
            options: [
                { text: "Share it with your team chat to raise awareness.", correct: false, rationale: "Sharing increases circulation of sensitive information." },
                { text: "Privately capture the evidence and alert security.", correct: true, rationale: "Documenting the leak and reporting enables a formal response." },
                { text: "Publicly comment asking for the post to be removed.", correct: false, rationale: "Public responses can amplify the leak and reveal actual details." }
            ]
        },
        {
            prompt: "You get a call from an unknown number claiming to be your boss. The caller sounds like your boss and is asking you for your bank details for because of an issue with your details in the database?",
            options: [
                { text: "Provide the requested information to avoid any issues.", correct: false, rationale: "Never provide sensitive information over the phone without verifying the caller's identity." },
                { text: "Hang up and call your boss directly to verify the request.", correct: true, rationale: "Verifying identity through a known contact is essential for security." },
                { text: "Ask for more details about the issue and then provide information.", correct: false, rationale: "Providing sensitive information without verification is risky." }
            ]
        }
    ];

    const introPanel = document.getElementById("orientation-intro");
    const questionPanel = document.getElementById("orientation-question");
    const outcomePanel = document.getElementById("orientation-outcome");
    const startButton = document.getElementById("orientation-start");
    const restartButton = document.getElementById("orientation-restart");
    const progressIndicator = document.getElementById("orientation-progress");
    const scoreIndicator = document.getElementById("orientation-score");
    const summary = document.getElementById("orientation-summary");

    const state = {
        index: 0,
        score: 0,
        strikes: 0,
        active: false,
        finished: false
    };

    function updateStatus() {
        const completed = state.active
            ? state.index + 1
            : Math.min(state.index + (state.finished ? 1 : 0), questions.length);
        progressIndicator.textContent = "Progress: " + completed + "/" + questions.length;
        scoreIndicator.textContent = "Score: " + state.score;
    }

    function togglePanels({ showIntro = false, showQuestion = false, showOutcome = false }) {
        introPanel.classList.toggle("hidden", !showIntro);
        questionPanel.classList.toggle("hidden", !showQuestion);
        outcomePanel.classList.toggle("hidden", !showOutcome);
    }

    function renderQuestion() {
        const current = questions[state.index];
        questionPanel.innerHTML = "";

        const heading = document.createElement("h2");
        heading.textContent = "Scenario " + (state.index + 1);

        const prompt = document.createElement("p");
        prompt.className = "panel-copy";
        prompt.textContent = current.prompt;

        const optionGrid = document.createElement("div");
        optionGrid.className = "option-grid";

        current.options.forEach((option, optionIndex) => {
            const button = document.createElement("button");
            button.className = "button decision";
            button.type = "button";
            button.textContent = option.text;
            button.addEventListener("click", () => handleAnswer(optionIndex));
            optionGrid.appendChild(button);
        });

        const feedback = document.createElement("p");
        feedback.className = "feedback";
        feedback.id = "orientation-feedback";
        feedback.setAttribute("aria-live", "polite");

        questionPanel.append(heading, prompt, optionGrid, feedback);
    }

    function handleAnswer(selectedIndex) {
        const current = questions[state.index];
        const isCorrect = current.options[selectedIndex].correct;
        const buttons = questionPanel.querySelectorAll("button.decision");
        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            btn.classList.toggle("correct", current.options[idx].correct);
            btn.classList.toggle("incorrect", !current.options[idx].correct && idx === selectedIndex);
        });

        const feedback = questionPanel.querySelector("#orientation-feedback");

        if (isCorrect) {
            state.score += 10;
            feedback.textContent = "Correct: " + current.options[selectedIndex].rationale;
        } else {
            state.strikes += 1;
            feedback.textContent = "Strike " + state.strikes + ": " + current.options[selectedIndex].rationale;
        }
        updateStatus();

        const nextButton = document.createElement("button");
        nextButton.className = "button secondary";
        nextButton.type = "button";
        nextButton.textContent = state.index === questions.length - 1 || state.strikes >= 3 ? "View Results" : "Next Scenario";
        nextButton.addEventListener("click", () => advance());

        feedback.after(nextButton);
    }

    function advance() {
        if (state.strikes >= 3 || state.index === questions.length - 1) {
            finish();
            return;
        }
        state.index += 1;
        updateStatus();
        renderQuestion();
    }

    function finish() {
        state.active = false;
        state.finished = true;
        const performance = state.score >= 40 && state.strikes === 0
            ? "Outstanding awareness! You passed without a single infraction."
            : state.score >= 30
                ? "Solid work. Review the flagged scenarios to sharpen your instincts."
                : "Mission failed. Re-run the simulation to strengthen your response plan.";

        summary.textContent = performance + " Final score: " + state.score + " with " + state.strikes + " strike(s).";
        togglePanels({ showOutcome: true });
        updateStatus();
    }

    function start() {
        state.index = 0;
        state.score = 0;
        state.strikes = 0;
        state.active = true;
        state.finished = false;
        updateStatus();
        renderQuestion();
        togglePanels({ showQuestion: true });
    }

    startButton.addEventListener("click", start);
    restartButton.addEventListener("click", () => {
        togglePanels({ showQuestion: false, showOutcome: false, showIntro: true });
        state.active = false;
        state.finished = false;
        state.index = 0;
        state.score = 0;
        state.strikes = 0;
        updateStatus();
    });

    updateStatus();
}());
