precision mediump float;

varying vec3 v_position;

uniform float u_time;      // Time in seconds
uniform vec2 u_resolution; // Viewport resolution

void main() {
    vec3 color = vec3(0.0);
    float lengthFactor, z = u_time;

    for (int i = 0; i < 3; i++) {
        vec2 uv, p = gl_FragCoord.xy / u_resolution;
        uv = p;

        // Center and apply aspect ratio
        p -= 0.5;
        p.x *= u_resolution.x / u_resolution.y;

        // Time component affecting the pattern
        z += 0.07;
        lengthFactor = length(p);

        // Distort UV coordinates
        uv += p / lengthFactor * (sin(z) + 1.0) * abs(sin(lengthFactor * 9.0 - z - z));

        // Calculate color component with clamping
        color[i] = 0.02 / length(mod(uv, 1.0) - 0.5);
    }

    // Cap excessive brightness
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(1.0 * v_position.x, 0.0, 1.0 * v_position.y, 1.0);
}