import * as THREE from "three";
import candleVertexShader from "../shaders/candles/vertex.glsl";
import candleFragmentShader from "../shaders/candles/fragment.glsl";

export default class CandlesMaterial {
  constructor(perlinTexture, gui) {
    // Default Configuration
    this.debugObject = {
      candleFireFirstColor: "#ff6600",
      candleFireSecondColor: "#ff7b00",
      candleFireTopColor: "#d5c98b",
      candleFireTopIntensity: 1.5,
      candleDistortWavyMotion: 0.01,
      candleRisingSpeed: 0.15,
      candleFireIntensity: 1.8,
      candleFireRemapX: 0.4,
      candleFireRemapY: 0.26,
    };

    // Material
    this.material = new THREE.ShaderMaterial({
      vertexShader: candleVertexShader,
      fragmentShader: candleFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
        uFireIntensity: new THREE.Uniform(1.5),
        uFireFirstColor: new THREE.Uniform(
          new THREE.Color(this.debugObject.candleFireFirstColor)
        ),
        uFireSecondColor: new THREE.Uniform(
          new THREE.Color(this.debugObject.candleFireSecondColor)
        ),
        uFireTopColor: new THREE.Uniform(
          new THREE.Color(this.debugObject.candleFireTopColor)
        ),
        uFireTopIntensity: new THREE.Uniform(
          this.debugObject.candleFireTopIntensity
        ),
        uDistortWavyMotion: new THREE.Uniform(
          this.debugObject.candleDistortWavyMotion
        ),
        uRisingSpeed: new THREE.Uniform(this.debugObject.candleRisingSpeed),
        uFireRemapX: new THREE.Uniform(this.debugObject.candleFireRemapX),
        uFireRemapY: new THREE.Uniform(this.debugObject.candleFireRemapY),
      },
      side: THREE.DoubleSide,
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
    const candleFolder = gui.addFolder("Candles");
    candleFolder.addColor(this.debugObject, "candleFireFirstColor").onChange(() => {
      this.material.uniforms.uFireFirstColor.value.set(
        new THREE.Color(this.debugObject.candleFireFirstColor)
      );
    });
    candleFolder.addColor(this.debugObject, "candleFireSecondColor").onChange(() => {
      this.material.uniforms.uFireSecondColor.value.set(
        new THREE.Color(this.debugObject.candleFireSecondColor)
      );
    });
    candleFolder.addColor(this.debugObject, "candleFireTopColor").onChange(() => {
      this.material.uniforms.uFireTopColor.value.set(
        new THREE.Color(this.debugObject.candleFireTopColor)
      );
    });
    candleFolder
      .add(this.debugObject, "candleFireTopIntensity")
      .min(0)
      .max(10)
      .step(0.1)
      .onChange(() => {
        this.material.uniforms.uFireTopIntensity.value =
          this.debugObject.candleFireTopIntensity;
      });
    candleFolder
      .add(this.debugObject, "candleDistortWavyMotion")
      .min(0)
      .max(0.5)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uDistortWavyMotion.value =
          this.debugObject.candleDistortWavyMotion;
      });
    candleFolder
      .add(this.debugObject, "candleRisingSpeed")
      .min(0)
      .max(0.5)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uRisingSpeed.value =
          this.debugObject.candleRisingSpeed;
      });

    candleFolder
      .add(this.debugObject, "candleFireIntensity")
      .min(0)
      .max(5)
      .step(0.1)
      .onChange(() => {
        this.material.uniforms.uFireIntensity.value =
          this.debugObject.candleFireIntensity;
      });

    candleFolder
      .add(this.debugObject, "candleFireRemapX")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uFireRemapX.value = this.debugObject.candleFireRemapX;
      });
    candleFolder
      .add(this.debugObject, "candleFireRemapY")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uFireRemapY.value = this.debugObject.candleFireRemapY;
      });
  }
  
  // Optional: Method to update time if you want more control
  updateTime(time) {
    this.material.uniforms.uTime.value = time;
  }
}
