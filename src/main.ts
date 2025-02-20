import World from './components/World/World';
import Player from './components/Units/Player';
import Game from './components/Game';
import Scene from './components/Scene/Scene';
import Camera from './components/Scene/Camera';
import GameHelper from './services/GameHelper';

const scene = Scene.getScene();
const camera = Camera.getCamera();
GameHelper.displayAxesHelper();
GameHelper.displayGrid();
// GameHelper.displayFloor();
// GameHelper.displayBoundaries();

const world = new World(scene);
world.addAmbientLight({ intensity: 1 });
world.addSunLight({ intensity: 1.2 });
world.render();

const player = new Player(scene, camera, world);
const game = new Game(world, player);

game.start();
