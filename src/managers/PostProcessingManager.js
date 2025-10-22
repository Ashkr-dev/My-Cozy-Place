import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export class PostProcessingManager {
  constructor(renderer, scene, camera, gui) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.gui = gui;
    
    this.composer = null;
    this.passes = {};
    this.enabled = true;
    
    this.init();
  }

  init() {
    this.createComposer();
    this.setupPasses();
    this.setupGUI();
  }

  createComposer() {
    const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      samples: this.renderer.getPixelRatio() === 1 ? 2 : 0,
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  setupPasses() {
    // Render Pass (always first)
    this.passes.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.passes.renderPass);

    // Bloom Pass
    this.passes.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(this.passes.bloomPass);

    // Gamma Correction Pass
    this.passes.gammaPass = new ShaderPass(GammaCorrectionShader);
    this.passes.gammaPass.enabled = false;
    this.composer.addPass(this.passes.gammaPass);

    // SMAA Pass (if needed)
    if (this.renderer.getPixelRatio() === 1 && this.renderer.capabilities.isWebGL2) {
      this.passes.smaaPass = new SMAAPass();
      this.composer.addPass(this.passes.smaaPass);
    }
  }

  setupGUI() {
    const postProcessingFolder = this.gui.addFolder('Post Processing');
    
    // Master toggle
    postProcessingFolder.add(this, 'enabled').name('Enabled').onChange((value) => {
      this.setEnabled(value);
    });

    // Bloom controls
    const bloomFolder = postProcessingFolder.addFolder('Bloom');
    bloomFolder.add(this.passes.bloomPass, 'enabled').name('Enabled');
    bloomFolder.add(this.passes.bloomPass, 'strength', 0, 3, 0.01).name('Strength');
    bloomFolder.add(this.passes.bloomPass, 'radius', 0, 2, 0.01).name('Radius');
    bloomFolder.add(this.passes.bloomPass, 'threshold', 0, 1, 0.01).name('Threshold');

    // Gamma correction
    const gammaFolder = postProcessingFolder.addFolder('Gamma Correction');
    gammaFolder.add(this.passes.gammaPass, 'enabled').name('Enabled');

    // Performance info
    postProcessingFolder.add(this, 'getPassCount').name('Pass Count').listen();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    // You could add logic here to toggle all passes if needed
  }

  resize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  render() {
    if (this.enabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  update() {
    // Update any time-based post-processing effects here
    // For example, you could add pulsing bloom or other animated effects
  }

  // Getters
  getPassCount() {
    return this.composer ? this.composer.passes.length : 0;
  }

  getComposer() {
    return this.composer;
  }

  // Add a new pass dynamically
  addPass(pass, name) {
    if (this.composer && pass) {
      this.composer.addPass(pass);
      this.passes[name] = pass;
      return true;
    }
    return false;
  }

  // Remove a pass
  removePass(name) {
    if (this.passes[name]) {
      const index = this.composer.passes.indexOf(this.passes[name]);
      if (index > -1) {
        this.composer.passes.splice(index, 1);
        delete this.passes[name];
        return true;
      }
    }
    return false;
  }

  // Clean up
  dispose() {
    if (this.composer) {
      this.composer.passes.forEach(pass => {
        if (pass.dispose) pass.dispose();
      });
      this.composer.dispose();
    }
  }
}