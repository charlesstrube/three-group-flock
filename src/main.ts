import "./style.css";

import { scene, camera, renderer } from "./scene";
import {
  createGeometry,
  birdMaterial,
  birds,
  updateGeometry,
  predatorMaterial,
  predators,
  life,
} from "./geometry";
import { stats } from "./gui";
import { Points } from "three";
import { createOctree, populateOctree } from "./octree";
import {
  createOctreeVizualization,
  updateOctreeVizualization,
} from "./octree-vizualization";

const birdGeometry = createGeometry(birds);
const predatorGeometry = createGeometry(predators);

const birdPoints = new Points(birdGeometry, birdMaterial);
const predatorPoints = new Points(predatorGeometry, predatorMaterial);

scene.add(birdPoints);
scene.add(predatorPoints);

const octreeVizualization = createOctreeVizualization();
scene.add(octreeVizualization);

function animate() {
  stats.begin();

  // Build the spatial index once per frame from all entities (birds + predators).
  // Must happen before updateGeometry so flock() queries reflect current positions.
  const octree = createOctree();
  populateOctree(life, octree);

  updateOctreeVizualization(octreeVizualization, octree);

  // Birds and predators have separate geometries but both flock against all of `life`.
  updateGeometry(birdGeometry, life, octree);
  updateGeometry(predatorGeometry, life, octree);

  renderer.render(scene, camera);
  stats.end();
}
renderer.setAnimationLoop(animate);
