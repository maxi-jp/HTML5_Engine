/**
 * Engine global variable and Input namespace type declarations.
 * This file is NOT loaded at runtime — it exists only for IDE IntelliSense.
 * Auto-included by VS Code because it sits at the project root.
 */

// ── Globals set by main.js ───────────────────────────────────────────────────

/** The active Renderer (Canvas2DRenderer or WebGLRenderer). Set at startup. */
declare var renderer: Renderer;
/** The active Game instance. Set at startup. */
declare var game: Game;
/** The global AudioPlayer instance. */
declare var audioPlayer: AudioPlayer;
/** Total elapsed seconds since game start. */
declare var totalTime: number;
/** True on touch-primary devices (phone/tablet). */
declare var mobileWithTouchScreen: boolean;
/** The game canvas element. */
declare var canvas: HTMLCanvasElement;
/** When true, shows the FPS/stats overlay. */
declare var drawStats: boolean;
/** When true, enables debug rendering. */
declare var debugMode: boolean;

/** Bootstraps the engine and starts the game. Call inside `window.onload`. */
declare function Init(gameClass: new (renderer: Renderer) => Game): void;

// ── Input namespace ──────────────────────────────────────────────────────────

declare namespace Input {
    // Keyboard
    /** True on the single frame the key was first pressed. */
    function IsKeyDown(keycode: number): boolean;
    /** True on the single frame the key was released. */
    function IsKeyUp(keycode: number): boolean;
    /** True every frame the key is held down. */
    function IsKeyPressed(keycode: number): boolean;

    // Mouse
    /** True every frame the mouse button is held. 0=left, 1=right, 2=middle. */
    function IsMousePressed(button?: 0 | 1 | 2): boolean;
    /** True on the single frame the mouse button was first pressed. */
    function IsMouseDown(button?: 0 | 1 | 2): boolean;
    /** True on the single frame the mouse button was released. */
    function IsMouseUp(button?: 0 | 1 | 2): boolean;
    /** Returns the current mouse position in canvas space. */
    function GetMousePosition(): { x: number; y: number };

    // Abstract actions
    function RegisterAction(name: string, bindings: object[]): void;
    function UnregisterAction(name: string): void;
    /** True every frame the action binding is held. */
    function GetActionDown(name: string): boolean;
    /** True on the single frame the action binding was first triggered. */
    function IsActionDown(name: string): boolean;
    /** @deprecated Use IsActionDown */
    function IsActionPressed(name: string): boolean;

    // Abstract axes — returns −1…1
    function RegisterAxis(name: string, bindings: object[]): void;
    function UnregisterAxis(name: string): void;
    function GetAxis(name: string): number;

    // Gamepad
    function GetGamepad(index: number): Gamepad | null;
    function IsGamepadButtonDown(gamepadIndex: number, button: string): boolean;
    function IsAnyGamepadButtonDown(): boolean;
    function IsAnyGamepadFaceButtonDown(): boolean;

    // Rumble
    function RegisterRumble(name: string, config: { duration: number; weakMagnitude?: number; strongMagnitude?: number }): void;
    function UnregisterRumble(name: string): void;
    function PlayRumble(name: string, gamepadIndex: number): void;

    // Virtual controls
    function RegisterVirtualJoystick(id: string, x: number, y: number, radius: number): void;
    function RemoveVirtualJoystick(id: string): void;
    function RegisterVirtualDPad(id: string, x: number, y: number, size: number): void;

    // Convenience
    /** True if any keyboard key, mouse button, touch, or gamepad button was triggered this frame. */
    function Anything(): boolean;
}
