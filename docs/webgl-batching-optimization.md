# WebGL Tile Rendering Optimization Guide

## Problem Analysis

### Current Performance Issue

The WebGL renderer currently makes one `gl.drawArrays()` call **per tile**, causing severe performance degradation for large tilemaps:

- **Forest map (small)**: 60 FPS ✅
- **Beach/RPG map (large)**: Drops to 30 FPS ❌

### Root Cause

In `Tileset.Draw()`:
```javascript
this.tilesetMap.forEach((row, rowIndex) => {
    row.forEach((tileId, colIndex) => {
        // Called for EVERY tile
        renderer.DrawImageSectionBasic(tileConfig.image, drawX, drawY, ...);
    });
});
```

For a 100×100 tile map, this results in **10,000 draw calls per frame** — catastrophic for WebGL performance.

Each `DrawImageSection()` call performs:
1. `gl.bufferData()` — Upload 6 vertices + 6 texcoords
2. Set uniforms (position, rotation, scale, alpha)
3. `gl.drawArrays(gl.TRIANGLES, 0, 6)` — Draw 2 triangles

### Why Canvas 2D Works Better

Canvas 2D's `drawImage()` is highly optimized by browser vendors for this exact use case (drawing many sections of the same image). WebGL requires manual batching to achieve similar performance.

---

## Solution 1: Tileset-Specific Batching (Quick Fix)

### Approach

Modify `Tileset` class to build one large vertex/texcoord buffer containing **all tiles**, then draw them in a single `gl.drawArrays()` call.

### Implementation

#### Step 1: Add Batched Draw Method to WebGLRenderer

Add to `src/engine/renderer.js` (WebGLRenderer class):

```javascript
/**
 * Draw multiple sprites from the same texture in a single batched call.
 * @param {HTMLImageElement} img - The shared texture atlas
 * @param {Float32Array} vertices - Interleaved: [x, y, u, v, x, y, u, v, ...]
 * @param {number} count - Number of vertices (must be multiple of 6)
 * @param {number} alpha - Global alpha for all sprites
 */
DrawBatchedSprites(img, vertices, count, alpha = 1.0) {
    if (count === 0) return;
    
    const gl = this.gl;
    const shader = this.spriteShader;
    
    shader.Use(gl);
    
    // Create or update batch buffer
    if (!this._batchBuffer) {
        this._batchBuffer = gl.createBuffer();
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this._batchBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
    
    // Setup vertex attributes (position + texcoord interleaved)
    const stride = 4 * 4; // 4 floats per vertex: x, y, u, v
    gl.vertexAttribPointer(shader.positionLoc, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(shader.texcoordLoc, 2, gl.FLOAT, false, stride, 2 * 4);
    
    // Set uniforms for identity transform (tiles are already in world space)
    gl.uniform2f(shader.resolutionLoc, this.canvas.width, this.canvas.height);
    gl.uniform2f(shader.translationLoc, 0, 0);
    gl.uniform1f(shader.rotationLoc, 0);
    gl.uniform2f(shader.sizeLoc, 1, 1);
    gl.uniform2f(shader.pivotLoc, 0, 0);
    gl.uniform1f(shader.alphaLoc, alpha);
    gl.uniformMatrix3fv(shader.viewMatrixLoc, false, this.viewMatrix);
    
    // Bind texture
    shader.BindTexture(gl, this.GetTexture(img));
    
    // Single draw call for all tiles
    gl.drawArrays(gl.TRIANGLES, 0, count);
    
    // Restore default position buffer for non-batched draws
    gl.bindBuffer(gl.ARRAY_BUFFER, shader.positionBuffer);
    gl.vertexAttribPointer(shader.positionLoc, 2, gl.FLOAT, false, 0, 0);
}
```

#### Step 2: Modify Tileset to Build Batch

Replace `Tileset.Draw()` in `src/engine/gameobjects.js`:

```javascript
Draw(renderer) {
    // Use batched rendering for WebGL, fallback to per-tile for Canvas2D
    if (renderer.DrawBatchedSprites) {
        this._DrawBatchedWebGL(renderer);
    } else {
        this._DrawPerTile(renderer);
    }
}

_DrawBatchedWebGL(renderer) {
    // Build batch buffer if not exists or map changed
    if (!this._batchVertices || this._batchDirty) {
        this._buildBatchBuffer();
        this._batchDirty = false;
    }
    
    if (this._batchCount === 0) return;
    
    // Single draw call for entire tileset
    renderer.DrawBatchedSprites(
        this.sprite.img,
        this._batchVertices,
        this._batchCount,
        this.sprite.alpha
    );
}

_buildBatchBuffer() {
    const scaleX = this.sprite.scale.x;
    const scaleY = this.sprite.scale.y;
    const basePosX = this.position.x;
    const basePosY = this.position.y;
    
    // Count non-empty tiles
    let tileCount = 0;
    this.tilesetMap.forEach(row => {
        row.forEach(tileId => {
            if (tileId && this.tilesetConfig[tileId]) tileCount++;
        });
    });
    
    // Allocate buffer: 6 vertices per tile, 4 floats per vertex (x, y, u, v)
    const vertexCount = tileCount * 6;
    this._batchVertices = new Float32Array(vertexCount * 4);
    this._batchCount = vertexCount;
    
    let bufferIndex = 0;
    
    this.tilesetMap.forEach((row, rowIndex) => {
        row.forEach((tileId, colIndex) => {
            if (!tileId) return;
            
            const tileConfig = this.tilesetConfig[tileId];
            if (!tileConfig) return;
            
            const sourceRect = tileConfig.rect;
            const img = tileConfig.image;
            
            // Calculate tile position (top-left corner)
            const x = basePosX + (colIndex * this.tileWidth * scaleX);
            const y = basePosY + (rowIndex * this.tileHeight * scaleY);
            const w = sourceRect.w * scaleX;
            const h = sourceRect.h * scaleY;
            
            // Texture coordinates (normalized 0-1)
            const u0 = sourceRect.x / img.width;
            const v0 = sourceRect.y / img.height;
            const u1 = (sourceRect.x + sourceRect.w) / img.width;
            const v1 = (sourceRect.y + sourceRect.h) / img.height;
            
            // Two triangles (6 vertices) for this tile
            // Triangle 1: top-left, top-right, bottom-left
            this._batchVertices[bufferIndex++] = x;     // x
            this._batchVertices[bufferIndex++] = y;     // y
            this._batchVertices[bufferIndex++] = u0;    // u
            this._batchVertices[bufferIndex++] = v0;    // v
            
            this._batchVertices[bufferIndex++] = x + w;
            this._batchVertices[bufferIndex++] = y;
            this._batchVertices[bufferIndex++] = u1;
            this._batchVertices[bufferIndex++] = v0;
            
            this._batchVertices[bufferIndex++] = x;
            this._batchVertices[bufferIndex++] = y + h;
            this._batchVertices[bufferIndex++] = u0;
            this._batchVertices[bufferIndex++] = v1;
            
            // Triangle 2: bottom-left, top-right, bottom-right
            this._batchVertices[bufferIndex++] = x;
            this._batchVertices[bufferIndex++] = y + h;
            this._batchVertices[bufferIndex++] = u0;
            this._batchVertices[bufferIndex++] = v1;
            
            this._batchVertices[bufferIndex++] = x + w;
            this._batchVertices[bufferIndex++] = y;
            this._batchVertices[bufferIndex++] = u1;
            this._batchVertices[bufferIndex++] = v0;
            
            this._batchVertices[bufferIndex++] = x + w;
            this._batchVertices[bufferIndex++] = y + h;
            this._batchVertices[bufferIndex++] = u1;
            this._batchVertices[bufferIndex++] = v1;
        });
    });
}

_DrawPerTile(renderer) {
    // Original per-tile drawing (Canvas2D or fallback)
    const basePosX = this.position.x;
    const basePosY = this.position.y;
    const scaleX = this.sprite.scale.x;
    const scaleY = this.sprite.scale.y;

    this.tilesetMap.forEach((row, rowIndex) => {
        row.forEach((tileId, colIndex) => {
            if (!tileId) return;
            
            const tileConfig = this.tilesetConfig[tileId];
            if (!tileConfig) return;
            
            const sourceRect = tileConfig.rect;
            const drawX = basePosX + (colIndex * this.tileWidth * scaleX);
            const drawY = basePosY + (rowIndex * this.tileHeight * scaleY);
            
            renderer.DrawImageSectionBasic(
                tileConfig.image,
                drawX, drawY,
                sourceRect.x, sourceRect.y,
                sourceRect.w, sourceRect.h,
                scaleX, scaleY,
                this.sprite.alpha
            );
        });
    });
}
```

### Benefits

- **10,000 draw calls → 1 draw call** per tileset layer
- Expected performance: **30 FPS → 60 FPS** on beach/RPG map
- Canvas2D performance unchanged (still uses optimized per-tile path)
- Minimal code changes

### Limitations

- Only batches tiles from the same texture (multiple tilesets still require multiple draw calls)
- Batch buffer must be rebuilt if map changes dynamically
- No per-tile rotation or complex transforms

---

## Solution 2: Universal SpriteBatch Class (Complete Solution)

### Overview

A general-purpose batching system that can batch **any** sprites from the same texture, not just tiles.

### Architecture

```javascript
class SpriteBatch {
    constructor(gl, maxSprites = 10000);
    Begin();                          // Start a new batch
    Draw(texture, x, y, w, h, ...);  // Add sprite to batch
    Flush();                          // Submit batch to GPU
    End();                            // Flush and cleanup
}
```

### Key Features

- **Automatic flushing** when texture changes or batch is full
- **Vertex buffer reuse** — allocate once, reuse every frame
- **Sorting support** — depth-sort sprites before drawing
- **Per-sprite alpha and color tinting**

### Implementation Outline

This is a more complex solution requiring:

1. Create `src/engine/spritebatch.js`
2. Modify all rendering code to use batch Begin/End
3. Handle texture switching automatically
4. Implement depth sorting for layered rendering

**Estimated implementation time**: 4-8 hours  
**Benefits**: Universal batching for all sprite drawing, not just tiles

---

## Recommendation

**Start with Solution 1** (Tileset-specific batching):
- Quick to implement (1-2 hours)
- Solves the immediate performance problem
- Maintains backward compatibility with Canvas2D

**Consider Solution 2** for future roadmap:
- Benefits all sprite-heavy games
- Industry-standard approach
- Required for advanced features (particle batching, UI batching, etc.)

---

## Testing

After implementing Solution 1, test with:

```javascript
// In tileset.html, add performance monitoring
let frameCount = 0;
let lastTime = performance.now();

function checkFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = now;
    }
    requestAnimationFrame(checkFPS);
}
checkFPS();
```

**Expected results**:
- Canvas2D: 60 FPS (unchanged)
- WebGL before: ~30 FPS on large map
- WebGL after: ~60 FPS on large map

---

## Additional Optimizations

Once batching is working, consider:

1. **Frustum culling** — Don't batch tiles outside camera view
2. **Dirty regions** — Only rebuild batch buffer when map changes
3. **Texture atlasing** — Combine multiple tilesets into one texture
4. **Instanced rendering** — Use `drawArraysInstanced()` for identical tiles

---

## See Also

- [WebGL Fundamentals - Drawing Multiple Things](https://webglfundamentals.org/webgl/lessons/webgl-drawing-multiple-things.html)
- [SpriteBatch implementation examples](https://github.com/mattdesl/gl-sprite-batch)
