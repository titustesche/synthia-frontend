precision mediump float;

varying vec3 v_position;

uniform float u_time;      // Time in seconds
uniform vec2 u_resolution; // Viewport resolution

void main() {
    gl_FragColor = vec4(1.0 * v_position.x, 0.0, 1.0 * v_position.y, 1.0);
}