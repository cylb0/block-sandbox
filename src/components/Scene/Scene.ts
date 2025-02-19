import { Scene as ThreeScene} from 'three';

/**
 * Singleton class responsible for managing the `THREE.Scene`.
 *
 * - Uses the `THREE.Scene` to hold all objects.
 * - Provides a global renderer instance that can be accessed from anywhere.
 * - Allows resetting the scene when needed.
 */
class Scene {
    /** The singleton instance of the `Scene` class */
    static #instance: Scene | null = null;

    /** The `THREE.Scene` instance used to render the scene. */
    static #scene: ThreeScene;
    
    /**
     * Private constructor to prevent instantiation.
     * 
     * - Initializes the `THREE.Scene`.
     */
    private constructor() {
        Scene.#scene = new ThreeScene();
    }

    /**
     * Retrieves the singleton instance of the `Scene` class.
     * 
     * - If the instance does not exists, it creates a new one.
     * - Ensures unicity of the scene instance throughout the game.
     *
     *  @returns The singleton instance of the `Scene` class.
     */
    public static getInstance(): Scene {
        if (!Scene.#instance) {
            Scene.#instance = new Scene();
        }
        return Scene.#instance;
    }

    /**
     * Retrieves the `THREE.Scene` instance.
     *
     * - Ensures that the renderer is always instantiated before returning it.
     *
     * @returns The `THREE.WebGLRenderer` instance.
     */
    public static getScene(): ThreeScene {
        return Scene.getInstance(), Scene.#scene;
    }
    
    /**
     * Resets the scene by clearing all objects and creating a new instance.
     */
    public static reset(): void {
        Scene.#scene.clear();
        Scene.#scene = new ThreeScene();
    }
}
    
export default Scene;
