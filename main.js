import "./style.css";

// 参考: https://sbcode.net/threejs/fbx-animation/

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import GUI from "lil-gui";
import { GamepadListener } from "gamepad.js";

const playerControl = { axis: { rotate: 0, translate: 0 }, pose: 0 };

const listener = new GamepadListener({
  deadZone: 0.1,
});
listener.start();
listener.on("gamepad:axis", function (event) {
  if (event.detail.stick === 0) {
    const ax = event.detail.gamepad.axes;
    //角度のための数値を取得
    if (event.detail.axis === 0) {
      playerControl.axis.rotate = -event.detail.value;
    }

    //移動のための数値を取得
    if (event.detail.axis === 1) {
      playerControl.axis.translate = -event.detail.value;
      if (Math.abs(event.detail.value) === 0) {
        setAction(animationActions[0]);
      } else if (Math.abs(event.detail.value) < 0.4) {
        setAction(animationActions[1]);
      } else {
        setAction(animationActions[2]);
      }
    }
    // 左スティック
  }
  /* console.log("stick: " + event.detail.stick); */
  console.log("axis: " + event.detail.axis);
  console.log("value: " + event.detail.value);
  /* console.log(event.detail.gamepad.axes); */
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);
let clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
camera.position.set(50, 200, 200);

const scene = new THREE.Scene();

const light = new THREE.PointLight(0xffffff, 1, 1800, Math.PI / 4, 0.5);
light.castShadow = true;
light.position.set(0, 200, 200);
scene.add(light);
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
const helper = new THREE.PointLightHelper(light, 50);
scene.add(helper);

const alight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(alight);

const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
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
let playerMesh = null;

const fbxLoader = new FBXLoader();
fbxLoader.load(
  "models/idle.fbx",
  (object) => {
    mixer = new THREE.AnimationMixer(object);
    playerMesh = object;
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
  if (playerControl.axis && playerMesh) {
    playerMesh.rotateY(playerControl.axis.rotate * 0.02);
    playerMesh.translateZ(playerControl.axis.translate * 0.7);
  }
  renderer.render(scene, camera);
}

tick();
