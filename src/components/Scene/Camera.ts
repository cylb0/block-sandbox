import * as THREE from 'three';
import { CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR } from '../../constants/camera';

class Camera {
    static #instance: Camera | null = null;
    static #camera: THREE.PerspectiveCamera;

    private constructor() {
        Camera.#camera = new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);
    }

    public static getInstance(): Camera {
        if (!Camera.#instance) {
            Camera.#instance = new Camera();
        }
        return Camera.#instance;
    }

    public static getCamera(): THREE.Camera {
        return Camera.getInstance(), Camera.#camera;
    }
}

export default Camera;
