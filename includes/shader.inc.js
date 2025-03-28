let shaderTime = 0.0;
let timeCheck = 0.0;
let shaderTurbulence = 2.0;
let shaderSpeed = 0.3;
let shaderCorruption = 0.0;
let shaderCorruptionSpeed = 1;
let color1 = {
    r: 1.0,
    g: 0.0,
    b: 0.0
};
let color2 = {
    r: 0.9,
    g: 0.1,
    b: 0.1
};

async function updateTurbulence(target, factor) {
    // Calculate the total change needed
    let margin = target - shaderTurbulence;
    let steps = Math.abs(margin) / factor;

    // Increment or decrement shaderTurbulence by factor each step
    for (let i = 0; i < steps; i++) {
        // Adjust shaderTurbulence towards target
        shaderTurbulence += (margin > 0 ? factor : -factor);
        await new Promise(resolve => setTimeout(resolve, 20));
    }

    // Ensure shaderTurbulence lands exactly on target
    shaderTurbulence = target;
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
    const dom1Loc   = gl.getUniformLocation(program, "dominantColor1");
    const dom2Loc   = gl.getUniformLocation(program, "dominantColor2");
    const turbLoc       = gl.getUniformLocation(program, "u_turbulence");
    const corruptionLoc = gl.getUniformLocation(program, "u_corruption");
    const corruptionSpeedLoc = gl.getUniformLocation(program, "u_corruptionSpeed");

    let now = performance.now() / 1000; // Current time in seconds
    let deltaTime = now - timeCheck; // Time elapsed since last update
    shaderTime += deltaTime * shaderSpeed; // Scale time advancement by shaderSpeed
    timeCheck = now; // Store the current time for the next frame

    // In your render loop:
    gl.uniform1f(timeLoc, shaderTime);
    gl.uniform2f(resLoc, canvasWidth, canvasHeight);
    gl.uniform3f(dom1Loc, color1.r, color1.g, color1.b);  // Base color.
    gl.uniform3f(dom2Loc, color2.r, color2.g, color2.b);  // Modulation color.
    gl.uniform1f(turbLoc, shaderTurbulence);
    gl.uniform1f(corruptionLoc, shaderCorruption);
    gl.uniform1f(corruptionSpeedLoc, shaderCorruptionSpeed)


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