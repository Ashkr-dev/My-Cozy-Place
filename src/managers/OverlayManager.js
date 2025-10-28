import * as THREE from "three";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default class OverlayManager {
  constructor(loadingManager, gui) {
    this.loadingManager = loadingManager;
    this.gui = gui;
    this.loadingBar = document.querySelector(".loading-bar");
    this.setupOverlay();
    this.setupLoadingManager();
    this.loadingAnimation = document.querySelector(".loading-animation");

    // Track if we've already set up SplitText
    this.splitTextCreated = false;
    this.splitInstance = null;

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
      document.querySelectorAll("#toggle").forEach((toggle) => {
        gsap.to(toggle, { duration: 0.5, opacity: 1, ease: "power2.inOut" });
      });
      gsap.to(this.overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
      });

      // Animate the loading text out
      gsap.to(this.loadingAnimation, { 
        duration: 0.5, 
        opacity: 0,
        onComplete: () => {
          this.loadingAnimation.style.display = "none";
        }
      });

      this.loadingBar.classList.add("ended");
      this.loadingBar.style.transform = "";
    });
  }
  
  
  onProgress(itemsLoaded, itemsTotal) {
    const progressRatio = itemsLoaded / itemsTotal;
    this.loadingBar.style.transform = `scaleX(${progressRatio})`;

    // Only create SplitText ONCE, not on every progress update!
    if (!this.splitTextCreated && this.loadingAnimation) {
      this.splitTextCreated = true;
      
      // Wait a tiny bit to ensure DOM is ready
      setTimeout(() => {
        this.createSplitTextAnimation();
      }, 100);
    }
  }
  
  createSplitTextAnimation() {
    try {
      // Clean up any existing instance
      if (this.splitInstance) {
        this.splitInstance.revert();
      }

      // Create SplitText
      this.splitInstance = new SplitText(this.loadingAnimation, {
        type: "words",
        wordsClass: "word",
      });

      // Animate the words
      gsap.from(this.splitInstance.words, {
        y: 100,
        duration: 1, // Fixed duration, not based on progressRatio
        opacity: 0,
        ease: "power2.inOut",
        stagger: 0.1,
        onStart: () => {
          this.loadingAnimation.style.opacity = 1;
        }
      });
    } catch (error) {
      console.warn("SplitText animation failed:", error);
    }
  }

  addToScene(scene) {
    scene.add(this.overlay);
  }

  getOverlayMaterial() {
    return this.overlayMaterial;
  }

  // Clean up method
  destroy() {
    if (this.splitInstance) {
      this.splitInstance.revert();
    }
  }
}