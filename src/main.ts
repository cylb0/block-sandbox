import World from '@/world/World';
import GameHelper from '@/services/GameHelper';
import Scene from '@/core/scene/Scene';
import Camera from '@/core/scene/Camera';
import Player from '@/units/Player';
import Game from '@/core/Game';
import { CHUNK_SIZE, SEA_LEVEL, WORLD_SIZE } from '@/constants/world';
import PerlinNoise from './core/noise/PerlinNoise';
import { PERLIN_NOISE_AMPLITUDE, PERLIN_NOISE_SCALE } from '@/constants/perlin';

const seed = 0;

const scene = Scene.getScene();
const camera = Camera.getCamera();
GameHelper.displayAxesHelper();

const world = new World(scene, seed);
world.addAmbientLight({ intensity: 1 });
world.addSunLight({ intensity: 1.2 });

const player = new Player(scene, camera, world);
const game = new Game(world, player);

game.start();

// function createCanvas(id: string, size: number) {
//     const canvas = document.createElement("canvas");
//     canvas.id = id;
//     canvas.width = size;
//     canvas.height = size;
//     return canvas;
// }

// const worldSize = WORLD_SIZE.size * CHUNK_SIZE;
// document.body.appendChild(createCanvas("canvas", worldSize * 10));

// const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// const ctx = canvas!.getContext('2d') as CanvasRenderingContext2D;

// const perlin = new PerlinNoise(seed);
// const scale = PERLIN_NOISE_SCALE;
// const amplitude = PERLIN_NOISE_AMPLITUDE;
// const water = "rgb(0, 0, 255)";
// const grass = "rgb(0, 255, 0)";
// const stone = "rgb(80, 80, 80)";
// const snow = "rgb(255, 255, 255)";

// const halfWorldSize = Math.floor(worldSize / 2);
// for (let x = -halfWorldSize; x < halfWorldSize ; x++) {
//     for (let z = -halfWorldSize; z < halfWorldSize; z++) {
//         const noiseValue = perlin.noise(x / scale, z / scale, amplitude);

//         const normalizedNoiseValue = (noiseValue + 1) * .5;
//         let height = normalizedNoiseValue * WORLD_SIZE.depth;
        
//         const y = Math.floor(height);
//         ctx.fillStyle = y < SEA_LEVEL ? water
//         : y < WORLD_SIZE.depth * .60 ? grass
//         : y < WORLD_SIZE.depth * .65 ? stone
//         : snow;
//         ctx.fillRect((x + halfWorldSize) * 10, (z + halfWorldSize) * 10, 10, 10)
//     }
// }
