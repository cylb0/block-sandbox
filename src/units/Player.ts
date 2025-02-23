import { ArrowHelper, Box3, BoxGeometry, Camera, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import World from "../world/World";
import Collidable from "../core/Collidable";
import { JUMP_VELOCITY, PLAYER_BASE_SPEED, PLAYER_DIMENSIONS, PLAYER_OFFSET, PLAYER_SPAWN_POSITION } from "../constants/player";
import IRenderable from "../interfaces/IRenderable";
import { CAMERA_ROTATION_SENSITIVITY } from "../constants/camera";
import IMovable from "../interfaces/IMovable";
import Scene from "../scene/Scene";
import { GRAVITY, MAX_VELOCITY } from "../constants/world";
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
    private keys: { [key: string]: boolean } = {};
    /** Tracks the state of the mouse button. */
    private isMouseDown: boolean;
    /** Debugging tool to visualize the player's forward direction. */
    private arrowHelper: ArrowHelper | null = null;
    /** Wether the player is currently on the ground. */
    private isGrounded: boolean = false;

    private isJumping: boolean = false;

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
        camera.position.set(0, 5, 3);
        camera.lookAt(0, 0, 0);

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
     * - Calls `handleKeyInputs()`.
     * - Calls `updatedBoundingBox()` for it to match player's new position.
     * - Calls `updateGroundedState()` to check if player should fall from his next position.
     * - Applies gravity.
    */
    public move(): void {
        this.handleKeyInputs();
        this.updateBoundingBox();
        this.updateGroundedState();
        this.applyGravity();
    }

    /**
     * Handles user key inuts and applies movements.
     * - Negates direction on the y axis to prevent flying.
     * - Moves the player.
     */
    private handleKeyInputs(): void {
        const direction = this.getForwardDirection();
        direction.y = 0;
        const right = this.getRightDirection();

        if (this.keys['KeyA']) this.moveDirection(right, 1);
        if (this.keys['KeyD']) this.moveDirection(right, -1);
        if (this.keys['KeyW']) this.moveDirection(direction, 1)
        if (this.keys['KeyS']) this.moveDirection(direction, -1);
        if (this.keys['Space']) this.jump();
    }

    /**
     * Moves the player in a given direction.
     * 
     * @param direction - The normalized direction vector.
     * @param multiplier - The movement intensity (negative to move backwards).
     */
    public moveDirection(direction: Vector3, multiplier: number): void {
        // TODO: check for directional collision
        const nextPosition = this.object.position.clone().addScaledVector(direction, this.speed * multiplier);
        this.position = nextPosition;
    }

    /**
     * Applies gravity to the player.
     * 
     * - Increases `velocityY` based on `GRAVITY`.
     * - Calls `handleGroundCollision()` to check for collision and adjust position.
     */
    private applyGravity(): void {
        if (this.isGrounded && !this.isJumping) {
            this.velocityY = 0;
            return;
        }

        this.velocityY += GRAVITY;
        if (this.velocityY > MAX_VELOCITY) {
            this.velocityY = MAX_VELOCITY;
        }
        this.handleGroundCollision();
    }

    /**
     * Starts a jump if the player is grounded and not jumping already.
     *
     * - Uses `JUMP_VELOCITY` to set player's vertical velocity.
     * - Updates `isGrounded` and `isPlaying`.
     */
    private jump(): void {
        if (!this.isGrounded || this.isJumping) return;
        this.velocityY = JUMP_VELOCITY;
        this.isGrounded = false;
        this.isJumping = true;
    }

    /**
     * Updates the `isGrounded` state by checking if there is a block below player.
     * 
     * - If no block is found below, check if player hit bedrock otherwise gravity will be applied.
     */
    private updateGroundedState(): void {
        const blocksBelow = this.getBlocksBelowPlayer(this.boundingBox);
        this.isGrounded = !!blocksBelow.length || this.isBelowBedrock(this.position);
    }

    /**
     * Handles collision with the ground.
     * 
     * - If the player is jumping (positive `velocityY`), ignores ground collision check.
     * - Clones the player's current bounding box and adds a delta-Y corresponding to nextPosition.
     * - If the player is below bedock, resets position to `PLAYER_OFFSET`.
     * - If no blocks are found, let him freefall.
     * - Otherwise adjust his position to stand on top block below and calls `updateBoundingBox()` to match new position.
     */
    private handleGroundCollision(): void {
        if (this.velocityY > 0) {
            this.isGrounded = false;
            this.position.y += this.velocityY;
            return;
        }

        const nextPosition = this.object.position.clone();
        nextPosition.y += this.velocityY;
        const nextBoundingBox = this.getNextPositionBoundingBox(nextPosition);

        const blocksBelowNextPosition = this.getBlocksBelowPlayer(nextBoundingBox);

        if (this.isBelowBedrock(nextPosition)) {
            this.isGrounded = true;
            this.velocityY = 0;
            this.isJumping = false;
            this.position.y = PLAYER_OFFSET;
            return;
        }

        if (!blocksBelowNextPosition.length) {
            this.isGrounded = false;
            this.position.y += this.velocityY;
            return;
        }

        this.isGrounded = true;
        this.velocityY = 0;
        this.isJumping = false;
        this.position.y = blocksBelowNextPosition[0].position.y + 1 + PLAYER_OFFSET;
        this.updateBoundingBox();
    }

    /**
     * Computes the bounding box for the given `nextPosition`.
     *
     * - Clones the current bounding box.
     * - Moves it using the difference between `this.position` and `nextPosition`.
     * @param nextPosition - The position to move the bounding box to.
     * @returns A new `THREE.Box3` representing the bounding box at `nextPosition`.
     */
    private getNextPositionBoundingBox(nextPosition: Vector3): Box3 {
        const deltaVector = this.getNextPositionDelta(nextPosition);
        const nextBoundingBox = this.boundingBox.clone();
        nextBoundingBox.min.add(deltaVector);
        nextBoundingBox.max.add(deltaVector);
        return nextBoundingBox;
    }

    /**
     * Returns the delta vector between current position and nextPosition.
     *
     * - Clones the current `THREE.Vector3` position.
     * - Substracts nextPosition.
     * 
     * @param nextPosition - The `THREE.Vector3` to get a delta from.
     * @returns A `THREE.Vector3` representing the delta between both positions.
     */
    private getNextPositionDelta(nextPosition: Vector3): Vector3 {
        return nextPosition.clone().sub(this.position);
    }

    /**
     * Retrieves all blocks directly below the given player's bounding box to determine
     * if the player is on solid ground.
     *
     * - Rounds the bounding box's bottom corners coordinates.
     * - Iterates over all `(x, z)` positions to retrieve blocks and add them to a array.
     *
     * @param box - The `THREE.Box3` bounding box representing a player position.
     * @returns An array of blocks found below the bounding box.
     */
    private getBlocksBelowPlayer(box: Box3): Array<Block> {
        const blocksBelow: Array<Block> = [];

        const minX = Math.round(box.min.x);
        const maxX = Math.round(box.max.x);
        const minZ = Math.round(box.min.z);
        const maxZ = Math.round(box.max.z);
        const y = box.min.y;

        for (let x = minX; x <= maxX; x++) {
            for (let z = minZ; z <= maxZ; z++) {
                const blockPosition = new Vector3(x, y, z);
                const block = this.getBlockAt(blockPosition);
                if (block) blocksBelow.push(block);
            }
        }

        return blocksBelow;
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

        // if (event.code === 'Space') this.jump();
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
