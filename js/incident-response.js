(function () {
    const phases = [
        {
            title: "Detection & Analysis",
            situation: "Endpoint detection flags a suspicious PowerShell process spawning from an accounting workstation.",
            choices: [
                {
                    text: "Immediately wipe the workstation and reimage it.",
                    rationale: "Premature eradication destroys evidence needed to understand scope."
                },
                {
                    text: "Pull forensic artifacts (memory, logs) and confirm malicious behavior.",
                    rationale: "Collect data to validate the incident and scope before containment."
                },
                {
                    text: "Alert all staff to power down their systems.",
                    rationale: "Uncoordinated broadcast increases panic and disrupts operations."
                }
            ],
            correct: 1
        },
        {
            title: "Containment",
            situation: "Confirmed malicious beaconing to an external command server from three hosts.",
            choices: [
                {
                    text: "Quarantine affected hosts on an isolated VLAN and block the beacon domain.",
                    rationale: "Controlled containment halts propagation while preserving evidence."
                },
                {
                    text: "Notify the media that a breach is in progress.",
                    rationale: "Communications must follow approved channels; external notice is premature."
                },
                {
                    text: "Initiate an enterprise-wide password reset before isolating systems.",
                    rationale: "Resetting accounts may tip off attackers and complicate forensics."
                }
            ],
            correct: 0
        },
        {
            title: "Eradication",
            situation: "Malware implants confirmed on quarantined devices.",
            choices: [
                {
                    text: "Deploy EDR scripts to remove persistence and verify cleanup signatures.",
                    rationale: "Automated eradication with validation ensures implants are removed."
                },
                {
                    text: "Release the quarantined systems back into production immediately.",
                    rationale: "Systems must be sanitized and validated prior to reintegration."
                },
                {
                    text: "Format every workstation in the organization.",
                    rationale: "Overreaction creates downtime without targeting the threat."
                }
            ],
            correct: 0
        },
        {
            title: "Recovery",
            situation: "Clean images prepared. Business leadership wants services restored fast.",
            choices: [
                {
                    text: "Gradually return systems to production while monitoring for residual activity.",
                    rationale: "Controlled recovery verifies that no reinfection occurs."
                },
                {
                    text: "Restore all machines at once to resume normal operations immediately.",
                    rationale: "Mass restoration risks reintroducing threats without monitoring."
                },
                {
                    text: "Keep systems offline for a week to be absolutely safe.",
                    rationale: "Excessive downtime harms mission objectives without added benefit."
                }
            ],
            correct: 0
        },
        {
            title: "Post-Incident Lessons",
            situation: "Operations stabilized. Leadership requests a debrief.",
            choices: [
                {
                    text: "Document timeline, root cause, and improvements; brief stakeholders.",
                    rationale: "Thorough reporting strengthens future readiness."
                },
                {
                    text: "Delete all logs and stop talking about the breach.",
                    rationale: "Transparency and records are essential for accountability."
                },
                {
                    text: "Celebrate success and move on without changes.",
                    rationale: "Skipping lessons leaves gaps unaddressed."
                }
            ],
            correct: 0
        }
    ];

    const introPanel = document.getElementById("incident-intro");
    const gamePanel = document.getElementById("incident-game");
    const outcomePanel = document.getElementById("incident-outcome");
    const startButton = document.getElementById("incident-start");
    const restartButton = document.getElementById("incident-restart");
    const stageDisplay = document.getElementById("incident-stage");
    const scoreDisplay = document.getElementById("incident-score");
    const misstepDisplay = document.getElementById("incident-misstep");
    const summary = document.getElementById("incident-summary");

    const state = {
        index: 0,
        score: 100,
        missteps: 0
    };

    function togglePanels({ intro = false, game = false, outcome = false }) {
        introPanel.classList.toggle("hidden", !intro);
        gamePanel.classList.toggle("hidden", !game);
        outcomePanel.classList.toggle("hidden", !outcome);
    }

    function updateStatus() {
        stageDisplay.textContent = "Stage: " + (state.index + 1) + "/" + phases.length;
        scoreDisplay.textContent = "Response Quality: " + state.score + "%";
        misstepDisplay.textContent = "Missteps: " + state.missteps;
    }

    function renderPhase() {
        const phase = phases[state.index];
        gamePanel.innerHTML = "";

        const heading = document.createElement("h2");
        heading.textContent = phase.title;

        const scenario = document.createElement("p");
        scenario.className = "panel-copy";
        scenario.textContent = phase.situation;

        const optionGrid = document.createElement("div");
        optionGrid.className = "option-grid";

        phase.choices.forEach((choice, idx) => {
            const button = document.createElement("button");
            button.className = "button decision";
            button.type = "button";
            button.textContent = choice.text;
            button.addEventListener("click", () => evaluate(idx));
            optionGrid.appendChild(button);
        });

        const feedback = document.createElement("p");
        feedback.className = "feedback";
        feedback.id = "incident-feedback";
        feedback.setAttribute("aria-live", "polite");

        gamePanel.append(heading, scenario, optionGrid, feedback);
    }

    function evaluate(idx) {
        const phase = phases[state.index];
        const buttons = gamePanel.querySelectorAll("button.decision");
        buttons.forEach((btn) => btn.disabled = true);

        const feedback = document.getElementById("incident-feedback");
        const correct = idx === phase.correct;
        if (correct) {
            buttons[idx].classList.add("correct");
            state.score = Math.min(100, state.score + 4);
            feedback.textContent = "Correct. " + phase.choices[idx].rationale;
        } else {
            buttons[idx].classList.add("incorrect");
            state.score = Math.max(0, state.score - 18);
            state.missteps += 1;
            feedback.textContent = "Misstep. " + phase.choices[idx].rationale;
        }

        buttons.forEach((btn, optionIdx) => {
            if (optionIdx === phase.correct) {
                btn.classList.add("correct");
            }
        });

        updateStatus();

        const nextButton = document.createElement("button");
        nextButton.className = "button secondary";
        nextButton.type = "button";
        nextButton.textContent = state.index === phases.length - 1 ? "View Report" : "Next Stage";
        nextButton.addEventListener("click", () => advance());
        feedback.after(nextButton);
    }

    function advance() {
        if (state.index === phases.length - 1) {
            conclude();
            return;
        }
        state.index += 1;
        updateStatus();
        renderPhase();
    }

    function conclude() {
        let verdict;
        if (state.score >= 90 && state.missteps === 0) {
            verdict = "Flawless execution. Stakeholders commend the rapid containment and lessons learned.";
        } else if (state.score >= 70) {
            verdict = "Effective response with minor gaps. Refine coordination and documentation practices.";
        } else {
            verdict = "Response degraded. Revisit playbooks and ensure teams rehearse critical decision points.";
        }
        summary.textContent = verdict + " Final response quality: " + state.score + "% with " + state.missteps + " misstep(s).";
        togglePanels({ outcome: true });
    }

    function begin() {
        state.index = 0;
        state.score = 100;
        state.missteps = 0;
        togglePanels({ game: true });
        updateStatus();
        renderPhase();
    }

    startButton.addEventListener("click", begin);
    restartButton.addEventListener("click", () => {
        state.index = 0;
        state.score = 100;
        state.missteps = 0;
        togglePanels({ intro: true });
        stageDisplay.textContent = "Stage: 0/0";
        scoreDisplay.textContent = "Response Quality: 100%";
        misstepDisplay.textContent = "Missteps: 0";
    });
}());
