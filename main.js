import "./style.css";

// 参考: https://sbcode.net/threejs/fbx-animation/

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import GUI from "lil-gui";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);
let clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
camera.position.set(100, 100, 200);

const scene = new THREE.Scene();

const directionalLight = new THREE.SpotLight(0xffffff, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);
directionalLight.position.set(0, 50, 80);
const helper = new THREE.SpotLightHelper(directionalLight, 50);
scene.add(helper);
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x33ff66,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = (-90 * Math.PI) / 180;
ground.receiveShadow = true;
scene.add(ground);

let mixer;
const animationActions = [];
let activeAction;
let lastAction;

const fbxLoader = new FBXLoader();
fbxLoader.load(
  "models/idle.fbx",
  (object) => {
    mixer = new THREE.AnimationMixer(object);
    const animationAction = mixer.clipAction(object.animations[0]);
    object.scale.set(0.05, 0.05, 0.05);
    // 参考: https://stackoverflow.com/questions/63187764/switch-off-lights-a-fbx-model-in-threejs
    object.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    animationActions.push(animationAction);
    animationsFolder.add(animations, "idle");
    activeAction = animationActions[0];
    activeAction.play();
    scene.add(object);
    fbxLoader.load("models/walk.fbx", (object) => {
      console.log("loaded walk");
      const animationAction = mixer.clipAction(object.animations[0]);
      animationActions.push(animationAction);
      animationsFolder.add(animations, "walk");
      fbxLoader.load("models/run.fbx", (object) => {
        console.log("loaded run");
        const animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction);
        animationsFolder.add(animations, "run");

        fbxLoader.load("models/laying.fbx", (object) => {
          console.log("loaded laying");
          const animationAction = mixer.clipAction(object.animations[0]);
          animationActions.push(animationAction);
          animationsFolder.add(animations, "laying");
        });
      });
    });
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

const animations = {
  idle: function () {
    setAction(animationActions[0]);
  },
  walk: function () {
    setAction(animationActions[1]);
  },
  run: function () {
    setAction(animationActions[2]);
  },
  laying: function () {
    setAction(animationActions[3]);
  },
};

const setAction = (toAction) => {
  if (toAction != activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    //lastAction.stop()
    lastAction.fadeOut(1);
    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  }
};

const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
animationsFolder.open();

function tick() {
  requestAnimationFrame(tick);
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  controls.update();

  renderer.render(scene, camera);
}

tick();
