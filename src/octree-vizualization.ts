import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Vector3,
  type TypedArray,
} from "three";
import type { PointOctree } from "sparse-octree";
import type { Particle } from "./particle";
import { params } from "./gui";

// 12 edges × 2 endpoints × 3 floats per vertex
const FLOATS_PER_BOX = 72;
const MAX_BOXES = 512;

export function createOctreeVizualization(): LineSegments {
  const geometry = new BufferGeometry();
  const buffer = new Float32Array(MAX_BOXES * FLOATS_PER_BOX);
  geometry.setAttribute("position", new Float32BufferAttribute(buffer, 3));

  const material = new LineBasicMaterial({ color: 0x00ff00 });
  const vizualization = new LineSegments(geometry, material);
  vizualization.visible = params.showOctree;
  return vizualization;
}

// Writes the 12 edges of a box into the buffer at `offset`.
// Returns the next available offset.
function writeBox(
  buffer: TypedArray,
  offset: number,
  min: Vector3,
  max: Vector3,
): number {
  const x0 = min.x,
    y0 = min.y,
    z0 = min.z;
  const x1 = max.x,
    y1 = max.y,
    z1 = max.z;

  // bottom face
  buffer[offset++] = x0;
  buffer[offset++] = y0;
  buffer[offset++] = z0;
  buffer[offset++] = x1;
  buffer[offset++] = y0;
  buffer[offset++] = z0;

  buffer[offset++] = x1;
  buffer[offset++] = y0;
  buffer[offset++] = z0;
  buffer[offset++] = x1;
  buffer[offset++] = y1;
  buffer[offset++] = z0;

  buffer[offset++] = x1;
  buffer[offset++] = y1;
  buffer[offset++] = z0;
  buffer[offset++] = x0;
  buffer[offset++] = y1;
  buffer[offset++] = z0;

  buffer[offset++] = x0;
  buffer[offset++] = y1;
  buffer[offset++] = z0;
  buffer[offset++] = x0;
  buffer[offset++] = y0;
  buffer[offset++] = z0;

  // top face
  buffer[offset++] = x0;
  buffer[offset++] = y0;
  buffer[offset++] = z1;
  buffer[offset++] = x1;
  buffer[offset++] = y0;
  buffer[offset++] = z1;

  buffer[offset++] = x1;
  buffer[offset++] = y0;
  buffer[offset++] = z1;
  buffer[offset++] = x1;
  buffer[offset++] = y1;
  buffer[offset++] = z1;

  buffer[offset++] = x1;
  buffer[offset++] = y1;
  buffer[offset++] = z1;
  buffer[offset++] = x0;
  buffer[offset++] = y1;
  buffer[offset++] = z1;

  buffer[offset++] = x0;
  buffer[offset++] = y1;
  buffer[offset++] = z1;
  buffer[offset++] = x0;
  buffer[offset++] = y0;
  buffer[offset++] = z1;

  // vertical edges
  buffer[offset++] = x0;
  buffer[offset++] = y0;
  buffer[offset++] = z0;
  buffer[offset++] = x0;
  buffer[offset++] = y0;
  buffer[offset++] = z1;

  buffer[offset++] = x1;
  buffer[offset++] = y0;
  buffer[offset++] = z0;
  buffer[offset++] = x1;
  buffer[offset++] = y0;
  buffer[offset++] = z1;

  buffer[offset++] = x1;
  buffer[offset++] = y1;
  buffer[offset++] = z0;
  buffer[offset++] = x1;
  buffer[offset++] = y1;
  buffer[offset++] = z1;

  buffer[offset++] = x0;
  buffer[offset++] = y1;
  buffer[offset++] = z0;
  buffer[offset++] = x0;
  buffer[offset++] = y1;
  buffer[offset++] = z1;

  return offset;
}

export function updateOctreeVizualization(
  vizualization: LineSegments,
  octree: PointOctree<Particle>,
): void {
  const attr = vizualization.geometry.getAttribute("position");
  const buffer = attr.array;
  vizualization.visible = params.showOctree;

  let offset = 0;

  // leaves() returns a plain Iterator (not iterable), so we walk it manually.
  const iter = octree.leaves();
  let result = iter.next();
  while (!result.done) {
    // Points live at node.data.points, not node.points directly.
    // Leaf nodes have children === null.
    const node = result.value as any;
    if (
      node.children === null &&
      node.data !== null &&
      node.data.points.length > 0
    ) {
      offset = writeBox(buffer, offset, node.min, node.max);
      if (offset >= MAX_BOXES * FLOATS_PER_BOX) {
        break;
      }
    }
    result = iter.next();
  }

  // Zero out stale edges from the previous frame
  buffer.fill(0, offset);

  attr.needsUpdate = true;
}
