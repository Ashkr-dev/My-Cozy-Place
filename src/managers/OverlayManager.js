import * as THREE from "three";
import gsap from "gsap";

export default class OverlayManager {
  constructor(loadingManager, gui) {
    this.loadingManager = loadingManager;
    this.gui = gui;
    this.loadingBar = document.querySelector(".loading-bar");
    this.setupOverlay();
    this.setupLoadingManager();

    // Add these critical properties:
    this.overlayMaterial.depthWrite = false;
    this.overlayMaterial.depthTest = false;
    this.overlay.renderOrder = 999;
  }

  setupOverlay() {
    // Create overlay geometry and material
    const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    const overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: new THREE.Uniform(1),
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uAlpha;
        void main() {
          gl_FragColor = vec4(0, 0, 0, uAlpha);
        }
      `,
    });

    this.overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    this.overlayMaterial = overlayMaterial;
  }

  setupLoadingManager() {
    // Set up loading manager callbacks
    this.loadingManager.onLoad = () => {
      this.onLoadComplete();
    };

    this.loadingManager.onProgress = (itemsUrl, itemsLoaded, itemsTotal) => {
      this.onProgress(itemsLoaded, itemsTotal);
    };
  }

  onLoadComplete() {
    gsap.delayedCall(0.5, () => {
      this.gui.show();
      gsap.to(this.overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
      });
      this.loadingBar.classList.add("ended");
      this.loadingBar.style.transform = "";

      
    });
  }

  onProgress(itemsLoaded, itemsTotal) {
    const progressRatio = itemsLoaded / itemsTotal;
    this.loadingBar.style.transform = `scaleX(${progressRatio})`;
  }

  addToScene(scene) {
    scene.add(this.overlay);
  }

  getOverlayMaterial() {
    return this.overlayMaterial;
  }
}
