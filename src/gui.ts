import { GUI } from "dat.gui";
import Stats from "stats.js";

export const params = {
  bird: {
    maxForce: 0.001,
    maxSpeed: 0.005,
    radius: {
      cohesion: 0.1 * 2,
      separation: 0.15 * 2,
      alignment: 0.25 * 2,
    },
  },
  predator: {
    maxForce: 0.001,
    maxSpeed: 0.005,
    radius: {
      cohesion: 0.5,
      separation: 0.2,
    },
  },
  showOctree: false,
};

export const EDGES = {
  width: 2,
};

const gui = new GUI({ name: "params" });

const birdGui = gui.addFolder("birds");
birdGui.open();
birdGui.add(params.bird, "maxForce", 0, 0.01);
birdGui.add(params.bird, "maxSpeed", 0, 0.01);
birdGui.add(params.bird.radius, "cohesion", 0, 1);
birdGui.add(params.bird.radius, "separation", 0, 1);
birdGui.add(params.bird.radius, "alignment", 0, 1);

const predatorGui = gui.addFolder("predators");
predatorGui.open();
predatorGui.add(params.predator, "maxForce", 0, 0.01);
predatorGui.add(params.predator, "maxSpeed", 0, 0.01);
predatorGui.add(params.predator.radius, "cohesion", 0, 1);
predatorGui.add(params.predator.radius, "separation", 0, 1);

gui.add(params, "showOctree");

export const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
