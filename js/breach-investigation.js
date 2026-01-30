content:
document.addEventListener('DOMContentLoaded', () => {
    const storyTextEl = document.getElementById('story-text');
    const choicesContainerEl = document.getElementById('choices-container');
    const resultTextEl = document.getElementById('result-text');

    let inventory = [];

    const story = {
        start: {
            story: "You wake up one morning to a notification from your bank: 'Your account balance is $0.00'. A sense of dread washes over you. All your money is gone. You must have been the victim of a cyberattack. Where do you start looking for clues?",
            choices: [
                { text: "Check your email for any suspicious messages.", nextNode: 'email' },
                { text: "Review your recent public activities.", nextNode: 'activities' },
                { text: "Think about the new software you recently installed.", nextNode: 'software' }
            ]
        },
        email: {
            story: "You scroll through your inbox. You find an email from 'SecureBank Ltd.' dated two days ago. It has the subject 'Urgent: Action Required on Your Account'. It urged you to click a link to 'verify' your details due to a 'security update'.",
            choices: [
                { text: "I remember that! I clicked it and logged in to be safe.", nextNode: 'phishingEnd' },
                { text: "I saw that, but the sender's address looked weird, so I deleted it.", nextNode: 'emailSafe' }
            ]
        },
        phishingEnd: {
            story: "That was the breach! The email was a phishing scam. The link led to a fake website designed to steal your login credentials. When you entered your details, you handed the keys to the attackers.",
            choices: [
                { text: "Start Over", nextNode: 'start' }
            ]
        },
        emailSafe: {
            story: "Good call. That was a phishing attempt. Your caution paid off. With that ruled out, where do you look next?",
            choices: [
                { text: "Review your recent public activities.", nextNode: 'activities' },
                { text: "Think about the new software you recently installed.", nextNode: 'software' }
            ]
        },
        activities: {
            story: "You think back on the last few days. You went to a coffee shop yesterday and did some online banking.",
            choices: [
                { text: "I connected to the shop's free, public Wi-Fi.", nextNode: 'wifiEnd' },
                { text: "I used my phone as a secure, personal hotspot.", nextNode: 'wifiSafe' }
            ]
        },
        wifiEnd: {
            story: "That was the breach! Public Wi-Fi networks are often unsecured. An attacker on the same network could have intercepted your traffic using a 'Man-in-the-Middle' attack, capturing your banking password.",
            choices: [
                { text: "Start Over", nextNode: 'start' }
            ]
        },
        wifiSafe: {
            story: "Excellent choice. Using a personal hotspot is much more secure than public Wi-Fi. With that ruled out, where do you look next?",
            choices: [
                { text: "Check your email for any suspicious messages.", nextNode: 'email' },
                { text: "Think about the new software you recently installed.", nextNode: 'software' }
            ]
        },
        software: {
            story: "You just downloaded a new 'free' photo editor from a website you hadn't used before. Your antivirus gave you a warning, but you installed it anyway.",
            choices: [
                { text: "It was probably fine. What's the harm?", nextNode: 'softwareEnd' },
                { text: "Actually, I heeded the warning and cancelled the installation.", nextNode: 'softwareSafe' }
            ]
        },
        softwareEnd: {
            story: "That was the breach! The 'free' software was likely bundled with malware, such as a keylogger or a trojan. When you installed it, you gave the malware access to your system, and it captured your banking details.",
            choices: [
                { text: "Start Over", nextNode: 'start' }
            ]
        },
        softwareSafe: {
            story: "Wise decision. Antivirus warnings should be taken seriously. That software could have been malicious. With that ruled out, where do you look next?",
            choices: [
                { text: "Check your email for any suspicious messages.", nextNode: 'email' },
                { text: "Review your recent public activities.", nextNode: 'activities' }
            ]
        }
    };

    let currentNode = 'start';

    function renderScene() {
        const scene = story[currentNode];
        storyTextEl.innerHTML = `<p>${scene.story}</p>`;
        choicesContainerEl.innerHTML = '';
        resultTextEl.innerHTML = '';

        scene.choices.forEach(choice => {
            // Don't show paths already explored
            if (inventory.includes(choice.nextNode)) {
                return;
            }
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.classList.add('choice-button');
            button.addEventListener('click', () => {
                // Add the *previous* node to inventory so we don't repeat the choice that led here
                if (scene.choices.length > 1) {
                    inventory.push(choice.nextNode);
                }
                
                // Reset inventory if starting over
                if (choice.nextNode === 'start') {
                    inventory = [];
                }

                currentNode = choice.nextNode;
                renderScene();
            });
            choicesContainerEl.appendChild(button);
        });
    }

    renderScene();
});
