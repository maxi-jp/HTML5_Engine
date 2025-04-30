class MenuExample extends Game {
    constructor() {
        super();

        this.mainMenu = null;

        this.openMenuLabel = null;

        this.onMenu = false;
    }

    Start() {
        this.screenWidth = 480;
        this.screenHeight = 480;

        this.openMenuLabel = new TextLabel("Press ESC to open the menu", new Vector2(10, 300), "30px Comic Sans MS", "white", "left");

        this.mainMenu = new MainMenu(this, canvas);
        this.mainMenu.Start();
        this.onMenu = true;
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        if (Input.IsKeyUp(KEY_ESCAPE)) {
            this.mainMenu.ShowMenu();
            this.onMenu = true;
        }
    }

    Draw(ctx) {
        super.Draw(ctx);

        DrawFillRectangle(ctx, 0, 0, this.screenWidth, this.screenHeight, "black");

        if (!this.onMenu)
            this.openMenuLabel.Draw(ctx);
    }

    OnMenuStartButton() {
        this.onMenu = false;
    }
}

class MainMenu extends HTMLMenu {
    constructor(game, canvas) {
        super(game, "#mainMenu", "#container", canvas);
    }

    Start() {
        super.Start();

        this.SetupElements([
            "#menuStart",
            "#menuCredits",
            '#credits'
        ]);

        this.SetupButtons([
            { selector: "#menuStart", callback: this.StartButton.bind(this) },
            { selector: "#menuCredits", callback: this.ShowCredits.bind(this)  },
        ]);
    }

    StartButton() {
        this.SetContainerStyle('left: -100%');
        this.game.OnMenuStartButton();
    }
    
    ShowMenu() {
        this.SetContainerStyle('left: 0%');
    }

    ShowCredits() {
        this.elements["#credits"].setAttribute('style', 'display: block;');
        this.elements["#credits"].classList.add('show');
        this.elements["#credits"].onanimationend = () => {
            this.elements["#credits"].classList.remove('show');
            this.elements["#credits"].setAttribute('style', 'display: none');
        };
    }
}

// initialize the game
if (game === null)
    game = new MenuExample();