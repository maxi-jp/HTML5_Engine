class Renderer {
    _width = 640;
    _height = 480;

    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = {
            imageSmoothingEnabled: true,
        };
        // config example:
        // {
        //     imageSmoothingEnabled: true, // enable/disable image smoothing on the canvas context
        // }
        Object.assign(this.config, config);
    }

    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }

    set width(value) {
        this.canvas.width = value;
    }
    set height(value) {
        this.canvas.height = value;
    }

    Clear() {}

    // Draw primitives
    DrawLine(x1, y1, x2, y2, color=Color.black, lineWidth = 1) {}
    DrawPolygon(points, strokeColor=Color.black, lineWidth=1, fill=false, fillColor=Color.black) {}
    DrawRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1, rot=0) {}
    DrawStrokeRectangle(x, y, w, h, color=Color.black, lineWidth=1, rot=0) {}
    DrawFillRectangle(x, y, w, h, color=Color.black, rot=0) {}
    DrawCircle(x, y, radius, color=Color.black, stroke=false, lineWidth=1) {}
    DrawFillCircle(x, y, radius, color=Color.black) {}
    DrawStrokeCircle(x, y, radius, color=Color.black, lineWidth=1) {}

    // Draw text
    DrawText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false) {}
    DrawFillText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {}
    DrawStrokeText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {}

    // Draw sprites
    DrawImage(img, x, y, scaleX, scaleY, rot=0) {}
    DrawImageBasic(img, x, y, w=img.width, h=img.height) {}
    DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0) {}
    DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY) {}

    // other Draw methods
    DrawGradientRectangle(x, y, w, h, gradient) { }
}

class Canvas2DRenderer extends Renderer {
    constructor(canvas, config) {
        super(canvas, config);
        this.ctx = canvas.getContext("2d");

        if (this.config.imageSmoothingEnabled !== undefined) {
            this.ctx.imageSmoothingEnabled = this.config.imageSmoothingEnabled;
        }
    }

    set width(value) {
        this.canvas.width = value;

        if (this.config.imageSmoothingEnabled !== undefined) {
            this.ctx.imageSmoothingEnabled = this.config.imageSmoothingEnabled;
        }
    }
    set height(value) {
        this.canvas.height = value;
        
        if (this.config.imageSmoothingEnabled !== undefined) {
            this.ctx.imageSmoothingEnabled = this.config.imageSmoothingEnabled;
        }
    }

    Clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    DrawLine(x1, y1, x2, y2, color=Color.black, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    DrawPolygon(points, strokeColor=Color.black, lineWidth=1, fill=false, fillColor=Color.black) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        if (fill) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    DrawRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1, rot=0) {
        if (stroke) {
            this.DrawStrokeRectangle(x, y, w, h, color, lineWidth, rot);
        }
        else {
            this.DrawFillRectangle(x, y, w, h, color, rot);
        }
    }
    
    DrawStrokeRectangle(x, y, w, h, color=Color.black, lineWidth=1, rot=0) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        if (rot !== 0) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rot);
            this.ctx.strokeRect(-w / 2, -h / 2, w, h);
            this.ctx.restore();
        }
        else {
            this.ctx.strokeRect(x, y, w, h);
        }
    }

    DrawFillRectangle(x, y, w, h, color=Color.black, rot=0) {
        this.ctx.fillStyle = color;
        if (rot !== 0) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rot);
            this.ctx.fillRect(-w / 2, -h / 2, w, h);
            this.ctx.restore();
        }
        else {
            this.ctx.fillRect(x, y, w, h);
        }
    }

    
    DrawCircle(x, y, radius, color=Color.black, stroke=false, lineWidth=1) {
        if (stroke) {
            this.DrawStrokeCircle(x, y, radius, color, lineWidth);
        }
        else {
            this.DrawFillCircle(x, y, radius, color);
        }
    }

    DrawFillCircle(x, y, radius, color=Color.black) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, PI2, false);
        this.ctx.fill();
        this.ctx.closePath();
    }

    DrawStrokeCircle(x, y, radius, color=Color.black, lineWidth=1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, PI2, false);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    DrawText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false) {
        if (stroke) {
            this.DrawStrokeText(text, x, y, font, color, align, baseline);
        }
        else {
            this.DrawFillText(text, x, y, font, color, align, baseline);
        }
    }

    DrawFillText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    DrawStrokeText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.strokeStyle = color;
        this.ctx.strokeText(text, x, y);
    }

    DrawImage(img, x, y, scaleX, scaleY, rot=0) {
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(rot);
        this.ctx.scale(scaleX, scaleY);

        this.ctx.drawImage(img, -img.halfWidth, -img.halfHeight);

        this.ctx.restore();
    }

    DrawImageBasic(img, x, y, w=img.width, h=img.height) {
        this.ctx.drawImage(img, x, y, w, h);
    }

    DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0) {
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(rot);
        this.ctx.scale(scaleX, scaleY);
        
        if (debugMode) {
            this.ctx.strokeStyle = "red";
            this.ctx.strokeRect(-sw/2, -sh/2, sw, sh);
        }

        this.ctx.drawImage(img, sx, sy, sw, sh, -sw/2, -sh/2, sw, sh);

        this.ctx.restore();
    }

    DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY) {
        this.ctx.drawImage(img, sx, sy, sw, sh, x, y, sw * scaleX, sh * scaleY);
    }

    DrawGradientRectangle(x, y, w, h, gradient) {
        this.ctx.fillStyle = gradient.gradient;
        this.ctx.fillRect(x, y, w, h);
    }
}

class WebGLRenderer extends Renderer {
    constructor(canvas, gl, config) {
        super(canvas, config);
        this.gl = gl;

        // auxiliar structure for circle vertices
        const numSegments = 64;
        this.circleVerts = [];
        for (let i = 0; i <= numSegments; i++) {
            this.circleVerts.push(0, 0);
        }

        // enable blending for pngs transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        this.basicRectShader = new BasicRectShader(this.gl);
        this.spriteShader = new SpriteShader(this.gl);
        this.gradientRectShader = new GradientRectShader(this.gl);
    }

    GetTexture(img) {
        // helper function to create and cache textures from images
        if (!img._webglTexture) {
            const gl = this.gl;
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // bowsers may use premultiplied alpha when uploading pngs
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            img._webglTexture = tex;
        }

        return img._webglTexture;
    }

    Clear() {
        this.gl.clearColor(0, 0, 0, 0); // TODO delete this after testing different pngs
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    DrawLine(x1, y1, x2, y2, color=Color.black, lineWidth=1) {
        const gl = this.gl;

        // buffer for the two points
        const vertices = new Float32Array([
            x1, y1,
            x2, y2
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
        
        this.basicRectShader.UseForCustomBuffer(gl, buffer);

        // Set viewport and clear if needed
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Set uniforms (no rotation/scale, just pass through)
        gl.uniform2f(this.basicRectShader.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.basicRectShader.translationLoc, 0, 0);
        gl.uniform1f(this.basicRectShader.rotationLoc, 0);
        gl.uniform2f(this.basicRectShader.sizeLoc, 1, 1);

        // Color
        gl.uniform4fv(this.basicRectShader.colorLoc, color.rgba);

        // Set line width (ignored on some platforms)
        gl.lineWidth(lineWidth);

        // Draw the line
        gl.drawArrays(gl.LINES, 0, 2);

        // Clean up
        gl.deleteBuffer(buffer);
    }

    DrawPolygon(points, strokeColor=Color.black, lineWidth=1, fill=false, fillColor=Color.black) {
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            this.DrawLine(p1[0], p1[1], p2[0], p2[1], strokeColor, lineWidth);
        }
    }

    DrawRectangle(x, y, w, h, color, stroke=false, lineWidth=1, rot=0) {
        if (stroke) {
            this.DrawStrokeRectangle(x, y, w, h, color, lineWidth, rot);
        } else {
            this.DrawFillRectangle(x, y, w, h, color, rot);
        }
    }

    DrawStrokeRectangle(x, y, w, h, color, lineWidth=1, rot=0) {
        if (rot === 0) {
            x += w/2;
            y += h/2;
        }

        // Rectangle corners centered at (x, y)
        const hw = w / 2, hh = h / 2;
        const corners = [
            [-hw, -hh],
            [ hw, -hh],
            [ hw,  hh],
            [-hw,  hh]
        ];
        // Apply rotation and translation
        const cosR = Math.cos(rot), sinR = Math.sin(rot);
        const points = corners.map(([cx, cy]) => [
            x + cx * cosR - cy * sinR,
            y + cx * sinR + cy * cosR
        ]);
        this.DrawPolygon(points, color, lineWidth);
    }

    DrawFillRectangle(x, y, w, h, color, rot=0) {
        const gl = this.gl;

        if (rot === 0) {
            x += w/2;
            y += h/2;
        }

        this.basicRectShader.Use(this.gl);
        
        // Set viewport and clear if needed
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Set uniforms
        gl.uniform2f(this.basicRectShader.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.basicRectShader.translationLoc, x, y);
        gl.uniform1f(this.basicRectShader.rotationLoc, rot);
        gl.uniform2f(this.basicRectShader.sizeLoc, w, h);

        // Color
        gl.uniform4fv(this.basicRectShader.colorLoc, color.rgba);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    DrawCircle(x, y, radius, color=Color.black, stroke=false, lineWidth=1) {
        if (stroke) {
            this.DrawStrokeCircle(x, y, radius, color, lineWidth);
        } else {
            this.DrawFillCircle(x, y, radius, color);
        }
    }

    DrawFillCircle(x, y, radius, color=Color.black) {
        const gl = this.gl;
        
        const numSegments = this.circleVerts.length / 2;
        for (let i = 0; i < this.circleVerts.length; i += 2) {
            const angle = (i / numSegments) * PI2;
            this.circleVerts[i] = x + Math.cos(angle) * radius;
            this.circleVerts[i + 1] = y + Math.sin(angle) * radius;
        }

        // insert center point into the circle vertices
        this.circleVerts.unshift(x, y);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.circleVerts), gl.STREAM_DRAW);

        // Use the shader with this custom buffer
        this.basicRectShader.UseForCustomBuffer(gl, buffer);

        // Set uniforms using the shader's locations
        gl.uniform2f(this.basicRectShader.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.basicRectShader.translationLoc, 0, 0);
        gl.uniform1f(this.basicRectShader.rotationLoc, 0);
        gl.uniform2f(this.basicRectShader.sizeLoc, 1, 1);
        gl.uniform4fv(this.basicRectShader.colorLoc, color.rgba);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments);

        gl.deleteBuffer(buffer);

        this.circleVerts.shift();
        this.circleVerts.shift(); // Remove the center point
    }

    DrawStrokeCircle(x, y, radius, color=Color.black, lineWidth=1) {
        const gl = this.gl;

        const numSegments = this.circleVerts.length / 2;
        for (let i = 0; i < this.circleVerts.length; i += 2) {
            const angle = (i / numSegments) * PI2;
            this.circleVerts[i] = x + Math.cos(angle) * radius;
            this.circleVerts[i + 1] = y + Math.sin(angle) * radius;
        }

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.circleVerts), gl.STREAM_DRAW);

        // Use the shader with this custom buffer
        this.basicRectShader.UseForCustomBuffer(gl, buffer);

        // Set uniforms using the shader's locations
        gl.uniform2f(this.basicRectShader.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.basicRectShader.translationLoc, 0, 0);
        gl.uniform1f(this.basicRectShader.rotationLoc, 0);
        gl.uniform2f(this.basicRectShader.sizeLoc, 1, 1);
        gl.uniform4fv(this.basicRectShader.colorLoc, color.rgba);

        gl.lineWidth(lineWidth); // May be ignored on most platforms
        gl.drawArrays(gl.LINE_STRIP, 0, numSegments);

        gl.deleteBuffer(buffer);
    }

    DrawText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false) {
        if (stroke) {
            this.DrawStrokeText(text, x, y, font, color, align, baseline);
        }
        else {
            this.DrawFillText(text, x, y, font, color, align, baseline);
        }
    }

    DrawFillText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {
        // TODO refactor this method
        // 1. Create an offscreen canvas
        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        // Measure text and resize canvas
        const metrics = ctx.measureText(text);
        const width = Math.ceil(metrics.width) + 8;

        // Extract font size in px from the font string
        let fontSize = 16; // fallback default
        const match = font.match(/(\d+)px/);
        if (match)
            fontSize = parseInt(match[1], 10);
        const height = Math.ceil(fontSize) + 8;

        textCanvas.width = width;
        textCanvas.height = height;

        // Redraw with correct size
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillStyle = color;
        ctx.clearRect(0, 0, width, height);

        // Calculate draw position based on alignment
        let drawX = width / 2;
        let drawY = height / 2;
        if (align === "left") drawX = 0;
        if (align === "right") drawX = width;
        if (baseline === "top") drawY = 0;
        if (baseline === "bottom") drawY = height;
        ctx.fillText(text, drawX, drawY);

        // 2. Upload as WebGL texture
        const gl = this.gl;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // 3. Draw as a textured quad using the SpriteShader
        this.spriteShader.Use(gl);
        gl.uniform2f(this.spriteShader.texResolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.spriteShader.texTranslationLoc, x, y);
        gl.uniform1f(this.spriteShader.texRotationLoc, 0);
        gl.uniform2f(this.spriteShader.texSizeLoc, width, height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(this.spriteShader.texSamplerLoc, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Optionally: delete the texture to avoid memory leaks
        gl.deleteTexture(tex);
    }

    DrawStrokeText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {
        // TODO
    }

    DrawImage(img, x, y, scaleX, scaleY, rot=0) {
        const gl = this.gl;
        this.spriteShader.Use(gl);
        
        // Set uniforms using the spriteShader's locations
        gl.uniform2f(this.spriteShader.texResolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.spriteShader.texTranslationLoc, x, y);
        gl.uniform1f(this.spriteShader.texRotationLoc, rot || 0);
        gl.uniform2f(this.spriteShader.texSizeLoc, scaleX * img.width, scaleY * img.height);

        // Bind texture
        const tex = this.GetTexture(img);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(this.spriteShader.texSamplerLoc, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawImageBasic(img, x, y, w=img.width, h=img.height) {
        this.DrawImage(img, x, y, w / img.width, h / img.height);
    }

    DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0) {
        const gl = this.gl;
        const shader = this.spriteShader;

        // Calculate normalized texture coordinates for the section
        const texLeft   = sx / img.width;
        const texTop    = sy / img.height;
        const texRight  = (sx + sw) / img.width;
        const texBottom = (sy + sh) / img.height;

        // Build texcoord buffer for the section (two triangles)
        const texcoords = new Float32Array([
            texLeft,  texTop,
            texRight, texTop,
            texLeft,  texBottom,
            texLeft,  texBottom,
            texRight, texTop,
            texRight, texBottom,
        ]);

        // Use the shader and set up position buffer
        shader.Use(gl);

        // Override the texcoord buffer for this draw
        gl.bindBuffer(gl.ARRAY_BUFFER, shader.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.DYNAMIC_DRAW);

        // Set uniforms
        gl.uniform2f(shader.texResolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(shader.texTranslationLoc, x, y);
        gl.uniform1f(shader.texRotationLoc, rot || 0);
        gl.uniform2f(shader.texSizeLoc, sw * scaleX, sh * scaleY);

        // Bind texture
        const tex = this.GetTexture(img);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(shader.texSamplerLoc, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Restore the default texcoords for future draws
        gl.bindBuffer(gl.ARRAY_BUFFER, shader.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shader.texcoords), gl.STATIC_DRAW);
    }

    DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY) {
        this.DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, 0);
    }
    
    DrawGradientRectangle(x, y, w, h, gradient) {
        // Only supports two color stops: top and bottom
        const gl = this.gl;
        const shader = this.gradientRectShader;

        // Center the rectangle at (x + w/2, y + h/2)
        shader.Use(gl);

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.uniform2f(shader.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(shader.translationLoc, x + w/2, y + h/2);
        gl.uniform1f(shader.rotationLoc, 0);
        gl.uniform2f(shader.sizeLoc, w, h);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gradient.webglTexture);
        gl.uniform1i(shader.gradientLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

// #region WebGL shader objects
class BasicRectShader {
    constructor(gl) {
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        this.quadVerts = [
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ];

        // Vertex shader (solid color)
        this.vsQuadSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform vec2 u_size;
            void main() {
                // Rotate
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    a_position.x * cosR - a_position.y * sinR,
                    a_position.x * sinR + a_position.y * cosR
                );
                // Scale and translate to screen
                vec2 pos = rotated * u_size + u_translation;
                // Convert to clipspace
                vec2 zeroToOne = pos / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            }
        `;

        // Fragment shader (solid color)
        this.fsSolidColorSource = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `;

        // Compile shaders and link program
        this.program = CreateProgram(gl, this.vsQuadSource, this.fsSolidColorSource);

        // Look up locations
        this.positionLoc = gl.getAttribLocation(this.program, "a_position");
        this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.translationLoc = gl.getUniformLocation(this.program, "u_translation");
        this.rotationLoc = gl.getUniformLocation(this.program, "u_rotation");
        this.sizeLoc = gl.getUniformLocation(this.program, "u_size");
        this.colorLoc = gl.getUniformLocation(this.program, "u_color");

        // Create a buffer for a unit rectangle centered at (0,0)
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.quadVerts), gl.STATIC_DRAW);
    }

    Use(gl) {
        gl.useProgram(this.program);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    UseForCustomBuffer(gl, buffer) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }
}

class SpriteShader {
    constructor(gl) {
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        this.quadVerts = [
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ];

        // Texture coordinates
        this.texcoords = [
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
        ];

        // Vertex shader for textured quad
        this.vsTextureSource = `
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform vec2 u_size;
            varying vec2 v_texcoord;
            void main() {
                // Rotate
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    a_position.x * cosR - a_position.y * sinR,
                    a_position.x * sinR + a_position.y * cosR
                );
                // Scale and translate to screen
                vec2 pos = rotated * u_size + u_translation;
                // Convert to clipspace
                vec2 zeroToOne = pos / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_texcoord = a_texcoord;
            }
        `;

        // Fragment shader for textured quad
        this.fsTextureSource = `
            precision mediump float;
            varying vec2 v_texcoord;
            uniform sampler2D u_texture;
            void main() {
                vec4 c = texture2D(u_texture, v_texcoord);
                gl_FragColor = c;
                // If alpha is very low, force RGB to black
                //if (c.a < 0.9) c.rgb = vec3(0.0);
                //gl_FragColor = vec4(c.rgb * c.a, 1.0 - c.a);
            }
        `;

        // Compile shaders and link program
        this.program = CreateProgram(gl, this.vsTextureSource, this.fsTextureSource);
        
        this.texPositionLoc = gl.getAttribLocation(this.program, "a_position");
        this.texTexcoordLoc = gl.getAttribLocation(this.program, "a_texcoord");
        this.texResolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.texTranslationLoc = gl.getUniformLocation(this.program, "u_translation");
        this.texRotationLoc = gl.getUniformLocation(this.program, "u_rotation");
        this.texSizeLoc = gl.getUniformLocation(this.program, "u_size");
        this.texSamplerLoc = gl.getUniformLocation(this.program, "u_texture");

        // Create a buffer for quad positions
        this.texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.quadVerts), gl.STATIC_DRAW);

        // Texture coordinates buffer
        this.texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoords), gl.STATIC_DRAW);
    }

    Use(gl) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.texPositionLoc);
        gl.vertexAttribPointer(this.texPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.enableVertexAttribArray(this.texTexcoordLoc);
        gl.vertexAttribPointer(this.texTexcoordLoc, 2, gl.FLOAT, false, 0, 0);
    }
}

class GradientRectShader {
    constructor(gl) {
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        this.quadVerts = [
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ];

        // Vertex shader: pass local position (0..1) for gradient
        this.vsSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform vec2 u_size;
            varying vec2 v_localPos;
            void main() {
                // Rotate
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    a_position.x * cosR - a_position.y * sinR,
                    a_position.x * sinR + a_position.y * cosR
                );
                // Scale and translate to screen
                vec2 pos = rotated * u_size + u_translation;
                // Convert to clipspace
                vec2 zeroToOne = pos / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

                // Pass local quad position (0..1) to fragment
                v_localPos = a_position * 0.5 + 0.5;
            }
        `;

        // Fragment shader: linear gradient following a 1D texture
        this.fsSource = `
            precision mediump float;
            varying vec2 v_localPos;
            uniform sampler2D u_gradient;
            void main() {
                gl_FragColor = texture2D(u_gradient, vec2(v_localPos.y, 0.0));
            }
        `;

        // Compile shaders and link program
        this.program = CreateProgram(gl, this.vsSource, this.fsSource);

        // Look up locations
        this.positionLoc = gl.getAttribLocation(this.program, "a_position");
        this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.translationLoc = gl.getUniformLocation(this.program, "u_translation");
        this.rotationLoc = gl.getUniformLocation(this.program, "u_rotation");
        this.sizeLoc = gl.getUniformLocation(this.program, "u_size");
        this.colorALoc = gl.getUniformLocation(this.program, "u_colorA");
        this.colorBLoc = gl.getUniformLocation(this.program, "u_colorB");

        // Create a buffer for a unit rectangle centered at (0,0)
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.quadVerts), gl.STATIC_DRAW);
    }

    // create or update a 1D gradient texture from color stops
    static CreateGradientTexture(gl, colorStops, size = 256) {
        // Create a 1D canvas and fill it with the gradient
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, size, 0);
        colorStops.forEach(cs => grad.addColorStop(cs.offset, cs.color.toString()));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, 1);

        // Upload as WebGL texture
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, ctx.getImageData(0, 0, size, 1).data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return tex;
    }

    Use(gl) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }
}

// #endregion

// #region WebGL helper functions

// Helper function to compile shaders and create the gl program
function CreateProgram(gl, vsSource, fsSource) {
    function compile(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
}

// #endregion