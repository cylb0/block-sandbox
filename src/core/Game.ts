import Camera from "@/core/scene/Camera";
import Renderer from "@/core/scene/Renderer";
import Scene from "@/core/scene/Scene";
import Player from "@/units/Player";
import World from "@/world/World";

/**
 * Manages the game logic, rendering and utilities.
 * 
 * - Handles the game loop and rendering updates.
 * - Manages the `Player` and `World` instances.
 */
class Game {
    /** The world instance containing chunks and terrain. */
    private world: World;

    /** The player instance controlled by the user. */
    private player: Player;

    /**
     * Creates a new game instance.
     * 
     * @param world - The `World` instance containing chunks and terrain.
     * @param player - The `Player` instance controlled by the user.
     */
    constructor(world: World, player: Player) {
        this.world = world;
        this.player = player;
    }
    
    /**
     * Starts the game loop and begins rendering the scene.
     * 
     * - Calls the `player.move()` method to update movement.
     * - Renders the scene using `Renderer singleton`.
     * - Uses `requestAnimationFrame` to create a smooth animation loop.
     */
    public start(): void {
        /**
         * Continuously renders the game.
         */
        const animate = () => {
            this.player.move();
            Renderer.getRenderer().render(Scene.getScene(), Camera.getCamera());
            requestAnimationFrame(animate);
        };
        animate();
    }
}

export default Game;
