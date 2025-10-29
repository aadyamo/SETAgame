(function () {
    const events = [
        {
            service: "HTTPS",
            port: 443,
            origin: "10.42.18.20 (Internal Finance)",
            behavior: "Beacon with valid certificate against payroll API",
            allow: true,
            intel: "Trusted subnet hitting approved endpoint."
        },
        {
            service: "SSH",
            port: 22,
            origin: "203.0.113.45 (External)",
            behavior: "Brute force attempts cycling 100 usernames in 2 minutes",
            allow: false,
            intel: "High velocity credential spray from unknown origin."
        },
        {
            service: "DNS",
            port: 53,
            origin: "198.51.100.7 (Partner Resolver)",
            behavior: "Consistent query volume, matches allow list",
            allow: true,
            intel: "Documented partner recursive resolver."
        },
        {
            service: "SMB",
            port: 445,
            origin: "172.16.90.42 (Guest Wi-Fi)",
            behavior: "Lateral movement attempt to core file server",
            allow: false,
            intel: "Guest network should never touch internal SMB workloads."
        },
        {
            service: "HTTPS",
            port: 443,
            origin: "185.14.58.92 (Threat Intel: Malicious)",
            behavior: "Encrypted outbound tunnel, JA3 fingerprint flagged",
            allow: false,
            intel: "Known command-and-control infrastructure signature."
        },
        {
            service: "RDP",
            port: 3389,
            origin: "10.10.40.17 (Admin workstation)",
            behavior: "Maintenance window remote session to patch server",
            allow: true,
            intel: "Scheduled change ticket approved for admin host."
        },
        {
            service: "MQTT",
            port: 1883,
            origin: "198.18.0.23 (IoT gateway)",
            behavior: "Telemetry spiking 10x baseline, payloads encrypted",
            allow: false,
            intel: "Anomaly in traffic pattern indicates possible compromise."
        },
        {
            service: "HTTPS",
            port: 443,
            origin: "10.50.2.21 (Dev cluster)",
            behavior: "New container reaching out to package mirror over TLS",
            allow: true,
            intel: "Mirror domain validated, checksum monitoring enabled."
        }
    ];

    const introPanel = document.getElementById("guardian-intro");
    const gamePanel = document.getElementById("guardian-game");
    const outcomePanel = document.getElementById("guardian-outcome");
    const startButton = document.getElementById("guardian-start");
    const restartButton = document.getElementById("guardian-restart");
    const waveDisplay = document.getElementById("guardian-wave");
    const integrityDisplay = document.getElementById("guardian-integrity");
    const breachDisplay = document.getElementById("guardian-breach");
    const summary = document.getElementById("guardian-summary");

    const state = {
        order: [],
        index: 0,
        integrity: 100,
        breaches: 0
    };

    function shuffle(list) {
        return [...list].sort(() => Math.random() - 0.5);
    }

    function updateStatus() {
        waveDisplay.textContent = "Wave: " + (state.index + 1) + "/" + state.order.length;
        integrityDisplay.textContent = "Shield Integrity: " + state.integrity + "%";
        breachDisplay.textContent = "Breaches: " + state.breaches;
    }

    function togglePanels({ intro = false, game = false, outcome = false }) {
        introPanel.classList.toggle("hidden", !intro);
        gamePanel.classList.toggle("hidden", !game);
        outcomePanel.classList.toggle("hidden", !outcome);
    }

    function renderEvent() {
        const event = state.order[state.index];
        gamePanel.innerHTML = "";

        const header = document.createElement("header");
        header.className = "console-header";

        const title = document.createElement("div");
        title.className = "message-meta";
        title.innerHTML = "<strong>Service:</strong> " + event.service + " &bull; <strong>Port:</strong> " + event.port;

        const origin = document.createElement("div");
        origin.className = "message-meta";
        origin.innerHTML = "<strong>Origin:</strong> " + event.origin;

        header.append(title, origin);

        const description = document.createElement("p");
        description.className = "panel-copy";
        description.textContent = event.behavior;

        const controls = document.createElement("div");
        controls.className = "option-grid";

        const allowBtn = document.createElement("button");
        allowBtn.className = "button decision";
        allowBtn.type = "button";
        allowBtn.textContent = "Allow Traffic";
        allowBtn.addEventListener("click", () => evaluate(true, allowBtn));

        const blockBtn = document.createElement("button");
        blockBtn.className = "button decision";
        blockBtn.type = "button";
        blockBtn.textContent = "Block Traffic";
        blockBtn.addEventListener("click", () => evaluate(false, blockBtn));

        controls.append(allowBtn, blockBtn);

        const feedback = document.createElement("p");
        feedback.className = "feedback";
        feedback.id = "guardian-feedback";
        feedback.setAttribute("aria-live", "polite");

        gamePanel.append(header, description, controls, feedback);
    }

    function evaluate(choice, button) {
        const event = state.order[state.index];
        const buttons = gamePanel.querySelectorAll("button.decision");
        buttons.forEach((btn) => {
            btn.disabled = true;
        });

        const correct = event.allow === choice;
        const feedback = document.getElementById("guardian-feedback");

        if (correct) {
            button.classList.add("correct");
            state.integrity = Math.min(100, state.integrity + 5);
            feedback.textContent = "Authorized move. Intel: " + event.intel;
        } else {
            button.classList.add("incorrect");
            state.integrity = Math.max(0, state.integrity - 25);
            state.breaches += 1;
            feedback.textContent = "Misstep. Intel: " + event.intel;
        }

        buttons.forEach((btn) => {
            const isAllow = btn.textContent.includes("Allow");
            if (isAllow === event.allow) {
                btn.classList.add("correct");
            }
        });

        updateStatus();

        const nextButton = document.createElement("button");
        nextButton.className = "button secondary";
        nextButton.type = "button";
        const finalWave = state.index === state.order.length - 1;
        const breachLimit = state.breaches >= 3 || state.integrity <= 0;
        nextButton.textContent = finalWave || breachLimit ? "Finalize Report" : "Next Connection";
        nextButton.addEventListener("click", () => advance());
        feedback.after(nextButton);
    }

    function advance() {
        if (state.breaches >= 3 || state.integrity <= 0 || state.index === state.order.length - 1) {
            conclude();
            return;
        }
        state.index += 1;
        updateStatus();
        renderEvent();
    }

    function conclude() {
        const healthy = state.integrity >= 70 && state.breaches === 0;
        if (healthy) {
            summary.textContent = "Perimeter stable. You blocked every malicious signal and allowed critical services through.";
        } else if (state.breaches >= 3 || state.integrity <= 0) {
            summary.textContent = "Shields down. Too many misclassifications triggered a breach scenario. Recalibrate your detection heuristics.";
        } else {
            summary.textContent = "Partial success. Refine classifications to reduce false positives and negatives.";
        }
        togglePanels({ outcome: true });
    }

    function begin() {
        state.order = shuffle(events).slice(0, 6);
        state.index = 0;
        state.integrity = 100;
        state.breaches = 0;
        togglePanels({ game: true });
        updateStatus();
        renderEvent();
    }

    startButton.addEventListener("click", begin);
    restartButton.addEventListener("click", () => {
        state.order = [];
        state.index = 0;
        state.integrity = 100;
        state.breaches = 0;
        togglePanels({ intro: true });
        waveDisplay.textContent = "Wave: 0/0";
        integrityDisplay.textContent = "Shield Integrity: 100%";
        breachDisplay.textContent = "Breaches: 0";
    });
}());
