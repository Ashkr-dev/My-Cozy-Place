import * as THREE from "three";
import coffeeSmokeVertexShader from "../shaders/coffeeSmoke/vertex.glsl";
import coffeeSmokeFragmentShader from "../shaders/coffeeSmoke/fragment.glsl";

export default class CoffeeSmokeMaterial {
  constructor(perlinTexture) {
    this.material = new THREE.ShaderMaterial({
      vertexShader: coffeeSmokeVertexShader,
      fragmentShader: coffeeSmokeFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return this.material;
  }

  updateTime(time) {
    this.material.uniforms.uTime.value = time;
  }
}
