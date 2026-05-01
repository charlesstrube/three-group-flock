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
      params.predator.radius.cohesion,
      (particle) => particle.data!.position,
    );
    if (count > 0) {
      // average
      point.divideScalar(count);
      // goes toward position
      point.sub(this.position);
      // magnitude
      point.setLength(params.predator.maxSpeed);
      // remove evlocity
      point.sub(this.velocity);
      // limit
      point.clampLength(0, params.predator.maxForce);
    }
    return point;
  }

  // Predators only avoid other predators, not birds.
  separation(particles: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      particles,
      params.predator.radius.separation,
      (point) => {
        // only goes away from other predators
        if (point.data!.type === "predator") {
          const diff = this.position.clone().sub(point.data!.position);
          diff.divideScalar(point.distance);
          return diff;
        }
        return new Vector3();
      },
    );
    if (count > 0) {
      // average
      steering.divideScalar(count);
      // magnitude
      steering.setLength(params.predator.maxSpeed);
      // remove velocity
      steering.sub(this.velocity);
      // limit
      steering.clampLength(0, params.predator.maxForce);
    }
    return steering;
  }

  // No alignment: predators don't try to match velocity with their neighbors.
  flock(particles: PointOctree<Particle>) {
    this.acceleration.add(this.cohesion(particles));
    this.acceleration.add(this.separation(particles));
  }
}
