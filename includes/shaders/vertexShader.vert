// GLSL ES 1.0 vertex shader for WebGL 1.0
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Assuming a_position is in [-1,1] so that v_texCoord is in [-1,1]
    v_texCoord = a_position;
}
