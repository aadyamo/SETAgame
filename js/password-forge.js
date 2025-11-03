(function () {
    const passwordInput = document.getElementById("forge-input");
    const resultCode = document.getElementById("forge-result");
    const strengthLabel = document.getElementById("forge-strength-label");
    const entropyLabel = document.getElementById("forge-entropy-label");
    const timeLabel = document.getElementById("forge-time-label");
    const guidance = document.getElementById("forge-guidance");
    const meterFill = document.getElementById("forge-meter-fill");
    const generateButton = document.getElementById("forge-generate");

    const charSets = {
        lower: "abcdefghijklmnopqrstuvwxyz",
        upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numbers: "0123456789",
        symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|~"
    };

    function pickChar(source) {
        return source[Math.floor(Math.random() * source.length)];
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateStrongPassword() {
        const desiredLength = 16;
        const pools = [charSets.lower, charSets.upper, charSets.numbers, charSets.symbols];
        const characters = [];

        pools.forEach((pool) => {
            characters.push(pickChar(pool));
        });

        const allCharacters = pools.join("");
        while (characters.length < desiredLength) {
            characters.push(pickChar(allCharacters));
        }

        shuffle(characters);
        return characters.join("");
    }

    function hasSequentialRun(password, runLength) {
        if (password.length < runLength) {
            return false;
        }
        for (let i = 0; i <= password.length - runLength; i += 1) {
            let asc = true;
            let desc = true;
            for (let j = 1; j < runLength; j += 1) {
                const prev = password.charCodeAt(i + j - 1);
                const current = password.charCodeAt(i + j);
                if (current !== prev + 1) {
                    asc = false;
                }
                if (current !== prev - 1) {
                    desc = false;
                }
            }
            if (asc || desc) {
                return true;
            }
        }
        return false;
    }

    function getPasswordCharacteristics(password) {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        const hasUnicode = /[^\x00-\x7F]/.test(password);
        let charsetSize = 0;
        if (hasLower) {
            charsetSize += 26;
        }
        if (hasUpper) {
            charsetSize += 26;
        }
        if (hasNumber) {
            charsetSize += 10;
        }
        if (hasSymbol) {
            charsetSize += 33;
        }
        if (hasUnicode) {
            charsetSize += 100;
        }
        const isRepeated = password.length > 1 && /^(.)\1+$/.test(password);
        const commonPattern = /(password|letmein|qwerty|welcome|admin|iloveyou|abc123|123456|654321|dragon)/i.test(password);
        const hasSequence = hasSequentialRun(password, 3);
        return {
            length: password.length,
            hasLower,
            hasUpper,
            hasNumber,
            hasSymbol,
            hasUnicode,
            charsetSize,
            uniqueSets: [hasLower, hasUpper, hasNumber, hasSymbol || hasUnicode].filter(Boolean).length,
            isRepeated,
            commonPattern,
            hasSequence
        };
    }

    function formatDuration(seconds) {
        if (!Number.isFinite(seconds)) {
            return "Longer than the age of the universe";
        }
        if (seconds < 1e-6) {
            return "<1 microsecond";
        }
        if (seconds < 1e-3) {
            return (seconds * 1e6).toFixed(1) + " microseconds";
        }
        if (seconds < 1) {
            return (seconds * 1000).toFixed(1) + " milliseconds";
        }
        const units = [
            { label: "second", size: 1 },
            { label: "minute", size: 60 },
            { label: "hour", size: 3600 },
            { label: "day", size: 86400 },
            { label: "month", size: 2629800 },
            { label: "year", size: 31557600 },
            { label: "century", size: 3155760000 }
        ];
        for (let i = units.length - 1; i >= 0; i -= 1) {
            const unit = units[i];
            if (seconds >= unit.size) {
                const value = seconds / unit.size;
                if (unit.label === "century" && value >= 1000) {
                    return "Millennia+";
                }
                const rounded = value >= 10 ? Math.round(value) : value.toFixed(1);
                return rounded + " " + unit.label + (Number(rounded) !== 1 ? "s" : "");
            }
        }
        return seconds.toFixed(0) + " seconds";
    }

    function estimateCrackTime(length, charsetSize) {
        if (!length) {
            return { text: "--", seconds: 0 };
        }
        if (charsetSize <= 1) {
            return { text: "Instantly (<1 microsecond)", seconds: 0.000001 };
        }
        const guessesPerSecond = 1e10;
        const combosLog10 = length * Math.log10(charsetSize);
        const secondsLog10 = combosLog10 - (Math.log10(guessesPerSecond) + Math.log10(2));
        if (secondsLog10 < -6) {
            return { text: "Instantly (<1 microsecond)", seconds: Math.pow(10, secondsLog10) };
        }
        const seconds = secondsLog10 > 308 ? Number.POSITIVE_INFINITY : Math.pow(10, secondsLog10);
        return { text: formatDuration(seconds), seconds };
    }

    function evaluateStrength(password, entropy, characteristics) {
        if (!password) {
            return {
                score: 0,
                base: "Start typing above to see how strong your password is.",
                suggestions: ["Aim for at least 12 characters with a mix of character types."]
            };
        }
        let score = 35;
        let base = "Very weak. Make it much longer and mix in different character types.";
        if (entropy >= 100) {
            score = 100;
            base = "Excellent. This password would take far longer than a lifetime to crack.";
        } else if (entropy >= 80) {
            score = 90;
            base = "Very strong. Keep it unique for every account.";
        } else if (entropy >= 60) {
            score = 75;
            base = "Solid, but you can still improve it with extra length or variety.";
        } else if (entropy >= 40) {
            score = 55;
            base = "Weak. Add more characters and vary the types you use.";
        }
        const suggestions = [];
        if (characteristics.length < 12) {
            suggestions.push("Make it at least 12 characters long.");
        }
        if (characteristics.uniqueSets < 3) {
            suggestions.push("Mix uppercase, lowercase, numbers, and symbols.");
        }
        if (characteristics.isRepeated) {
            suggestions.push("Avoid repeating the same character over and over.");
        }
        if (characteristics.hasSequence) {
            suggestions.push("Break up sequences like abc or 123.");
        }
        if (characteristics.commonPattern) {
            suggestions.push("Switch out common words or predictable patterns.");
        }
        return { score, base, suggestions };
    }

    function computeMetrics(password) {
        const input = password || "";
        const characteristics = getPasswordCharacteristics(input);
        const entropy = characteristics.charsetSize > 0 ? Math.round(characteristics.length * Math.log2(Math.max(characteristics.charsetSize, 1))) : 0;
        const crack = estimateCrackTime(characteristics.length, characteristics.charsetSize);
        const feedback = evaluateStrength(input, entropy, characteristics);
        const messageParts = [feedback.base];
        if (feedback.suggestions.length > 0) {
            messageParts.push("Try this: " + feedback.suggestions.join(" "));
        }
        if (input) {
            messageParts.push("Estimated crack time: " + crack.text + ".");
        }
        return {
            entropy,
            score: feedback.score,
            crackText: crack.text,
            message: messageParts.join(" ")
        };
    }

    function updateMetrics(password) {
        const metrics = computeMetrics(password);
        if (password) {
            resultCode.textContent = password;
        } else if (!resultCode.textContent) {
            resultCode.textContent = "forge-me";
        }
        if (strengthLabel) {
            strengthLabel.textContent = "Strength: " + metrics.score + "%";
        }
        if (entropyLabel) {
            entropyLabel.textContent = "Entropy: " + metrics.entropy + " bits";
        }
        if (timeLabel) {
            timeLabel.textContent = "Crack Time: " + metrics.crackText;
        }
        if (guidance) {
            guidance.textContent = metrics.message;
        }
        if (meterFill) {
            meterFill.style.width = Math.min(metrics.score, 100) + "%";
            meterFill.dataset.level = metrics.score;
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            updateMetrics(passwordInput.value);
        });
    }

    if (generateButton) {
        generateButton.addEventListener("click", () => {
            const password = generateStrongPassword();
            if (passwordInput) {
                passwordInput.value = password;
            }
            updateMetrics(password);
        });
    }

    updateMetrics(passwordInput ? passwordInput.value : "");
}());
