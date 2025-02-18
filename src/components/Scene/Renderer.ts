import * as THREE from 'three';

class Renderer {
    static #instance: Renderer | null = null;
    static #renderer: THREE.WebGLRenderer;

    private constructor() {
        Renderer.#renderer = new THREE.WebGLRenderer();
        Renderer.#renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(Renderer.#renderer.domElement);
    }

    public static getInstance(): Renderer {
        if (!Renderer.#instance) {
            Renderer.#instance = new Renderer();
        }
        return Renderer.#instance;
    }

    public static getRenderer(): THREE.WebGLRenderer {
        return Renderer.getInstance(), Renderer.#renderer;
    }
}

export default Renderer;
