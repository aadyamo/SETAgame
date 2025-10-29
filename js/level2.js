(function () {
    const samples = [
        {
            sender: "hr-updates@company-careers.com",
            subject: "ACTION REQUIRED: Annual Benefits Confirmation",
            body: [
                "Hello teammate,",
                "Due to a system migration, all employees must re-enter their payroll credentials in the secure portal by tonight.",
                "Use the link below to avoid suspension of your benefits: http://company-careers.com/update",
                "Regards,",
                "People Team"
            ],
            phish: true,
            clue: "Urgent deadline, suspicious domain redirecting to non-corporate URL."
        },
        {
            sender: "security@intranet.local",
            subject: "Weekly MFA Check-in",
            body: [
                "Security Team reminder:",
                "Next week we will rotate MFA codes. No action is required from you today.",
                "We will send an approved push notification when it is your turn.",
                "Stay safe!"
            ],
            phish: false,
            clue: "Routine notification, no request for credentials or link."
        },
        {
            sender: "it-support@0ffice365.com",
            subject: "Mailbox Quota Exceeded",
            body: [
                "Attention user,",
                "Your email storage is over quota. Sign in immediately to restore service.",
                "Click here: http://0ffice365.com/restore",
                "If you do not act within 12 hours your mailbox will be deleted.",
                "IT Services"
            ],
            phish: true,
            clue: "Misspelled domain and aggressive threat to delete mailbox."
        },
        {
            sender: "news@trustedvendor.com",
            subject: "Quarterly Patch Notes & Improvements",
            body: [
                "Hi there,",
                "We have released v2.9 of the analytics dashboard. This update is automatic.",
                "You can review the change log in the customer portal under 'Release Notes'.",
                "Let us know if you have any questions."
            ],
            phish: false,
            clue: "Informational message, no suspicious attachments or asks."
        },
        {
            sender: "finance-alerts@internal-net.local",
            subject: "Invoice verification this Friday",
            body: [
                "Team,",
                "This Friday we will conduct the biweekly invoice verification drill.",
                "Ensure you only approve invoices originating from the finance queue and report suspected fraud through the hotline.",
                "Thank you."
            ],
            phish: false,
            clue: "Matches known process, no external links."
        },
        {
            sender: "executive-office@board-secure.com",
            subject: "Executive voice memo (confidential)",
            body: [
                "Hi,",
                "Our CEO recorded a confidential voice memo for select staff.",
                "Download the audio attachment and provide a summary within 30 minutes.",
                "Keep this confidential."
            ],
            phish: true,
            clue: "Unexpected confidential request with download from unknown domain."
        }
    ];

    const introPanel = document.getElementById("phishing-intro");
    const gamePanel = document.getElementById("phishing-game");
    const outcomePanel = document.getElementById("phishing-outcome");
    const startButton = document.getElementById("phishing-start");
    const restartButton = document.getElementById("phishing-restart");
    const progress = document.getElementById("phishing-progress");
    const scoreDisplay = document.getElementById("phishing-score");
    const strikeDisplay = document.getElementById("phishing-strike");
    const summary = document.getElementById("phishing-summary");

    const state = {
        index: 0,
        score: 0,
        strikes: 0,
        queue: []
    };

    function shuffle(list) {
        return [...list].sort(() => Math.random() - 0.5);
    }

    function updateStatus() {
        progress.textContent = "Progress: " + state.index + "/" + state.queue.length;
        scoreDisplay.textContent = "Score: " + state.score;
        strikeDisplay.textContent = "Strikes: " + state.strikes;
    }

    function togglePanels({ intro = false, game = false, outcome = false }) {
        introPanel.classList.toggle("hidden", !intro);
        gamePanel.classList.toggle("hidden", !game);
        outcomePanel.classList.toggle("hidden", !outcome);
    }

    function renderSample() {
        const sample = state.queue[state.index];
        gamePanel.innerHTML = "";

        const header = document.createElement("header");
        header.className = "console-header";

        const meta = document.createElement("div");
        meta.className = "message-meta";
        meta.innerHTML = "<strong>From:</strong> " + sample.sender + "<br><strong>Subject:</strong> " + sample.subject;

        const counter = document.createElement("span");
        counter.className = "message-counter";
        counter.textContent = "Message " + (state.index + 1) + " of " + state.queue.length;

        header.append(meta, counter);

        const article = document.createElement("article");
        article.className = "message-card";

        const body = document.createElement("pre");
        body.textContent = sample.body.join("\n");
        article.appendChild(body);

        const controls = document.createElement("div");
        controls.className = "option-grid";

        const phishBtn = document.createElement("button");
        phishBtn.type = "button";
        phishBtn.className = "button decision";
        phishBtn.textContent = "Flag as Phish";
        phishBtn.addEventListener("click", () => evaluate(true, phishBtn));

        const legitBtn = document.createElement("button");
        legitBtn.type = "button";
        legitBtn.className = "button decision";
        legitBtn.textContent = "Deliver Message";
        legitBtn.addEventListener("click", () => evaluate(false, legitBtn));

        controls.append(phishBtn, legitBtn);

        const feedback = document.createElement("p");
        feedback.className = "feedback";
        feedback.id = "phishing-feedback";
        feedback.setAttribute("aria-live", "polite");

        gamePanel.append(header, article, controls, feedback);
    }

    function evaluate(choice, button) {
        const sample = state.queue[state.index];
        const buttons = gamePanel.querySelectorAll("button.decision");
        buttons.forEach((btn) => btn.disabled = true);

        const correct = sample.phish === choice;

        if (correct) {
            state.score += sample.phish ? 15 : 10;
            button.classList.add("correct");
        } else {
            state.strikes += 1;
            button.classList.add("incorrect");
        }

        buttons.forEach((btn) => {
            const isBtnPhish = btn.textContent === "Flag as Phish";
            if (isBtnPhish === sample.phish) {
                btn.classList.add("correct");
            }
        });

        const feedback = document.getElementById("phishing-feedback");
        const verdict = correct ? "Correct response." : "Incorrect response.";
        feedback.textContent = verdict + " Clue: " + sample.clue;

        updateStatus();

        const nextButton = document.createElement("button");
        nextButton.className = "button secondary";
        nextButton.type = "button";
        const finalRound = state.index === state.queue.length - 1;
        const outOfChances = state.strikes >= 3;
        nextButton.textContent = finalRound || outOfChances ? "View Report" : "Next Message";
        nextButton.addEventListener("click", () => advance());
        feedback.after(nextButton);
    }

    function advance() {
        if (state.strikes >= 3 || state.index === state.queue.length - 1) {
            conclude();
            return;
        }
        state.index += 1;
        updateStatus();
        renderSample();
    }

    function conclude() {
        const processed = Math.min(state.queue.length, state.index + 1);
        progress.textContent = "Progress: " + processed + "/" + state.queue.length;
        const total = state.queue.length;
        const accuracy = Math.max(0, Math.round((state.score / (total * 15)) * 100));
        summary.textContent = "Accuracy " + accuracy + "%; Score " + state.score + ". " + (state.strikes >= 3
            ? "Gateway locked after multiple misses. Review phishing indicators and retry."
            : "Solid triage work. Continue sharpening link inspection and sender validation skills.");
        togglePanels({ outcome: true });
    }

    function begin() {
        state.queue = shuffle(samples).slice(0, 5);
        state.index = 0;
        state.score = 0;
        state.strikes = 0;
        togglePanels({ game: true });
        updateStatus();
        renderSample();
    }

    startButton.addEventListener("click", begin);
    restartButton.addEventListener("click", () => {
        state.index = 0;
        state.score = 0;
        state.strikes = 0;
        state.queue = [];
        togglePanels({ intro: true });
        updateStatus();
    });

    updateStatus();
}());
