import * as THREE from "three";
import { Particle } from "./particle";
import { Bird } from "./bird";
import { Predator } from "./predator";

export function createGeometry(points: Particle[]) {
  const vertices: number[] = [];
  const colors: number[] = [];

  for (const point of points) {
    const [r, g, b] = point.color.replace("#", "").split("");
    console.log(r, g, b);
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

export function updateGeometry(
  geometry: THREE.BufferGeometry,
  particles: Particle[],
) {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    particle.edges();
    particle.flock(particles);
    particle.update();

    const x = i * 3;
    const y = i * 3 + 1;
    const z = i * 3 + 2;
    geometry.attributes.position.array[x] = particle.position.x;
    geometry.attributes.position.array[y] = particle.position.y;
    geometry.attributes.position.array[z] = particle.position.z;
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
