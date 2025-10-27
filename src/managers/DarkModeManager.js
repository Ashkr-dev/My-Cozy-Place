import gsap from "gsap";

export class DarkModeManager {
  constructor(bakedMaterial, gui) {
    this.bakedMaterial = bakedMaterial;
    this.gui = gui;
    this.gsap = gsap;
    this.isDarkMode = false;
    this.toggleButton = document.querySelector(".toggle-theme");

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
    this.updateTheme();
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
    } else {
      document.body.classList.remove("dark");
      this.toggleButton.setAttribute("aria-pressed", "false");
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
}
