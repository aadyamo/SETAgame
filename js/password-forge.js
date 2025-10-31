(function () {
    const words = {
        adjectives: ["lunar", "quantum", "silent", "scarlet", "shadow", "aurora", "velvet", "neon", "crypto", "stellar", "holo", "glacial"],
        nouns: ["cipher", "gateway", "sentinel", "vector", "cosmos", "bastion", "echo", "sparrow", "nebula", "ledger", "pulse", "matrix"],
        verbs: ["drift", "forge", "ignite", "decode", "shield", "trace", "amplify", "bootstrap", "anchor", "filter", "sprint", "phase"]
    };

    const numbers = ["07", "19", "314", "819", "88", "2049", "9001", "731", "442", "1337"];
    const symbols = ["!", "@", "#", "$", "%", "&", "*", "+", "=", "?"];

    const upperToggle = document.getElementById("forge-upper");
    const numberToggle = document.getElementById("forge-numbers");
    const symbolToggle = document.getElementById("forge-symbols");
    const leetToggle = document.getElementById("forge-leet");
    const delimiterSelect = document.getElementById("forge-delimiter");
    const wordCountSlider = document.getElementById("forge-word-count");
    const wordCountValue = document.getElementById("forge-word-count-value");
    const resultCode = document.getElementById("forge-result");
    const strengthLabel = document.getElementById("forge-strength-label");
    const timeLabel = document.getElementById("forge-time-label");
    const guidance = document.getElementById("forge-guidance");
    const meterFill = document.getElementById("forge-meter-fill");
    const generateButton = document.getElementById("forge-generate");
    const copyButton = document.getElementById("forge-copy");
    const passwordInput = document.getElementById("forge-input");
    const analyzeButton = document.getElementById("forge-analyze");

    wordCountSlider.addEventListener("input", () => {
        wordCountValue.textContent = wordCountSlider.value;
    });

    function pick(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function mutateUppercase(tokens) {
        return tokens.map((token) => {
            if (token.length < 2) {
                return token.toUpperCase();
            }
            const chars = token.split("");
            const flips = Math.max(1, Math.floor(chars.length / 2));
            for (let i = 0; i < flips; i += 1) {
                const index = Math.floor(Math.random() * chars.length);
                chars[index] = chars[index].toUpperCase();
            }
            return chars.join("");
        });
    }

    const leetMap = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", l: "1" };

    function mutateLeet(tokens) {
        return tokens.map((token) => token.replace(/[aeiostl]/g, (char) => {
            return Math.random() > 0.5 ? leetMap[char] : char;
        }));
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

    function evaluateStrength(password, entropy, characteristics) {
        if (!password) {
            return {
                score: 0,
                base: "Type a password above to see how strong it is.",
                suggestions: []
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
        strengthLabel.textContent = "Password strength: " + metrics.score + "%";
        timeLabel.textContent = "Estimated crack time: " + metrics.crackText;
        guidance.textContent = metrics.message;
        meterFill.style.width = Math.min(metrics.score, 100) + "%";
        meterFill.dataset.level = metrics.score;
    }

    function analyzeInputPassword() {
        const value = passwordInput ? passwordInput.value : "";
        updateMetrics(value);
    }

    function forge() {
        const count = parseInt(wordCountSlider.value, 10);
        let tokens = [];
        const pools = [words.adjectives, words.nouns, words.verbs];
        for (let i = 0; i < count; i += 1) {
            const pool = pools[i % pools.length];
            tokens.push(pick(pool));
        }

        const applyUpper = upperToggle.checked;
        const applyLeet = leetToggle.checked;
        if (applyUpper) {
            tokens = mutateUppercase(tokens);
        }
        if (applyLeet) {
            tokens = mutateLeet(tokens);
        }

        const delimiter = delimiterSelect.value;
        let password = tokens.join(delimiter);

        if (numberToggle.checked) {
            password += delimiter ? delimiter : "";
            password += pick(numbers);
        }

        if (symbolToggle.checked) {
            const position = Math.floor(Math.random() * (password.length + 1));
            const symbol = pick(symbols);
            password = password.slice(0, position) + symbol + password.slice(position);
        }

        if (passwordInput) {
            passwordInput.value = password;
        }
        updateMetrics(password);
    }

    async function copy() {
        const text = resultCode.textContent;
        try {
            await navigator.clipboard.writeText(text);
            guidance.textContent = "Copied to your clipboard. Keep it safe.";
        } catch (error) {
            guidance.textContent = "Clipboard blocked. Select and copy manually.";
        }
    }

    generateButton.addEventListener("click", forge);
    copyButton.addEventListener("click", copy);
    if (analyzeButton) {
        analyzeButton.addEventListener("click", analyzeInputPassword);
    }
    if (passwordInput) {
        passwordInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                analyzeInputPassword();
            }
        });
        passwordInput.addEventListener("input", analyzeInputPassword);
    }

    forge();
}());
