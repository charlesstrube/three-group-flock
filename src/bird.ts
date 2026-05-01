import { params } from "./gui";
import { Particle } from "./particle";

export class Bird extends Particle {
  type = "bird" as const;

  cohesion(particles: Particle[]) {
    const { steering, count } = this.getSteering(
      particles,
      params.radius.cohesion,
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
      params.radius.separation,
      (particle, distance) => {
        const diff = this.position.clone().sub(particle.position);
        diff.divideScalar(distance);

        if (particle.type === "predator") {
          diff.multiplyScalar(3);
        }
        return diff;
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

  align(particles: Particle[]) {
    const { steering, count } = this.getSteering(
      particles,
      params.radius.alignment,
      (particle) => particle.velocity,
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
    const alignment = this.align(particles);
    const cohesion = this.cohesion(particles);
    const separation = this.separation(particles);
    this.acceleration.add(cohesion);
    this.acceleration.add(alignment);
    this.acceleration.add(separation);
  }
}
