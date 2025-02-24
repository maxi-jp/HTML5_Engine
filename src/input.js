// #region Keyboard key ids
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
const KEY_Z = 90, KEY_X = 88, KEY_C = 67, KEY_V = 86, KEY_B = 66, KEY_N = 78, KEY_M = 77;

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
// #endregion

// #region Gamepad button IDs
const directions = ["UP", "DOWN", "LEFT", "RIGHT"];

const gamepadMapping = {
    xbox: {
        buttons: {
            FACE_DOWN: 0,  // BUTTON_A
            FACE_RIGHT: 1, // BUTTON_B
            FACE_LEFT: 2,  // BUTTON_X
            FACE_UP: 3,    // BUTTON_Y
            LB: 4, // BUTTON_LB
            RB: 5, // BUTTON_RB
            LT: 6, // BUTTON_LT
            RT: 7, // BUTTON_RT
            BACK: 8,  // BUTTON_BACK
            START: 9, // BUTTON_START
            LS: 10, // BUTTON_LS Left stick click
            RS: 11, // BUTTON_RS Right stick click
            DPAD_UP: 12,    // BUTTON_DPAD_UP
            DPAD_DOWN: 13,  // BUTTON_DPAD_DOWN
            DPAD_LEFT: 14,  // BUTTON_DPAD_LEFT
            DPAD_RIGHT: 15, // BUTTON_DPAD_RIGHT
            HOME: 16, // BUTTON_HOME

            LS_LEFT: "LS_LEFT",
            LS_RIGHT: "LS_RIGHT",
            LS_UP: "LS_UP",
            LS_DOWN: "LS_DOWN",
            RS_LEFT: "RS_LEFT",
            RS_RIGHT: "RS_RIGHT",
            RS_UP: "RS_UP",
            RS_DOWN: "RS_DOWN"
        },
        axes: {
            LS: 0,
            RS: 1,
        },
        triggers: {
            LT: 6,
            RT: 7
        }
    },
    standard: {
        buttons: {
            FACE_DOWN: 0,  // BUTTON_A
            FACE_RIGHT: 1, // BUTTON_B
            FACE_LEFT: 2,  // BUTTON_X
            FACE_UP: 3,    // BUTTON_Y
            LB: 4, // BUTTON_LB
            RB: 5, // BUTTON_RB
            LT: 6, // BUTTON_LT
            RT: 7, // BUTTON_RT
            BACK: 8,  // BUTTON_BACK
            START: 9, // BUTTON_START
            LS: 10, // BUTTON_LS Left stick click
            RS: 11, // BUTTON_RS Right stick click
            DPAD_UP: 12,    // BUTTON_DPAD_UP
            DPAD_DOWN: 13,  // BUTTON_DPAD_DOWN
            DPAD_LEFT: 14,  // BUTTON_DPAD_LEFT
            DPAD_RIGHT: 15, // BUTTON_DPAD_RIGHT
            HOME: 16, // BUTTON_HOME

            LS_LEFT: "LS_LEFT",
            LS_RIGHT: "LS_RIGHT",
            LS_UP: "LS_UP",
            LS_DOWN: "LS_DOWN",
            RS_LEFT: "RS_LEFT",
            RS_RIGHT: "RS_RIGHT",
            RS_UP: "RS_UP",
            RS_DOWN: "RS_DOWN"
        },
        axes: {
            LS: 0,
            RS: 1,
        },
        triggers: {
            LT: 6,
            RT: 7
        }
    },
    eightbitdo: {
        buttons: {
            FACE_DOWN: 1,  // BUTTON_A
            FACE_RIGHT: 0, // BUTTON_B
            FACE_LEFT: 4,  // BUTTON_X
            FACE_UP: 3,    // BUTTON_Y
            LB: 6, // BUTTON_LB
            RB: 7, // BUTTON_RB
            LT: 6, // BUTTON_LT
            RT: 7, // BUTTON_RT
            BACK: 10,  // BUTTON_BACK
            START: 11, // BUTTON_START
            LS: 10, // BUTTON_LS Left stick click
            RS: 11, // BUTTON_RS Right stick click
            DPAD_UP: 12,    // BUTTON_DPAD_UP
            DPAD_DOWN: 13,  // BUTTON_DPAD_DOWN
            DPAD_LEFT: 14,  // BUTTON_DPAD_LEFT
            DPAD_RIGHT: 15, // BUTTON_DPAD_RIGHT
            HOME: 16, // BUTTON_HOME

            LS_LEFT: "LS_LEFT",
            LS_RIGHT: "LS_RIGHT",
            LS_UP: "LS_UP",
            LS_DOWN: "LS_DOWN",
            RS_LEFT: "RS_LEFT",
            RS_RIGHT: "RS_RIGHT",
            RS_UP: "RS_UP",
            RS_DOWN: "RS_DOWN"
        },
        axes: {
            LS: 0,
            RS: 1,
        },
        triggers: {
            LT: 6,
            RT: 7
        },
    }
}
// #endregion

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
        // gamepad object structure:
        // {
        //     gamepad: null,
        //     down: [],
        //     up: [],
        //     pressed: [],
        //     mapping: {} // reference to the gamepadMapping object
        // }
    ],

// #region Setup Functions
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
            const gamepad = event.gamepad;
            let mapping = null;

            // detect the type of gamepad and apply the specific mapping
            if (gamepad.id.toLowerCase().includes("xbox")) {
                mapping = gamepadMapping.xbox;
            }
            else if (gamepad.id.includes("8Bitdo") || gamepad.id.includes("Vendor: 2dc8")) {
                mapping = gamepadMapping.eightbitdo;
            }
            else if (gamepad.id.toLowerCase().includes("standard gamepad")) {
                mapping = gamepadMapping.standard;
            }
            else {
                console.warn("Unknown gamepad type: ", gamepad.id);
            }

            this.gamepads[event.gamepad.index] = {
                gamepad: event.gamepad,
                down: [],
                up: [],
                pressed: [],
                mapping: mapping
            }

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
    IsGamepadButtonDown: function(gamepadIndex, buttonId) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping)
            return gamepad.down[gamepad.mapping.buttons[buttonId]];
        return false;
    },

    IsGamepadButtonUp: function(gamepadIndex, buttonId) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping)
            return gamepad.up[gamepad.mapping.buttons[buttonId]];
        return false;
    },

    IsGamepadButtonPressed: function(gamepadIndex, buttonId) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping)
            return gamepad.pressed[gamepad.mapping.buttons[buttonId]];
        return false;
    },

    GetGamepadAxisValue: function(gamepadIndex, axisIndex) {
        const gamepad = this.gamepads[gamepadIndex]?.gamepad;
        if (gamepad && gamepad.axes[axisIndex] !== undefined) {
            return gamepad.axes[axisIndex];
        }
        return 0;
    },

    GetGamepadStickAxisValue: function(gamepadIndex, stickId, axis) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping) {
            const axisId = gamepad.mapping.axes[stickId] * 2 + axis;
            if (gamepad.gamepad.axes[axisId] !== undefined) {
                return gamepad.gamepad.axes[axisId];
            }
        }
        return 0;
    },

    GetGamepadLeftStickValue: function(gamepadIndex, axis) {
        return this.GetGamepadStickAxisValue(gamepadIndex, "LS", axis);
    },

    GetGamepadRightStickValue: function(gamepadIndex, axis) {
        return this.GetGamepadStickAxisValue(gamepadIndex, "RS", axis);
    },

    GetGamepadStickValue: function(gamepadIndex, stick) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping) {
            const x = gamepad.gamepad.axes[gamepad.mapping.axes[stick] * 2] || 0;
            const y = gamepad.gamepad.axes[gamepad.mapping.axes[stick] * 2 + 1] || 0;
            return { x, y };
        }
        return { x: 0, y: 0 };
    },

    GetGamepadStickDirection: function(gamepadIndex, stickId, dir) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping) {
            const stick = gamepad.mapping.axes[stickId];
            const x = gamepad.gamepad.axes[stick * 2] || 0;
            const y = gamepad.gamepad.axes[stick * 2 + 1] || 0;

            return x < -0.5 && dir === "LEFT"  ||
                   x >  0.5 && dir === "RIGHT" ||
                   y < -0.5 && dir === "UP"    ||
                   y >  0.5 && dir === "DOWN";
        }
        return false;
    },

    GetGamepadTriggerValue: function(gamepadIndex, trigger) {
        const gamepad = this.gamepads[gamepadIndex];
        if (gamepad && gamepad.mapping) {
            return gamepad.gamepad.buttons[gamepad.mapping.triggers[trigger]].value || 0;
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

            // Update stick direction buttons like logic
            for (let i = 0; i < 2; i++) {
                const stick = i == 0 ? "LS" : "RS";
                directions.forEach(dir => {
                    const buttonId = `${stick}_${dir}`;
                    gamepad.down[buttonId] = gamepad.up[buttonId] = false;

                    const stickId = gamepad.mapping.axes[stick];
                    const x = gamepad.gamepad.axes[stickId * 2] || 0;
                    const y = gamepad.gamepad.axes[stickId * 2 + 1] || 0;

                    const pressed = x < -0.5 && dir === "LEFT" ||
                                    x > 0.5 && dir === "RIGHT" ||
                                    y < -0.5 && dir === "UP" ||
                                    y > 0.5 && dir === "DOWN";
                    if (pressed && !gamepad.pressed[buttonId]) {
                        gamepad.down[buttonId] = true;
                    }
                    if (!pressed && gamepad.pressed[buttonId]) {
                        gamepad.up[buttonId] = true;
                    }

                    gamepad.pressed[buttonId] = pressed;
                });
            }
        }
    }
// #endregion
};

function MouseDown(event) {
    //let rect = canvas.getBoundingClientRect();
    //let clickX = event.clientX - rect.left;
    //let clickY = event.clientY - rect.top;

    Input.mouse.down = true;
    Input.mouse.pressed = true;

    //console.log("MouseDown: " + "X=" + clickX + ", Y=" + clickY);
}

function MouseUp(event) {
    //let rect = canvas.getBoundingClientRect();
    //let clickX = event.clientX - rect.left;
    //let clickY = event.clientY - rect.top;

    Input.mouse.up = true;
    Input.mouse.pressed = false;

    //console.log("MouseUp: " + "X=" + clickX + ", Y=" + clickY);
}

function MouseMove(event) {
    let rect = canvas.getBoundingClientRect();
    Input.mouse.x = event.clientX - rect.left;
    Input.mouse.y = event.clientY - rect.top;
    //console.log(Input.mouse);
}
