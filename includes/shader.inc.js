const startTime = Date.now();

async function initWebGL() {
    const canvas = document.getElementById('shader_canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Shader-Dateien laden
    const vertexShaderSource = await fetch('includes/shaders/vertexShader.vert').then(res => res.text());
    const fragmentShaderSource = await fetch('includes/shaders/fragmentShader.frag').then(res => res.text());

    // Shader erstellen
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Shader-Programm erstellen
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Dreiecks-Vertices definieren
    const vertices = new Float32Array([
        -1.0, -1.0,  0.0,  // Bottom-left
        1.0, -1.0,  0.0,  // Bottom-right
        -1.0,  1.0,  0.0,  // Top-left
        1.0,  1.0,  0.0,  // Top-right
    ]);

    const indices = new Uint16Array([
        0, 1, 2,  // Erstes Dreieck
        2, 1, 3,  // Zweites Dreieck
    ]);

    // Vertex-Buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttrib = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

    // Index-Buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Zeichne das Quad
    // const centerUniform = gl.getUniformLocation(program, 'center');
    const resolution = gl.getUniformLocation(program, 'u_resolution');
    // const sizeUniform = gl.getUniformLocation(program, 'size');
    // updatePosition(gl, centerUniform);
    // updateSize(gl, sizeUniform);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), (Date.now() - startTime) / 1000);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    initWebGL();
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(`Program link error: ${gl.getProgramInfoLog(program)}`);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function updateSize(gl, sizeUniform)
{
    const elapsedTime = (Date.now() - startTime) / 1000.0;
    const size = (Math.pow(Math.sin(elapsedTime), 2) + 1) * 2;

    gl.uniform1f(sizeUniform, size);
}

function updatePosition(gl, centerUniform)
{
    const elapsedTime = (Date.now() - startTime) / 1000.0;

    const center = [
        Math.sin(elapsedTime) * 0.5,
        Math.cos(elapsedTime) * 0.5,
        0.0
    ];

    gl.uniform3fv(centerUniform, center);
}

initWebGL();