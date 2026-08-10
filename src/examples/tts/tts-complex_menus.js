class MainMenu extends HTMLMenu {
    constructor(game, canvas) {
        super(game, "#mainMenu", "#container", canvas, true, true, true);

        this.phase = 0;
        this.timer = 0;
    }

    Start() {
        super.Start();

        this.SetupElements([
            // "#menuStart",
            '#press-to-start',
            '.neon-logo',
            '#press-to-start-2'
        ]);

        // this.SetupButtons([
        //     { selector: "#menuStart", callback: this.StartButton.bind(this) }
        // ]);

        this.timer = 0;
    }

    PressToStart() {
        this.elements[".neon-logo"].classList.remove("hidden");
        this.elements["#press-to-start"].classList.add("hidden");

        game.Invoke(this.ShowPressAgain, 4, this);

        this.phase = 1;
        this.timer = 0;
    }

    StartButton() {
        this.SetContainerStyle('top: -100%; opacity: 0;');

        this.game.OnMenuStartButton();
    }
    
    ShowMenu() {
        this.SetContainerStyle('top: 0%; opacity: 1;');
    }

    ShowPressAgain() {
        this.elements["#press-to-start-2"].classList.remove("hidden");
    }
}

class PauseMenu extends HTMLMenu {
    constructor(game, canvas) {
        super(game, "#pauseMenu", "#container", canvas, true, true, true);
    }

    Start() {
        super.Start();

        // this.SetupElements([
        //     "#menuResume"
        // ]);

        this.SetupButtons([
            { selector: "#menuResume", callback: this.ResumeButton.bind(this) }
        ]);
    }

    ResumeButton() {
        this.game.PauseGame(false);
    }
    
    ShowMenu() {
        this.RemoveClassFromContainer("hidden");
        this.SetContainerStyle('top: 0%; opacity: 1;');
    }

    HideMenu() {
        this.AddClassToContainer("hidden");
        this.SetContainerStyle('top: -100%; opacity: 0;');
    }
}

class GameOverMenu extends HTMLMenu {
    constructor(game, canvas) {
        super(game, "#gameOverMenu", "#container", canvas, true, true, true);
    }

    Start() {
        super.Start();
        this.SetupElements(["#finalScore"]);
        this.SetupButtons([{ selector: "#btnRestart", callback: this.OnRestart.bind(this) }]);
    }

    OnRestart() {
        this.HideMenu();
        this.game.OnGameOverRestartButton();
    }

    SetScore(score) {
        this.elements["#finalScore"].textContent = score;
    }

    ShowMenu() {
        this.RemoveClassFromContainer("hidden");
        this.SetContainerStyle('top: 0%; opacity: 1;');
    }

    HideMenu() {
        this.AddClassToContainer("hidden");
        this.SetContainerStyle('top: -100%; opacity: 0;');
    }
}
