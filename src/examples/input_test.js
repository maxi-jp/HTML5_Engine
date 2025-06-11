class InputAsset {
    constructor(id, position, width, height, key, value=null) {
        this.id = id;
        this.position = position;
        this.width = width;
        this.height = height;
        this.key = key;
        this.color = Color.white;
        this.pressedColor = Color.FromHTMLColorName("lightgreen");
        this.keyDownCount = 0;
        this.keyUpCount = 0;
        this.pressed = false;
        this.value = value;
    }

    DawAsRectangle(renderer) {
        // rectangles fill
        renderer.DrawFillRectangle(this.position.x, this.position.y, this.width, this.height, this.color);

        // rectangles stroke line
        renderer.DrawStrokeRectangle(this.position.x, this.position.y, this.width, this.height);

        // rectangles text
        renderer.DrawFillText(this.key, this.position.x + this.width / 2, this.position.y + this.height - 12, "bold 32px Arial", Color.black, "center");

        
        renderer.DrawFillText("↓" + this.keyDownCount, this.position.x + 1, this.position.y + 12, "normal 12px Arial", Color.black, "left");
        renderer.DrawFillText("↑" + this.keyUpCount, this.position.x + this.width - 2, this.position.y + 12, "normal 12px Arial", Color.black, "right");
    }

    DrawAsCircle(renderer) {
        // circle fill
        renderer.DrawFillCircle(this.position.x, this.position.y, this.width, this.color);

        // circle stroke
        renderer.DrawStrokeCircle(this.position.x, this.position.y, this.width);

        // circles text
        renderer.DrawFillText(this.key, this.position.x, this.position.y + 13, "bold 22px Arial", Color.black, "center");
        
        renderer.DrawFillText("↓" + this.keyDownCount, this.position.x - 15, this.position.y - 6, "normal 10px Arial", Color.black, "left");
        renderer.DrawFillText("↑" + this.keyUpCount, this.position.x + 14, this.position.y - 6, "normal 10px Arial", Color.black, "right");
    }

    UpdateAsKeyboard() {
        // key pressed event
        this.pressed = Input.IsKeyPressed(this.id);
        if (this.pressed)
            this.color = this.pressedColor;
        else
            this.color = Color.white;

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
            this.color = Color.white;

        // keydown event
        if (Input.IsGamepadButtonDown(0, this.id))
            this.keyDownCount++;
        // keyup event
        if (Input.IsGamepadButtonUp(0, this.id))
            this.keyUpCount++;
    }
}

class InputTest extends Game {
    constructor(renderer) {
        super(renderer);

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
            new InputAsset("DPAD_DOWN",  new Vector2(370, 150), 20, 20, "↓"),
            new InputAsset("DPAD_RIGHT", new Vector2(410, 115), 20, 20, "→"),
            new InputAsset("DPAD_LEFT",  new Vector2(330, 115), 20, 20, "←"),
            new InputAsset("DPAD_UP",    new Vector2(370,  80), 20, 20, "↑"),

            new InputAsset("FACE_DOWN",  new Vector2(520, 150), 20, 20, "A"),
            new InputAsset("FACE_RIGHT", new Vector2(560, 115), 20, 20, "B"),
            new InputAsset("FACE_LEFT",  new Vector2(480, 115), 20, 20, "X"),
            new InputAsset("FACE_UP",    new Vector2(520,  80), 20, 20, "Y"),

            new InputAsset("BACK",  new Vector2(420, 40), 20, 20, "b"),
            new InputAsset("START", new Vector2(470, 40), 20, 20, "s"),

            new InputAsset("HOME", new Vector2(445, 170), 20, 20, "H"),

            new InputAsset("LB", new Vector2(300, 50), 20, 20, "LB"),
            new InputAsset("RB", new Vector2(590, 50), 20, 20, "RB"),
        ];
        
        this.gamepadTriggers = [
            new InputAsset("LT", new Vector2(260, 76), 40, 60, "LT"),
            new InputAsset("RT", new Vector2(590, 76), 40, 60, "RT")
        ];
        this.gamepadTriggers[0].pressedColor = this.gamepadTriggers[1].pressedColor = new Color(0, 1, 0, 0.5);

        this.gamepadStickCircles = [
            new InputAsset("LS", new Vector2(370, 230), 40, 40, "LS", {x: 0, y: 0}),
            new InputAsset("RS", new Vector2(520, 230), 40, 40, "RS", {x: 0, y: 0})
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
        this.gamepadStickCircles[0].value = Input.GetGamepadStickValue(0, "LS");
        this.gamepadStickCircles[0].horizontalValue = Input.GetGamepadStickAxisValue(0, "LS", 0);
        this.gamepadStickCircles[0].verticalValue = Input.GetGamepadStickAxisValue(0, "LS", 1);
        this.gamepadStickCircles[1].value = Input.GetGamepadStickValue(0, "RS");
        this.gamepadStickCircles[1].horizontalValue = Input.GetGamepadStickAxisValue(0, "RS", 0);
        this.gamepadStickCircles[1].verticalValue = Input.GetGamepadStickAxisValue(0, "RS", 1);

        // gamepad triggers values
        this.gamepadTriggers.forEach(trigger => {
            trigger.value = Input.GetGamepadTriggerValue(0, trigger.id);
        });
    }

    Draw() {
        super.Draw();

        // keyboard keys
        this.renderer.DrawFillText("Keyboard WASD events:", 18, 90, "normal 12px Arial", Color.black, "left");
        this.keyRects.forEach(keyRect => {
            keyRect.DawAsRectangle(this.renderer);
        }, this);

        // gamepad buttons
        this.renderer.DrawFillText("Gamepad0 events:", 240, 20, "normal 12px Arial", Color.black, "left");
        this.gamepadButtonCircles.forEach(buttonCircle => {
            buttonCircle.DrawAsCircle(this.renderer)
        }, this);
        // gamepad stick
        this.gamepadStickCircles.forEach(stick => {
            stick.DrawAsCircle(this.renderer);

            // axis values
            this.renderer.DrawFillText("x = " + stick.horizontalValue.toFixed(3), stick.position.x, stick.position.y + 22, "normal 12px Arial", Color.black, "center");
            this.renderer.DrawFillText("y = " + stick.verticalValue.toFixed(3), stick.position.x, stick.position.y + 30, "normal 12px Arial", Color.black, "center");

            // red dot
            this.renderer.DrawFillCircle(stick.position.x + (stick.value.x * 40), stick.position.y + (stick.value.y * 40), 3, Color.red);
        }, this)
        // gamepad triggers
        this.gamepadTriggers.forEach(trigger => {     
            this.renderer.DrawFillRectangle(trigger.position.x, trigger.position.y, trigger.width, trigger.value * trigger.height, Color.blue);

            trigger.DawAsRectangle(this.renderer);

            this.renderer.DrawFillText(trigger.value.toFixed(3), trigger.position.x + trigger.width / 2, trigger.position.y + trigger.height - 2, "normal 12px Arial", Color.black, "center");
        }, this);

        // mouse info (position and state)
        if (Input.IsMousePressed()) {
            renderer.DrawFillCircle(Input.mouse.x, Input.mouse.y, 10, Color.red);
        }
        else {
            renderer.DrawFillCircle(Input.mouse.x, Input.mouse.y, 10, Color.white);
        }
        renderer.DrawStrokeCircle(Input.mouse.x, Input.mouse.y, 10, Color.black, 1);

        this.renderer.DrawFillText("↓" + this.mouseCounts.down, Input.mouse.x + 12, Input.mouse.y - 4, "normal 12px Arial", Color.black, "center");
        this.renderer.DrawFillText("↑" + this.mouseCounts.up, Input.mouse.x + 12, Input.mouse.y + 12, "normal 12px Arial", Color.black, "center");
    }
}
