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
    const entropyLabel = document.getElementById("forge-entropy-label");
    const guidance = document.getElementById("forge-guidance");
    const meterFill = document.getElementById("forge-meter-fill");
    const generateButton = document.getElementById("forge-generate");
    const copyButton = document.getElementById("forge-copy");

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

    function calculateEntropy(wordCount, hasUpper, hasNumbers, hasSymbols, leet) {
        const wordSpace = Math.log2(words.adjectives.length + words.nouns.length + words.verbs.length);
        let charSpace = wordSpace * wordCount;
        if (hasUpper) {
            charSpace += wordCount * 1.2;
        }
        if (leet) {
            charSpace += wordCount * 1.4;
        }
        if (hasNumbers) {
            charSpace += Math.log2(numbers.length);
        }
        if (hasSymbols) {
            charSpace += Math.log2(symbols.length);
        }
        return Math.round(charSpace);
    }

    function evaluateStrength(entropy) {
        if (entropy >= 70) {
            return { score: 100, text: "Mission-grade! This passphrase withstands offline cracking for centuries." };
        }
        if (entropy >= 55) {
            return { score: 85, text: "Strong shield. Reinforce with unique digits or additional words for extra safety." };
        }
        if (entropy >= 40) {
            return { score: 65, text: "Moderate strength. Consider toggling more mutations to evade brute-force attempts." };
        }
        return { score: 40, text: "Vulnerable. Increase word count and mix in symbols or digits." };
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

        resultCode.textContent = password;

        const entropy = calculateEntropy(count, applyUpper, numberToggle.checked, symbolToggle.checked, applyLeet);
        const feedback = evaluateStrength(entropy);
        strengthLabel.textContent = "Strength: " + feedback.score + "%";
        entropyLabel.textContent = "Entropy: " + entropy + " bits";
        guidance.textContent = feedback.text;

        meterFill.style.width = Math.min(feedback.score, 100) + "%";
        meterFill.dataset.level = feedback.score;
    }

    async function copy() {
        const text = resultCode.textContent;
        try {
            await navigator.clipboard.writeText(text);
            guidance.textContent = "Copied to clipboard. Deploy wisely.";
        } catch (error) {
            guidance.textContent = "Clipboard blocked. Select and copy manually.";
        }
    }

    generateButton.addEventListener("click", forge);
    copyButton.addEventListener("click", copy);

    forge();
}());
