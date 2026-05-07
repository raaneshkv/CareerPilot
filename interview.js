// ── Auth Guard ───────────────────────────────────────────────────────────────
(function authGuard() {
    const user = JSON.parse(localStorage.getItem('cp_auth_user') || 'null');
    if (!user) { window.location.href = 'index.html'; }
})();

const startInterviewBtn = document.getElementById('startInterviewBtn');
const jobRoleInput      = document.getElementById('jobRole');
const setupSection      = document.getElementById('setupSection');
const interviewSection  = document.getElementById('interviewSection');
const questionBox       = document.getElementById('questionBox');
const answerInput       = document.getElementById('answerInput');
const submitAnswerBtn   = document.getElementById('submitAnswerBtn');
const feedbackBox       = document.getElementById('feedbackBox');
const feedbackTitle     = document.getElementById('feedbackTitle');
const feedbackText      = document.getElementById('feedbackText');
const nextQuestionBtn   = document.getElementById('nextQuestionBtn');
const skipQuestionBtn   = document.getElementById('skipQuestionBtn');

let currentRole     = '';
let currentQuestion = '';
let questionCount   = 0;
let totalScore      = 0;
const MAX_QUESTIONS = 15;

// Question type rotation for variety
const QUESTION_TYPES = [
    'behavioral',    // 1
    'technical',     // 2
    'situational',   // 3
    'behavioral',    // 4
    'technical',     // 5
    'technical',     // 6
    'behavioral',    // 7
    'situational',   // 8
    'technical',     // 9
    'behavioral',    // 10
    'technical',     // 11
    'situational',   // 12
    'behavioral',    // 13
    'technical',     // 14
    'situational',   // 15
];

if (startInterviewBtn) {
    startInterviewBtn.addEventListener('click', async () => {
        currentRole = jobRoleInput.value.trim();
        if (!currentRole) {
            alert('Please enter a target job role.');
            return;
        }

        questionCount = 0;
        totalScore    = 0;
        const btnOriginalText   = startInterviewBtn.innerHTML;
        startInterviewBtn.innerHTML = 'Starting…';
        startInterviewBtn.disabled  = true;

        try {
            setupSection.classList.add('hidden');
            interviewSection.classList.remove('hidden');
            await loadNextQuestion();
        } catch (e) {
            console.error(e);
            alert('Error starting interview: ' + e.message);
        } finally {
            startInterviewBtn.innerHTML = btnOriginalText;
            startInterviewBtn.disabled  = false;
        }
    });
}

async function loadNextQuestion() {
    if (questionCount >= MAX_QUESTIONS) {
        showFinalSummary();
        return;
    }

    questionCount++;
    questionBox.innerText = `Thinking of question ${questionCount} of ${MAX_QUESTIONS}…`;
    answerInput.value     = '';
    feedbackBox.classList.add('hidden');
    submitAnswerBtn.classList.remove('hidden');
    answerInput.classList.remove('hidden');

    try {
    const qType = QUESTION_TYPES[questionCount - 1] || 'behavioral';
    const systemPrompt =
        `You are an expert interviewer conducting a mock interview for a ${currentRole} position. ` +
        `Ask exactly ONE ${qType} interview question. ` +
        `This is question ${questionCount} of ${MAX_QUESTIONS}. ` +
        'Do NOT repeat previous questions. ' +
        'Return only the question itself, no numbering, no preamble.';

    currentQuestion = await window.callGrokAPI(
        `Generate a unique ${qType} question for a ${currentRole} interview. Question ${questionCount} of ${MAX_QUESTIONS}.`,
        systemPrompt
    );

    questionBox.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
          <span class="rm-badge" style="font-size:0.75rem;text-transform:capitalize">${qType}</span>
          <span style="font-size:0.8rem;color:var(--text-muted)">Q${questionCount} / ${MAX_QUESTIONS}</span>
        </div>
        <p style="margin:0;font-size:1.05rem;line-height:1.6">${currentQuestion}</p>
    `;
    } catch (e) {
        questionBox.innerText = 'Error loading question: ' + e.message;
    }
}

function showFinalSummary() {
    const avgScore = Math.round(totalScore / MAX_QUESTIONS);
    questionBox.innerHTML = `<h3><span class="t-icon">🏆</span> Interview Complete!</h3>`;
    answerInput.classList.add('hidden');
    submitAnswerBtn.classList.add('hidden');
    feedbackBox.classList.remove('hidden');
    feedbackBox.className = 'feedback-box';
    feedbackTitle.innerText = `Final Score: ${avgScore}/100`;

    let grade, summaryText;
    if (avgScore >= 90) {
        grade = '🏅 Outstanding';
        summaryText = 'Exceptional performance! You demonstrated deep expertise, articulate communication, and compelling real-world examples. You are highly ready for this role.';
    } else if (avgScore >= 80) {
        grade = '⭐ Excellent';
        summaryText = 'Great job! You showed strong knowledge and communication. A few answers could benefit from more specific examples using the STAR method (Situation, Task, Action, Result).';
    } else if (avgScore >= 70) {
        grade = '👍 Good';
        summaryText = 'Solid performance with good understanding of the role. Focus on adding more concrete examples and quantifiable achievements to your answers.';
    } else if (avgScore >= 55) {
        grade = '📚 Needs Improvement';
        summaryText = 'You showed potential but need more preparation. Review core concepts for this role, practice the STAR method, and work on structuring your answers more clearly.';
    } else {
        grade = '🔄 Keep Practicing';
        summaryText = 'This role requires significant preparation. Study role-specific skills, practice mock interviews daily, and focus on building real project experience.';
    }

    feedbackText.innerHTML = `
        <div style="text-align:center;margin-bottom:1rem">
            <span style="font-size:1.5rem;font-weight:700">${grade}</span>
        </div>
        <p>${summaryText}</p>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap">
            <button class="btn-hero" style="flex:1" onclick="location.reload()">Try Again</button>
            <a href="roadmap.html" class="btn-outline" style="flex:1;display:flex;align-items:center;justify-content:center">Build Roadmap</a>
        </div>
    `;
    nextQuestionBtn.classList.add('hidden');
}

if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', async () => {
        const answer = answerInput.value.trim();
        if (!answer) {
            alert('Please provide an answer first.');
            return;
        }

        submitAnswerBtn.innerHTML = 'Evaluating…';
        submitAnswerBtn.disabled  = true;

        try {
            const systemPrompt =
                `You are an expert interviewer evaluating a candidate for a ${currentRole} position. ` +
                `The interview question was: "${currentQuestion}". ` +
                `The candidate's answer: "${answer}". ` +
                'Evaluate the answer on: clarity, relevance, depth, and use of examples. ' +
                'Start your response with "Score: X/100" on the first line, then provide detailed, constructive feedback in 3-4 sentences. ' +
                'Mention what was good and what could be improved.';

            const evaluation = await window.callGrokAPI(answer, systemPrompt);

            // Extract score from response
            const scoreMatch = evaluation.match(/Score:\s*(\d+)/i);
            const score      = scoreMatch ? parseInt(scoreMatch[1]) : 70;
            totalScore      += score;
            const feedback   = evaluation.replace(/Score:\s*\d+\/100\n?/i, '').trim();

            feedbackBox.className       = 'feedback-box ' + (score < 70 ? 'bad' : '');
            feedbackTitle.innerText     = `Evaluation — Score: ${score}/100`;
            feedbackText.innerText      = feedback;

            submitAnswerBtn.classList.add('hidden');
            answerInput.classList.add('hidden');
            feedbackBox.classList.remove('hidden');
            
            if (questionCount >= MAX_QUESTIONS) {
                nextQuestionBtn.innerText = "View Final Results";
            } else {
                nextQuestionBtn.innerText = "Next Question";
            }

        } catch (e) {
            alert('Error evaluating answer: ' + e.message);
        } finally {
            submitAnswerBtn.innerHTML = 'Submit Answer';
            submitAnswerBtn.disabled  = false;
        }
    });
}

if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', loadNextQuestion);
}

if (skipQuestionBtn) {
    skipQuestionBtn.addEventListener('click', async () => {
        // Count the skip as a 0-score question and move on
        totalScore += 0;
        feedbackBox.classList.add('hidden');
        submitAnswerBtn.classList.remove('hidden');
        answerInput.classList.remove('hidden');
        answerInput.value = '';
        await loadNextQuestion();
    });
}
