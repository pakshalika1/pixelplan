// Complete a Quest Action
async function completeTask(taskId) {
    const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
    if (!card) return;
    card.classList.add('task-completed');

    try {
        const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            setTimeout(() => {
                // Update UI elements dynamically (optimistic-feeling instant update)
                const tokenEl = document.getElementById('token-val');
                const xpEl = document.getElementById('xp-val');
                const xpTargetEl = document.getElementById('xp-target');
                const fillEl = document.getElementById('progress-fill');

                tokenEl.innerText = data.tokens;
                xpEl.innerText = data.xp;
                xpTargetEl.innerText = data.nextLevelXp;

                bump(tokenEl.closest('.score-badge'));

                const percent = Math.min(Math.round((data.xp / data.nextLevelXp) * 100), 100);
                fillEl.style.width = `${percent}%`;

                if (data.leveledUp) {
                    showLevelUp(data.level);
                    setTimeout(() => window.location.reload(), 1400);
                } else {
                    card.remove();
                }
            }, 220);
        } else {
            card.classList.remove('task-completed');
            alert(data.error || 'Something went wrong completing that quest.');
        }
    } catch (err) {
        card.classList.remove('task-completed');
        console.error('Failed to complete quest', err);
        alert('Network error. Check your connection and try again.');
    }
}

// Purchase Item Action
async function buyItem(itemId, cost) {
    const currentTokens = parseInt(document.getElementById('token-val').innerText, 10);

    if (currentTokens < cost) {
        alert('NOT ENOUGH TOKENS. COMPLETE MORE QUESTS.');
        return;
    }

    try {
        const res = await fetch(`/api/shop/buy/${itemId}`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            const tokenEl = document.getElementById('token-val');
            tokenEl.innerText = data.newBalance;
            bump(tokenEl.closest('.score-badge'));
            setTimeout(() => window.location.reload(), 500);
        } else {
            alert(data.error || 'Purchase failed.');
        }
    } catch (err) {
        console.error('Purchase failed', err);
        alert('Network error. Check your connection and try again.');
    }
}

// Small "bump" animation helper for tactile feedback
function bump(el) {
    if (!el) return;
    el.classList.remove('bump');
    // Force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add('bump');
}

// Level-up celebration overlay
function showLevelUp(level) {
    const overlay = document.createElement('div');
    overlay.className = 'levelup-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = `
        <div class="levelup-card">
            LEVEL UP!
            <p>YOU ARE NOW LEVEL ${level}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Graceful client-side validation for the quest form (no empty submissions)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quest-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        const title = document.getElementById('quest-title');
        if (!title.value.trim()) {
            e.preventDefault();
            title.focus();
        }
    });
});
