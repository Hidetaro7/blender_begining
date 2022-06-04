import "./style.css";

// 参考: https://sbcode.net/threejs/fbx-animation/

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { axes } from "./gamepad";
import { Player } from "./Player";

const playerControl = { axis: axes, pose: 0 };

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
camera.position.set(50, 100, 200);

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
  wireframe: true,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = (-90 * Math.PI) / 180;
ground.receiveShadow = true;
scene.add(ground);

const player = new Player();
scene.add(player);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

function tick() {
  requestAnimationFrame(tick);
  if (player) {
    camera.lookAt(player.position);
  }
  //controls.update();
  renderer.render(scene, camera);
}

tick();
