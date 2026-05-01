import type { PointOctree } from "sparse-octree";
import { params } from "./gui";
import { Particle } from "./particle";

export class Bird extends Particle {
  type = "bird" as const;

  // Steer toward the average position of nearby birds.
  cohesion(octree: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      octree,
      params.bird.radius.cohesion,
      (point) => point.data!.position,
    );
    if (count > 0) {
      // average
      steering.divideScalar(count);
      // go toward position
      steering.sub(this.position);
      // magnitude
      steering.setLength(params.bird.maxSpeed);
      // remove velocity
      steering.sub(this.velocity);
      // limit
      steering.clampLength(0, params.bird.maxForce);
    }
    return steering;
  }

  // Steer away from nearby particles. Dividing by distance makes the force
  // stronger for closer neighbors. Predators trigger 3x the repulsion force.
  separation(octree: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      octree,
      params.bird.radius.separation,
      (point) => {
        // gets the opposite direction
        const diff = this.position.clone().sub(point.data!.position);
        diff.divideScalar(point.distance);

        // makes them super afraid of predator
        if (point.data!.type === "predator") {
          diff.multiplyScalar(3);
        }
        return diff;
      },
    );
    if (count > 0) {
      // average
      steering.divideScalar(count);
      // magnitude
      steering.setLength(params.bird.maxSpeed);
      // remove velocity
      steering.sub(this.velocity);
      // limit
      steering.clampLength(0, params.bird.maxForce);
    }
    return steering;
  }

  // Steer toward the average velocity of nearby birds.
  align(point: PointOctree<Particle>) {
    const { steering, count } = this.getSteering(
      point,
      params.bird.radius.alignment,
      (particle) => particle.data!.velocity,
    );
    if (count > 0) {
      // average
      steering.divideScalar(count);
      // magnitude
      steering.setLength(params.bird.maxSpeed);
      // remove velocity
      steering.sub(this.velocity);
      // limite
      steering.clampLength(0, params.bird.maxForce);
    }
    return steering;
  }

  flock(particles: PointOctree<Particle>) {
    this.acceleration.add(this.cohesion(particles));
    this.acceleration.add(this.align(particles));
    this.acceleration.add(this.separation(particles));
  }
}
