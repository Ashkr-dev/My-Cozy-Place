uniform float uTime;

varying float vLife;
varying float vNoise;

void main() {
    // Circular shape with smooth falloff
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(coord);

    // Discard pixels outside circle
    if(distanceToCenter > 0.5) {
        discard;
    }

    // Fire color gradient based on life
    vec3 color;
    if(vLife < 0.3) {
        // Core - bright yellow/white
        color = mix(vec3(1.0, 1.0, 0.8), vec3(1.0, 0.9, 0.3), vLife * 3.0);
    } else if(vLife < 0.6) {
        // Middle - orange
        color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.4, 0.0), (vLife - 0.3) * 3.0);
    } else {
        // Outer - red
        color = mix(vec3(1.0, 0.3, 0.0), vec3(0.5, 0.1, 0.0), (vLife - 0.6) * 2.5);
    }

    // Alpha based on distance from center and life
    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);

    // Fade in at start, fade out at end
    alpha *= smoothstep(0.0, 0.2, vLife); // Fade in
    alpha *= 1.0 - smoothstep(0.7, 1.0, vLife); // Fade out

    // Add noise-based variation
    alpha *= 0.8 + 0.2 * vNoise;

    // Final color with alpha
    gl_FragColor = vec4(color, alpha);

    // Discard very transparent pixels
    if(gl_FragColor.a < 0.05) {
        discard;
    }

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}