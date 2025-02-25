import { WebGLRenderer } from 'three';
import Camera from '@/core/scene/Camera';

/**
 * Singleton class responsible for rendering the scene.
 *
 * - Uses the `THREE.WebGLRenderer` to render 3D objects.
 * - Provides a global renderer instance that can be accessed from anywhere in the game.
 * - Handles window resiszing to maintain aspect ratio.
 */
class Renderer {
    /** The singleton instance of the `Renderer` class */
    static #instance: Renderer | null = null;
    
    /** The `THREE.WebGLRenderer` instance used to render the scene. */
    static #renderer: WebGLRenderer;

    /**
     * Private constructor to prevent instantiation.
     * 
     * - Initializes the `THREE.WebGLRenderer` using window dimensions.
     * - Adds an event listener for resizing events.
     */
    private constructor() {
        Renderer.#renderer = new WebGLRenderer();
        Renderer.#renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(Renderer.#renderer.domElement);

        window.addEventListener('resize', () => this.onResize());
    }

    /**
     * Retrieves the singleton instance of the `Renderer` class.
     * 
     * - If the instance does not exists, it creates a new one.
     * - Ensures unicity of the renderer instance throughout the game.
     *
     *  @returns The singleton instance of the `Renderer` class.
     */
    public static getInstance(): Renderer {
        if (!Renderer.#instance) {
            Renderer.#instance = new Renderer();
        }
        return Renderer.#instance;
    }

    /**
     * Retrieves the `THREE.WebGLRenderer` instance.
     *
     * - Ensures that the renderer is always instantiated before returning it.
     *
     * @returns The `THREE.WebGLRenderer` instance.
     */
    public static getRenderer(): WebGLRenderer {
        return Renderer.getInstance(), Renderer.#renderer;
    }

    /**
     * Handles the renderer and camera to match window size.
     *
     * - Updates the camera aspect ratio and projection matrix.
     * - Resizes the renderer based on the new window size.
     */
    private onResize(): void {
        const camera = Camera.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        Renderer.#renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default Renderer;
