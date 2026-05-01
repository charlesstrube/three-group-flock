import * as THREE from "three";
import { params } from "./gui";

function createRandomVector(magnitude = 0.01): THREE.Vector3 {
  return new THREE.Vector3(
    Math.random() * magnitude - magnitude / 2,
    Math.random() * magnitude - magnitude / 2,
    Math.random() * magnitude - magnitude / 2,
  );
}

export class Particle {
  position: THREE.Vector3 = createRandomVector(2);
  velocity: THREE.Vector3 = this.normalizeVelocity();
  acceleration: THREE.Vector3 = new THREE.Vector3();
  color: string = "#fff";
  type: "bird" | "predator" | "none" = "none";

  setEdge(axis: "x" | "y" | "z") {
    const max = 2;
    const min = 0 - max;
    const position = this.position[axis];
    const setter = `set${axis.toUpperCase()}` as "setX" | "setY" | "setZ";

    if (position > max) {
      this.position[setter](min);
    }
    if (position < min) {
      this.position[setter](max);
    }
  }

  edges() {
    this.setEdge("x");
    this.setEdge("y");
    this.setEdge("z");
  }

  getSteering(
    particles: Particle[],
    perceptionRadius: number,
    vectorToAddCb: (particle: Particle, distance: number) => THREE.Vector3,
  ) {
    const steering = new THREE.Vector3();
    let count = 0;
    for (let particle of particles) {
      const distance = this.position.distanceTo(particle.position);
      if (particle !== this && distance < perceptionRadius) {
        count += 1;
        steering.add(vectorToAddCb(particle, distance));
      }
    }

    return { steering, count };
  }

  // @ts-ignore
  flock(particles: Particle[]) {}

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, params.maxSpeed);
    this.acceleration.multiplyScalar(0);
  }

  private normalizeVelocity(): THREE.Vector3 {
    return createRandomVector().normalize().multiplyScalar(0.01);
  }
}
