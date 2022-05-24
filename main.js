import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);
let clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
camera.position.set(0, 0, 100);

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

let mixer;

const fbxLoader = new FBXLoader();
fbxLoader.load(
  "models/pose-finish.fbx",
  (object) => {
    mixer = new THREE.AnimationMixer(object);
    const animationAction = mixer.clipAction(object.animations[0]);
    object.scale.set(0.05, 0.05, 0.05);
    animationAction.play();
    scene.add(object);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

function tick() {
  requestAnimationFrame(tick);
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  controls.update();

  renderer.render(scene, camera);
}

tick();
