import { GUI } from "dat.gui";
import Stats from "stats.js";

export const params = {
  maxForce: 0.001,
  maxSpeed: 0.02,
  radius: {
    cohesion: 0.1,
    separation: 0.15,
    alignment: 0.25,
  },
};

const gui = new GUI({ name: "params" });

gui.add(params, "maxForce", 0, 0.01);
gui.add(params, "maxSpeed", 0, 0.1);
const radiusGui = gui.addFolder("turbulence");
radiusGui.open();
radiusGui.add(params.radius, "cohesion", 0, 0.5);
radiusGui.add(params.radius, "separation", 0, 0.5);
radiusGui.add(params.radius, "alignment", 0, 0.5);

export const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
