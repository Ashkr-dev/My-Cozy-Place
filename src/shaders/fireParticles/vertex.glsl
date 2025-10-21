uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform sampler2D uPerlinTexture;
uniform float uRiseSpeed;
uniform float uRiseHeight;
uniform float uRandomSeed;
uniform float uTurbulanceX;
uniform float uTurbulanceZ;

attribute float aScale;
attribute float aRandom; // Add random seed for each particle

varying float vLife;
varying float vNoise;

void main() {
    // Get unique seed for each particle
    float seed = aRandom * uRandomSeed;

    // Sample noise texture for organic movement
    vec2 noiseUV = vec2(position.x * 0.1 + uTime * 0.5, position.z * 0.1 + uTime * 0.3 + seed);
    vec4 noiseColor = texture2D(uPerlinTexture, noiseUV);
    float noise = noiseColor.r * 2.0 - 1.0; // Convert to -1 to 1

    // Calculate particle life cycle
    float life = mod(uTime * uRiseSpeed + seed * 2.0, 1.0);
    vLife = life;
    vNoise = noise;

    // Base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Fire-specific movement:
    // 1. Rising upward
    modelPosition.y += life * uRiseHeight;

    // 2. Side-to-side sway with noise
    modelPosition.x += sin(uTime * 1.0 + seed) * 0.1 * life;
    modelPosition.z += cos(uTime * 1.5 + seed) * 0.1 * life;

    // 3. Organic turbulence
    modelPosition.x += noise * uTurbulanceX * life;
    modelPosition.z += noise * uTurbulanceZ * life;

    // 4. Expand as it rises
    float expansion = life * 0.3;
    modelPosition.x += sin(seed) * expansion;
    modelPosition.z += cos(seed) * expansion;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Size changes over life:
    // Start small, grow, then shrink at end
    float sizeMultiplier = 1.0;

    if(life < 0.2) {
        // Growing phase
        sizeMultiplier = life * 5.0;
    } else if(life > 0.7) {
        // Shrinking phase
        sizeMultiplier = (1.0 - life) * 3.0;
    }

    // // Add flickering
    float flicker = 0.8 + 0.2 * sin(uTime * 20.0 + seed * 100.0);
    // float flicker = 1.0;

    gl_PointSize = uSize * aScale * uPixelRatio * sizeMultiplier * flicker;
    gl_PointSize *= (1.0 / -viewPosition.z);
}