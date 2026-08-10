# Timers

The engine provides a frame-based timer system similar to Unity's `Invoke` and `InvokeRepeating`. Timers run in sync with your game loop, automatically pause when the game loses focus, and integrate seamlessly with GameObject lifecycle management.

Unlike raw JavaScript `setTimeout`/`setInterval`, engine timers:
- ✅ Run on **game time**, not wall-clock time
- ✅ Automatically **pause** when the browser tab loses focus
- ✅ Synchronize with the game loop (no timing drift)
- ✅ Auto-cancel when their owning GameObject is destroyed
- ✅ Never fire while the game is paused

All timers are managed centrally by the `Game` class with minimal overhead — a single update loop that only runs when timers are active.

---

## One-shot timers

### `Invoke(callback, delay)`

Executes a function once after a delay (in seconds).

**From Game class:**
```javascript
class MyGame extends Game {
    Start() {
        super.Start();
        
        // Execute after 3 seconds
        this.Invoke(() => {
            console.log('3 seconds have passed!');
        }, 3.0);
        
        // Spawn an enemy after 5 seconds
        this.Invoke(() => {
            this.SpawnEnemy();
        }, 5.0);
    }
}
```

**From GameObject:**
```javascript
class Bomb extends GameObject {
    Start() {
        // Explode after 2 seconds (auto-cancelled if bomb is destroyed)
        this.Invoke(() => {
            this.Explode();
        }, 2.0);
    }
    
    Explode() {
        // Create explosion effect, damage nearby enemies...
        game.Destroy(this);
    }
}
```

---

## Automatic context binding (Unity-style)

Just like Unity's `Invoke`, the engine **automatically binds callbacks to their owner**, so `this` always refers to the correct object. This means you can pass methods directly without worrying about context:

**From GameObject (automatic binding):**
```javascript
class Enemy extends GameObject {
    Start() {
        // ✅ These all work! No .bind() or arrow functions needed
        this.Invoke(this.Attack, 2.0);
        this.InvokeRepeating(this.Patrol, 0, 1.5);
    }
    
    Attack() {
        // "this" correctly refers to the Enemy instance
        this.health -= 10;
    }
    
    Patrol() {
        // "this" still refers to the Enemy
        this.position.x += 10;
    }
}
```

**From non-GameObject classes:**

If you're not in a GameObject, pass the owner as the third parameter to `game.Invoke()`:

```javascript
class MainMenu {
    ShowMessage() {
        // Pass "this" as the third parameter for automatic binding
        game.Invoke(this.HideMessage, 3.0, this);
    }
    
    HideMessage() {
        // "this" correctly refers to the MainMenu instance
        this.elements[".message"].classList.add("hidden");
    }
}
```

**Why this works:**

When you call `this.Invoke(this.method, delay)` from a GameObject, it internally calls `game.Invoke(callback, delay, this)`, passing the GameObject as the owner. The engine then binds the callback to the owner automatically, preserving the correct `this` context.

**You can still use arrow functions if you prefer:**
```javascript
this.Invoke(() => this.Attack(), 2.0);  // Also works!
```

---

## Repeating timers

### `InvokeRepeating(callback, delay, interval)`

Executes a function repeatedly at a fixed interval.

| Parameter | Type | Description |
|---|---|---|
| `callback` | `Function` | The function to execute |
| `delay` | `number` | Initial delay in seconds before first execution |
| `interval` | `number` | Interval in seconds between repetitions |

**From Game class:**
```javascript
class MyGame extends Game {
    Start() {
        super.Start();
        
        // Spawn an enemy every 2 seconds, starting after 5 seconds
        this.spawnerTimer = this.InvokeRepeating(() => {
            this.SpawnEnemy();
        }, 5.0, 2.0);
    }
}
```

**From GameObject:**
```javascript
class Turret extends GameObject {
    Start() {
        // Fire bullet every 0.5 seconds, starting immediately
        this.fireTimer = this.InvokeRepeating(() => {
            this.FireBullet();
        }, 0, 0.5);
    }
}
```

---

## Cancelling timers

### `CancelInvoke(timer)`

Stops a specific timer. Both `Invoke()` and `InvokeRepeating()` return a `Timer` instance that you can cancel later.

```javascript
class MyGame extends Game {
    Start() {
        super.Start();
        
        let count = 0;
        this.spawnerTimer = this.InvokeRepeating(() => {
            this.SpawnEnemy();
            count++;
            
            // Stop spawning after 10 enemies
            if (count >= 10) {
                this.CancelInvoke(this.spawnerTimer);
            }
        }, 2.0, 2.0);
    }
}
```

### `CancelAllInvokes()`

When called from a GameObject, cancels all timers owned by that object:

```javascript
class Boss extends GameObject {
    Start() {
        this.InvokeRepeating(() => this.Attack1(), 0, 3.0);
        this.InvokeRepeating(() => this.Attack2(), 1.5, 3.0);
        this.InvokeRepeating(() => this.SpawnMinion(), 5.0, 5.0);
    }
    
    Die() {
        // Stop all attack patterns
        this.CancelAllInvokes();
        
        // Play death animation...
        game.Destroy(this);
    }
}
```

> **Note:** When a GameObject is destroyed via `game.Destroy(gameObject)`, the engine automatically calls `CancelAllInvokes()` for you, so you don't need to manually cancel timers in most destruction scenarios.

---

## Timer ownership and automatic cleanup

Timers created from a GameObject (via `this.Invoke()` or `this.InvokeRepeating()`) are automatically **owned** by that object. When the GameObject is destroyed, all its timers are cancelled automatically:

```javascript
class Grenade extends GameObject {
    constructor(position) {
        super(position);
        
        // This timer will auto-cancel if the grenade is destroyed early
        // (e.g., shot by player before it explodes)
        this.Invoke(() => {
            this.Explode();
        }, 3.0);
    }
    
    TakeDamage() {
        game.Destroy(this);  // Timers cancelled automatically
    }
}
```

**Game-level timers** (created with `game.Invoke()`) have no owner and run until completion or manual cancellation. Use these for game-wide events that should persist regardless of individual GameObject lifetimes:

```javascript
class MyGame extends Game {
    Start() {
        super.Start();
        
        // Global timer — not tied to any specific object
        this.Invoke(() => {
            this.ShowVictoryScreen();
        }, 60.0); // Victory after 60 seconds
    }
}
```

---

## Common patterns

### Delayed destruction
```javascript
// Destroy object after 5 seconds
this.Invoke(() => {
    game.Destroy(this);
}, 5.0);
```

### Flashing effect
```javascript
class Enemy extends GameObject {
    TakeDamage() {
        this.health -= 10;
        
        // Flash red briefly
        this.color = Color.red;
        this.Invoke(() => {
            this.color = Color.white;
        }, 0.1);
    }
}
```

### Cooldown system
```javascript
class Player extends GameObject {
    constructor(position) {
        super(position);
        this.canShoot = true;
    }
    
    Update(deltaTime) {
        if (Input.GetActionDown('Fire') && this.canShoot) {
            this.Shoot();
            this.canShoot = false;
            
            // Re-enable shooting after 0.5 seconds
            this.Invoke(() => {
                this.canShoot = true;
            }, 0.5);
        }
    }
}
```

### Wave-based enemy spawning
```javascript
class MyGame extends Game {
    Start() {
        super.Start();
        this.wave = 1;
        this.StartWave();
    }
    
    StartWave() {
        const enemyCount = 5 + this.wave * 2;
        
        // Spawn enemies one by one
        let spawned = 0;
        this.waveTimer = this.InvokeRepeating(() => {
            this.SpawnEnemy();
            spawned++;
            
            if (spawned >= enemyCount) {
                this.CancelInvoke(this.waveTimer);
                
                // Start next wave after 10 seconds
                this.Invoke(() => {
                    this.wave++;
                    this.StartWave();
                }, 10.0);
            }
        }, 0, 1.0);
    }
}
```

### Temporary power-up
```javascript
class Player extends GameObject {
    ActivatePowerUp() {
        this.speed *= 2;
        this.invincible = true;
        
        // Remove after 5 seconds
        this.Invoke(() => {
            this.speed /= 2;
            this.invincible = false;
        }, 5.0);
    }
}
```

---

## Performance notes

The timer system is highly optimized:
- **Minimal overhead**: Single update loop processes all timers in one pass
- **Zero cost when idle**: If no timers are active, overhead is ~1 nanosecond (array length check)
- **Efficient removal**: Completed/cancelled timers are removed immediately using reverse iteration
- **No GC pressure**: Timer objects are small and short-lived

With hundreds of active timers, the update cost is typically < 0.1ms per frame on modern hardware.

---

## Comparison with JavaScript timers

| Feature | Engine Timers | `setTimeout`/`setInterval` |
|---|---|---|
| **Game time sync** | ✅ Pauses with game | ❌ Runs on wall-clock time |
| **Tab backgrounding** | ✅ Maintains accuracy | ❌ Throttled by browser |
| **GameObject cleanup** | ✅ Auto-cancelled on destroy | ❌ Must manually track |
| **Frame-perfect timing** | ✅ Synced to game loop | ❌ Runs independently |
| **Pause/resume game** | ✅ Pauses automatically | ❌ Keeps running |

**Use engine timers** for any game logic. Use JavaScript timers only for non-game DOM interactions (e.g., showing/hiding UI elements unrelated to gameplay).

---

## API reference

### Game methods

| Method | Description |
|---|---|
| `Invoke(callback, delay)` | Execute callback once after delay (seconds) |
| `InvokeRepeating(callback, delay, interval)` | Execute callback repeatedly at interval |
| `CancelInvoke(timer)` | Cancel a specific timer |
| `CancelAllInvokes(owner)` | Cancel all timers owned by a GameObject |

### GameObject methods

| Method | Description |
|---|---|
| `Invoke(callback, delay)` | Execute callback once (auto-owned by this object) |
| `InvokeRepeating(callback, delay, interval)` | Execute callback repeatedly (auto-owned) |
| `CancelInvoke(timer)` | Cancel a specific timer |
| `CancelAllInvokes()` | Cancel all timers owned by this object |

### Timer object

The `Timer` class is used internally. You typically don't need to interact with it directly, but it's available if needed:

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Unique timer ID |
| `callback` | `Function` | Function to execute |
| `delay` | `number` | Delay/interval in seconds |
| `elapsed` | `number` | Time elapsed since last execution |
| `repeating` | `boolean` | Whether this timer repeats |
| `owner` | `GameObject \| null` | GameObject that owns this timer |
| `active` | `boolean` | Whether timer is active |

| Method | Description |
|---|---|
| `Cancel()` | Manually cancel this timer |

---

## See also

- [Core Concepts](core-concepts.md) — Game loop and GameObject lifecycle
- [Examples](examples.md) — See timers in action in the example games
