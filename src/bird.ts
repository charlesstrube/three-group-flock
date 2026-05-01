import type { PointOctree } from "sparse-octree";
import { params } from "./gui";
import { Particle } from "./particle";

export class Bird extends Particle {
  type = "bird" as const;

  // Steer toward the average position of nearby birds.
  cohesion(octotree: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      octotree,
      params.radius.cohesion,
      (point) => point.data!.position,
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

  // Steer away from nearby particles. Dividing by distance makes the force
  // stronger for closer neighbors. Predators trigger 3x the repulsion force.
  separation(octotree: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      octotree,
      params.radius.separation,
      (point) => {
        const diff = this.position.clone().sub(point.data!.position);
        diff.divideScalar(point.distance);

        if (point.data!.type === "predator") {
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

  // Steer toward the average velocity of nearby birds.
  align(point: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      point,
      params.radius.alignment,
      (particle) => particle.data!.velocity,
    );
    if (count > 0) {
      steering.divideScalar(count);
      steering.setLength(params.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, params.maxForce);
    }
    return steering;
  }

  flock(particles: PointOctree<Particle>) {
    this.acceleration.add(this.cohesion(particles));
    this.acceleration.add(this.align(particles));
    this.acceleration.add(this.separation(particles));
  }
}
