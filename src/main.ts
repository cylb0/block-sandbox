import World from './world/World';
import GameHelper from './services/GameHelper';
import Scene from './scene/Scene';
import Camera from './scene/Camera';
import Player from './units/Player';
import Game from './core/Game';

const scene = Scene.getScene();
const camera = Camera.getCamera();
GameHelper.displayAxesHelper();
// GameHelper.displayGrid();
// GameHelper.displayExampleCube();
GameHelper.displayFloor();
// GameHelper.displayBoundaries();

const world = new World(scene);
world.addAmbientLight({ intensity: 1 });
world.addSunLight({ intensity: 1.2 });
world.render();

const player = new Player(scene, camera, world);
const game = new Game(world, player);

game.start();
