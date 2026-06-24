// Python Learning Platform - Main App Logic

let codeHistory = JSON.parse(localStorage.getItem('pythonCodeHistory')) || [];
let chatHistory = JSON.parse(localStorage.getItem('pythonChatHistory')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    loadChatHistory();
    setupEnterKey();
});

function checkCode() {
    const code = document.getElementById('codeInput').value;
    
    if (!code.trim()) {
        showError('Please enter some Python code first!');
        return;
    }

    const errors = validatePythonCode(code);
    const suggestions = generateSuggestions(code);

    if (errors.length === 0) {
        showOutput('✅ Code looks good! No syntax errors detected.');
        document.getElementById('errors').innerHTML = '';
    } else {
        showError(errors.join('\n'));
    }

    if (suggestions.length > 0) {
        showSuggestions(suggestions.join('\n'));
    }

    saveToHistory(code);
}

function runCode() {
    const code = document.getElementById('codeInput').value;
    
    if (!code.trim()) {
        showError('Please enter some Python code first!');
        return;
    }

    const errors = validatePythonCode(code);
    
    if (errors.length > 0) {
        showError('❌ Cannot run: ' + errors[0]);
        return;
    }

    const output = simulatePythonExecution(code);
    showOutput(output);
    saveToHistory(code);
}

function validatePythonCode(code) {
    const errors = [];
    const lines = code.split('\n');
    let inString = false;
    let stringChar = '';

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) return;

        // Check brackets and parentheses
        const openParen = (line.match(/\(/g) || []).length;
        const closeParen = (line.match(/\)/g) || []).length;
        if (openParen !== closeParen) {
            errors.push(`Line ${lineNum}: Unmatched parentheses`);
        }

        const openBracket = (line.match(/\[/g) || []).length;
        const closeBracket = (line.match(/\]/g) || []).length;
        if (openBracket !== closeBracket) {
            errors.push(`Line ${lineNum}: Unmatched brackets`);
        }

        // Check for common typos
        if (trimmed.includes('prnt(')) {
            errors.push(`Line ${lineNum}: Did you mean "print()"?`);
        }
        if (trimmed.includes('inpt(')) {
            errors.push(`Line ${lineNum}: Did you mean "input()"?`);
        }
        if (trimmed.includes('lenght(')) {
            errors.push(`Line ${lineNum}: Did you mean "len()"?`);
        }
    });

    return errors;
}

function generateSuggestions(code) {
    const suggestions = [];

    if (!code.includes('print')) {
        suggestions.push('💡 Tip: Use print() to display output');
    }

    if (code.includes('var ')) {
        suggestions.push('💡 Python tip: Use variable_name instead of "var" keyword');
    }

    if (code.includes('console.log')) {
        suggestions.push('💡 This looks like JavaScript. Use print() in Python!');
    }

    if (code.includes('function ')) {
        suggestions.push('💡 Use "def" to define functions in Python, not "function"');
    }

    return suggestions;
}

function simulatePythonExecution(code) {
    try {
        const lines = code.split('\n');
        let output = '📤 Output:\n\n';
        let foundPrint = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('print(')) {
                foundPrint = true;
                const match = trimmed.match(/print\(['"`](.+?)['"`]\)/);
                if (match) {
                    output += match[1] + '\n';
                } else {
                    const content = trimmed.substring(6, trimmed.length - 1);
                    output += content + '\n';
                }
            }
        });

        if (!foundPrint) {
            output += '(No output - try adding print() statements)';
        }

        return output;
    } catch (e) {
        return '❌ Error: ' + e.message;
    }
}

function showOutput(message) {
    document.getElementById('output').innerHTML = message;
}

function showError(message) {
    document.getElementById('errors').innerHTML = message;
}

function showSuggestions(message) {
    document.getElementById('suggestions').innerHTML = message;
}

function saveToHistory(code) {
    const timestamp = new Date().toLocaleString();
    const entry = {
        code: code.substring(0, 50) + (code.length > 50 ? '...' : ''),
        fullCode: code,
        time: timestamp
    };

    codeHistory.unshift(entry);
    if (codeHistory.length > 20) codeHistory.pop();
    
    localStorage.setItem('pythonCodeHistory', JSON.stringify(codeHistory));
    loadHistory();
}

function loadHistory() {
    const historyDiv = document.getElementById('codeHistory');
    
    if (codeHistory.length === 0) {
        historyDiv.innerHTML = '<p style="color: #999; text-align: center;">No history yet</p>';
        return;
    }

    historyDiv.innerHTML = codeHistory.map((item, index) => `
        <div class="history-item" onclick="loadCode(${index})">
            <strong>${item.time}</strong>
            <p>${item.code}</p>
        </div>
    `).join('');
}

function loadCode(index) {
    document.getElementById('codeInput').value = codeHistory[index].fullCode;
    document.getElementById('codeInput').focus();
}

function clearCode() {
    if (confirm('Clear the code?')) {
        document.getElementById('codeInput').value = '';
        document.getElementById('output').innerHTML = '';
        document.getElementById('errors').innerHTML = '';
        document.getElementById('suggestions').innerHTML = '';
    }
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');
    const response = generateAIResponse(message);
    
    setTimeout(() => {
        addChatMessage(response, 'bot');
    }, 500);

    input.value = '';
}

function addChatMessage(message, sender) {
    const chatDiv = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message chat-' + sender;
    messageDiv.textContent = message;
    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;

    chatHistory.push({ sender, message });
    localStorage.setItem('pythonChatHistory', JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const chatDiv = document.getElementById('chatHistory');
    if (chatHistory.length > 0) {
        chatDiv.innerHTML = chatHistory.map(msg => 
            `<div class="chat-message chat-${msg.sender}">${msg.message}</div>`
        ).join('');
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
}

function generateAIResponse(question) {
    question = question.toLowerCase();

    const responses = {
        'print': '📌 print() shows output. Example: print("Hello World")',
        'input': '📌 input() gets user input. Example: name = input("Your name: ")',
        'if': '📌 if checks conditions. Example: if x > 5: print("Big")',
        'for': '📌 for loop repeats. Example: for i in range(5): print(i)',
        'while': '📌 while repeats until false. Example: while x > 0: x = x - 1',
        'function': '📌 def makes functions. Example: def hello(): print("Hi")',
        'list': '📌 Lists: items = [1, 2, 3]',
        'dict': '📌 Dicts: person = {"name": "Ali"}',
        'variable': '📌 Variables store data. Example: name = "Abdullah"',
        'error': '✅ Share your code - I can help fix it!',
        'help': '🤖 I can explain: print, input, if, for, while, functions, lists, dicts'
    };

    for (let key in responses) {
        if (question.includes(key)) {
            return responses[key];
        }
    }

    return '🤖 Ask about: print, input, if, for, while, functions, lists, or dicts';
}

function setupEnterKey() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChat();
            }
        });
    }
}