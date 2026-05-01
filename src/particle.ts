import * as THREE from "three";
import { EDGES, params } from "./gui";
import type { PointContainer, PointOctree } from "sparse-octree";

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
    const min = 0 - EDGES.width;
    const position = this.position[axis];
    const setter = `set${axis.toUpperCase()}` as "setX" | "setY" | "setZ";

    if (position > EDGES.width) {
      this.position[setter](min);
    }
    if (position < min) {
      this.position[setter](EDGES.width);
    }
  }

  /**
   * this limit the area to have boundaries
   */
  edges() {
    this.setEdge("x");
    this.setEdge("y");
    this.setEdge("z");
  }

  /**
   *
   * @param points
   * @param perceptionRadius
   * @param vectorToAddCb
   * @returns { }
   */
  getSteering(
    points: PointOctree<Particle>,
    perceptionRadius: number,
    vectorToAddCb: (point: PointContainer<Particle>) => THREE.Vector3,
  ) {
    const steering = new THREE.Vector3();
    let count = 0;

    // findPoints returns only neighbors within the radius — O(log n) instead of O(n).
    // skipSelf=true excludes this particle's own position from the results.
    const pointContainers = points.findPoints(
      this.position,
      perceptionRadius,
      true,
    );

    for (let point of pointContainers) {
      if (point.data) {
        count += 1;
        steering.add(vectorToAddCb(point));
      }
    }

    return { steering, count };
  }

  // @ts-ignore
  flock(particles: PointOctree<Particle>) {}

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    if (this.type !== "none")
      this.velocity.clampLength(0, params[this.type].maxSpeed);
    this.acceleration.multiplyScalar(0);
  }

  private normalizeVelocity(): THREE.Vector3 {
    return createRandomVector().normalize().multiplyScalar(0.01);
  }
}
