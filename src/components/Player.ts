import * as THREE from 'three';
import { CAMERA_ROTATION_SENSITIVITY } from '../constants/camera';
import { IRenderable } from '../interfaces/IRenderable';
import { PLAYER_DIMENSIONS, PLAYER_SPAWN_POSITION, PLAYER_BASE_SPEED } from '../constants/player';

class Player implements IRenderable {
    public object: THREE.Group;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private speed: number;
    private keys: { [key: string]: boolean };
    private isMouseDown: boolean;
    private arrowHelper: THREE.ArrowHelper | null = null;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
        this.speed = PLAYER_BASE_SPEED;
        this.keys = { q: false, z: false, d: false, s: false }
        this.isMouseDown = false;
        
        this.object = new THREE.Group();
        this.object.add(this.camera);
        this.object.position.set(PLAYER_SPAWN_POSITION.x, PLAYER_SPAWN_POSITION.y, PLAYER_SPAWN_POSITION.z);
        this.scene.add(this.object);

        this.render();
        this.initDebugArrow();
        this.initEventListeners();
    }

    private initDebugArrow(): void {
        const direction = new THREE.Vector3(0, 0, 1);
        this.arrowHelper = new THREE.ArrowHelper(direction, this.object.position, 10, 0xff0000);
        this.scene.add(this.arrowHelper);
    }

    private initEventListeners(): void {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousedown', () => {
            this.isMouseDown = true
            document.body.style.cursor = 'none';
        });
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false
            document.body.style.cursor = 'default';
        });
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('contextmenu', (event) => event.preventDefault());
    }

    private onKeyDown(event: KeyboardEvent): void {
        this.keys[event.code] = true;
    }

    private onKeyUp(event: KeyboardEvent): void {
        this.keys[event.code] = false;
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isMouseDown) return;
        this.object.rotation.y -= event.movementX * CAMERA_ROTATION_SENSITIVITY;
        this.camera.rotation.x -= event.movementY * CAMERA_ROTATION_SENSITIVITY;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }

    public updatePosition(): void {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(this.camera.up, direction);
        right.normalize();

        if (this.keys['KeyA']) this.object.position.addScaledVector(right, this.speed);
        if (this.keys['KeyD']) this.object.position.addScaledVector(right, -this.speed);
        if (this.keys['KeyW']) this.object.position.addScaledVector(direction, this.speed);
        if (this.keys['KeyS']) this.object.position.addScaledVector(direction, -this.speed);

        this.updateDebugArrow();
    }

    public render(): void {
        const playerGeometry = new THREE.BoxGeometry(PLAYER_DIMENSIONS.width, PLAYER_DIMENSIONS.height, PLAYER_DIMENSIONS.depth);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const playerModel = new THREE.Mesh(playerGeometry, playerMaterial);
        this.object.add(playerModel);
    }

    private updateDebugArrow(): void {
        if (!this.arrowHelper) return;
        const direction = new THREE.Vector3();
        this.object.getWorldDirection(direction);
        this.arrowHelper.setDirection(direction);
        this.arrowHelper.position.copy(this.object.position);
    }
}

export default Player;
