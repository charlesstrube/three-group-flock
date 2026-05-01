# Octree Visualization Design

## Goal

Add a toggleable wireframe visualization of the occupied octree leaf nodes in the Three.js flocking scene, so the spatial partitioning structure is visible at runtime.

## Scope

Only occupied leaf nodes (those containing at least one particle) are drawn. All octree levels above the leaves are ignored.

## Files

| File | Change |
|------|--------|
| `src/octree-viz.ts` | New — creates and updates the wireframe |
| `src/gui.ts` | Add `showOctree: false` toggle to `params` |
| `src/main.ts` | Integrate viz update into animate loop |

## Architecture

### `src/octree-viz.ts`

**`createOctreeViz(scene: Scene): LineSegments`**
- Creates a `BufferGeometry` with a pre-allocated `Float32Array` for vertex positions
- Wraps it in a `LineSegments` object with a `LineBasicMaterial`
- Adds it to the scene and returns it

**`updateOctreeViz(viz: LineSegments, octree: PointOctree<Particle>): void`**
- Iterates `octree.leaves()` and filters for occupied nodes via `countPoints() > 0`
- For each occupied leaf, reads its `min` and `max` bounds (Vector3)
- Writes the 24 vertices (12 edges × 2 endpoints) of the bounding box into the buffer
- Pads unused slots with zeros if fewer nodes than the pre-allocated max
- Sets `needsUpdate = true` on the position attribute

**Buffer sizing:** pre-allocate for a worst-case of 512 leaf nodes (4×4×4 space, depth 3, maxPoints 8). Each node = 12 edges = 24 vertices = 72 floats.

### `src/gui.ts`

Add to `params`:
```ts
showOctree: false
```
Add a checkbox in the dat.GUI panel.

### `src/main.ts`

In `animate()`, after `populateOctree`:
```ts
if (params.showOctree) {
  octreeViz.visible = true
  updateOctreeViz(octreeViz, octree)
} else {
  octreeViz.visible = false
}
```

## Data Flow

```
animate()
  └─ createOctree() + populateOctree(life, octree)
  └─ [if showOctree] updateOctreeViz(octreeViz, octree)
       └─ octree.leaves() → filter occupied → write box edges to buffer
  └─ updateGeometry(birds...) + updateGeometry(predators...)
  └─ renderer.render()
```

## Constraints

- Visualization only updates when visible (no wasted work when toggled off)
- Single draw call — all boxes in one `LineSegments` object
- Buffer is pre-allocated once at startup, only the vertex data is overwritten each frame
