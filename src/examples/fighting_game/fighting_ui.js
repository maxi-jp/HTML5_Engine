// ── FightingUI Class ─────────────────────────────────────────────────────────

class FightingUI extends HTMLMenu {
    constructor(game, canvas) {
        // We use "body" as the container selectors assuming the UI elements are 
        // already properly positioned in your HTML file structure.
        super(game, "body", "body", canvas, false);
    }

    Start() {
        super.Start();
        
        // The HTMLMenu will cache these elements and make them accessible via this.elements
        this.SetupElements([
            '#timer',
            '#playerHealth .health-bar',
            '#enemyHealth .health-bar',
            '#displayText'
        ]);
    }

    UpdateTimerDisplay(time) {
        if (this.elements['#timer']) {
            this.elements['#timer'].textContent = time;
        }
    }

    UpdateHealthBars(playerHealth, enemyHealth) {
        if (this.elements['#playerHealth .health-bar']) {
            this.elements['#playerHealth .health-bar'].style.width = playerHealth + '%';
        }
        if (this.elements['#enemyHealth .health-bar']) {
            this.elements['#enemyHealth .health-bar'].style.width = enemyHealth + '%';
        }
    }

    ShowEndMatchText(message) {
        const displayEl = this.elements['#displayText'];
        if (displayEl) {
            displayEl.textContent = message;
            displayEl.style.display = 'flex';
        }
    }
}
