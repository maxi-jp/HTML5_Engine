// key events
var lastPress = null;

const KEY_LEFT   = 37;
const KEY_UP     = 38;
const KEY_RIGHT  = 39;
const KEY_DOWN   = 40;
const KEY_ENTER  = 13;
const KEY_PAUSE  = 19;
const KEY_SPACE  = 32;
const KEY_ESCAPE = 27;
const KEY_LSHIFT = 16;
const KEY_LCTRL  = 17;
const KEY_TAB    = 9;

const KEY_Q = 81, KEY_W = 87, KEY_E = 69, KEY_R = 82, KEY_T = 84, KEY_Y = 89, KEY_U = 85;
const KEY_A = 65, KEY_S = 83, KEY_D = 68, KEY_F = 70, KEY_G = 71, KEY_H = 72, KEY_J = 74;
const KEY_Z = 90, KEY_X = 88, KEY_C = 67, KEY_V = 86, KEY_B = 66, KEY_M = 78, KEY_N = 77;

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
    gamepad: null,
    gamepads: [
        // gamepad object structure:
        // {
        //     gamepad: null,
        //     down: [],
        //     up: [],
        //     pressed: []
        // }
    ],

// #region Setup Functions
    SetupKeyboardEvents: function() {
        AddEvent(document, "keydown", function(e) {
            console.log(e.keyCode);
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
            this.gamepads[event.gamepad.index] = {
                gamepad: event.gamepad,
                down: [],
                up: [],
                pressed: []
            }
            this.gamepad = event.gamepad;

            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                event.gamepad.index, event.gamepad.id,
                event.gamepad.buttons.length, event.gamepad.axes.length);
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            delete this.gamepads[event.gamepad.index];
            this.gamepads.splice(event.gamepad.index, 1);

            console.log("Gamepad disconnected from index %d: %s",
                event.gamepad.index, event.gamepad.id);
        });

        // update connected gamepads and update button states
        this.UpdateGamepads();
    },
// #endregion

// #region Keyboard and Mouse Events
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
// #endregion

// #region Gamepad Events
    IsGamepadButtonDown: function(gamepadIndex, buttonIndex) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad)
            return gamepad.down[buttonIndex];
        return false;
    },

    IsGamepadButtonUp: function(gamepadIndex, buttonIndex) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad)
            return gamepad.up[buttonIndex];
        return false;
    },

    IsGamepadButtonPressed: function(gamepadIndex, buttonIndex) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad)
            return gamepad.pressed[buttonIndex];
        return false;
    },

    GetGamepadAxisValue: function(gamepadIndex, axisIndex) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        if (gamepad && gamepad.axes[axisIndex] !== undefined) {
            return gamepad.axes[axisIndex];
        }
        return 0;
    },

    GetStickValue: function(gamepadIndex, stickId, axis) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        const axisId = stickId * 2 + axis;
        if (gamepad && gamepad.axes[axisId] !== undefined) {
            return gamepad.axes[axisId];
        }
        return 0;
    },

    LeftStickValue: function(gamepadIndex, axis) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        if (gamepad && gamepad.axes[axis] !== undefined) {
            return gamepad.axes[axis];
        }
        return 0;
    },

    RightStickValue: function(gamepadIndex, axis) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        if (gamepad && gamepad.axes[2 + axis] !== undefined) {
            return gamepad.axes[2 + axis];
        }
        return 0;
    },

    GetGamepadStickValue: function(gamepadIndex, stick) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        if (gamepad) {
            const x = gamepad.axes[stick * 2] || 0;
            const y = gamepad.axes[stick * 2 + 1] || 0;
            return { x, y };
        }
        return { x: 0, y: 0 };
    },

    GetGamepadTriggerValue: function(gamepadIndex, trigger) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        if (gamepad) {
            return gamepad.buttons[trigger].value || 0;
        }
        return 0;
    },
// #endregion

// #region Update functions
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
    },

    UpdateGamepads: function() {
        // update current gamepad connected references
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepads[gamepads[i].index].gamepad = gamepads[i];
            }
        }

        // Update button down and up states
        for (let gamepadIndex in this.gamepads) {
            const gamepad = this.gamepads[gamepadIndex];
            for (let buttonIndex in gamepad.gamepad.buttons) {
                const button = gamepad.gamepad.buttons[buttonIndex];

                gamepad.down[buttonIndex] = gamepad.up[buttonIndex] = false;

                if (button.pressed && !gamepad.pressed[buttonIndex]) {
                    gamepad.down[buttonIndex] = true;
                }
                if (!button.pressed && gamepad.pressed[buttonIndex]) {
                    gamepad.up[buttonIndex] = true;
                }

                gamepad.pressed[buttonIndex] = button.pressed;
            }
        }
    }
// #endregion
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
