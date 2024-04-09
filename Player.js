import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { axes } from "./gamepad";
export class Player extends THREE.Object3D {
  constructor() {
    super();
    this.animationActions = [];
    this.lastAction;
    this.activeAction;
    this._mixer;
    this.loadFBX();
    this.playerControl = { axis: axes, pose: 0 };
    this.tick();
    this.clock = new THREE.Clock();
  }
  async loadFBX() {
    const fbxLoader = new FBXLoader();

    fbxLoader.load(
      "models/idle.fbx",
      (object) => {
        const mixer = new THREE.AnimationMixer(object);
        this._mixer = mixer;
        this.add(object);
        const animationAction = mixer.clipAction(object.animations[0]);
        object.scale.set(0.05, 0.05, 0.05);
        // 参考: https://stackoverflow.com/questions/63187764/switch-off-lights-a-fbx-model-in-threejs
        object.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.animationActions.push(animationAction);
        this.activeAction = this.animationActions[0];
        this.activeAction.play();
        fbxLoader.load("models/walk.fbx", (object) => {
          console.log("loaded walk");
          const animationAction = mixer.clipAction(object.animations[0]);
          this.animationActions.push(animationAction);
          fbxLoader.load("models/run.fbx", (object) => {
            console.log("loaded run");
            const animationAction = mixer.clipAction(object.animations[0]);
            this.animationActions.push(animationAction);

            fbxLoader.load("models/laying.fbx", (object) => {
              console.log("loaded laying");
              const animationAction = mixer.clipAction(object.animations[0]);
              this.animationActions.push(animationAction);
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
  }

  setAction(toAction) {
    if (toAction != this.activeAction) {
      this.lastAction = this.activeAction;
      this.activeAction = toAction;
      //this.lastAction.stop()
      this.lastAction.fadeOut(1);
      this.activeAction.reset();
      this.activeAction.fadeIn(1);
      this.activeAction.play();
    }
  }
  tick() {
    window.requestAnimationFrame(this.tick.bind(this));
    if (this._mixer) {
      this._mixer.update(this.clock.getDelta());
    }
    const axes = this.playerControl.axis;
    if (axes.length) {
      const ax = Math.abs(axes[1]);
      if (ax > 0.6) {
        this.setAction(this.animationActions[2]);
      } else if (ax > 0) {
        this.setAction(this.animationActions[1]);
      } else {
        this.setAction(this.animationActions[0]);
      }
      this.rotateY(axes[0] * -0.08);
      if (Math.abs(axes[0]) < 0.01) {
        this.translateZ(axes[1] * -2);
      } else {
        this.translateZ(axes[1] * -1);
      }
    }
  }
}
