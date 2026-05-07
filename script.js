// ── Config ──────────────────────────────────────────────────────────────────
// 🔑 Add your Groq API key here (get one free at https://console.groq.com)
const GROQ_API_KEY = localStorage.getItem('cp_groq_key') || 'YOUR_GROQ_API_KEY_HERE';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── Authentication — Login Modal (only on Get Started click) ─────────────────
const LOGIN_MODAL_HTML = `
<div id="loginModal" style="
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.7);
    backdrop-filter:blur(8px);
    z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:1rem;
">
  <div style="
    background:var(--surface);
    padding:2.5rem 2rem;
    border-radius:20px;
    border:1px solid var(--border);
    width:100%;max-width:420px;
    box-shadow:0 24px 80px rgba(99,102,241,0.2);
    position:relative;
  ">
    <button id="loginModalClose" style="
      position:absolute;top:1rem;right:1rem;
      background:transparent;border:none;
      color:var(--text-muted);font-size:1.25rem;
      cursor:pointer;line-height:1;
    ">✕</button>
    <div style="text-align:center;margin-bottom:1.5rem">
      <div style="font-size:2.5rem;margin-bottom:0.5rem">🚀</div>
      <h2 style="font-family:'Space Grotesk',sans-serif;margin:0 0 0.5rem">Welcome to <span class="grad-text">CareerPilot</span></h2>
      <p style="color:var(--text-muted);font-size:0.875rem;margin:0">Sign in to navigate your career with AI precision.</p>
    </div>
    <div id="loginError" style="
      display:none;
      background:rgba(239,68,68,0.1);
      border:1px solid rgba(239,68,68,0.3);
      color:#f87171;
      padding:0.6rem 0.85rem;
      border-radius:8px;
      font-size:0.85rem;
      margin-bottom:1rem;
    "></div>
    <div id="loginView">
      <div style="margin-bottom:1rem">
        <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;font-weight:500">EMAIL ADDRESS</label>
        <input type="email" id="loginEmail" placeholder="you@example.com" style="
          width:100%;padding:0.75rem 1rem;
          background:var(--bg);border:1px solid var(--border);
          color:var(--text);border-radius:10px;
          outline:none;font-size:0.95rem;box-sizing:border-box;
          transition:border-color 0.2s;
        " />
      </div>
      <div style="margin-bottom:1.5rem">
        <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;font-weight:500">PASSWORD</label>
        <div style="position:relative">
          <input type="password" id="loginPassword" placeholder="Min 6 characters" style="
            width:100%;padding:0.75rem 1rem;
            background:var(--bg);border:1px solid var(--border);
            color:var(--text);border-radius:10px;
            outline:none;font-size:0.95rem;box-sizing:border-box;
            transition:border-color 0.2s;
          " />
        </div>
      </div>
      <button id="loginSubmitBtn" class="btn-primary" style="width:100%;padding:0.8rem;border-radius:10px;font-size:1rem;font-weight:600;">Sign In</button>
      <p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:var(--text-muted)">
        Don't have an account? <button id="switchToSignup" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:0.85rem;font-weight:600">Create one</button>
      </p>
    </div>
    <div id="signupView" style="display:none">
      <div style="margin-bottom:1rem">
        <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;font-weight:500">FULL NAME</label>
        <input type="text" id="signupName" placeholder="Jane Doe" style="
          width:100%;padding:0.75rem 1rem;
          background:var(--bg);border:1px solid var(--border);
          color:var(--text);border-radius:10px;
          outline:none;font-size:0.95rem;box-sizing:border-box;
        " />
      </div>
      <div style="margin-bottom:1rem">
        <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;font-weight:500">EMAIL ADDRESS</label>
        <input type="email" id="signupEmail" placeholder="you@example.com" style="
          width:100%;padding:0.75rem 1rem;
          background:var(--bg);border:1px solid var(--border);
          color:var(--text);border-radius:10px;
          outline:none;font-size:0.95rem;box-sizing:border-box;
        " />
      </div>
      <div style="margin-bottom:1.5rem">
        <label style="display:block;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;font-weight:500">PASSWORD</label>
        <input type="password" id="signupPassword" placeholder="Min 6 characters" style="
          width:100%;padding:0.75rem 1rem;
          background:var(--bg);border:1px solid var(--border);
          color:var(--text);border-radius:10px;
          outline:none;font-size:0.95rem;box-sizing:border-box;
        " />
      </div>
      <button id="signupSubmitBtn" class="btn-primary" style="width:100%;padding:0.8rem;border-radius:10px;font-size:1rem;font-weight:600;">Create Account</button>
      <p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:var(--text-muted)">
        Already have an account? <button id="switchToLogin" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:0.85rem;font-weight:600">Sign in</button>
      </p>
    </div>
  </div>
</div>
`;

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideLoginError() {
    const el = document.getElementById('loginError');
    if (el) el.style.display = 'none';
}

function openLoginModal(onSuccess) {
    if (document.getElementById('loginModal')) return;
    document.body.insertAdjacentHTML('beforeend', LOGIN_MODAL_HTML);

    // Toggle login/signup
    document.getElementById('switchToSignup').addEventListener('click', () => {
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('signupView').style.display = 'block';
        hideLoginError();
    });
    document.getElementById('switchToLogin').addEventListener('click', () => {
        document.getElementById('signupView').style.display = 'none';
        document.getElementById('loginView').style.display = 'block';
        hideLoginError();
    });

    // Close
    document.getElementById('loginModalClose').addEventListener('click', () => {
        document.getElementById('loginModal').remove();
    });

    // Sign In
    document.getElementById('loginSubmitBtn').addEventListener('click', () => {
        hideLoginError();
        const email = document.getElementById('loginEmail').value.trim();
        const pass  = document.getElementById('loginPassword').value;
        if (!email || !pass) return showLoginError('Please fill in all fields.');
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return showLoginError('Please enter a valid email address.');
        if (pass.length < 6) return showLoginError('Password must be at least 6 characters.');
        
        // Check stored account
        const stored = JSON.parse(localStorage.getItem('cp_account') || 'null');
        if (!stored) return showLoginError('No account found. Please create one first.');
        if (stored.email !== email) return showLoginError('Email not found.');
        if (stored.password !== btoa(pass)) return showLoginError('Incorrect password.');
        
        localStorage.setItem('cp_auth_user', JSON.stringify({ name: stored.name, email }));
        document.getElementById('loginModal').remove();
        updateNavForUser(stored.name);
        if (onSuccess) onSuccess();
        else window.location.href = 'index.html';
    });

    // Sign Up
    document.getElementById('signupSubmitBtn').addEventListener('click', () => {
        hideLoginError();
        const name  = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const pass  = document.getElementById('signupPassword').value;
        if (!name || !email || !pass) return showLoginError('Please fill in all fields.');
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return showLoginError('Please enter a valid email address.');
        if (pass.length < 6) return showLoginError('Password must be at least 6 characters.');
        
        localStorage.setItem('cp_account', JSON.stringify({ name, email, password: btoa(pass) }));
        localStorage.setItem('cp_auth_user', JSON.stringify({ name, email }));
        document.getElementById('loginModal').remove();
        updateNavForUser(name);
        if (onSuccess) onSuccess();
        else window.location.href = 'index.html';
    });
}

function getInitials(name) {
    return (name || 'U').trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function updateNavForUser(name, email) {
    // Hide Sign In button
    const signInBtn = document.getElementById('homeSignInBtn');
    if (signInBtn) signInBtn.style.display = 'none';

    // Show profile menu
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) profileMenu.style.display = 'flex';

    const initials = getInitials(name);
    const profileInitialsEl = document.getElementById('profileInitials');
    if (profileInitialsEl) profileInitialsEl.textContent = initials;

    const profileDropdownAvatarEl = document.getElementById('profileDropdownAvatar');
    if (profileDropdownAvatarEl) profileDropdownAvatarEl.textContent = initials;

    const profileDropdownNameEl = document.getElementById('profileDropdownName');
    if (profileDropdownNameEl) profileDropdownNameEl.textContent = name || 'User';

    const profileDropdownEmailEl = document.getElementById('profileDropdownEmail');
    if (profileDropdownEmailEl) profileDropdownEmailEl.textContent = email || '';

    // Toggle dropdown open/close
    const avatarBtn = document.getElementById('profileAvatarBtn');
    const dropdown  = document.getElementById('profileDropdown');
    if (avatarBtn && dropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            avatarBtn.setAttribute('aria-expanded', String(isOpen));
        });
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
            if (avatarBtn) avatarBtn.setAttribute('aria-expanded', 'false');
        });
    }

    // Sign Out
    const signOutBtn = document.getElementById('homeSignOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            localStorage.removeItem('cp_auth_user');
            window.location.reload();
        });
    }
}

// Init: restore session if logged in
(function initAuth() {
    const user = JSON.parse(localStorage.getItem('cp_auth_user') || 'null');
    if (user) {
        updateNavForUser(user.name, user.email);
    } else {
        // Wire Sign In button
        const signInBtn = document.getElementById('homeSignInBtn');
        if (signInBtn) signInBtn.addEventListener('click', () => openLoginModal());
    }

    // Guard roadmap + interview links when not logged in
    document.addEventListener('click', function(e) {
        const el = e.target.closest('a[href="roadmap.html"], a[href="interview.html"]');
        if (!el) return;
        const user = JSON.parse(localStorage.getItem('cp_auth_user') || 'null');
        if (user) return; // logged in — navigate normally
        e.preventDefault();
        openLoginModal();
    });
})();

// ── Theme Toggle ─────────────────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// ── Mobile Menu ──────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
    });
}

// ── Shared Groq API Call ────────────────────────────────────────────────────────
window.callGrokAPI = async function (prompt, systemPrompt = 'You are a helpful AI assistant.', retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                max_tokens: 1024,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: prompt }
                ]
            })
        });

        if (response.status === 429) {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
                continue;
            }
            throw new Error('Rate limit hit. Please wait a moment and try again.');
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.error?.message || `API error (${response.status})`);
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content || 'No response received.';
    }
};

// ── Chatbot UI ───────────────────────────────────────────────────────────────
const chatbotFab   = document.getElementById('chatbotFab');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatbotClose = document.getElementById('chatbotClose');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

if (chatbotFab) {
    chatbotFab.addEventListener('click', () => {
        chatbotPanel.classList.add('open');
        if (chatInput) chatInput.focus();
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
        chatbotPanel.classList.remove('open');
    });
}

function addMessage(text, sender) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `cm ${sender}`;

    const avatar = sender === 'user' ? '👤' : '🤖';
    // Render newlines as <br>
    const formatted = text.replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="cm-av">${avatar}</div>
        <div class="cm-bubble"><p>${formatted}</p></div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleChat() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    // Typing indicator
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'cm ai';
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
        <div class="cm-av">🤖</div>
        <div class="cm-bubble"><p>...</p></div>
    `;
    if (chatMessages) {
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    try {
        const reply = await window.callGrokAPI(
            text,
            'You are CareerPilot AI, an expert career guidance mentor. Help users with career advice, resume tips, interview preparation, skill development, and job search strategies. Be concise, practical, and encouraging.'
        );
        const el = document.getElementById(typingId);
        if (el) el.remove();
        addMessage(reply, 'ai');
    } catch (err) {
        const el = document.getElementById(typingId);
        if (el) el.remove();
        addMessage('Sorry, I encountered an error: ' + err.message, 'ai');
    }
}

if (chatSend) chatSend.addEventListener('click', handleChat);
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });
}

window.sendChip = function (btn) {
    if (chatInput) chatInput.value = btn.innerText;
    handleChat();
};
