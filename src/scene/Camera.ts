import { PerspectiveCamera } from 'three';
import { CAMERA_ASPECT, CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from '../constants/camera';

/**
 * Singleton class representing the main camera used by the player in game.
 *
 * - Uses `THREE.PerspectiveCamera` for 3D projection.
 * - Provides a global camera instance that can be accessed from anywhere in the game.
 */
class Camera {
    /** The singleton instance of the `Camera` class */
    static #instance: Camera | null = null;
    /** The `THREE.PerspectiveCamera` instance used in the scene. */
    static #camera: PerspectiveCamera;

    /**
     * Private constructor to prevent instantiation.
     * 
     * - Initializes the `THREE.PerspectiveCamera` with predefined settings.
     */
    private constructor() {
        Camera.#camera = new PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);
    }

    /**
     * Retrieves the singleton instance of the `Camera` class.
     * 
     * - If the instance does not exists, it creates a new one.
     * - Ensures unicity of the camera instance throughout the game.
     *
     *  @returns The singleton instance of the `Camera` class.
     */
    public static getInstance(): Camera {
        if (!Camera.#instance) {
            Camera.#instance = new Camera();
        }
        return Camera.#instance;
    }

    /**
     * Retrieves the `THREE.PerspectiveCamera` instance.
     *
     * - Ensures that the camera is always instantiated before returning it.
     *
     * @returns The `THREE.PerspectiveCamera` instance.
     */
    public static getCamera(): PerspectiveCamera {
        return Camera.getInstance(), Camera.#camera;
    }
}

export default Camera;
