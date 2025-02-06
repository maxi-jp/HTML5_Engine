// key events
var lastPress = null;

const KEY_LEFT   = 37, KEY_A = 65;
const KEY_UP     = 38, KEY_W = 87;
const KEY_RIGHT  = 39, KEY_D = 68;
const KEY_DOWN   = 40, KEY_S = 83;
const KEY_PAUSE  = 19; KEY_Q = 81;
const KEY_SPACE  = 32; KEY_E = 69;
const KEY_ESCAPE = 27; KEY_F = 70;
const KEY_LSHIFT = 16;
const KEY_LCTRL  = 17;

const KEY_0 = 48;
const KEY_1 = 49;
const KEY_2 = 50;
const KEY_3 = 51;
const KEY_4 = 52;
const KEY_5 = 53;
const KEY_6 = 54;
const KEY_7 = 55;
const KEY_8 = 56;
const KEY_9 = 57;

// Gamepad button IDs
const BUTTON_A = 0;
const BUTTON_B = 1;
const BUTTON_X = 2;
const BUTTON_Y = 3;
const BUTTON_LB = 4;
const BUTTON_RB = 5;
const BUTTON_LT = 6;
const BUTTON_RT = 7;
const BUTTON_BACK = 8;
const BUTTON_START = 9;
const BUTTON_LS = 10; // Left stick click
const BUTTON_RS = 11; // Right stick click
const BUTTON_DPAD_UP = 12;
const BUTTON_DPAD_DOWN = 13;
const BUTTON_DPAD_LEFT = 14;
const BUTTON_DPAD_RIGHT = 15;
const BUTTON_HOME = 16;

var Input = {
    mouse: {
        x: 0,
        y: 0,
        down: false,
        up: false,
        pressed: false
    },

    keyboard: {
        keyup: {},
        keypressed: {},
        keydown: {}
    },

    gamepads: [
        // {
        //     gamepad: null,
        //     down: [],
        //     up: [],
        //     pressed: [],
        //     axes: [],
        //     triggers: []
        // }
    ],
    gamepadButtonDown: [],
    gamepadButtonUp: [],
    gamepadButtonPressed: [],
    gamepadAxes: [],

    SetupKeyboardEvents: function() {
        AddEvent(document, "keydown", function(e) {
            //console.log(e.keyCode);
            // avoid when the key is being held down such that it is automatically repeating
            if (!e.repeat) {
                Input.keyboard.keydown[e.keyCode] = true;
                Input.keyboard.keypressed[e.keyCode] = true;
            }
        } );
    
        AddEvent(document, "keyup", function(e) {
            Input.keyboard.keyup[e.keyCode] = true;
            Input.keyboard.keypressed[e.keyCode] = false;
        } );
    
        function AddEvent (element, eventName, func)
        {
            if (element.addEventListener)
                element.addEventListener(eventName, func, false);
            else if (element.attachEvent) // IE9
                element.attachEvent(eventName, func);
        }
    },

    SetupMouseEvents: function(canvas) {
        // mouse click event
        canvas.addEventListener("mousedown", MouseDown, false);
        // mouse move event
        canvas.addEventListener("mousemove", MouseMove, false);
        // mouse up event
        canvas.addEventListener("mouseup", MouseUp, false);
    },

    SetupGamepadEvents: function() {
        window.addEventListener("gamepadconnected", (event) => {
            this.gamepads[event.gamepad.index] = event.gamepad;
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                event.gamepad.index, event.gamepad.id,
                event.gamepad.buttons.length, event.gamepad.axes.length);
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            delete this.gamepads[event.gamepad.index];
            console.log("Gamepad disconnected from index %d: %s",
                event.gamepad.index, event.gamepad.id);
        });

        // Detect already connected gamepads
        this.UpdateGamepads();
    },

    UpdateGamepads: function() {
        // update current gamepad connected references
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepads[gamepads[i].index] = gamepads[i];
            }
        }

        // Update button down and up states
        for (let gamepadIndex in this.gamepads) {
            const gamepad = this.gamepads[gamepadIndex];
            for (let buttonIndex in gamepad.buttons) {
                const button = gamepad.buttons[buttonIndex];

                this.gamepadButtonDown[buttonIndex] = this.gamepadButtonUp[buttonIndex] = false;

                if (button.pressed && !this.gamepadButtonPressed[buttonIndex]) {
                    this.gamepadButtonDown[buttonIndex] = true;
                }
                if (!button.pressed && this.gamepadButtonPressed[buttonIndex]) {
                    this.gamepadButtonUp[buttonIndex] = true;
                }

                this.gamepadButtonPressed[buttonIndex] = button.pressed;
            }

            // Update axes values
            this.gamepadAxes[gamepadIndex] = gamepad.axes.slice();
        }
    },

    IsKeyPressed: function(keycode) {
        return this.keyboard.keypressed[keycode];
    },

    IsKeyDown: function(keycode) {
        return this.keyboard.keydown[keycode];
    },

    IsKeyUp: function (keycode) {
        return this.keyboard.keyup[keycode];
    },

    IsMousePressed: function () {
        return this.mouse.pressed;
    },

    IsMouseDown: function () {
        return this.mouse.down;
    },

    IsGamepadButtonDown: function(gamepadIndex, buttonIndex) {
        return this.gamepadButtonDown[buttonIndex];
    },

    IsGamepadButtonUp: function(gamepadIndex, buttonIndex) {
        return this.gamepadButtonUp[buttonIndex];
    },

    IsGamepadButtonPressed: function(gamepadIndex, buttonIndex) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.buttons[buttonIndex]) {
            return gamepad.buttons[buttonIndex].pressed;
        }
        return false;
    },

    GetGamepadAxisValue: function(gamepadIndex, axisIndex) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.axes[axisIndex] !== undefined) {
            return gamepad.axes[axisIndex];
        }
        return 0;
    },

    LeftStickValue: function(gamepadIndex, axis) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.axes[0 + axis] !== undefined) {
            return gamepad.axes[0 + axis];
        }
        return 0;
    },

    RightStickValue: function(gamepadIndex, axis) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.axes[2 + axis] !== undefined) {
            return gamepad.axes[2 + axis];
        }
        return 0;
    },

    GetGamepadStickValue: function(gamepadIndex, stick) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad) {
            const x = gamepad.axes[stick * 2] || 0;
            const y = gamepad.axes[stick * 2 + 1] || 0;
            return { x, y };
        }
        return { x: 0, y: 0 };
    },

    GetGamepadTriggerValue: function(gamepadIndex, trigger) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad) {
            return gamepad.buttons[trigger].value || 0;
        }
        return 0;
    },

    PostUpdate: function () {
        // clean keyboard keydown events
        for (var property in this.keyboard.keydown) {
            if (this.keyboard.keydown.hasOwnProperty(property)) {
                this.keyboard.keydown[property] = false;
            }
        }

        // clean keyboard keyup events
        for (var property in this.keyboard.keyup) {
            if (this.keyboard.keyup.hasOwnProperty(property)) {
                this.keyboard.keyup[property] = false;
            }
        }

        // clean mouse down events
        this.mouse.down = false;
        this.mouse.up = false;

        // update gamepads
        this.UpdateGamepads();
    }
};



function MouseDown (event)
{
    //let rect = canvas.getBoundingClientRect();
    //let clickX = event.clientX - rect.left;
    //let clickY = event.clientY - rect.top;

    Input.mouse.down = true;
    Input.mouse.pressed = true;

    //console.log("MouseDown: " + "X=" + clickX + ", Y=" + clickY);
}

function MouseUp (event)
{
    //let rect = canvas.getBoundingClientRect();
    //let clickX = event.clientX - rect.left;
    //let clickY = event.clientY - rect.top;

    Input.mouse.up = true;
    Input.mouse.pressed = false;

    //console.log("MouseUp: " + "X=" + clickX + ", Y=" + clickY);
}

function MouseMove (event)
{
    let rect = canvas.getBoundingClientRect();
    Input.mouse.x = event.clientX - rect.left;
    Input.mouse.y = event.clientY - rect.top;
    //console.log(Input.mouse);
}
