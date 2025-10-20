uniform float uTime;
uniform sampler2D uPerlinTexture;

uniform vec3 uFireFirstColor;
uniform vec3 uFireSecondColor;
uniform vec3 uFireTopColor;
uniform float uFireTopIntensity;
uniform float uDistortWavyMotion;
uniform float uRisingSpeed;
uniform float uFireIntensity;
uniform float uFireRemapX;
uniform float uFireRemapY;

varying vec2 vUv;

void main() {
    vec2 fireUv = vUv;

    // Distort for wavy motion (simulate heat turbulence)
    float distortion = sin(fireUv.y * 10.0 + uTime * 2.0) * uDistortWavyMotion;
    fireUv.x += distortion;

    // Scale UV to compress flame shape
    fireUv.x *= uFireRemapX;
    fireUv.y *= uFireRemapY;

    // Animate upward
    // fireUv.y += uTime * 0.2;
    fireUv.y += uTime * uRisingSpeed; // Rising
    fireUv.x += sin(uTime * 3.0 + fireUv.y * 10.0) * 0.02; // Side flicker

    // Sample noise texture
    float fireNoise = texture2D(uPerlinTexture, fireUv).r;

    // Remap noise value for fire intensity
    float intensity = smoothstep(0.2, 1.0, fireNoise);

    // Shape the flame using vUv mask
    intensity *= smoothstep(0.0, 0.3, vUv.x);      // left edge fade
    intensity *= smoothstep(1.0, 0.7, vUv.x);      // right edge fade
    intensity *= smoothstep(0.0, 0.6, vUv.y);      // Top fade
    intensity *= smoothstep(1.0, 0.8, vUv.y);      // Bottom fade

    // Fire color gradient (deep red to yellow-white)
    vec3 color = uFireFirstColor; // start with orange
    color = mix(uFireSecondColor, color, intensity); // deep red → orange
    color = mix(color, uFireTopColor, pow(intensity * uFireTopIntensity, 2.0)); // tip becomes white-hot

    // //Glow Aura / Emissive Bloom Feel
    // float radial = 1.0 - length(vUv - vec2(0.5, 0.1)) * 2.0;
    // intensity += pow(radial, 3.0) * 0.3;

    // Output
    gl_FragColor = vec4(color, intensity * uFireIntensity);

    // Optional: tone mapping and color correction
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
