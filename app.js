const API_URL = 'https://poet-hub-api.onrender.com';

if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    const submitBtn = document.getElementById('submitToken');
    const tokenInput = document.getElementById('tokenInput');
    const errorMsg = document.getElementById('errorMsg');

    submitBtn.addEventListener('click', async () => {
        const token = tokenInput.value.trim();
        
        if (!token) {
            errorMsg.textContent = 'Please enter a token';
            errorMsg.classList.add('show');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (data.valid) {
                localStorage.setItem('poetHubToken', token);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = 'Invalid access token';
                errorMsg.classList.add('show');
            }
        } catch (error) {
            errorMsg.textContent = 'Connection error. Please try again.';
            errorMsg.classList.add('show');
        }
    });

    tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('poetHubToken');
    if (!token) {
        window.location.href = 'index.html';
    }

    const navItems = document.querySelectorAll('.nav-item');
    const toolSections = document.querySelectorAll('.tool-section');
    const generateBtns = document.querySelectorAll('.generate-btn');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tool = item.getAttribute('data-tool');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            toolSections.forEach(section => section.classList.remove('active'));
            document.getElementById(tool).classList.add('active');
        });
    });

    generateBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const endpoint = btn.getAttribute('data-endpoint');
            const section = btn.closest('.tool-section');
            const inputId = `${endpoint.replace(/-/g, '')}Input`;
            const resultsId = `${endpoint.replace(/-/g, '')}Results`;
            const input = document.getElementById(inputId);
            const results = document.getElementById(resultsId);
            
            let requestData = {};

            if (endpoint === 'style-match') {
                const poetInput = document.getElementById('poetInput');
                const poemInput = document.getElementById('styleMatchInput');
                if (!poetInput.value.trim() || !poemInput.value.trim()) {
                    alert('Please enter both poet name and poem');
                    return;
                }
                requestData = {
                    poet: poetInput.value.trim(),
                    poem: poemInput.value.trim()
                };
            } else if (endpoint === 'prompt-expander') {
                if (!input.value.trim()) {
                    alert('Please enter your poem idea');
                    return;
                }
                requestData = { idea: input.value.trim() };
            } else {
                if (!input.value.trim()) {
                    alert('Please enter your poem');
                    return;
                }
                requestData = { poem: input.value.trim() };
            }

            btn.disabled = true;
            btn.textContent = 'Generating...';
            results.innerHTML = '<div class="loading">Processing your request...</div>';
            results.classList.add('show');

            try {
                const response = await fetch(`${API_URL}/api/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();
                results.textContent = data.result;
            } catch (error) {
                results.textContent = 'Error: Unable to process request. Please try again.';
            } finally {
                btn.disabled = false;
                btn.textContent = btn.textContent.replace('Generating...', getButtonText(endpoint));
            }
        });
    });

    function getButtonText(endpoint) {
        const buttonTexts = {
            'analyze': 'Analyze Poem',
            'rewrite': 'Rewrite Poem',
            'style-match': 'Match Style',
            'title-gen': 'Generate Titles',
            'feedback': 'Get Feedback',
            'meter-rhythm': 'Analyze Rhythm',
            'imagery-score': 'Score Imagery',
            'voice-detection': 'Detect Voice',
            'prompt-expander': 'Expand Prompt'
        };
        return buttonTexts[endpoint] || 'Generate';
    }
}
