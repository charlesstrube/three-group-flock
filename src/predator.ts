import { Vector3 } from "three";
import { params } from "./gui";
import { Particle } from "./particle";

export class Predator extends Particle {
  type = "predator" as const;
  color: string = "#f00";

  cohesion(particles: Particle[]) {
    const { steering, count } = this.getSteering(
      particles,
      0.5,
      (particle) => particle.position,
    );
    if (count > 0) {
      steering.divideScalar(count);
      steering.sub(this.position);
      steering.setLength(params.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, params.maxForce);
    }
    return steering;
  }

  separation(particles: Particle[]) {
    const { steering, count } = this.getSteering(
      particles,
      0.2,
      (particle, distance) => {
        if (particle.type === "predator") {
          const diff = this.position.clone().sub(particle.position);
          diff.divideScalar(distance);
          // diff.multiplyScalar(4);
          return diff;
        }
        return new Vector3();
      },
    );
    if (count > 0) {
      steering.divideScalar(count);
      steering.setLength(params.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, params.maxForce);
    }
    return steering;
  }

  flock(particles: Particle[]) {
    this.acceleration.add(this.cohesion(particles));
    this.acceleration.add(this.separation(particles));
  }
}
