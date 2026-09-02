# AI Utilities (`ai.js`)

`src/engine/ai.js` provides general-purpose AI helpers that any game can use. Currently it exposes a single class: `AStarPathfinder`.

---

## `AStarPathfinder`

An A\* pathfinder that works with any grid object implementing the duck-typed interface below. It is not tied to a specific game — the same instance works for RTS games, dungeon crawlers, puzzle games, or any scenario requiring grid navigation.

### Grid interface

Your grid object must implement:

| Member | Signature | Description |
|---|---|---|
| `IsWalkable` | `(col, row) → boolean` | Whether the cell can be traversed |
| `IsInBounds` | `(col, row) → boolean` | Whether the coordinates are inside the grid |
| `WorldToGrid` | `(Vector2) → {col, row}` | Convert a world position to grid coordinates |
| `GridToWorld` | `(col, row) → Vector2` | Convert grid coordinates to a world position (typically cell centre) |
| `width` | `number` | Grid width in cells |
| `height` | `number` | Grid height in cells |

> The engine's `GridMap` class (used by the RTS example) satisfies this interface automatically.

---

### Constructor

```javascript
const pathfinder = new AStarPathfinder(grid, options);
```

| Option | Type | Default | Description |
|---|---|---|---|
| `allowDiagonals` | `boolean` | `true` | Allow 8-directional movement |
| `maxIterations` | `number` | `20000` | Safety cap — stops the search and returns the closest reachable cell |
| `smoothPath` | `boolean` | `true` | Apply line-of-sight smoothing (removes redundant intermediate waypoints) |
| `heuristic` | `function` | auto | Override the distance heuristic. Auto-selects `Octile` for 8-dir, `Manhattan` for 4-dir |

---

### Methods

#### `FindPath(startWorld, endWorld)` → `Vector2[]`

Find a world-space path between two `Vector2` positions.

- Returns an array of `Vector2` waypoints from start to end (inclusive).
- Returns `[]` if start is completely isolated.
- If the exact target cell is blocked, automatically falls back to the nearest walkable cell.

```javascript
const waypoints = pathfinder.FindPath(unit.position, targetPos);
if (waypoints.length > 0) {
    // waypoints[0] is start, waypoints[waypoints.length - 1] is (near) target
}
```

#### `FindPathGrid(sc, sr, ec, er)` → `{col, row}[]`

Same as `FindPath` but operates on grid coordinates and returns grid-coordinate objects instead of world positions. Useful when you want to reason about the path in grid space before converting.

```javascript
const gridPath = pathfinder.FindPathGrid(0, 0, 24, 17);
```

---

### Heuristics

`AStarPathfinder.Heuristic` exposes three named heuristic functions:

| Name | Best used when | Formula |
|---|---|---|
| `Manhattan` | 4-directional grids (no diagonals) | `\|dx\| + \|dy\|` |
| `Octile` | 8-directional grids with diagonal cost √2 (**default** for `allowDiagonals: true`) | `max(dx, dy) + (√2 − 1) · min(dx, dy)` |
| `Euclidean` | Continuous / any-angle movement | `√(dx² + dy²)` |

The heuristic is **auto-selected** based on `allowDiagonals`:

```javascript
// 4-directional → Manhattan selected automatically
new AStarPathfinder(grid, { allowDiagonals: false });

// 8-directional → Octile selected automatically (default)
new AStarPathfinder(grid);
```

You can override with any named heuristic or a custom function:

```javascript
// Named constant
new AStarPathfinder(grid, { heuristic: AStarPathfinder.Heuristic.Euclidean });

// Custom function (e.g. weighted A* — faster but non-optimal)
new AStarPathfinder(grid, {
    heuristic: (col, row, ec, er) => 1.5 * Math.hypot(col - ec, row - er)
});
```

---

### Path smoothing

When `smoothPath: true` (default), the pathfinder runs a post-process pass over the raw A\* waypoints using **Bresenham's line** to check line-of-sight between non-adjacent waypoints. Any intermediate waypoint that can be skipped without crossing a wall is removed.

This produces straight-line segments where possible, dramatically reducing the number of "staircase" waypoints on open terrain.

```javascript
// Disable smoothing if you need to follow exact grid cells
const pathfinder = new AStarPathfinder(grid, { smoothPath: false });
```

---

### Unreachable targets

When the target cell is blocked or surrounded, the pathfinder does two things:

1. **Blocked target cell**: runs a BFS outward from the target to find the nearest walkable cell, then paths to that cell instead.
2. **Fully surrounded / iteration cap reached**: returns the path to the closest cell reached during the search (lowest heuristic score), so the unit still moves toward the goal rather than stopping.

In both cases, `FindPath` always returns either a valid path or `[]` — it never throws or loops infinitely.

---

### Example: minimal setup

```javascript
// Any object satisfying the grid interface works:
class MyGrid {
    constructor(cols, rows) {
        this.width  = cols;
        this.height = rows;
        this.cells  = Array.from({ length: rows }, () => new Array(cols).fill(true));
    }
    IsInBounds(col, row) { return col >= 0 && col < this.width && row >= 0 && row < this.height; }
    IsWalkable(col, row) { return this.IsInBounds(col, row) && this.cells[row][col]; }
    WorldToGrid(pos)     { return { col: Math.floor(pos.x / 32), row: Math.floor(pos.y / 32) }; }
    GridToWorld(col, row){ return new Vector2((col + 0.5) * 32, (row + 0.5) * 32); }
}

const grid = new MyGrid(30, 20);
const pathfinder = new AStarPathfinder(grid);

// Find path between two world positions
const waypoints = pathfinder.FindPath(new Vector2(16, 16), new Vector2(944, 624));
```

---

### Performance notes

- Uses a **binary min-heap** internally — O(log n) push/pop for the open set.
- String keys (`"col,row"`) are used for the closed set and open map — fast for grids up to ~200×200.
- Typical times on modern hardware: **< 1 ms** for 32×32, **< 15 ms** for 128×128.
- For grids larger than ~200×200 with many dynamic obstacles, consider caching paths and only recalculating when the relevant area changes.

---

### See also

- [Interactive demo](../pathfinding.html ':ignore :target=_blank') — paint walls, move start/end markers, switch heuristics live
- [RTS example](../rts.html ':ignore :target=_blank') — production usage integrated with `GridMap` and unit movement
- [Examples](examples.md) — full list of demos
