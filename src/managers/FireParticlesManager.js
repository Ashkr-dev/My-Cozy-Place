import * as THREE from 'three';
import fireParticlesVertexShader from '../shaders/fireParticles/vertex.glsl';
import fireParticlesFragmentShader from '../shaders/fireParticles/fragment.glsl';

export class FireParticlesManager {
  constructor(perlinTexture, gui) {
    this.perlinTexture = perlinTexture;
    this.gui = gui;
    this.particles = null;
    this.material = null;
    this.geometry = null;
    
    this.uniforms = {
      uTime: new THREE.Uniform(0),
      uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
      uSize: new THREE.Uniform(28),
      uPerlinTexture: new THREE.Uniform(perlinTexture),
      uRiseSpeed: new THREE.Uniform(0.2),
      uRiseHeight: new THREE.Uniform(0.9),
      uRandomSeed: new THREE.Uniform(100),
      uTurbulanceX: new THREE.Uniform(0.02),
      uTurbulanceZ: new THREE.Uniform(0.05),
    };

    this.init();
    this.setupGUI();
  }

  init() {
    this.createGeometry();
    this.createMaterial();
    this.createParticles();
  }

  createGeometry() {
    this.geometry = new THREE.BufferGeometry();
    const fireParticlesCount = 25;
    const fireParticlesPositions = new Float32Array(fireParticlesCount * 3);
    const fireParticlesScale = new Float32Array(fireParticlesCount);
    const fireParticlesRandom = new Float32Array(fireParticlesCount);

    // Fire origin position (adjust to match your fireplace)
    const fireOrigin = new THREE.Vector3(0, -0.5, -1.8);

    for (let i = 0; i < fireParticlesCount; i++) {
      fireParticlesPositions[i * 3 + 0] = fireOrigin.x + (Math.random() - 0.5) * 0.3;
      fireParticlesPositions[i * 3 + 1] = fireOrigin.y + Math.random() * 0.1 - 0.05;
      fireParticlesPositions[i * 3 + 2] = fireOrigin.z + (Math.random() - 0.5) * 0.2;

      fireParticlesScale[i] = 0.5 + Math.random() * 0.3;
      fireParticlesRandom[i] = Math.random();
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(fireParticlesPositions, 3)
    );
    this.geometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(fireParticlesScale, 1)
    );
    this.geometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(fireParticlesRandom, 1)
    );
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: fireParticlesVertexShader,
      fragmentShader: fireParticlesFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  createParticles() {
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  setupGUI() {
    const FireParticlesFolder = this.gui.addFolder("Fire Particles");
    
    FireParticlesFolder.add(this.uniforms.uSize, "value")
      .min(0)
      .max(200)
      .step(1)
      .name("Size");

    FireParticlesFolder.add(this.uniforms.uRiseSpeed, "value")
      .min(0)
      .max(2.0)
      .step(0.01)
      .name("Rising Speed");

    FireParticlesFolder.add(this.uniforms.uRiseHeight, "value")
      .min(0)
      .max(2.0)
      .step(0.01)
      .name("Rising Height");

    FireParticlesFolder.add(this.uniforms.uRandomSeed, "value")
      .min(0)
      .max(200)
      .step(1)
      .name("Random Seed");

    FireParticlesFolder.add(this.uniforms.uTurbulanceX, "value")
      .min(0)
      .max(2.0)
      .step(0.01)
      .name("Turbulence X");

    FireParticlesFolder.add(this.uniforms.uTurbulanceZ, "value")
      .min(0)
      .max(2.0)
      .step(0.01)
      .name("Turbulence Z");

    // Optional: Add reset button
    // FireParticlesFolder.add(this, 'resetParticles').name("Reset Particles");
  }

  addToScene(scene) {
    if (this.particles) {
      scene.add(this.particles);
    }
  }

  update(time) {
    this.uniforms.uTime.value = time;
    
    // Update pixel ratio on resize (you might want to handle this externally)
    this.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  }

  resetParticles() {
    // Optional: Reset particle positions or other properties
    // console.log("Resetting fire particles...");
  }

  // Getters
  getParticles() {
    return this.particles;
  }

  // Clean up method
  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}