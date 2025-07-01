class Renderer {
    _width = 640;
    _height = 480;
    _imageSmoothingEnabled = true;

    constructor(canvas) {
        this.canvas = canvas;
    }

    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get imageSmoothingEnabled() {
        return this._imageSmoothingEnabled;
    }

    set width(value) {
        this.canvas.width = value;
    }
    set height(value) {
        this.canvas.height = value;
    }
    set imageSmoothingEnabled(value) {
        this._imageSmoothingEnabled = value;
    }

    Clear() {}

    // Draw primitives
    DrawLine(x1, y1, x2, y2, color=Color.black, lineWidth = 1) {}
    DrawPolygon(points, strokeColor=Color.black, lineWidth=1, fill=false, fillColor=Color.black) {}
    DrawRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1, rot=0, pivot=coord) {}
    DrawStrokeRectangle(x, y, w, h, color=Color.black, lineWidth=1, rot=0, pivot=coord) {}
    DrawFillRectangle(x, y, w, h, color=Color.black, rot=0, pivot=coord) {}
    DrawBasicRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1) {}
    DrawStrokeBasicRectangle(x, y, w, h, color=Color.black, lineWidth=1) {}
    DrawFillBasicRectangle(x, y, w, h, color=Color.black) {}
    DrawCircle(x, y, radius, color=Color.black, stroke=false, lineWidth=1) {}
    DrawFillCircle(x, y, radius, color=Color.black) {}
    DrawStrokeCircle(x, y, radius, color=Color.black, lineWidth=1) {}

    // Draw text
    DrawText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false, lineWidth=1) {}
    DrawFillText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {}
    DrawStrokeText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {}

    // Draw sprites
    DrawImage(img, x, y, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0) {}
    DrawImageBasic(img, x, y, w=img.width, h=img.height, alpha=1.0) {}
    DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0) {}
    DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY, alpha=1.0) {}

    // other Draw methods
    DrawGradientRectangle(x, y, w, h, gradient) { }

    // Camera transform methods
    ApplyCameraTransform(camera) {}
    RestoreCameraTransform() {}
}

// #region Canvas2DRenderer class

class Canvas2DRenderer extends Renderer {
    constructor(canvas, config) {
        super(canvas, config);
        this.ctx = canvas.getContext("2d");
    }

    set width(value) {
        this.canvas.width = value;
        this.ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    }
    set height(value) {
        this.canvas.height = value;
        this.ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    }

    set imageSmoothingEnabled(value) {
        this._imageSmoothingEnabled = value;
        this.ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
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

    DrawRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1, rot=0, pivot=coord) {
        if (stroke) {
            this.DrawStrokeRectangle(x, y, w, h, color, lineWidth, rot, pivot);
        }
        else {
            this.DrawFillRectangle(x, y, w, h, color, rot, pivot);
        }
    }
    
    DrawStrokeRectangle(x, y, w, h, color=Color.black, lineWidth=1, rot=0, pivot=coord) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        if (rot !== 0) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rot);
            this.ctx.strokeRect(-w / 2 - pivot.x, -h / 2 - pivot.y, w, h);
            this.ctx.restore();
        }
        else {
            this.ctx.strokeRect(x - pivot.x - w / 2, y - pivot.y - h / 2, w, h);
        }
    }

    DrawFillRectangle(x, y, w, h, color=Color.black, rot=0, pivot=coord) {
        this.ctx.fillStyle = color;
        if (rot !== 0) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rot);
            this.ctx.fillRect(-w / 2 - pivot.x, -h / 2 - pivot.y, w, h);
            this.ctx.restore();
        }
        else {
            this.ctx.fillRect(x - pivot.x - w / 2, y - pivot.y - h / 2, w, h);
        }
    }

    DrawBasicRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1) {
        if (stroke) {
            this.DrawStrokeBasicRectangle(x, y, w, h, color, lineWidth);
        }
        else {
            this.DrawFillBasicRectangle(x, y, w, h, color);
        }
    }

    DrawStrokeBasicRectangle(x, y, w, h, color=Color.black, lineWidth=1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, w, h);
    }

    DrawFillBasicRectangle(x, y, w, h, color=Color.black) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
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

    DrawText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false, lineWidth=1) {
        if (stroke) {
            this.DrawStrokeText(text, x, y, font, color, align, baseline, lineWidth);
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

    DrawStrokeText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", lineWidth=1) {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeText(text, x, y);
    }

    DrawImage(img, x, y, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0) {
        this.ctx.globalAlpha = alpha;
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(rot);
        this.ctx.scale(scaleX, scaleY);

        this.ctx.drawImage(img, -img.halfWidth - pivot.x, -img.halfHeight - pivot.y);

        this.ctx.restore();
        this.ctx.globalAlpha = 1.0;
    }

    DrawImageBasic(img, x, y, w=img.width, h=img.height, alpha=1.0) {
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(img, x, y, w, h);
        this.ctx.globalAlpha = 1.0;
    }

    DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0) {
        this.ctx.save();
        
        this.ctx.translate(x, y);
        this.ctx.rotate(rot);
        this.ctx.scale(scaleX, scaleY);
        
        if (debugMode) {
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(-sw/2 - pivot.x, -sh/2 - pivot.y, sw, sh);
        }

        this.ctx.globalAlpha = alpha;

        this.ctx.drawImage(img, sx, sy, sw, sh, -sw/2 - pivot.x, -sh/2 - pivot.y, sw, sh);

        this.ctx.globalAlpha = 1.0;
        
        this.ctx.restore();
    }

    DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY, alpha=1.0) {
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(img, sx, sy, sw, sh, x, y, sw * scaleX, sh * scaleY);
        this.ctx.globalAlpha = 1.0;
    }

    DrawGradientRectangle(x, y, w, h, gradient) {
        gradient.UpdateSize(x, y, w, h);
        this.ctx.fillStyle = gradient.gradient;
        this.ctx.fillRect(x, y, w, h);
    }

    ApplyCameraTransform(camera) {
        this.ctx.save();
        this.ctx.translate(-camera.x, -camera.y);
        // TODO: handle rotation and scale
    }

    RestoreCameraTransform() {
        this.ctx.restore();
    }
}

// #endregion

// #region WebGLRenderer class

class WebGLRenderer extends Renderer {
    constructor(canvas, gl, config) {
        super(canvas, config);
        this.gl = gl;

        this.viewMatrix = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1  // -camera.x, -camera.y, 1
        ]);

        // auxiliar line vertices and buffer
        this.lineVertices = new Float32Array(4);
        this.lineBuffer = gl.createBuffer();

        // auxiliar polygon buffer
        this.polygonBuffer = gl.createBuffer();

        // auxiliar rectangle vertices
        this.auxRectVertices = [
            { x: -1, y: -1},
            { x:  1, y: -1},
            { x:  1, y:  1},
            { x: -1, y:  1}
        ];

        // auxiliar texcoord buffer for drawin a texture section (two triangles) (used in DrawImageSection)
        this.auxTexcoords = new Float32Array([
            0.0, 0,0,
            0.0, 0,0,
            0.0, 0,0,
            0.0, 0,0,
            0.0, 0,0,
            0.0, 0,0,
        ]);

        // auxiliar structure for circle vertices
        this.circleNumSegments = 64;
        this.circleVerts = new Float32Array(this.circleNumSegments * 2);
        this.circleBuffer = gl.createBuffer();

        // axuliar canvas for measure text
        this.textCanvas = document.createElement('canvas');
        this.textCanvasCtx = this.textCanvas.getContext('2d');

        // auxiliar texture for rendering text from the auxiliar canvas (very ineficient)
        this.textTexture = this.CreateTextTexture();

        // enable blending for pngs transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Shaders
        this.basicRectShader = new BasicRectShader(this.gl);
        this.spriteShader = new SpriteShader(this.gl);
        this.gradientRectShader = new GradientRectShader(this.gl);
        
        // Setup shaders to bind buffers and enable vertex attributes
        this.basicRectShader.Setup(this.gl);
        this.spriteShader.Setup(this.gl);
        this.gradientRectShader.Setup(this.gl);

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0); // TODO delete this after testing different pngs
    }

    set width(value) {
        this.canvas.width = value;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    set height(value) {
        this.canvas.height = value;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    GetTexture(img) {
        // helper function to create and cache textures from images
        if (!img._webglTexture) {
            const gl = this.gl;
            const tex = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, tex);
            //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // bowsers may use premultiplied alpha when uploading pngs
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); // Do not assume the source is premultiplied
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE); // Use the image's colorspace as is
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._imageSmoothingEnabled ? gl.LINEAR : gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._imageSmoothingEnabled ? gl.LINEAR : gl.NEAREST);

            img._webglTexture = tex;
        }

        return img._webglTexture;
    }

    CreateTextTexture() {
        const gl = this.gl;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.bindTexture(gl.TEXTURE_2D, null); // Unbind after setting params

        return texture;
    }

    PrepareText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false, lineWidth=1) {
        const textCanvas = this.textCanvas;
        const ctx = this.textCanvasCtx;

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
        ctx.clearRect(0, 0, width, height);

        // Calculate draw position based on alignment
        let drawX = width / 2;
        let drawY = height / 2;
        let tx = x, ty = y;
        if (align === "left") {
            tx += drawX;
            drawX = 0;
        }
        if (align === "right") {
            tx -= drawX;
            drawX = width;
        }
        if (baseline === "top") {
            ty += drawY;
            drawY = 0;
        }
        if (baseline === "bottom") {
            ty -= drawY;
            drawY = height;
        }

        if (stroke) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.strokeText(text, drawX, drawY);
        }
        else {
            ctx.fillStyle = color;
            ctx.fillText(text, drawX, drawY);
        }

        return { width, height, x: tx, y: ty };
    }

    Clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    DrawLine(x1, y1, x2, y2, color=Color.black, lineWidth=1) {
        const gl = this.gl;

        // update buffer for the two points
        this.lineVertices.set([x1, y1, x2, y2]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.lineVertices, gl.STREAM_DRAW);
        
        // gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.lineVertices);
        this.basicRectShader.UseForCustomBuffer(gl, this.lineBuffer);

        // // Set uniforms (no rotation/scale, just pass through)
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, 0, 0, 0, 1, 1, 0, 0, color.rgba);

        // // Set line width (ignored on some platforms)
        gl.lineWidth(lineWidth);

        // // Draw the line
        gl.drawArrays(gl.LINES, 0, 2);
    }

    DrawPolygon(points, strokeColor=Color.black, lineWidth=1, fill=false, fillColor=Color.black) {
        // for (let i = 0; i < points.length; i++) {
        //     const p1 = points[i];
        //     const p2 = points[(i + 1) % points.length];
        //     this.DrawLine(p1.x, p1.y, p2.x, p2.y, strokeColor, lineWidth);
        // }

        const gl = this.gl;

        // Convert points to a flat Float32Array
        const vertices = new Float32Array(points.flatMap(p => [p.x, p.y]));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.polygonBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);

        this.basicRectShader.UseForCustomBuffer(gl, this.polygonBuffer);

        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, 0, 0, 0, 1, 1, 0, 0, strokeColor.rgba);

        // Fill polygon if requested
        if (fill && points.length >= 3) {
            gl.uniform4fv(this.basicRectShader.colorLoc, fillColor.rgba);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length);
        }

        // Draw stroke
        if (points.length >= 2) {
            gl.uniform4fv(this.basicRectShader.colorLoc, strokeColor.rgba);
            gl.lineWidth(lineWidth);
            gl.drawArrays(gl.LINE_LOOP, 0, points.length);
        }
    }

    DrawRectangle(x, y, w, h, color, stroke=false, lineWidth=1, rot=0, pivot=coord) {
        if (stroke) {
            this.DrawStrokeRectangle(x, y, w, h, color, lineWidth, rot, pivot);
        } else {
            this.DrawFillRectangle(x, y, w, h, color, rot, pivot);
        }
    }

    DrawStrokeRectangle(x, y, w, h, color, lineWidth=1, rot=0, pivot=coord) {
        const gl = this.gl;

        this.basicRectShader.UseForCustomBuffer(gl, this.basicRectShader.outlineBuffer);

        // Set uniforms
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, rot, w, h, pivot.x, pivot.y, color.rgba);

        // Set line width (may be ignored on some platforms)
        gl.lineWidth(lineWidth);

        // Draw the outline (5 points, LINE_STRIP)
        gl.drawArrays(gl.LINE_STRIP, 0, 5);
    }

    DrawFillRectangle(x, y, w, h, color, rot=0, pivot=coord) {
        const gl = this.gl;

        this.basicRectShader.Use(gl);

        // Set uniforms
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, rot, w, h, pivot.x, pivot.y, color.rgba);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawBasicRectangle(x, y, w, h, color=Color.black, stroke=false, lineWidth=1) {
        if (stroke) {
            this.DrawStrokeBasicRectangle(x, y, w, h, color, lineWidth);
        }
        else {
            this.DrawFillBasicRectangle(x, y, w, h, color);
        }
    }

    DrawStrokeBasicRectangle(x, y, w, h, color=Color.black, lineWidth=1) {
        const gl = this.gl;

        this.basicRectShader.UseForCustomBuffer(gl, this.basicRectShader.outlineBuffer);

        // Set uniforms
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, 0, w, h, -w/2, -h/2, color.rgba);

        // Set line width (may be ignored on some platforms)
        gl.lineWidth(lineWidth);

        // Draw the outline (5 points, LINE_STRIP)
        gl.drawArrays(gl.LINE_STRIP, 0, 5);
    }

    DrawFillBasicRectangle(x, y, w, h, color=Color.black) {
        const gl = this.gl;

        this.basicRectShader.Use(gl);

        // Set uniforms
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, 0, w, h, -w/2, -h/2, color.rgba);

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
        
        // TODO let this new vertices calculation and the buffer creation to the shader and just pass the position to update the points
        // same with the DrawStrokeCircle
        for (let i = 0; i < this.circleVerts.length; i += 2) {
            const angle = (i / this.circleNumSegments) * PI2;
            this.circleVerts[i] = x + Math.cos(angle) * radius;
            this.circleVerts[i + 1] = y + Math.sin(angle) * radius;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.circleVerts, gl.STREAM_DRAW);

        // Use the shader with this custom buffer
        this.basicRectShader.UseForCustomBuffer(gl, this.circleBuffer);

        // Set uniforms
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, 0, 0, 0, 1, 1, 0, 0, color.rgba);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.circleNumSegments);
    }

    DrawStrokeCircle(x, y, radius, color=Color.black, lineWidth=1) {
        const gl = this.gl;
        
        for (let i = 0; i < this.circleVerts.length; i += 2) {
            const angle = (i / this.circleNumSegments) * PI2;
            this.circleVerts[i] = x + Math.cos(angle) * radius;
            this.circleVerts[i + 1] = y + Math.sin(angle) * radius;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.circleVerts, gl.STREAM_DRAW);

        // Use the shader with this custom buffer
        this.basicRectShader.UseForCustomBuffer(gl, this.circleBuffer);

        // Set uniforms
        this.basicRectShader.SetUniforms(gl, this.canvas.width, this.canvas.height, 0, 0, 0, 1, 1, 0, 0, color.rgba);

        gl.lineWidth(lineWidth); // May be ignored on most platforms
        gl.drawArrays(gl.LINE_STRIP, 0, this.circleNumSegments);
    }

    DrawText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", stroke=false, lineWidth=1) {
        // TODO rethink this method
        // Prepare the text in the auxiliar Canvas
        const { width, height, x: tx, y: ty } = this.PrepareText(text, x, y, font, color, align, baseline, stroke, lineWidth);

        const gl = this.gl;
        
        // Upload as WebGL texture
        gl.bindTexture(gl.TEXTURE_2D, this.textTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textCanvas);

        // Draw as a textured quad using the SpriteShader
        this.spriteShader.Use(gl);
        
        this.spriteShader.SetUniforms(gl, this.canvas.width, this.canvas.height, tx, ty, 0, width, height, 0, 0, 1.0);
        
        // Bind texture
        this.spriteShader.BindTexture(gl, this.textTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawFillText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic") {
        this.DrawText(text, x, y, font, color, align, baseline, false);
    }

    DrawStrokeText(text, x, y, font, color=Color.black, align="center", baseline="alphabetic", lineWidth=1) {
        this.DrawText(text, x, y, font, color, align, baseline, true, lineWidth);
    }

    DrawTextCached(texture, x, y, width, height) {
        const gl = this.gl;
        
        // Draw as a textured quad using the SpriteShader
        this.spriteShader.Use(gl);
        
        this.spriteShader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, 0, width, height, 0, 0, 1.0);
        
        // Bind texture
        this.spriteShader.BindTexture(gl, texture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawImage(img, x, y, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0) {
        const gl = this.gl;
        this.spriteShader.Use(gl);
        
        // Set uniforms using the spriteShader's locations
        this.spriteShader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, rot || 0, scaleX * img.width, scaleY * img.height, pivot.x * scaleX, pivot.y * scaleY, alpha);

        // Bind texture
        this.spriteShader.BindTexture(gl, this.GetTexture(img));

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawImageBasic(img, x, y, w=img.width, h=img.height, alpha=1.0) {
        this.DrawImage(img, x + w / 2, y + h / 2, w / img.width, h / img.height, 0, coord, alpha);
    }

    DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0) {
        const gl = this.gl;
        const shader = this.spriteShader;

        // Calculate normalized texture coordinates for the section
        const texLeft   = sx / img.width;
        const texTop    = sy / img.height;
        const texRight  = (sx + sw) / img.width;
        const texBottom = (sy + sh) / img.height;

        // Build texcoord buffer for the section (two triangles)
        this.auxTexcoords.set([
            texLeft,  texTop,
            texRight, texTop,
            texLeft,  texBottom,
            texLeft,  texBottom,
            texRight, texTop,
            texRight, texBottom,
        ]);

        // Use the shader and set up position buffer
        shader.Use(gl);

        // Update texcoord buffer for this draw
        gl.bindBuffer(gl.ARRAY_BUFFER, shader.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.auxTexcoords, gl.STREAM_DRAW);

        // Set uniforms
        shader.SetUniforms(gl, this.canvas.width, this.canvas.height, x, y, rot || 0, sw * scaleX, sh * scaleY, pivot.x * scaleX, pivot.y * scaleY, alpha);

        // Bind texture
        shader.BindTexture(gl, this.GetTexture(img));

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Restore the default texcoords for future draws
        gl.bindBuffer(gl.ARRAY_BUFFER, shader.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, shader.texcoords, gl.STATIC_DRAW);
    }

    DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY, alpha=1.0) {
        this.DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, 0, alpha);
    }
    
    DrawGradientRectangle(x, y, w, h, gradient) {
        // TODO this would be far more optimal if instead of using a texture, it'll use vertex color
        gradient.UpdateSize(x, y, w, h);
        
        const gl = this.gl;
        const shader = this.gradientRectShader;

        shader.Use(gl);
        
        gl.uniform2f(shader.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(shader.translationLoc, x + w/2, y + h/2);
        gl.uniform1f(shader.rotationLoc, 0);
        gl.uniform2f(shader.sizeLoc, w, h);

        // Pass gradient start and end points
        gl.uniform2f(shader.gradientStartLoc, gradient.gradientStart.x, gradient.gradientStart.y);
        gl.uniform2f(shader.gradientEndLoc, gradient.gradientEnd.x, gradient.gradientEnd.y);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gradient.webglTexture);
        gl.uniform1i(shader.gradientLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    ApplyCameraTransform(camera) {
        if (-camera.x !== this.viewMatrix[6] || -camera.y !== this.viewMatrix[7]) {
            this.viewMatrix[6] = -camera.x;
            this.viewMatrix[7] = -camera.y;
            // TODO apply rotation and scale

            this.gl.useProgram(this.basicRectShader.program);
            this.gl.uniformMatrix3fv(this.basicRectShader.viewMatrixLoc, false, this.viewMatrix);

            this.gl.useProgram(this.spriteShader.program);
            this.gl.uniformMatrix3fv(this.spriteShader.viewMatrixLoc, false, this.viewMatrix);

            this.gl.useProgram(this.gradientRectShader.program);
            this.gl.uniformMatrix3fv(this.gradientRectShader.viewMatrixLoc, false, this.viewMatrix);
        }
    }

    RestoreCameraTransform() {
        if (this.viewMatrix[6] !== 0 || this.viewMatrix[7] !== 0) {
            this.viewMatrix[6] = this.viewMatrix[7] = 0;

            this.gl.useProgram(this.basicRectShader.program);
            this.gl.uniformMatrix3fv(this.basicRectShader.viewMatrixLoc, false, this.viewMatrix);

            this.gl.useProgram(this.spriteShader.program);
            this.gl.uniformMatrix3fv(this.spriteShader.viewMatrixLoc, false, this.viewMatrix);

            this.gl.useProgram(this.gradientRectShader.program);
            this.gl.uniformMatrix3fv(this.gradientRectShader.viewMatrixLoc, false, this.viewMatrix);
        }
    }
}

// #endregion

// #region WebGL shader objects

class BasicRectShader {
    constructor(gl) {
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        this.quadVerts = new Float32Array([
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ]);

        // Outline vertices for a rectangle (LINE_STRIP, 5 points to close the loop)
        // used when rendering a stroke rectangle (DrawStrokeRectangle method)
        this.outlineVerts = new Float32Array([
            -0.5, -0.5, // bottom-left
             0.5, -0.5, // bottom-right
             0.5,  0.5, // top-right
            -0.5,  0.5, // top-left
            -0.5, -0.5  // close loop
        ]);

        // Vertex shader (solid color)
        this.vsQuadSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform vec2 u_pivot;
            uniform vec2 u_size;
            uniform mat3 u_viewMatrix;
            void main() {
                // Scale - Rotate
                vec2 local = a_position * u_size - u_pivot;
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    local.x * cosR - local.y * sinR,
                    local.x * sinR + local.y * cosR
                );
                vec2 pos = rotated + u_translation;
                vec3 localPos = vec3(pos, 1.0);
                vec3 worldPos = u_viewMatrix * localPos;
                // Convert to clipspace
                vec2 zeroToOne = worldPos.xy / u_resolution;
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
                //gl_FragColor = u_color;
                // Premultiply the RGB components by the alpha value
                // to match the gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
                gl_FragColor = vec4(u_color.rgb * u_color.a, u_color.a);
            }
        `;

        // Compile shaders and link program
        this.program = CreateProgram(gl, this.vsQuadSource, this.fsSolidColorSource);

        // Look up locations
        this.positionLoc = gl.getAttribLocation(this.program, "a_position");
        this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.translationLoc = gl.getUniformLocation(this.program, "u_translation");
        this.rotationLoc = gl.getUniformLocation(this.program, "u_rotation");
        this.viewMatrixLoc = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.sizeLoc = gl.getUniformLocation(this.program, "u_size");
        this.pivotLoc = gl.getUniformLocation(this.program, "u_pivot");
        this.colorLoc = gl.getUniformLocation(this.program, "u_color");

        // Create a buffer for a unit rectangle centered at (0,0)
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.quadVerts, gl.STATIC_DRAW);

        // Another buffer for the outline vertices (for the DrawStrokeRectangle method)
        this.outlineBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.outlineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.outlineVerts, gl.STATIC_DRAW);

        // Set temporal viewMatrix
        gl.useProgram(this.program);
        gl.uniformMatrix3fv(this.viewMatrixLoc, false, new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]));
    }

    Setup(gl) {
        gl.useProgram(this.program);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    Use(gl) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    UseForCustomBuffer(gl, buffer) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }
    
    SetUniforms(gl, resolutionX, resolutionY, translationX, translationY, rotation, sizeX, sizeY, pivotX, pivotY, color) {
        gl.uniform2f(this.resolutionLoc, resolutionX, resolutionY);
        gl.uniform2f(this.translationLoc, translationX, translationY);
        gl.uniform1f(this.rotationLoc, rotation);
        gl.uniform2f(this.sizeLoc, sizeX, sizeY);
        gl.uniform2f(this.pivotLoc, pivotX, pivotY);
        gl.uniform4fv(this.colorLoc, color);
    }
}

class SpriteShader {
    constructor(gl) {
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        this.quadVerts = new Float32Array([
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ]);

        // Texture coordinates
        this.texcoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
        ]);

        // Vertex shader for textured quad
        this.vsTextureSource = `
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform vec2 u_size;
            uniform vec2 u_pivot;
            uniform mat3 u_viewMatrix;
            varying vec2 v_texcoord;
            void main() {
                // Scale first, then rotate
                vec2 local = a_position * u_size - u_pivot;
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    local.x * cosR - local.y * sinR,
                    local.x * sinR + local.y * cosR
                );
                vec2 pos = rotated + u_translation;
                vec3 localPos = vec3(pos, 1.0);
                vec3 worldPos = u_viewMatrix * localPos;
                // Convert to clipspace
                vec2 zeroToOne = worldPos.xy / u_resolution;
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
            uniform float u_alpha;
            void main() {
                vec4 texColor = texture2D(u_texture, v_texcoord);
                //gl_FragColor = vec4(texColor.rgb, texColor.a * u_alpha);
                // If alpha is very low, force RGB to black
                //if (c.a < 0.9) c.rgb = vec3(0.0);
                //gl_FragColor = vec4(c.rgb * c.a, 1.0 - c.a);
                // Apply the uniform alpha to the texture's alpha.
                texColor.a *= u_alpha;
                // Premultiply the RGB components by the final alpha.
                texColor.rgb *= texColor.a;
                gl_FragColor = texColor;
            }
        `;

        // Compile shaders and link program
        this.program = CreateProgram(gl, this.vsTextureSource, this.fsTextureSource);
        
        this.texPositionLoc = gl.getAttribLocation(this.program, "a_position");
        this.texTexcoordLoc = gl.getAttribLocation(this.program, "a_texcoord");
        this.texResolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.texTranslationLoc = gl.getUniformLocation(this.program, "u_translation");
        this.texRotationLoc = gl.getUniformLocation(this.program, "u_rotation");
        this.viewMatrixLoc = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.texSizeLoc = gl.getUniformLocation(this.program, "u_size");
        this.pivotLoc = gl.getUniformLocation(this.program, "u_pivot");
        this.texSamplerLoc = gl.getUniformLocation(this.program, "u_texture");
        this.texAlphaLoc = gl.getUniformLocation(this.program, "u_alpha");

        // Create a buffer for quad positions
        this.texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.quadVerts, gl.STATIC_DRAW);

        // Texture coordinates buffer
        this.texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texcoords, gl.STATIC_DRAW);

        // Set temporal viewMatrix
        gl.useProgram(this.program);
        gl.uniformMatrix3fv(this.viewMatrixLoc, false, new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]));
    }

    Setup(gl) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.texPositionLoc);
        gl.vertexAttribPointer(this.texPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.enableVertexAttribArray(this.texTexcoordLoc);
        gl.vertexAttribPointer(this.texTexcoordLoc, 2, gl.FLOAT, false, 0, 0);
    }

    Use(gl) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.vertexAttribPointer(this.texPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.vertexAttribPointer(this.texTexcoordLoc, 2, gl.FLOAT, false, 0, 0);
    }

    SetUniforms(gl, resolutionX, resolutionY, translationX, translationY, rotation, sizeX, sizeY, pivotX, pivotY, alpha) {
        gl.uniform2f(this.texResolutionLoc, resolutionX, resolutionY);
        gl.uniform2f(this.texTranslationLoc, translationX, translationY);
        gl.uniform1f(this.texRotationLoc, rotation);
        gl.uniform2f(this.texSizeLoc, sizeX, sizeY);
        gl.uniform2f(this.pivotLoc, pivotX, pivotY);
        gl.uniform1f(this.texAlphaLoc, alpha);
    }

    BindTexture(gl, texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.texSamplerLoc, 0);
    }
}

class GradientRectShader {
    constructor(gl) {
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        this.quadVerts = new Float32Array([
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ]);

        // Vertex shader: pass local position (0..1) for gradient
        this.vsSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform mat3 u_viewMatrix;
            uniform vec2 u_size;
            uniform vec2 u_gradientStart; // Original world-space gradient start
            uniform vec2 u_gradientEnd;   // Original world-space gradient end
            varying vec2 v_worldPos;
            varying vec2 v_gradientStartTransformed; // Transformed gradient start (camera space)
            varying vec2 v_gradientEndTransformed;   // Transformed gradient end (camera space)
            void main() {
                // Scale first, then rotate
                vec2 scaled = a_position * u_size;
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    scaled.x * cosR - scaled.y * sinR,
                    scaled.x * sinR + scaled.y * cosR
                );
                vec2 pos = rotated + u_translation;
                vec3 localPos = vec3(pos, 1.0);
                vec3 worldPos = u_viewMatrix * localPos;
                // Convert to clipspace
                vec2 zeroToOne = worldPos.xy / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

                // Pass local quad position (0..1) to fragment
                v_worldPos = worldPos.xy;
                // Transform gradient start/end points by the view matrix
                v_gradientStartTransformed = (u_viewMatrix * vec3(u_gradientStart, 1.0)).xy;
                v_gradientEndTransformed = (u_viewMatrix * vec3(u_gradientEnd, 1.0)).xy;
            }
        `;

        // Fragment shader: linear gradient following a 1D texture
        this.fsSource = `
            precision mediump float;
            varying vec2 v_worldPos;
            uniform sampler2D u_gradient;
            varying vec2 v_gradientStartTransformed; // Transformed gradient start (camera space)
            varying vec2 v_gradientEndTransformed;   // Transformed gradient end (camera space)
            void main() {
                // All calculations are now in camera space
                vec2 gradientVec = v_gradientEndTransformed - v_gradientStartTransformed;
                float gradientLenSq = dot(gradientVec, gradientVec);
                if (gradientLenSq == 0.0) {
                    gl_FragColor = texture2D(u_gradient, vec2(0.0, 0.5));
                    return;
                }
                vec2 pointVec = v_worldPos - v_gradientStartTransformed;
                float projection = dot(pointVec, gradientVec);
                float t = clamp(projection / gradientLenSq, 0.0, 1.0);
                gl_FragColor = texture2D(u_gradient, vec2(t, 0.5));
            }
        `;

        // Compile shaders and link program
        this.program = CreateProgram(gl, this.vsSource, this.fsSource);

        // Look up locations
        this.positionLoc = gl.getAttribLocation(this.program, "a_position");
        this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
        this.translationLoc = gl.getUniformLocation(this.program, "u_translation");
        this.rotationLoc = gl.getUniformLocation(this.program, "u_rotation");
        this.viewMatrixLoc = gl.getUniformLocation(this.program, "u_viewMatrix");
        this.sizeLoc = gl.getUniformLocation(this.program, "u_size");
        this.gradientLoc = gl.getUniformLocation(this.program, "u_gradient");
        this.gradientStartLoc = gl.getUniformLocation(this.program, "u_gradientStart");
        this.gradientEndLoc = gl.getUniformLocation(this.program, "u_gradientEnd");

        // Create a buffer for a unit rectangle centered at (0,0)
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.quadVerts, gl.STATIC_DRAW);

        // Set temporal viewMatrix
        gl.useProgram(this.program);
        gl.uniformMatrix3fv(this.viewMatrixLoc, false, new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]));
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

    static CleanGradientTexture(gl, text) {
        gl.deleteTexture(text);
    }

    Setup(gl) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    Use(gl) {
        gl.useProgram(this.program);
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