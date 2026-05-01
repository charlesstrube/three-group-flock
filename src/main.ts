import "./style.css";
import * as THREE from "three";

import { scene, camera, renderer } from "./scene";
import {
  createGeometry,
  birdMaterial,
  birds,
  updateGeometry,
  predatorMaterial,
  predators,
  life,
} from "./particles";
import { stats } from "./gui";

const birdGeometry = createGeometry(birds);
const predatorGeometry = createGeometry(predators);

const birdPoints = new THREE.Points(birdGeometry, birdMaterial);
const predatorPoints = new THREE.Points(predatorGeometry, predatorMaterial);

scene.add(birdPoints);
scene.add(predatorPoints);

function animate() {
  stats.begin();

  updateGeometry(birdGeometry, life);
  updateGeometry(predatorGeometry, life);

  // const currentTime = performance.now();
  // const deltaTime = currentTime - time;
  // time = currentTime;

  renderer.render(scene, camera);
  stats.end();
}
renderer.setAnimationLoop(animate);
