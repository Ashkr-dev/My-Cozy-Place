import gsap from "gsap";
import { Howl, Howler } from "howler";

// Create a sound instance
const backgroundMusic = new Howl({
  src: ["backgroundMusic.mp3"],
  loop: true,
});

Howler.volume(0.2);

export class VinylPlayerManager {
  constructor() {
    this.vinylDisc = null;
    this.vinylArm = null;
    this.vinylPlayer = null;
    this.interactiveObjects = [];

    this.state = {
      isPlaying: false,
      armAnimation: null,
      discAnimation: null,
    };
  }

  // Initialize with the vinyl objects from the GLTF model
  initialize(vinylDisc, vinylArm, vinylPlayer = null) {
    this.vinylDisc = vinylDisc;
    this.vinylArm = vinylArm;
    this.vinylPlayer = vinylPlayer;

    // Set up interactive objects for raycasting
    if (this.vinylDisc) {
      this.interactiveObjects.push(this.vinylDisc);
      this.vinylDisc.userData.isInteractive = true;
    }
    if (this.vinylArm) {
      this.interactiveObjects.push(this.vinylArm);
      this.vinylArm.userData.isInteractive = true;
    }
    if (this.vinylPlayer) {
      this.interactiveObjects.push(this.vinylPlayer);
      this.vinylPlayer.userData.isInteractive = true;
    }

    return this.interactiveObjects;
  }

  // Handle click on vinyl player
  handleClick() {
    if (this.state.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    this.state.isPlaying = !this.state.isPlaying;

    this.flashCursor();
  }

  // Start vinyl player animation
  start() {
    if (!this.vinylDisc || !this.vinylArm) {
      console.warn("Vinyl player components not found");
      return;
    }

    // Start disc rotation
    this.state.discAnimation = gsap.to(this.vinylDisc.rotation, {
      y: Math.PI * 2,
      duration: 4,
      repeat: -1,
      ease: "none",
    });

    // Move arm to playing position
    this.state.armAnimation = gsap
      .timeline()
      .to(this.vinylArm.rotation, {
        y: Math.PI / -6,
        duration: 2,
        ease: "power2.inOut",
      })
      .to(this.vinylArm.rotation, {
        x: Math.PI / 30,
        duration: 1,
        ease: "power2.out",
      });

    // Play the backgroundMusic
    backgroundMusic.play();
  }

  // Stop vinyl player animation
  stop() {
    // Stop disc rotation
    if (this.state.discAnimation) {
      this.state.discAnimation.kill();
    }

    // Reset disc rotation to original position
    if (this.vinylDisc) {
      gsap.to(this.vinylDisc.rotation, {
        y: 0,
        duration: 1,
        ease: "power2.out",
      });
    }

    // Move arm back to resting position
    if (this.state.armAnimation) {
      this.state.armAnimation.kill();
    }

    if (this.vinylArm) {
      gsap
        .timeline()
        .to(this.vinylArm.rotation, {
          x: 0,
          duration: 1,
          ease: "power2.inOut",
        })
        .to(this.vinylArm.rotation, {
          y: 0,
          duration: 1.5,
          ease: "power2.out",
        });
    }

    // Stop the backgroundMusic
    backgroundMusic.pause();
  }

  // Check if an object is part of the vinyl player
  isVinylObject(object) {
    if (!object) return false;

    return (
      object.name.includes("vinyl") ||
      object.name.includes("disc") ||
      object.name.includes("arm") ||
      this.interactiveObjects.includes(object)
    );
  }

  // Visual feedback for interaction
  flashCursor() {
    document.body.style.cursor = "pointer";
    setTimeout(() => {
      // Reset cursor if not hovering over vinyl anymore
      if (!document.body.classList.contains("hovering-vinyl")) {
        document.body.style.cursor = "default";
      }
    }, 300);
  }

  // Update method for any per-frame updates
  update() {
    // Could add per-frame updates here if needed
  }

  // Getter for current state
  getState() {
    return this.state.isPlaying;
  }

  // Getter for interactive objects (for raycasting)
  getInteractiveObjects() {
    return this.interactiveObjects;
  }

  // Clean up method
  dispose() {
    this.stop();
    this.interactiveObjects = [];
  }
}
