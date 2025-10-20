import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import CoffeeSmokeMaterial from "./materials/CoffeeSmoke";
import FireMaterial from "./materials/fire";
import CandlesMaterial from "./materials/Candles";
import OverlayManager from "./managers/OverlayManager.js";
import Stats from "stats.js";
import gsap from "gsap";

/**
 * Stats
 */

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

/**
 * Base
 */
// Debug
const debugObject = {
  // Fairy & Lamp color
  color: "#f4f3d7",
  clearColor: "#02020d",
};

const gui = new GUI({
  width: 400,
});
gui.hide();
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager();

const textureLoader = new THREE.TextureLoader(loadingManager);
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("draco/");
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Overlay Manager
 */
const overlayManager = new OverlayManager(loadingManager, gui);
overlayManager.addToScene(scene);

/**
 * Baked Textures & Perlin
 */
const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

// Baked Texture
const bakedTexture = textureLoader.load("./Baked7.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Baked Material
 */
const bakedMaterial = new THREE.MeshBasicMaterial({
  map: bakedTexture,
});

/**
 * Emissive Material
 */
const LampBulbMaterial = new THREE.MeshBasicMaterial({
  color: debugObject.color,
});
const emissiveFolder = gui.addFolder("Lamp & Fairy emissions");
emissiveFolder.addColor(debugObject, "color").onChange(() => {
  LampBulbMaterial.color.set(debugObject.color);
});

/**
 * Coffee Smoke Material
 */
const coffeeSmokeMaterial = new CoffeeSmokeMaterial(perlinTexture);

/**
 * Fire Material
 */
const fireMaterial = new FireMaterial(perlinTexture, gui);

/**
 * Candles
 */
const candleMaterial = new CandlesMaterial(perlinTexture, gui);

/**
 * Models
 */
let vinylDisc = null;
let vinylArm = null;
const cozy_place = gltfLoader.load("./cozy_place4.glb", (gltf) => {
  // Baked Mesh
  const bakedMesh = gltf.scene.getObjectByName("baked");
  bakedMesh.material = bakedMaterial;
  bakedMesh.renderOrder = 2;

  /**
   * Emissions
   */
  // Lamps
  const TraditionalLampBulbEmission = gltf.scene.getObjectByName(
    "Traditional-Lamp-Bulb-Emission"
  );
  const ArcLampBulbEmission = gltf.scene.getObjectByName(
    "Arc-Lamp-Bulb-Emission"
  );
  const BuffetLampBulbEmission = gltf.scene.getObjectByName(
    "Buffet-Lamp-Bulb-Emission"
  );
  TraditionalLampBulbEmission.material = LampBulbMaterial;
  ArcLampBulbEmission.material = LampBulbMaterial;
  BuffetLampBulbEmission.material = LampBulbMaterial;

  // Fairy Lights
  const FairyLightsEmission = gltf.scene.getObjectByName("Fairy-Bulb-Emission");
  FairyLightsEmission.material = LampBulbMaterial;

  // Candles
  const candlesThread = gltf.scene.getObjectByName("Candles-Emission");
  candlesThread.material = new THREE.MeshBasicMaterial({
    color: "#000000",
  });

  // Coffee Smoke
  const coffeeSmoke = gltf.scene.getObjectByName("coffee-smoke");
  coffeeSmoke.material = coffeeSmokeMaterial;
  coffeeSmoke.renderOrder = 1;

  // FirePlace Fire
  const fire = gltf.scene.getObjectByName("fire");
  fire.material = fireMaterial;

  // Candles
  const candles = gltf.scene.getObjectByName("Candles");
  candles.material = candleMaterial;

  // Vinyl-player
  vinylDisc = gltf.scene.getObjectByName("vinyl-disc");
  vinylDisc.material = bakedMaterial;

  // Vinyl-arm
  vinylArm = gltf.scene.getObjectByName("vinyl-arm");
  vinylArm.material = bakedMaterial;
  let tl = gsap.timeline();
  tl.to(vinylArm.rotation, {
    y: Math.PI / -6,
    duration: 4,
    delay: 5,
    ease: "none",
  });
  tl.to(vinylArm.rotation, {
    x: Math.PI / 30,
  });
  tl.to(vinylDisc.rotation, {
    y: Math.PI * 2,
    duration: 4,
    repeat: -1,
    ease: "none",
  });

  gltf.scene.scale.set(0.2, 0.2, 0.2);
  gltf.scene.position.set(0, -0.5, 0);
  scene.add(gltf.scene);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(debugObject.clearColor);

// Add clear color control to GUI
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  // Update materials
  coffeeSmokeMaterial.uniforms.uTime.value = elapsedTime;
  fireMaterial.uniforms.uTime.value = elapsedTime;
  candleMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  stats.end();
};

tick();
