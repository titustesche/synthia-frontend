const startTime = Date.now();
let targetTurbulence = 0.0;
let shaderTurbulence = 0.0;
let shaderSpeed = 1.0;

async function updateTurbulence(factor) {
    shaderTurbulence += (targetTurbulence - shaderTurbulence) * factor;
}

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
    let canvasWidth = canvas.getBoundingClientRect().width;
    let canvasHeight = canvas.getBoundingClientRect().height;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const timeLoc   = gl.getUniformLocation(program, "u_time");
    const resLoc    = gl.getUniformLocation(program, "u_resolution");
    const speedLoc  = gl.getUniformLocation(program, "speed");
    const dom1Loc   = gl.getUniformLocation(program, "dominantColor1");
    const dom2Loc   = gl.getUniformLocation(program, "dominantColor2");
    const turbLoc       = gl.getUniformLocation(program, "u_turbulence");

    // In your render loop:
    gl.uniform1f(timeLoc, performance.now() / 1000.0);
    gl.uniform2f(resLoc, canvasWidth, canvasHeight);
    gl.uniform1f(speedLoc, shaderSpeed);  // Adjust speed here.
    gl.uniform3f(dom1Loc, 0.0, 0.2, 1.0);  // Base color.
    gl.uniform3f(dom2Loc, 0.8, 0.3, 0.6);  // Modulation color.
    gl.uniform1f(turbLoc, shaderTurbulence);


    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // updateTurbulence(0.01);
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

initWebGL();