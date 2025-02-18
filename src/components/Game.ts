import Player from "./Player";
import Camera from "./Scene/Camera";
import Renderer from "./Scene/Renderer";
import Scene from "./Scene/Scene";
import World from "./World";
import * as THREE from 'three';

class Game {
    private world: World;
    private player: Player;

    constructor(world: World, player: Player) {
        this.world = world;
        this.player = player;
    }

    public static initAxesHelper(scene: THREE.Scene): void {
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    }

    public start(): void {
        const animate = () => {
            this.player.updatePosition();
            Renderer.getRenderer().render(Scene.getScene(), Camera.getCamera());
            requestAnimationFrame(animate);
        };
        animate();
    }
}

export default Game;
