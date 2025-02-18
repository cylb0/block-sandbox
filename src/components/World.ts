import * as THREE from 'three';
import Scene from './Scene/Scene';

class World {
    constructor() {
        // Cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, .5, 0);
        Scene.getScene().add(cube);
    }

    public addGround(
        size: number = 100,
        color: THREE.ColorRepresentation = 0x228b00
    ): void {
        const groundGeometry = new THREE.PlaneGeometry(size, size);
        const groundMaterial = new THREE.MeshStandardMaterial({ color });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        Scene.getScene().add(ground);
    }

    public addAmbientLight(
        color: THREE.ColorRepresentation = 0xffffff,
        intensity: number = .5
    ): void {
        const ambientLight  = new THREE.AmbientLight(color, intensity);
        Scene.getScene().add(ambientLight);
    }

    public addSunLight(
        position: THREE.Vector3 = new THREE.Vector3(10, 20, 10),
        color: THREE.ColorRepresentation = 0xffffff,
        intensity: number = 1
    ): void {
        const sunLight = new THREE.DirectionalLight(color, intensity);
        sunLight.position.copy(position);
        sunLight.castShadow = true;
        Scene.getScene().add(sunLight);
    }
}

export default World;
