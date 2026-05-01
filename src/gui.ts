import { GUI } from "dat.gui";
import Stats from "stats.js";

export const params = {
  maxForce: 0.001,
  maxSpeed: 0.005,
  radius: {
    cohesion: 0.1 * 2,
    separation: 0.15 * 2,
    alignment: 0.25 * 2,
  },
};

export const EDGES = {
  width: 2,
};

const gui = new GUI({ name: "params" });

gui.add(params, "maxForce", 0, 0.01);
gui.add(params, "maxSpeed", 0, 0.1);
const radiusGui = gui.addFolder("turbulence");
radiusGui.open();
radiusGui.add(params.radius, "cohesion", 0, 1);
radiusGui.add(params.radius, "separation", 0, 1);
radiusGui.add(params.radius, "alignment", 0, 1);

export const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
