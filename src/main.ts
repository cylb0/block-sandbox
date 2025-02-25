import World from '@/world/World';
import GameHelper from '@/services/GameHelper';
import Scene from '@/core/scene/Scene';
import Camera from '@/core/scene/Camera';
import Player from '@/units/Player';
import Game from '@/core/Game';

const scene = Scene.getScene();
const camera = Camera.getCamera();
GameHelper.displayAxesHelper();

const world = new World(scene);
world.addAmbientLight({ intensity: 1 });
world.addSunLight({ intensity: 1.2 });
world.render();

const player = new Player(scene, camera, world);
const game = new Game(world, player);

game.start();
