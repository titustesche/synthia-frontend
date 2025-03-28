#ifdef GL_ES
precision highp float;
#endif

// Uniforms (set from JS)
uniform float u_time;
uniform vec2  u_resolution;
uniform float u_turbulence;  // New uniform to control turbulence
uniform float u_corruption;    // Uniform to adjust UV distortion strength
uniform float u_corruptionSpeed;  // New uniform to control corruption speed
uniform vec3  dominantColor1;
uniform vec3  dominantColor2;

// Internal constants
// Removed constant dark blue so that glow respects dominant colors.
// const vec3 color3 = vec3(0.062745, 0.078431, 0.600000);
const float innerRadius = 0.3;
const float noiseScale  = 0.65;

#define BG_COLOR vec3(0.0)

//-------------------------------------------------------------------
// Random function for glitch manipulation
//-------------------------------------------------------------------
float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

//-------------------------------------------------------------------
// Hash and noise functions
//-------------------------------------------------------------------
vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p3.x+p3.y, p3.x+p3.z, p3.y+p3.z) * p3.zyx);
}

float snoise3(vec3 p)
{
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;

    vec3 i = floor(p + dot(p, vec3(K1)));
    vec3 d0 = p - (i - dot(i, vec3(K2)));

    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);

    vec3 d1 = d0 - (i1 - vec3(K2));
    vec3 d2 = d0 - (i2 - vec3(K1));
    vec3 d3 = d0 - 0.5;

    vec4 h = max(vec4(0.6) - vec4(dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)), vec4(0.0));
    vec4 n = h * h * h * h * vec4(
    dot(d0, hash33(i)),
    dot(d1, hash33(i + i1)),
    dot(d2, hash33(i + i2)),
    dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
}

//-------------------------------------------------------------------
// Extract alpha from color based on brightest channel
//-------------------------------------------------------------------
vec4 extractAlpha(vec3 colorIn)
{
    vec4 colorOut;
    float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
    if(maxValue > 1e-5)
    {
        colorOut.rgb = colorIn.rgb / maxValue;
        colorOut.a = maxValue;
    }
    else
    {
        colorOut = vec4(0.0);
    }
    return colorOut;
}

//-------------------------------------------------------------------
// Light functions
//-------------------------------------------------------------------
float light1(float intensity, float attenuation, float dist)
{
    return intensity / (1.0 + dist * attenuation);
}

float light2(float intensity, float attenuation, float dist)
{
    return intensity / (1.0 + dist * dist * attenuation);
}

//-------------------------------------------------------------------
// Core ring effect drawing function
//-------------------------------------------------------------------
void draw(out vec4 _FragColor, in vec2 uv)
{
    float ang = atan(uv.y, uv.x);
    float len = length(uv);

    // Use the new u_turbulence to modify the noise frequency:
    float n0 = snoise3(vec3(uv * noiseScale * u_turbulence, u_time * 0.5)) * 0.5 + 0.5;
    float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
    float d0 = distance(uv, (r0 / len) * uv);

    float v0 = light1(1.0, 10.0, d0);
    v0 *= smoothstep(r0 * 1.05, r0, len);
    float cl = cos(ang + u_time * 2.0) * 0.5 + 0.5;

    float a = u_time * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    // Compute base color from the chosen dominant colors.
    vec3 col = mix(dominantColor1, dominantColor2, cl);
    // Removed mixing with a constant dark blue so the glow respects the chosen colors.
    col = (col + v1) * v2 * v3;
    col = clamp(col, 0.0, 1.0);

    _FragColor = extractAlpha(col);
}

//-------------------------------------------------------------------
// Main entry point
//-------------------------------------------------------------------
varying vec2 v_texCoord;
void main()
{
    // Map gl_FragCoord to uv in [0,1]
    vec2 uv = gl_FragCoord.xy / u_resolution;
    // Map uv from [0,1] to [-1,1]
    uv = uv * 2.0 - 1.0;
    // Adjust x by the aspect ratio (u_resolution.x / u_resolution.y)
    uv.x *= (u_resolution.x / u_resolution.y);

    // --- UV Manipulation for glitching bands ---
    // Remap uv.y from [-1,1] to [0,1] and quantize into 50 bands:
    float band = floor(((uv.y + 1.0) / 2.0) * 50.0);

    // Base continuous horizontal offset for subtle motion.
    float baseOffset = sin(u_time * 2.0 + band * 2.0) * 0.05;

    // Compute a discrete glitch offset using u_corruptionSpeed to control its speed.
    float glitchDiscrete = floor(u_time * u_corruptionSpeed * 5.0);
    float glitchTarget = (rand(vec2(band, glitchDiscrete * 1.3)) - 0.5) * 0.3;

    // Add a jitter component using u_corruptionSpeed.
    float jitter = (rand(vec2(band, u_time * u_corruptionSpeed * 50.0)) - 0.5) * 0.05;

    // Combine the discrete glitch with the jitter.
    float glitchOffset = glitchTarget + jitter;

    // Final x offset applied to the uv coordinate, scaled by the u_corruption uniform.
    float xOffset = baseOffset + glitchOffset;
    uv.x += u_corruption * xOffset;
    // --- End UV Manipulation ---

    vec4 col;
    draw(col, uv);

    gl_FragColor.rgb = mix(BG_COLOR, col.rgb, col.a);
    gl_FragColor.a = 1.0;
}
