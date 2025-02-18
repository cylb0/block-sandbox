import World from './components/World';
import Player from './components/Player';
import Game from './components/Game';
import Scene from './components/Scene/Scene';
import Camera from './components/Scene/Camera';

const scene = Scene.getScene();
const camera = Camera.getCamera();
Game.initAxesHelper(scene);

const world = new World();
world.addGround();
world.addAmbientLight();
world.addSunLight();

const player = new Player(scene, camera);
const game = new Game(world, player);

game.start();
