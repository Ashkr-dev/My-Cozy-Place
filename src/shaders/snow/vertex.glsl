uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;

attribute float aScale;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += sin(uTime);
    modelPosition.y += sin(uTime * 0.5 + modelPosition.x * 100.0) * aScale * 0.8;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / -viewPosition.z);
}