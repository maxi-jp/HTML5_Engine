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
    function GetAction(name: string): boolean;
    /** True on the single frame the action binding was first triggered. */
    function GetActionDown(name: string): boolean;
    /** True on the single frame the action binding was released. */
    function GetActionUp(name: string): boolean;

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
    function RegisterRumble(name: string, strong?: number, weak?: number, duration?: number, delay?: number): void;
    function UnregisterRumble(name: string): void;
    function ExecuteRumble(id: string, gamepadIndex?: number): void;

    // Virtual controls
    function RegisterVirtualJoystick(id: string, x: number, y: number, radius: number): void;
    function RemoveVirtualJoystick(id: string): void;
    function RegisterVirtualDPad(id: string, x: number, y: number, size: number): void;

    // Convenience
    /** True if any keyboard key, mouse button, touch, or gamepad button was triggered this frame. */
    function Anything(): boolean;
}

// ── Timer class ──────────────────────────────────────────────────────────────

/**
 * Represents a game timer. Created via game.Invoke() or gameObject.Invoke().
 * Timers run on game time and are automatically paused when the game loses focus.
 */
declare class Timer {
    /** Unique timer ID. */
    id: number;
    /** The callback function to execute. */
    callback: Function;
    /** Delay or interval in seconds. */
    delay: number;
    /** Interval for repeating timers (0 for one-shot). */
    interval: number;
    /** Time elapsed since last execution. */
    elapsed: number;
    /** Whether this timer repeats. */
    repeating: boolean;
    /** GameObject that owns this timer (if any). */
    owner: GameObject | null;
    /** Whether this timer is active. */
    active: boolean;
    
    /** Cancels this timer. */
    Cancel(): void;
}

// ── Renderer class ───────────────────────────────────────────────────────────

/**
 * Base renderer class. Canvas2DRenderer and WebGLRenderer share this API.
 * Available globally as `renderer` and within Game as `this.renderer`.
 */
declare class Renderer {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    halfWidth: number;
    halfHeight: number;
    imageSmoothingEnabled: boolean;
    fillScreen: boolean;
    fillScreenMatchNativeResolution: boolean;
    fillScreenUseDevicePixelRatio: boolean;
    fillScreenPreserveAspectRatio: boolean;

    // Core methods
    Clear(): void;
    SetScreenSize(width: number, height: number): void;
    SetCanvasFillWindow(matchNativeResolution?: boolean, useDevicePixelRatio?: boolean, preserveAspectRatio?: boolean): void;
    RestoreCanvasOriginalSize(): void;

    // Camera
    ApplyCameraTransform(camera: any): void;
    RestoreCameraTransform(): void;

    // Primitives
    DrawLine(x1: number, y1: number, x2: number, y2: number, color?: Color, lineWidth?: number): void;
    DrawPolygon(points: {x: number, y: number}[], strokeColor?: Color, lineWidth?: number, fill?: boolean, fillColor?: Color): void;
    
    // Rectangles
    DrawRectangle(x: number, y: number, w: number, h: number, color?: Color, stroke?: boolean, lineWidth?: number, rot?: number, pivot?: {x: number, y: number}): void;
    DrawStrokeRectangle(x: number, y: number, w: number, h: number, color?: Color, lineWidth?: number, rot?: number, pivot?: {x: number, y: number}): void;
    DrawFillRectangle(x: number, y: number, w: number, h: number, color?: Color, rot?: number, pivot?: {x: number, y: number}): void;
    DrawBasicRectangle(x: number, y: number, w: number, h: number, color?: Color, stroke?: boolean, lineWidth?: number): void;
    DrawStrokeBasicRectangle(x: number, y: number, w: number, h: number, color?: Color, lineWidth?: number): void;
    DrawFillBasicRectangle(x: number, y: number, w: number, h: number, color?: Color): void;

    // Circles
    DrawCircle(x: number, y: number, radius: number, color?: Color, stroke?: boolean, lineWidth?: number): void;
    DrawFillCircle(x: number, y: number, radius: number, color?: Color): void;
    DrawStrokeCircle(x: number, y: number, radius: number, color?: Color, lineWidth?: number): void;
    
    // Text
    DrawText(text: string, x: number, y: number, font: string, color?: Color, align?: "left" | "center" | "right", baseline?: "top" | "middle" | "alphabetic" | "bottom", stroke?: boolean, lineWidth?: number): void;
    DrawFillText(text: string, x: number, y: number, font: string, color?: Color, align?: "left" | "center" | "right", baseline?: "top" | "middle" | "alphabetic" | "bottom"): void;
    DrawStrokeText(text: string, x: number, y: number, font: string, color?: Color, align?: "left" | "center" | "right", baseline?: "top" | "middle" | "alphabetic" | "bottom", lineWidth?: number): void;
    
    // Images
    DrawImage(img: HTMLImageElement, x: number, y: number, scaleX: number, scaleY: number, rot?: number, pivot?: {x: number, y: number}, alpha?: number): void;
    DrawImageBasic(img: HTMLImageElement, x: number, y: number, w?: number, h?: number, alpha?: number): void;
    DrawImageSection(img: HTMLImageElement, x: number, y: number, sx: number, sy: number, sw: number, sh: number, scaleX: number, scaleY: number, rot?: number, pivot?: {x: number, y: number}, alpha?: number): void;
    DrawImageSectionBasic(img: HTMLImageElement, x: number, y: number, sx: number, sy: number, sw: number, sh: number, scaleX: number, scaleY: number, alpha?: number): void;
    
    // Other
    DrawGradientRectangle(x: number, y: number, w: number, h: number, gradient: any): void;
}

// ── TiledLoader utility ──────────────────────────────────────────────────────

/**
 * Utility for loading and parsing Tiled Map Editor JSON exports.
 * Converts Tiled JSON format into engine-compatible Tileset data structures.
 * Requires tilesets to be embedded in the JSON export (check "Embed tilesets" when exporting from Tiled).
 */
declare class TiledLoader {
    // Parse a Tiled JSON map and convert it to engine format.
    static Parse(tiledJSON: any, graphicAssets: {[key: string]: {path: string, img: HTMLImageElement | null}}): any;
    
    // Load a Tiled JSON file asynchronously.
    static LoadJSON(url: string): Promise<any>;
    
    // Create Tileset game objects from parsed map data.
    static CreateTilesets(mapData: any, position: Vector2, scale?: number): Tileset[];
    
    // Get all object layers from the Tiled JSON.
    static GetObjectLayers(tiledJSON: any): any[];
    
    // Get objects from a specific layer by name.
    static GetObjectsByName(tiledJSON: any, name: string, layerName?: string): any[];
    
    // Get objects from a specific layer by type.
    static GetObjectsByType(tiledJSON: any, type: string, layerName?: string): any[];
    
    // Create SpriteObject instances from animated objects in object layers.
    static CreateSpriteObjects(tiledJSON: any, mapData: any, position: Vector2, scale?: number, layerName?: string): SpriteObject[];
    
    // Create a GameObjectsBackgroundLayer from an object layer with parallax support.
    static CreateGameObjectsBackgroundLayer(tiledJSON: any, mapData: any, layerName: string, position?: Vector2, scale?: number): GameObjectsBackgroundLayer;
}
