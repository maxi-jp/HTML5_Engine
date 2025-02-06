class InputAsset {
    constructor(id, position, width, height, key, value=null) {
        this.id = id;
        this.position = position;
        this.width = width;
        this.height = height;
        this.key = key;
        this.color = "white";
        this.pressedColor = "lightgreen";
        this.keyDownCount = 0;
        this.keyUpCount = 0;
        this.pressed = false;
        this.value = value;
    }

    DawAsRectangle(ctx) {
        // rectangles fill
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // rectangles stroke line
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        // rectangles text
        ctx.fillStyle = "black";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.key, this.position.x + this.width / 2, this.position.y + this.height - 12);

        ctx.font = "normal 12px Arial";
        ctx.textAlign = "left";
        ctx.fillText("↓" + this.keyDownCount, this.position.x + 1, this.position.y + 12);
        ctx.textAlign = "right";
        ctx.fillText("↑" + this.keyUpCount, this.position.x + this.width - 2, this.position.y + 12);
    }

    DrawAsCircle(ctx) {
        // circle fill
        DrawFillCircle(ctx, this.position.x, this.position.y, this.width, this.color);

        // circle stroke
        DrawStrokeCircle(ctx, this.position.x, this.position.y, this.width, "black", 1);

        // circles text
        ctx.fillStyle = "black";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.key, this.position.x, this.position.y + 13);

        ctx.font = "normal 10px Arial";
        ctx.textAlign = "left";
        ctx.fillText("↓" + this.keyDownCount, this.position.x - 15, this.position.y - 6);
        ctx.textAlign = "right";
        ctx.fillText("↑" + this.keyUpCount, this.position.x + 14, this.position.y - 6);
    }

    UpdateAsKeyboard() {
        // key pressed event
        this.pressed = Input.IsKeyPressed(this.id);
        if (this.pressed)
            this.color = this.pressedColor;
        else
            this.color = "white";

        // keydown event
        if (Input.IsKeyDown(this.id))
            this.keyDownCount++;
        // keyup event
        if (Input.IsKeyUp(this.id))
            this.keyUpCount++;
    }

    UpdateAsGamepadButton() {
        // buttonpressed event
        this.pressed = Input.IsGamepadButtonPressed(0, this.id);
        if (this.pressed)
            this.color = this.pressedColor;
        else
            this.color = "white";

        // keydown event
        if (Input.IsGamepadButtonDown(0, this.id))
            this.keyDownCount++;
        // keyup event
        if (Input.IsGamepadButtonUp(0, this.id))
            this.keyUpCount++;
    }
}

class InputTest extends Game {
    constructor() {
        super();

        this.keyRects = [
            new InputAsset(KEY_W, new Vector2( 80, 100), 50, 50, "W"),
            new InputAsset(KEY_A, new Vector2( 20, 160), 50, 50, "A"),
            new InputAsset(KEY_S, new Vector2( 80, 160), 50, 50, "S"),
            new InputAsset(KEY_D, new Vector2(140, 160), 50, 50, "D"),
        ];

        this.mouseCounts = {
            down: 0,
            up: 0
        };

        this.gamepadButtonCircles = [
            new InputAsset(BUTTON_DPAD_DOWN,  new Vector2(370, 150), 20, 20, "↓"),
            new InputAsset(BUTTON_DPAD_RIGHT, new Vector2(410, 115), 20, 20, "→"),
            new InputAsset(BUTTON_DPAD_LEFT,  new Vector2(330, 115), 20, 20, "←"),
            new InputAsset(BUTTON_DPAD_UP,    new Vector2(370,  80), 20, 20, "↑"),

            new InputAsset(BUTTON_A, new Vector2(520, 150), 20, 20, "A"),
            new InputAsset(BUTTON_B, new Vector2(560, 115), 20, 20, "B"),
            new InputAsset(BUTTON_X, new Vector2(480, 115), 20, 20, "X"),
            new InputAsset(BUTTON_Y, new Vector2(520,  80), 20, 20, "Y"),

            new InputAsset(BUTTON_BACK,  new Vector2(420, 40), 20, 20, "b"),
            new InputAsset(BUTTON_START, new Vector2(470, 40), 20, 20, "s"),

            new InputAsset(BUTTON_HOME, new Vector2(445, 170), 20, 20, "H"),

            new InputAsset(BUTTON_LB, new Vector2(300, 50), 20, 20, "LB"),
            new InputAsset(BUTTON_RB, new Vector2(590, 50), 20, 20, "RB"),
        ];
        
        this.gamepadTriggers = [
            new InputAsset(BUTTON_LT, new Vector2(260, 76), 40, 60, "LT"),
            new InputAsset(BUTTON_RT, new Vector2(590, 76), 40, 60, "RT")
        ];
        this.gamepadTriggers[0].pressedColor = this.gamepadTriggers[1].pressedColor = "rgba(0, 255, 0, 0.5)";

        this.gamepadStickCircles = [
            new InputAsset(BUTTON_LS, new Vector2(370, 230), 40, 40, "LS", {x: 0, y: 0}),
            new InputAsset(BUTTON_RS, new Vector2(520, 230), 40, 40, "RS", {x: 0, y: 0})
        ];

        this.gamepadButtons = [...this.gamepadButtonCircles, ...this.gamepadStickCircles, ...this.gamepadTriggers];
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // keyboard events
        this.keyRects.forEach(rect => {
            rect.UpdateAsKeyboard();
        });

        // mouse down & up
        if (Input.mouse.down)
            this.mouseCounts.down++;

        if (Input.mouse.up)
            this.mouseCounts.up++;

        // gamepad buttons events
        this.gamepadButtons.forEach(button => {
            button.UpdateAsGamepadButton();
        });

        // gamepad sticks values
        for (let i = 0; i < 2; i++) {
            const stickCircle = this.gamepadStickCircles[i]
            
            stickCircle.value = Input.GetGamepadStickValue(0, i);
            stickCircle.horizontalValue = Input.GetStickValue(0, i, 0);
            stickCircle.verticalValue = Input.GetStickValue(0, i, 1);
        }

        // gamepad triggers values
        this.gamepadTriggers.forEach(trigger => {
            trigger.value = Input.GetGamepadTriggerValue(0, trigger.id);
        });
    }

    Draw(ctx) {
        super.Draw(ctx);

        // keyboard keys
        DrawFillText(ctx, "Keyboard WASD events:", 18, 90, "normal 12px Arial", "black", "left");
        this.keyRects.forEach(keyRect => {
            keyRect.DawAsRectangle(ctx);
        });

        // gamepad buttons
        DrawFillText(ctx, "Gamepad0 events:", 240, 20, "normal 12px Arial", "black", "left");
        this.gamepadButtonCircles.forEach(buttonCircle => {
            buttonCircle.DrawAsCircle(ctx)
        });
        // gamepad stick
        this.gamepadStickCircles.forEach(stick => {
            stick.DrawAsCircle(ctx);

            // axis values
            ctx.textAlign = "center";
            ctx.fillText("x = " + stick.horizontalValue.toFixed(3), stick.position.x, stick.position.y + 22);
            ctx.fillText("y = " + stick.verticalValue.toFixed(3), stick.position.x, stick.position.y + 30);

            // red dot
            DrawFillCircle(ctx, stick.position.x + (stick.value.x * 40), stick.position.y + (stick.value.y * 40), 3, "red");
        })
        // gamepad triggers
        this.gamepadTriggers.forEach(trigger => {            
            ctx.fillStyle = 'rgba(0, 0, 255, 1)';
            ctx.fillRect(trigger.position.x, trigger.position.y, trigger.width, trigger.value * trigger.height);

            trigger.DawAsRectangle(ctx);

            ctx.textAlign = "center";
            ctx.fillText(trigger.value.toFixed(3), trigger.position.x + trigger.width / 2, trigger.position.y + trigger.height - 2);
        });

        // mouse info (position and state)
        ctx.beginPath();
        ctx.arc(Input.mouse.x, Input.mouse.y, 10, 0, Math.PI * 2, false);
        ctx.fillStyle = "white";
        if (Input.IsMousePressed())
            ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.fillText("↓" + this.mouseCounts.down, Input.mouse.x + 12, Input.mouse.y - 4);
        ctx.fillText("↑" + this.mouseCounts.up, Input.mouse.x + 12, Input.mouse.y + 12);
    }
}

// initialize the game
if (game === null)
    game = new InputTest();