import * as THREE from 'three';

class Scene {
    static #instance: Scene | null = null;
    static #scene: THREE.Scene;
    
    private constructor() {
        Scene.#scene = new THREE.Scene();
    }
    
    public static getInstance(): Scene {
        if (!Scene.#instance) {
            Scene.#instance = new Scene();
        }
        return Scene.#instance;
    }

    public static getScene(): THREE.Scene {
        return Scene.getInstance(), Scene.#scene;
    }
    
    public static reset(): void {
        Scene.#scene.clear();
        Scene.#scene = new THREE.Scene();
    }
}
    
export default Scene;
