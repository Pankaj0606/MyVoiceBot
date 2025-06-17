// Finalized script.js with 5 requested fixes and updated image paths

document.addEventListener('DOMContentLoaded', () => {
    const talkButton = document.getElementById('talk-button');
    const conversationLog = document.getElementById('conversation-log');
    const statusDiv = document.getElementById('status');
    const textInput = document.getElementById('text-input');
    const sendButton = document.getElementById('send-button');
    const muteToggle = document.getElementById('mute-toggle');
    const clearChatBtn = document.getElementById('clear-chat');
    const chatHistoryList = document.getElementById('chat-history');
    const clearAllBtn = document.getElementById('clear-all');

    let chatHistory = [];
    let isMuted = false;
    let currentUtterance = null;
    let sessionId = `Chat ${new Date().toLocaleString()}`;
    let sessionStorage = JSON.parse(localStorage.getItem('voicebot-sessions') || '{}');

    function loadChatSidebar() {
        chatHistoryList.innerHTML = '';

        const newChatBtn = document.createElement('button');
        newChatBtn.textContent = '+ New Chat';
        newChatBtn.className = 'w-full mb-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded';
        newChatBtn.addEventListener('click', () => {
            chatHistory = [];
            sessionId = `Chat ${new Date().toLocaleString()}`;
            conversationLog.innerHTML = '';
            saveSession();
            loadChatSidebar();
        });
        chatHistoryList.appendChild(newChatBtn);

        Object.keys(sessionStorage).reverse().forEach(session => {
            const li = document.createElement('li');
            li.className = 'group flex items-center justify-between bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 cursor-pointer';
            li.innerHTML = `
                <span class="truncate" title="${session}">${session}</span>
                <button class="text-red-400 hidden group-hover:block" data-session="${session}">✕</button>
            `;
            li.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    loadSession(session);
                }
            });
            li.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                delete sessionStorage[session];
                localStorage.setItem('voicebot-sessions', JSON.stringify(sessionStorage));
                loadChatSidebar();
            });
            chatHistoryList.appendChild(li);
        });
    }

    function loadSession(session) {
        chatHistory = sessionStorage[session] || [];
        conversationLog.innerHTML = '';
        chatHistory.forEach(msg => {
            addMessageToLog(msg.parts[0].text, msg.role === 'user' ? 'user' : 'bot');
        });
        sessionId = session;
    }

    function saveSession() {
        sessionStorage[sessionId] = chatHistory;
        localStorage.setItem('voicebot-sessions', JSON.stringify(sessionStorage));
    }

    function addMessageToLog(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'flex items-start gap-3 justify-end' : 'flex items-start gap-3';
        messageDiv.innerHTML = `
            <div class="${sender === 'user' ? 'bg-gray-700' : 'bg-blue-600'} p-2 rounded-full flex-shrink-0">
                <img src="${sender === 'user' ? 'images/user-icon.png' : 'images/your-photo.jpg'}" class="w-6 h-6 rounded-full" />
            </div>
            <div class="bg-gray-700 rounded-lg p-3 text-white max-w-xs md:max-w-md">
                <p>${text}</p>
            </div>
        `;
        conversationLog.appendChild(messageDiv);
        conversationLog.scrollTop = conversationLog.scrollHeight;
    }

    function speak(text) {
        window.speechSynthesis.cancel();
        if (isMuted) return;

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = 'en-US';
        currentUtterance.rate = 1;
        currentUtterance.pitch = 1.2;
        currentUtterance.onend = () => {
            talkButton.disabled = false;
            statusDiv.textContent = 'Press the button or type to ask a question.';
        };
        window.speechSynthesis.speak(currentUtterance);
    }

    async function getBotResponse(userQuery) {
        statusDiv.textContent = 'Thinking...';
        window.speechSynthesis.cancel();

        addMessageToLog(userQuery, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: userQuery }] });

        if (!sessionStorage[sessionId]) {
            sessionStorage[sessionId] = [];
        }
        saveSession();

        try {
            const response = await fetch('/.netlify/functions/get-bot-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'The server function failed.');
            }

            const result = await response.json();
            const botText = result.text;

            addMessageToLog(botText, 'bot');
            chatHistory.push({ role: 'model', parts: [{ text: botText }] });
            saveSession();
            speak(botText);
        } catch (error) {
            console.error("Error fetching from serverless function:", error);
            const errorMessage = "I'm having trouble connecting to my brain. Try again shortly.";
            addMessageToLog(errorMessage, 'bot');
            speak(errorMessage);
            talkButton.disabled = false;
            statusDiv.textContent = 'Error occurred.';
        }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        talkButton.addEventListener('click', () => {
            window.speechSynthesis.cancel();
            talkButton.disabled = true;
            talkButton.classList.add('is-listening');
            statusDiv.textContent = 'Listening...';
            try {
                recognition.start();
            } catch (e) {
                statusDiv.textContent = 'Could not start listening.';
                talkButton.disabled = false;
                talkButton.classList.remove('is-listening');
            }
        });

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            getBotResponse(speechResult);
        };

        recognition.onspeechend = () => recognition.stop();
        recognition.onend = () => talkButton.classList.remove('is-listening');
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            statusDiv.textContent = `Error: ${event.error}`;
            talkButton.disabled = false;
            talkButton.classList.remove('is-listening');
        };
    } else {
        statusDiv.textContent = "Speech Recognition not supported in this browser.";
        talkButton.disabled = true;
    }

    sendButton.addEventListener('click', () => {
        const userText = textInput.value.trim();
        if (userText) {
            window.speechSynthesis.cancel();
            getBotResponse(userText);
            textInput.value = '';
        }
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendButton.click();
    });

    muteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        muteToggle.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
        if (isMuted) window.speechSynthesis.cancel();
    });

    clearChatBtn.addEventListener('click', () => {
        chatHistory = [];
        conversationLog.innerHTML = '';
        statusDiv.textContent = 'Chat cleared.';
        saveSession();
    });

    clearAllBtn.addEventListener('click', () => {
        localStorage.removeItem('voicebot-sessions');
        sessionStorage = {};
        chatHistory = [];
        conversationLog.innerHTML = '';
        loadChatSidebar();
    });

    loadChatSidebar();
});
