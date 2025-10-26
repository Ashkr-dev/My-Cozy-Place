uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform float uNightMix;

varying vec2 vUv;

void main() {
    vec3 dayTexture = texture2D(uDayTexture, vUv).rgb;
    vec3 nightTexture = texture2D(uNightTexture, vUv).rgb;

    vec3 finalTheme = mix(dayTexture, nightTexture, uNightMix );
    gl_FragColor = vec4(finalTheme, 1.0);
}