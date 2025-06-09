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
    DrawLine(x1, y1, x2, y2, color=Color.Black(), lineWidth = 1) {}
    DrawPolygon(points, strokeColor=Color.Black(), lineWidth=1, fill=false, fillColor=Color.Black()) {}
    DrawRectangle(x, y, w, h, color, stroke=false, lineWidth=1, rot=0) {}

    // Draw sprites
    DrawImage(img, x, y, scaleX, scaleY, rot=0) {}
    DrawImageBasic(img, x, y, w, h) {}
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

    DrawLine(x1, y1, x2, y2, color=Color.Black(), lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    DrawPolygon(points, strokeColor=Color.Black(), lineWidth=1, fill=false, fillColor=Color.Black()) {
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

    DrawRectangle(x, y, w, h, color, stroke=false, lineWidth=1, rot=0) {
        if (stroke) {
            this.DrawStrokeRectangle(x, y, w, h, color, lineWidth, rot);
        }
        else {
            this.DrawFillRectangle(x, y, w, h, color, rot);
        }
    }
    
    DrawStrokeRectangle(x, y, w, h, color, lineWidth, rot) {
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
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    DrawFillRectangle(x, y, w, h, color, rot) {
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

    DrawImage(img, x, y, scaleX, scaleY, rot=0) {
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(rot);
        this.ctx.scale(scaleX, scaleY);

        this.ctx.drawImage(img, -img.halfWidth, -img.halfHeight);

        this.ctx.restore();
    }

    DrawImageBasic(img, x, y, w, h) {
        this.ctx.drawImage(img, x, y, w, h);
    }

}

class WebGLRenderer extends Renderer {
    constructor(canvas, gl, config) {
        super(canvas, config);
        this.gl = gl;
        
        // enable blending for pngs transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // Vertex shader (solid color)
        const vsSource = `
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
        const fsSource = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `;
        
        // Compile shaders and link program
        this.program = this._createProgram(vsSource, fsSource);
        this.gl.useProgram(this.program);

        // Look up locations
        this.positionLoc = this.gl.getAttribLocation(this.program, "a_position");
        this.resolutionLoc = this.gl.getUniformLocation(this.program, "u_resolution");
        this.translationLoc = this.gl.getUniformLocation(this.program, "u_translation");
        this.rotationLoc = this.gl.getUniformLocation(this.program, "u_rotation");
        this.sizeLoc = this.gl.getUniformLocation(this.program, "u_size");
        this.colorLoc = this.gl.getUniformLocation(this.program, "u_color");

        // Create a buffer for a unit rectangle centered at (0,0)
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        const vertices = [
            -0.5, -0.5,
             0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
             0.5, -0.5,
             0.5,  0.5,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        // Vertex shader for textured quad
        const vsTexSource = `
            attribute vec2 a_position;
            attribute vec2 a_texcoord;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform float u_rotation;
            uniform vec2 u_size;
            varying vec2 v_texcoord;
            void main() {
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotated = vec2(
                    a_position.x * cosR - a_position.y * sinR,
                    a_position.x * sinR + a_position.y * cosR
                );
                vec2 pos = rotated * u_size + u_translation;
                vec2 zeroToOne = pos / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_texcoord = a_texcoord;
            }
        `;
        // Fragment shader for textured quad
        const fsTexSource = `
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
        this.texProgram = this._createProgram(vsTexSource, fsTexSource);
        this.texPositionLoc = this.gl.getAttribLocation(this.texProgram, "a_position");
        this.texTexcoordLoc = this.gl.getAttribLocation(this.texProgram, "a_texcoord");
        this.texResolutionLoc = this.gl.getUniformLocation(this.texProgram, "u_resolution");
        this.texTranslationLoc = this.gl.getUniformLocation(this.texProgram, "u_translation");
        this.texRotationLoc = this.gl.getUniformLocation(this.texProgram, "u_rotation");
        this.texSizeLoc = this.gl.getUniformLocation(this.texProgram, "u_size");
        this.texSamplerLoc = this.gl.getUniformLocation(this.texProgram, "u_texture");

        // Create a buffer for quad positions
        this.texBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuffer);
        // Rectangle from (-0.5, -0.5) to (0.5, 0.5)
        const quadVerts = [
            -0.5, -0.5,
            0.5, -0.5,
            -0.5,  0.5,
            -0.5,  0.5,
            0.5, -0.5,
            0.5,  0.5,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quadVerts), this.gl.STATIC_DRAW);

        // Texture coordinates buffer
        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        const texcoords = [
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);
    }

    _createProgram(vsSource, fsSource) {
        const gl = this.gl;
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

    DrawLine(x1, y1, x2, y2, color=Color.Black(), lineWidth=1) {
        const gl = this.gl;

        // reuse the rectangle shader but with different buffer data

        // buffer for the two points
        const vertices = new Float32Array([
            x1, y1,
            x2, y2
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);

        gl.useProgram(this.program);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Set up attributes
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms (no rotation/scale, just pass through)
        gl.uniform2f(this.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.translationLoc, 0, 0);
        gl.uniform1f(this.rotationLoc, 0);
        gl.uniform2f(this.sizeLoc, 1, 1);

        // Color
        gl.uniform4fv(this.colorLoc, color.rgba);

        // Set line width (ignored on some platforms)
        gl.lineWidth(lineWidth);

        // Draw the line
        gl.drawArrays(gl.LINES, 0, 2);

        // Clean up
        gl.deleteBuffer(buffer);
    }

    DrawPolygon(points, strokeColor=Color.Black(), lineWidth=1, fill=false, fillColor=Color.Black()) {
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

    DrawFillRectangle(x, y, w, h, color, rot) {
        if (rot === 0) {
            x += w/2;
            y += h/2;
        }

        const gl = this.gl;
        gl.useProgram(this.program);

        // Set viewport and clear if needed
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        gl.uniform2f(this.resolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.translationLoc, x, y);
        gl.uniform1f(this.rotationLoc, rot);
        gl.uniform2f(this.sizeLoc, w, h);

        // Color
        gl.uniform4fv(this.colorLoc, color.rgba);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawImage(img, x, y, scaleX, scaleY, rot=0) {
        const gl = this.gl;
        gl.useProgram(this.texProgram);

        // Set up position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.texPositionLoc);
        gl.vertexAttribPointer(this.texPositionLoc, 2, gl.FLOAT, false, 0, 0);

        // Set up texcoord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.enableVertexAttribArray(this.texTexcoordLoc);
        gl.vertexAttribPointer(this.texTexcoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        gl.uniform2f(this.texResolutionLoc, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.texTranslationLoc, x, y);
        gl.uniform1f(this.texRotationLoc, rot || 0);
        gl.uniform2f(this.texSizeLoc, scaleX * img.width, scaleY * img.height);

        // Bind texture
        const tex = this.GetTexture(img);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(this.texSamplerLoc, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    DrawImageBasic(img, x, y, w, h) {
        this.DrawImage(img, x, y, w / img.width, h / img.height);
    }
    
}