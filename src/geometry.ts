import * as THREE from "three";
import type { Particle } from "./particle";
import { Bird } from "./bird";
import { Predator } from "./predator";
import type { PointOctree } from "sparse-octree";

export function createGeometry(points: Particle[]) {
  const vertices: number[] = [];
  const colors: number[] = [];

  for (const point of points) {
    const [r, g, b] = point.color.replace("#", "").split("");
    colors.push(
      Number.parseInt(r, 16),
      Number.parseInt(g, 16),
      Number.parseInt(b, 16),
    );
    vertices.push(point.position.x, point.position.y, point.position.z);
  }

  const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
  const positionAttribute = new THREE.Float32BufferAttribute(vertices, 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("color", colorAttribute);
  return geometry;
}

// The octree must already be populated before this is called (see main.ts).
export function updateGeometry(
  geometry: THREE.BufferGeometry,
  particles: Particle[],
  octree: PointOctree<Particle>,
) {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.edges(); // wrap around world boundaries
    particle.flock(octree); // compute steering forces via octree neighbor queries
    particle.update(); // apply forces to velocity and position

    // Write updated position directly into the GPU buffer.
    const x = i * 3;
    geometry.attributes.position.array[x] = particle.position.x;
    geometry.attributes.position.array[x + 1] = particle.position.y;
    geometry.attributes.position.array[x + 2] = particle.position.z;
  }
  geometry.attributes.position.needsUpdate = true;
}

export const birdMaterial = new THREE.PointsMaterial({
  size: 0.01,
  transparent: true,
  sizeAttenuation: true,
  vertexColors: true,
});

export const predatorMaterial = new THREE.PointsMaterial({
  size: 0.05,
  transparent: true,
  sizeAttenuation: true,
  vertexColors: true,
});

export const birds = Array(700)
  .fill(null)
  .map(() => new Bird());

export const predators = Array(10)
  .fill(null)
  .map(() => new Predator());

export const life = [...predators, ...birds];
