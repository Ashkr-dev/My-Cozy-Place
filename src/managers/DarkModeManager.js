import gsap from "gsap";
import { Howl } from "howler";

const popSound = new Howl({
  src: ["pop-sound.mp3"],
  preload: true, // Add preload to ensure it's ready
  volume: 0.2,
  fade: true,
});


export class DarkModeManager {
  constructor(bakedMaterial, gui) {
    this.bakedMaterial = bakedMaterial;
    this.gui = gui;
    this.gsap = gsap;
    this.isDarkMode = false;
    this.toggleButton = document.querySelector(".toggle-theme");
    this.soundEnabled = true; // Add sound toggle flag

    this.init();
  }

  init() {
    // Set up GUI controls
    this.setupGUI();

    // Set up event listeners
    this.setupEventListeners();

    // Set initial state
    this.updateTheme();
  }

  setupGUI() {
    const themeFolder = this.gui.addFolder("Theme");
    themeFolder
      .add(this.bakedMaterial.uniforms.uNightMix, "value")
      .min(0)
      .max(1)
      .name("Night Mix")
      .onChange((value) => {
        // Sync GUI changes with dark mode state
        this.isDarkMode = value === 0;
        this.updateDOM();
      });

    // Optional: Add sound control to GUI
    themeFolder
      .add(this, 'soundEnabled')
      .name("Toggle Sound");
  }

  setupEventListeners() {
    this.toggleButton.addEventListener("click", () => this.toggle());

    // Optional: Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        this.isDarkMode = e.matches;
        this.updateTheme();
      });

      // Set initial state based on system preference
      this.isDarkMode = mediaQuery.matches;
      this.updateTheme();
    }

    // Hover Animation
    this.toggleButton.addEventListener("pointerenter", () => {
      this.gsap.to(this.toggleButton, {
        scale: 1.5,
        ease: "back.out(2)",
        duration: 0.5,
        rotate: "-15deg",
      });
    });

    this.toggleButton.addEventListener("pointerleave", () => {
      this.gsap.to(this.toggleButton, {
        scale: 1,
        ease: "back.out(2)",
        duration: 0.5,
        rotate: 0,
      });
    });
  }

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    
    // Play pop sound when toggling
    this.playToggleSound();
    
    // Add click animation
    this.animateToggle();
    
    this.updateTheme();
  }

  playToggleSound() {
    if (this.soundEnabled && popSound) {
      // Stop any currently playing instance to avoid overlap
      popSound.stop();
      
      // Play the sound
      popSound.play();
      
      // Optional: Add slight random pitch variation for more natural sound
      const pitch = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
      popSound.rate(pitch);
    }
  }

  animateToggle() {
    // Click animation - quick scale down then back up
    // this.gsap.to(this.toggleButton, {
    //   scale: 0.8,
    //   duration: 0.1,
    //   ease: "power2.in",
    //   onComplete: () => {
    //     this.gsap.to(this.toggleButton, {
    //       scale: 1.2,
    //       duration: 0.2,
    //       ease: "back.out(1.7)",
    //       onComplete: () => {
    //         this.gsap.to(this.toggleButton, {
    //           scale: 1,
    //           duration: 0.1
    //         });
    //       }
    //     });
    //   }
    // });

    // // Optional: Add rotation animation on click
    // this.gsap.to(this.toggleButton, {
    //   rotation: "+=360",
    //   duration: 0.6,
    //   ease: "back.out(1.7)"
    // });
  }

  updateTheme() {
    // Update material uniform
    this.bakedMaterial.uniforms.uNightMix.value = this.isDarkMode ? 0 : 1;

    // Update GUI to reflect changes
    this.bakedMaterial.uniforms.uNightMix.needsUpdate = true;

    // Update DOM
    this.updateDOM();
  }

  updateDOM() {
    if (this.isDarkMode) {
      document.body.classList.add("dark");
      this.toggleButton.setAttribute("aria-pressed", "true");
      this.toggleButton.setAttribute("aria-label", "Switch to light mode");
    } else {
      document.body.classList.remove("dark");
      this.toggleButton.setAttribute("aria-pressed", "false");
      this.toggleButton.setAttribute("aria-label", "Switch to dark mode");
    }
  }

  // Public method to get current state
  getIsDarkMode() {
    return this.isDarkMode;
  }

  // Public method to set state programmatically
  setDarkMode(isDark) {
    this.isDarkMode = isDark;
    this.updateTheme();
  }

  // Method to enable/disable sound
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }
}