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
            story: "You open your email inbox. Which of these emails looks suspicious?",
            showInbox: true,
            emails: [
                {
                    sender: "SecureBank Ltd. <security@securebank-support.com>",
                    subject: "Urgent: Action Required on Your Account",
                    preview: "Due to a recent security update, we need you to verify your account details immediately. Click here to log in and confirm.",
                    isPhishing: true
                },
                {
                    sender: "John Doe <john.doe@example.com>",
                    subject: "Weekend Plans",
                    preview: "Hey, are we still on for the movie this weekend? Let me know what time works for you.",
                    isPhishing: false
                },
                {
                    sender: "Work HR <hr@company.com>",
                    subject: "Updated Benefits Information",
                    preview: "Please review the attached document for the latest benefits package details.",
                    isPhishing: false
                },
                {
                    sender: "Amazon Deals <deals@amazon.com>",
                    subject: "50% Off Electronics - Limited Time!",
                    preview: "Don't miss out on our biggest sale of the year. Shop now and save big!",
                    isPhishing: false
                },
                {
                    sender: "Newsletter <news@techdigest.com>",
                    subject: "Weekly Tech News Roundup",
                    preview: "This week's top stories: AI breakthroughs, new gadgets, and cybersecurity tips.",
                    isPhishing: false
                },
                {
                    sender: "Mom <mom@family.com>",
                    subject: "How are you doing?",
                    preview: "Just wanted to check in and see how you're doing. Call me when you can.",
                    isPhishing: false
                }
            ],
            choices: [] // No choices, emails are clickable
        },
        phishingEnd: {
            story: "That was the breach! The email from 'SecureBank Ltd.' was a phishing scam. The sender's address was 'security@securebank-support.com' instead of the official bank domain. The link led to a fake website designed to steal your login credentials. When you entered your details, you handed the keys to the attackers.",
            choices: [
                { text: "Start Over", nextNode: 'start' }
            ]
        },
        emailWrong: {
            story: "That email doesn't seem suspicious. It looks legitimate. Maybe check another one or look elsewhere?",
            choices: [
                { text: "Go back to inbox", nextNode: 'email' },
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
            story: "You check your recently downloaded software. Which of these looks suspicious?",
            showSoftwareList: true,
            softwares: [
                {
                    name: "PhotoMaster Pro",
                    source: "Downloaded from photomastersite.com (official website)",
                    isSuspicious: false
                },
                {
                    name: "FreeVideoConverter",
                    source: "Downloaded from freewarehub.net (third-party site)",
                    isSuspicious: true
                },
                {
                    name: "Antivirus Plus",
                    source: "Downloaded from microsoft.com (official website)",
                    isSuspicious: false
                },
                {
                    name: "GameLauncher",
                    source: "Downloaded from gamestore.com (official website)",
                    isSuspicious: false
                },
                {
                    name: "PDFReader Ultimate",
                    source: "Downloaded from softwaredownloadz.xyz (unknown third-party site)",
                    isSuspicious: false
                }
            ],
            choices: [] // No choices, softwares are clickable
        },
        softwareEnd: {
            story: "That was the breach! Software downloaded from untrusted third-party sites may contain embedded malware or spyware. FreeVideoConverter from freewarehub.net was likely bundled with malicious code that captured your banking details.",
            choices: [
                { text: "Start Over", nextNode: 'start' }
            ]
        },
        softwareWrong: {
            story: "That software doesn't seem suspicious. It appears to be from a legitimate source. Maybe check another one or look elsewhere?",
            choices: [
                { text: "Go back to software list", nextNode: 'software' },
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

        const inboxContainerEl = document.getElementById('inbox-container');
        const emailsListEl = document.getElementById('emails-list');

        if (scene.showInbox) {
            inboxContainerEl.style.display = 'block';
            emailsListEl.innerHTML = '';
            scene.emails.forEach((email, index) => {
                const emailDiv = document.createElement('div');
                emailDiv.classList.add('email-item');
                emailDiv.innerHTML = `
                    <div class="sender">${email.sender}</div>
                    <div class="subject">${email.subject}</div>
                    <div class="preview">${email.preview}</div>
                `;
                emailDiv.addEventListener('click', () => {
                    if (email.isPhishing) {
                        currentNode = 'phishingEnd';
                    } else {
                        currentNode = 'emailWrong';
                    }
                    inboxContainerEl.style.display = 'none';
                    renderScene();
                });
                emailsListEl.appendChild(emailDiv);
            });
        } else {
            inboxContainerEl.style.display = 'none';
        }

        const softwareContainerEl = document.getElementById('software-container');
        const softwareListEl = document.getElementById('software-list');

        if (scene.showSoftwareList) {
            softwareContainerEl.style.display = 'block';
            softwareListEl.innerHTML = '';
            scene.softwares.forEach((software, index) => {
                const softwareDiv = document.createElement('div');
                softwareDiv.classList.add('software-item');
                softwareDiv.innerHTML = `
                    <div class="name">${software.name}</div>
                    <div class="source">${software.source}</div>
                `;
                softwareDiv.addEventListener('click', () => {
                    if (software.isSuspicious) {
                        currentNode = 'softwareEnd';
                    } else {
                        currentNode = 'softwareWrong';
                    }
                    softwareContainerEl.style.display = 'none';
                    renderScene();
                });
                softwareListEl.appendChild(softwareDiv);
            });
        } else {
            softwareContainerEl.style.display = 'none';
        }

        scene.choices.forEach(choice => {
            // Don't show paths already explored, except for start
            if (currentNode !== 'start' && inventory.includes(choice.nextNode)) {
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
