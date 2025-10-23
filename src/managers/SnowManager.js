import * as THREE from 'three';
import snowVertexShader from '../shaders/snow/vertex.glsl';
import snowFragmentShader from '../shaders/snow/fragment.glsl';

export class SnowManager {
  constructor(gui) {
    this.gui = gui;
    this.snow = null;
    this.material = null;
    this.geometry = null;
    
    this.uniforms = {
      uTime: new THREE.Uniform(0),
      uSize: new THREE.Uniform(50),
      uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    };

    this.init();
  }

  init() {
    this.createGeometry();
    this.createMaterial();
    this.createSnow();
  }

  createGeometry() {
    this.geometry = new THREE.BufferGeometry();
    const snowCount = 15;
    const snowPositions = new Float32Array(snowCount * 3);
    const snowScale = new Float32Array(snowCount);

    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3 + 0] = Math.random() - 0.5 - 3.5;
      snowPositions[i * 3 + 1] = 1;
      snowPositions[i * 3 + 2] = Math.random() - 0.5 + 0.3;

      snowScale[i] = Math.random();
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(snowPositions, 3)
    );
    this.geometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(snowScale, 1)
    );
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: snowVertexShader,
      fragmentShader: snowFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      
    });
  }

  createSnow() {
    this.snow = new THREE.Points(this.geometry, this.material);
  }

  addToScene(scene) {
    if (this.snow) {
      scene.add(this.snow);
    }
  }

  update(time) {
    this.uniforms.uTime.value = time;
  }

  // Handle window resize
  handleResize() {
    this.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }

  // Getters
  getSnow() {
    return this.snow;
  }

  // Clean up method
  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.snow && this.snow.parent) {
      this.snow.parent.remove(this.snow);
    }
  }
}