import * as THREE from "three";
import fireVertexShader from "../shaders/fire/vertex.glsl";
import fireFragmentShader from "../shaders/fire/fragment.glsl";

export default class FireMaterial {
  constructor(perlinTexture, gui) {
    // Default configuration
    this.debugObject = {
      fireFirstColor: "#ff6600",
      fireSecondColor: "#ff7b00",
      fireTopColor: "#d5c98b",
      fireTopIntensity: 1.5,
      distortWavyMotion: 0.03,
      risingSpeed: 0.15,
      fireIntensity: 1.8,
      fireRemapX: 0.7,
      fireRemapY: 0.3,
    };

    // Create the material
    this.material = new THREE.ShaderMaterial({
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
        uFireIntensity: new THREE.Uniform(this.debugObject.fireIntensity),
        uFireFirstColor: new THREE.Uniform(
          new THREE.Color(this.debugObject.fireFirstColor)
        ),
        uFireSecondColor: new THREE.Uniform(
          new THREE.Color(this.debugObject.fireSecondColor)
        ),
        uFireTopColor: new THREE.Uniform(
          new THREE.Color(this.debugObject.fireTopColor)
        ),
        uFireTopIntensity: new THREE.Uniform(this.debugObject.fireTopIntensity),
        uDistortWavyMotion: new THREE.Uniform(
          this.debugObject.distortWavyMotion
        ),
        uRisingSpeed: new THREE.Uniform(this.debugObject.risingSpeed),
        uFireRemapX: new THREE.Uniform(this.debugObject.fireRemapX),
        uFireRemapY: new THREE.Uniform(this.debugObject.fireRemapY),
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // Setup GUI if provided
    if (gui) {
      this.setupGUI(gui);
    }

    return this.material;
  }

  setupGUI(gui) {
    const fireFolder = gui.addFolder("Fire");

    fireFolder.addColor(this.debugObject, "fireFirstColor").onChange(() => {
      this.material.uniforms.uFireFirstColor.value.set(
        this.debugObject.fireFirstColor
      );
    });

    fireFolder.addColor(this.debugObject, "fireSecondColor").onChange(() => {
      this.material.uniforms.uFireSecondColor.value.set(
        this.debugObject.fireSecondColor
      );
    });

    fireFolder.addColor(this.debugObject, "fireTopColor").onChange(() => {
      this.material.uniforms.uFireTopColor.value.set(
        this.debugObject.fireTopColor
      );
    });

    fireFolder
      .add(this.debugObject, "fireTopIntensity")
      .min(0)
      .max(10)
      .step(0.1)
      .onChange(() => {
        this.material.uniforms.uFireTopIntensity.value =
          this.debugObject.fireTopIntensity;
      });

    fireFolder
      .add(this.debugObject, "distortWavyMotion")
      .min(0)
      .max(0.5)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uDistortWavyMotion.value =
          this.debugObject.distortWavyMotion;
      });

    fireFolder
      .add(this.debugObject, "risingSpeed")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uRisingSpeed.value =
          this.debugObject.risingSpeed;
      });

    fireFolder
      .add(this.debugObject, "fireIntensity")
      .min(0)
      .max(10)
      .step(0.1)
      .onChange(() => {
        this.material.uniforms.uFireIntensity.value =
          this.debugObject.fireIntensity;
      });

    fireFolder
      .add(this.debugObject, "fireRemapX")
      .min(0)
      .max(1)
      .step(0.1)
      .onChange(() => {
        this.material.uniforms.uFireRemapX.value = this.debugObject.fireRemapX;
      });

    fireFolder
      .add(this.debugObject, "fireRemapY")
      .min(0)
      .max(1)
      .step(0.1)
      .onChange(() => {
        this.material.uniforms.uFireRemapY.value = this.debugObject.fireRemapY;
      });
  }

  // Optional: Method to update time if you want more control
  updateTime(time) {
    this.material.uniforms.uTime.value = time;
  }
}
