import { Vector3 } from "three";
import { params } from "./gui";
import { Particle } from "./particle";
import type { PointOctree } from "sparse-octree";

export class Predator extends Particle {
  type = "predator" as const;
  color: string = "#f00";

  // Predators chase all nearby entities (birds + other predators).
  cohesion(particles: PointOctree<Particle>) {
    const { steering: point, count } = this.getSteering(
      particles,
      0.5,
      (particle) => particle.data!.position,
    );
    if (count > 0) {
      point.divideScalar(count);
      point.sub(this.position);
      point.setLength(params.maxSpeed);
      point.sub(this.velocity);
      point.clampLength(0, params.maxForce);
    }
    return point;
  }

  // Predators only avoid other predators, not birds.
  separation(particles: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(particles, 0.2, (point) => {
      if (point.data!.type === "predator") {
        const diff = this.position.clone().sub(point.data!.position);
        diff.divideScalar(point.distance);
        return diff;
      }
      return new Vector3();
    });
    if (count > 0) {
      steering.divideScalar(count);
      steering.setLength(params.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, params.maxForce);
    }
    return steering;
  }

  // No alignment: predators don't try to match velocity with their neighbors.
  flock(particles: PointOctree<Particle>) {
    this.acceleration.add(this.cohesion(particles));
    this.acceleration.add(this.separation(particles));
  }
}
