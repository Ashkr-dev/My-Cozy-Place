import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import CoffeeSmokeMaterial from "./materials/CoffeeSmoke";
import FireMaterial from "./materials/fire";
import CandlesMaterial from "./materials/Candles";
/**
 * Base
 */
// Debug
const debugObject = {
  // Fairy & Lamp color
  color: "#f4f3d7",
};
const gui = new GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();
const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

// Baked Texture
const bakedTexture = textureLoader.load("./Baked7.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

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
const cozy_place = gltfLoader.load("./cozy_place4.glb", (gltf) => {
  // Baked Mesh
  const bakedMesh = gltf.scene.getObjectByName("Baked");
  bakedMesh.material = bakedMaterial;

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

  // FirePlace Fire
  const fire = gltf.scene.getObjectByName("fire");
  fire.material = fireMaterial;

  // Candles
  const candles = gltf.scene.getObjectByName("Candles");
  candles.material = candleMaterial;

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

debugObject.clearColor = "#02020d";
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
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
};

tick();
