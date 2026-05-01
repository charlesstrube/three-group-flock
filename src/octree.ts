import { PointOctree } from "sparse-octree";
import { Vector3 } from "three";
import { EDGES } from "./gui";
import { Particle } from "./particle";

const min = new Vector3(-EDGES.width, -EDGES.width, -EDGES.width);
const max = new Vector3(EDGES.width, EDGES.width, EDGES.width);

// A new octree is created every frame because sparse-octree has no clear() method.
// Bounds match the world edges defined in EDGES so no particle falls outside the tree.
export function createOctree() {
  return new PointOctree<Particle>(min, max);
}

// Must be called once per frame BEFORE any flock() call so every particle
// can query the full, up-to-date spatial index of its neighbors.
export function populateOctree(
  particles: Particle[],
  octree: PointOctree<Particle>,
) {
  for (let i = 0; i < particles.length; i++) {
    octree.set(particles[i].position, particles[i]);
  }
}
