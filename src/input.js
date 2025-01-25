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

        // clean mose down events
        this.mouse.down = false;
        this.mouse.up = false;
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
