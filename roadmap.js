// ── Auth Guard ───────────────────────────────────────────────────────────────
(function authGuard() {
    const user = JSON.parse(localStorage.getItem('cp_auth_user') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    // Show user name and sign-out
    const nameEl = document.getElementById('navUserName');
    const signOutEl = document.getElementById('signOutBtn');
    if (nameEl) { nameEl.textContent = `👤 ${user.name.split(' ')[0]}`; nameEl.style.display = 'inline'; }
    if (signOutEl) signOutEl.style.display = 'inline-block';
})();

// ── PDF Upload & Parsing ─────────────────────────────────────────────────────
const pdfDropZone  = document.getElementById('pdfDropZone');
const pdfFileInput = document.getElementById('pdfFileInput');
const pdfBrowseBtn = document.getElementById('pdfBrowseBtn');
const pdfFileName  = document.getElementById('pdfFileName');

async function extractTextFromPDF(file) {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) throw new Error('pdf.js failed to load. Please refresh the page.');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page    = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText.trim();
}

function handlePDFFile(file) {
    if (!file || file.type !== 'application/pdf') { alert('Please select a valid PDF file.'); return; }
    pdfFileName.textContent = '⏳ Extracting text from PDF…';
    pdfDropZone.classList.add('loading');
    extractTextFromPDF(file)
        .then(text => {
            if (!text) throw new Error('No text found — the PDF may be image-based.');
            document.getElementById('resumeInput').value = text;
            pdfFileName.textContent = `✅ ${file.name} — text extracted successfully`;
            pdfDropZone.classList.remove('loading');
            pdfDropZone.classList.add('success');
        })
        .catch(err => {
            pdfFileName.textContent = `❌ Error: ${err.message}`;
            pdfDropZone.classList.remove('loading');
        });
}

if (pdfBrowseBtn) pdfBrowseBtn.addEventListener('click', () => pdfFileInput.click());
if (pdfFileInput) pdfFileInput.addEventListener('change', e => handlePDFFile(e.target.files[0]));
if (pdfDropZone) {
    pdfDropZone.addEventListener('dragover', e => { e.preventDefault(); pdfDropZone.classList.add('drag-over'); });
    pdfDropZone.addEventListener('dragleave', () => pdfDropZone.classList.remove('drag-over'));
    pdfDropZone.addEventListener('drop', e => {
        e.preventDefault();
        pdfDropZone.classList.remove('drag-over');
        handlePDFFile(e.dataTransfer.files[0]);
    });
}

// ── Roadmap Dashboard Logic ──────────────────────────────────────────────────
const generateBtn    = document.getElementById('generateBtn');
const resumeInput    = document.getElementById('resumeInput');
const uploadSection  = document.getElementById('uploadSection');
const resultsSection = document.getElementById('resultsSection');
const resetBtn       = document.getElementById('resetBtn');
const exportBtn      = document.getElementById('exportBtn');

// Dashboard Elements
const dashSummary   = document.getElementById('dashSummary');
const rolesGrid     = document.getElementById('rolesGrid');
const projectsGrid  = document.getElementById('projectsGrid');
const skillsTags    = document.getElementById('skillsTags');
const roadmapNodes  = document.getElementById('roadmapNodes');
const progressRing  = document.getElementById('progressRingFill');
const progressPct   = document.getElementById('progressPct');
const progressCount = document.getElementById('progressCount');
const progressSub   = document.getElementById('progressSub');
const skillBarsGrid = document.getElementById('skillBarsGrid');

let currentNodes = [];

// Safe JSON Parse
function safeParse(raw) {
    try {
        const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : null;
    } catch { return null; }
}

if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        window.print();
    });
}

if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
        const text = resumeInput.value.trim();
        if (!text) return alert('Please paste or upload your resume first.');

        const btnHtml = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span class="rsc-spinner"></span> Generating Dashboard...';
        generateBtn.disabled = true;

        try {
            // 1. Roles & Summary
            const overviewRaw = await window.callGrokAPI(
                `Resume:\n${text.substring(0, 3000)}\n\nAnalyze this resume. Return a JSON object with: 1) "summary": 2-3 sentence career analysis. 2) "roles": Array of 4 best-fit job titles.`,
                'You are an expert career counselor. Return ONLY valid JSON, no markdown formatting outside the JSON.'
            );
            const overview = safeParse(overviewRaw) || { summary: "Analysis complete.", roles: ["Software Engineer"] };
            dashSummary.textContent = overview.summary;
            rolesGrid.innerHTML = overview.roles.map(r => `<span class="role-badge">${r}</span>`).join('');

            // 2. Projects
            const projectsRaw = await window.callGrokAPI(
                `Resume:\n${text.substring(0, 3000)}\n\nSuggest 4 "Proof of Work" projects to bridge their gap to a Senior role. Return JSON array: [{"title":"...", "desc":"...", "tags":["React", "Node"]}]`,
                'Return ONLY a JSON array of 4 projects.'
            );
            const projs = safeParse(projectsRaw) || [];
            projectsGrid.innerHTML = projs.map(p => `
                <div class="dash-proj-card">
                    <h4>${p.title}</h4>
                    <p>${p.desc}</p>
                    <div class="proj-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
                </div>
            `).join('');

            // 3. Skills Gap & Radar Chart
            const skillsRaw = await window.callGrokAPI(
                `Resume:\n${text.substring(0, 3000)}\n\nReturn JSON: { "detected": ["React", "Git", "CSS", "Python"], "radar": [ {"skill": "Frontend", "current": 80, "required": 95}, ... ] } with 5-6 broad categories for the radar.`,
                'Return ONLY valid JSON.'
            );
            const skills = safeParse(skillsRaw) || { detected: ["JavaScript"], radar: [{skill: "Programming", current: 50, required: 80}] };
            skillsTags.innerHTML = skills.detected.map(s => `<span class="skill-tag">${s}</span>`).join('');
            renderSkillBars(skills.radar);

            // 4. Roadmap Nodes
            const roadmapRaw = await window.callGrokAPI(
                `Resume:\n${text.substring(0, 3000)}\n\nGenerate 5 concrete learning steps. Return JSON array: [{"title":"...", "category":"frontend|backend|devops", "current": 40, "target": 80, "concepts":["C1", "C2"], "resources":[{"label":"YouTube", "type":"youtube"}]}]`,
                'Return ONLY a JSON array.'
            );
            currentNodes = safeParse(roadmapRaw) || [];
            // Map node status
            currentNodes = currentNodes.map(n => ({ ...n, completed: false }));
            renderNodes();
            updateProgress();

            uploadSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            generateBtn.innerHTML = btnHtml;
            generateBtn.disabled = false;
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
    });
}

function renderSkillBars(data) {
    if (!skillBarsGrid || !data || !data.length) return;

    // Build HTML with width=0 first (for animation)
    skillBarsGrid.innerHTML = data.map(d => {
        const cur = Math.min(Math.max(d.current || 0, 0), 100);
        const req = Math.min(Math.max(d.required || 0, 0), 100);
        return `
        <div class="skill-bar-row">
          <div class="skill-bar-label">
            <span>${d.skill}</span>
            <span>${cur}% <span style="color:rgba(251,191,36,0.85)">/ ${req}%</span></span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-current" style="width:0%" data-target="${cur}"></div>
            <div class="skill-bar-required-marker" style="left:${req}%"></div>
          </div>
        </div>`;
    }).join('');

    // Animate bars in on next frame
    requestAnimationFrame(() => {
        skillBarsGrid.querySelectorAll('.skill-bar-current').forEach(bar => {
            bar.style.width = bar.dataset.target + '%';
        });
    });
}

// ── Curated Resource Links ────────────────────────────────────────────────────
const RESOURCE_MAP = {
    // Frontend
    'react':        { url: 'https://react.dev/learn', type: 'docs' },
    'vue':          { url: 'https://vuejs.org/guide/', type: 'docs' },
    'angular':      { url: 'https://angular.io/docs', type: 'docs' },
    'javascript':   { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'docs' },
    'typescript':   { url: 'https://www.typescriptlang.org/docs/', type: 'docs' },
    'css':          { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', type: 'docs' },
    'html':         { url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'docs' },
    'next.js':      { url: 'https://nextjs.org/docs', type: 'docs' },
    'tailwind':     { url: 'https://tailwindcss.com/docs', type: 'docs' },
    // Backend
    'node':         { url: 'https://nodejs.org/en/docs/', type: 'docs' },
    'express':      { url: 'https://expressjs.com/', type: 'docs' },
    'python':       { url: 'https://docs.python.org/3/tutorial/', type: 'docs' },
    'django':       { url: 'https://docs.djangoproject.com/en/stable/', type: 'docs' },
    'fastapi':      { url: 'https://fastapi.tiangolo.com/', type: 'docs' },
    'java':         { url: 'https://dev.java/learn/', type: 'docs' },
    'spring':       { url: 'https://spring.io/guides', type: 'docs' },
    'go':           { url: 'https://go.dev/tour/welcome/1', type: 'docs' },
    'rust':         { url: 'https://doc.rust-lang.org/book/', type: 'docs' },
    // Data / ML
    'machine learning': { url: 'https://www.coursera.org/learn/machine-learning', type: 'course' },
    'deep learning': { url: 'https://www.deeplearning.ai/courses/', type: 'course' },
    'pytorch':      { url: 'https://pytorch.org/tutorials/', type: 'docs' },
    'tensorflow':   { url: 'https://www.tensorflow.org/tutorials', type: 'docs' },
    'pandas':       { url: 'https://pandas.pydata.org/docs/user_guide/index.html', type: 'docs' },
    'numpy':        { url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'docs' },
    'sql':          { url: 'https://www.w3schools.com/sql/', type: 'docs' },
    // DevOps / Cloud
    'docker':       { url: 'https://docs.docker.com/get-started/', type: 'docs' },
    'kubernetes':   { url: 'https://kubernetes.io/docs/tutorials/', type: 'docs' },
    'aws':          { url: 'https://aws.amazon.com/getting-started/', type: 'docs' },
    'gcp':          { url: 'https://cloud.google.com/docs/get-started', type: 'docs' },
    'azure':        { url: 'https://learn.microsoft.com/en-us/azure/', type: 'docs' },
    'git':          { url: 'https://www.atlassian.com/git/tutorials', type: 'docs' },
    'linux':        { url: 'https://linuxjourney.com/', type: 'docs' },
    'ci/cd':        { url: 'https://www.redhat.com/en/topics/devops/what-is-ci-cd', type: 'docs' },
    // General
    'data structures': { url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course' },
    'algorithms':   { url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course' },
    'system design':{ url: 'https://github.com/donnemartin/system-design-primer', type: 'docs' },
    'freecodecamp': { url: 'https://www.freecodecamp.org/learn', type: 'course' },
    'coursera':     { url: 'https://www.coursera.org', type: 'course' },
    'udemy':        { url: 'https://www.udemy.com', type: 'course' },
    'leetcode':     { url: 'https://leetcode.com/problemset/all/', type: 'course' },
};

function getCuratedResourceLink(label, type) {
    const key = (label || '').toLowerCase();
    // Try exact match
    if (RESOURCE_MAP[key]) return RESOURCE_MAP[key].url;
    // Try partial match
    for (const [k, v] of Object.entries(RESOURCE_MAP)) {
        if (key.includes(k) || k.includes(key)) return v.url;
    }
    // YouTube for video-type resources
    if (type === 'youtube') {
        return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(label + ' full course');
    }
    // freeCodeCamp as a quality default over plain Google
    return 'https://www.freecodecamp.org/news/search/?query=' + encodeURIComponent(label);
}

function renderNodes() {
    roadmapNodes.innerHTML = currentNodes.map((n, i) => {
        const pct = Math.round((n.current / n.target) * 100);
        return `
        <div class="rm-node ${n.completed ? 'completed' : ''}" data-index="${i}">
            <div class="rm-node-header" onclick="toggleNode(${i})">
                <div class="rm-icon">🚀</div>
                <div class="rm-info">
                    <div class="rm-title-row">
                        <h4>${n.title}</h4>
                        ${n.completed ? '<span class="rm-badge">Done</span>' : ''}
                    </div>
                    <div class="rm-progress-bar">
                        <div class="rm-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            </div>
            <div class="rm-body" id="rm-body-${i}" style="display:none;">
                <p class="rm-lbl">Concepts</p>
                <div class="rm-tags">${n.concepts.map(c => `<span>${c}</span>`).join('')}</div>
                <p class="rm-lbl" style="margin-top:1rem">Resources</p>
                <div class="rm-tags">${n.resources.map(r => {
                    let link = r.url && r.url.startsWith('http') ? r.url : getCuratedResourceLink(r.label, r.type);
                    const icon = r.type === 'youtube' ? '▶' : r.type === 'course' ? '🎓' : r.type === 'docs' ? '📖' : '🔗';
                    return `<a href="${link}" target="_blank" class="res-${r.type || 'link'}">${icon} ${r.label}</a>`;
                }).join('')}</div>
                <button class="rm-toggle-btn" onclick="markNode(${i}, event)">
                    ${n.completed ? '✅ Marked as Completed' : '⭕ Mark as Completed'}
                </button>
            </div>
        </div>
    `;
    }).join('');
}

window.toggleNode = function(index) {
    const body = document.getElementById(`rm-body-${index}`);
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
};

window.markNode = function(index, e) {
    e.stopPropagation();
    currentNodes[index].completed = !currentNodes[index].completed;
    renderNodes();
    updateProgress();
    document.getElementById(`rm-body-${index}`).style.display = 'block'; // keep open
};

function updateProgress() {
    const done = currentNodes.filter(n => n.completed).length;
    const total = currentNodes.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    
    progressCount.textContent = `${done} of ${total} steps done`;
    progressSub.textContent = `${total - done} steps remaining to reach your target role.`;
    progressPct.textContent = `${pct}%`;
    
    // Update SVG Circle
    const circ = 2 * Math.PI * 54;
    const dash = circ - ((pct / 100) * circ);
    progressRing.style.strokeDasharray = circ;
    progressRing.style.strokeDashoffset = dash;
}
