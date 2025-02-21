import { ArrowHelper, BoxGeometry, Camera, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import World from "../world/World";
import Collidable from "../core/Collidable";
import { PLAYER_BASE_SPEED, PLAYER_DIMENSIONS, PLAYER_OFFSET, PLAYER_SPAWN_POSITION } from "../constants/player";
import IRenderable from "../interfaces/IRenderable";
import { CAMERA_ROTATION_SENSITIVITY } from "../constants/camera";
import IMovable from "../interfaces/IMovable";
import Scene from "../scene/Scene";
import { CHUNK_SIZE, GRAVITY, MAX_VELOCITY, WORLD_SIZE } from "../constants/world";
import { BLOCK_OFFSET, BLOCK_SIZE } from "../constants/block";
import Block from "../blocks/Block";

class Player extends Collidable implements IMovable, IRenderable {
    private scene: Scene;
    private camera: Camera;
    private world: World;
    /** Movement speed of the player. */
    private speed: number;
    /** Vertical velocity of the player, used for gravity or jumps. */
    private velocityY: number = 0; 
    /** Tracks the state of movement keys. */
    private keys: { [key: string]: boolean } = { q: false, z: false, d: false, s: false };
    /** Tracks the state of the mouse button. */
    private isMouseDown: boolean;
    /** Debugging tool to visualize the player's forward direction. */
    private arrowHelper: ArrowHelper | null = null;
    /** Wether the player is currently on the ground. */
    private isGrounded: boolean = false;

    /**
     * Creates a new `Player` instance.
     * 
     * - Initializes movement, camera and event listeners.
     * - Calls `render()` to create the player model.
     *
     * @param camera - The `THREE.Camera` attached to the player.
     * @param world - The `World` instance managing chunks and blocks.
     */
    constructor(scene: Scene, camera: Camera, world: World) {
        const playerGroup = new Group();
        const playerModel = Player.createPlayer();
        playerGroup.add(playerModel);
        const position = new Vector3(PLAYER_SPAWN_POSITION.x, PLAYER_SPAWN_POSITION.y, PLAYER_SPAWN_POSITION.z);
        super(position, playerGroup);

        // this.object.add(camera);
        camera.position.set(4, 4, 4);
        camera.lookAt(3, 0, 0);

        this.scene = scene;
        this.camera = camera;
        this.world = world;
        this.speed = PLAYER_BASE_SPEED;
        this.isMouseDown = false;

        this.initEventListeners();
        this.render();
    }

    /**
     * Renders the player in the scene.
     */
    public render(): void {
        Scene.getScene().add(this.object);
    }

    /**
     * Moves the player depending on user inputs.
     * 
     * - Negates direction on the y axis to prevent flying.
     * - Applies gravity.
     * - Updates bounding box of the player.
    */
    public move(): void {
        const direction = this.getForwardDirection();
        direction.y = 0;
        const right = this.getRightDirection();

        if (this.keys['KeyA']) this.moveDirection(right, 1);
        if (this.keys['KeyD']) this.moveDirection(right, -1);
        if (this.keys['KeyW']) this.moveDirection(direction, 1)
        if (this.keys['KeyS']) this.moveDirection(direction, -1);
        this.applyGravity();
        this.updateBoundingBox();
    }

    /**
     * Moves the player in a given direction.
     * 
     * - Calls `updateGroundedState()` to check if player should fall from his next position.
     * @param direction - The normalized direction vector.
     * @param multiplier - The movement intensity (negative to move backwards).
     */
    public moveDirection(direction: Vector3, multiplier: number): void {
        const nextPosition = this.object.position.clone().addScaledVector(direction, this.speed * multiplier);
        this.position = nextPosition;
        this.updateGroundedState();
    }

    /**
     * Applies gravity to the player.
     * 
     * - Increases `velocityY` based on `GRAVITY`.
     * - Calls `handleGroundCollision()` to check for collision and adjust position.
     */
    private applyGravity(): void {
        if (this.isGrounded) return;
    
        this.velocityY += GRAVITY;
        if (this.velocityY > MAX_VELOCITY) {
            this.velocityY = MAX_VELOCITY;
        }

        const nextPosition = this.object.position.clone();
        nextPosition.y += this.velocityY;
        
        this.handleGroundCollision(nextPosition);
    }

    /**
     * Updates the `isGrounded` state by checking if there is a block below.
     * 
     * - If no block is found below, gravity will be applied.
     */
    private updateGroundedState(): void {
        const checkPosition = this.position.clone();
        checkPosition.y -= .1;
        this.isGrounded = this.getBlockAt(checkPosition) !== null || this.isBelowBedrock(checkPosition);
    }

    /**
     * Handles collision with the ground.
     * 
     * - If the player will hit a block, adjust his position to stand on top.
     * - If the player is below bedock, resets position to `PLAYER_OFFSET`.
     * - Otherwise, let him free fall.
     * 
     * @param nextPosition - The player's next computed position.
     */
    private handleGroundCollision(nextPosition: Vector3): void {
        const blockBelow = this.getBlockAt(nextPosition);
        if (blockBelow == null) {
            if (this.isBelowBedrock(nextPosition)) {
                this.velocityY = 0;
                this.isGrounded = true;
                this.position.y = PLAYER_OFFSET;
            } else {
                this.isGrounded = false;
                this.position.y += this.velocityY;
            }
            return;
        }
        this.velocityY = 0;
        this.isGrounded = true;
        this.position.y = blockBelow.position.y + 1 + PLAYER_OFFSET;
    }

    /**
     * Checks wether or not the given player position is below floor.
     *
     * - It leverages `PLAYER_OFFSET` to adjust to player's lowest point.
     * 
     * @param position - The position to check.
     * @returns `true` if player's position is lower than world floor, `false` otherwise.
     */
    private isBelowBedrock(position: Vector3): boolean {
        return position.y <= PLAYER_OFFSET;
    }

    /**
     * Creates and returns a `THREE.Mesh` representing the player.
     *
     * - Generates a box-shaped mesh using predefined dimensions.
     *
     * @returns A `THREE.Mesh` representing the player.
     */
    private static createPlayer(): Mesh {
        const playerGeometry = new BoxGeometry(PLAYER_DIMENSIONS.width, PLAYER_DIMENSIONS.height, PLAYER_DIMENSIONS.length);
        const playerMaterial = new MeshStandardMaterial({ color: 0x0000ff });
        return new Mesh(playerGeometry, playerMaterial);
    } 
    
    /**
     * Handles key press events by setting the corresponding key state to `true`.
     * 
     * @param event - The keyboard event containing the key code.
     */
    private onKeyDown(event: KeyboardEvent): void {
        this.keys[event.code] = true;
    }

    /**
     * Handles key press events by setting the corresponding key state to `false`.
     *
     * @param event - The keyboard event containing the key code.
     */
    private onKeyUp(event: KeyboardEvent): void {
        this.keys[event.code] = false;
    }

    /**
     * Handles mouse movement for camera rotation when mouse is clicked.
     *
     * Updates:
     * - `object.rotation.y` based on horizontal movement (`movementX`).
     * - `camera.rotation.x` based on vertical movement (`movementY`).
     * It also limits the camera pitch rotation to prevent flipping (First person camera).
     * 
     * @param event - The mouse event containing movement data. 
     */
    private onMouseMove(event: MouseEvent): void {
        if (!this.isMouseDown) return;
        this.object.rotation.y -= event.movementX * CAMERA_ROTATION_SENSITIVITY;
        this.camera.rotation.x -= event.movementY * CAMERA_ROTATION_SENSITIVITY;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }

    /**
     * Computes the forward direction based on the camera's orientation.
     *
     * @returns A normalized `THREE.Vector3` representing the forward direction.
     */
    private getForwardDirection(): Vector3 {
        const direction = new Vector3();
        this.camera.getWorldDirection(direction);
        return direction.normalize();
    }

    /**
     * Computes the right direction relative to the camera's orientation.
     * It is calculated using the cross product of the camera's up vector and the forward direction
     *
     * @returns A normalized `THREE.Vector3` representing the rightward direction.
     */
    private getRightDirection(): Vector3 {
        const right = new Vector3();
        right.crossVectors(this.camera.up, this.getForwardDirection());
        return right.normalize();
    }

    /**
     * Initializes event listeners for player input management.
     *
     * Listens for:
     * - `keydown` / `keyup`: Tracks movement key presses.
     * - `mousedown` / `mouseup`: Toggles mouse interactions and hides cursor.
     * - `contextmenu`: Disables context menu on right-click.
     */
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

    /**
     * Retrieves the block at given world coordinates.
     * 
     * @param position - The world coordinates to look for a block.
     * @returns A `Block` if found, `null` otherwise.
     */
    private getBlockAt(position: Vector3): Block | null {
        return this.world.getBlockAt(position)
    }
}

export default Player;
