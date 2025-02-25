import { ArrowHelper, Box3, BoxGeometry, Camera, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import World from "@/world/World";
import Collidable from "@/core/Collidable";
import { JUMP_VELOCITY, PLAYER_BASE_SPEED, PLAYER_DIMENSIONS, PLAYER_VERTICAL_OFFSET, PLAYER_SPAWN_POSITION } from "@/constants/player";
import IRenderable from "@/interfaces/IRenderable";
import { CAMERA_ROTATION_SENSITIVITY } from "@/constants/camera";
import IMovable from "@/interfaces/IMovable";
import Scene from "@/core/scene/Scene";
import { CHUNK_SIZE, GRAVITY, MAX_VELOCITY, WORLD_SIZE } from "@/constants/world";
import Block from "@/blocks/Block";
import { BLOCK_SIZE } from "@/constants/block";

class Player extends Collidable implements IMovable, IRenderable {
    private touchStartX: number = 0;
    private touchStartY: number = 0;
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
    /** Wether the player is currently jumping. */
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

        this.object.add(camera);
        camera.position.set(1.5, 5, 3);
        camera.lookAt(1.5, 0, 0);

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
     * - Calls `updateGroundedState()` to check if player should fall from his next position.
     * - Calls `appliGravity()` to apply y-axis changes.
    */
    public move(): void {
        this.handleKeyInputs();
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
     * - Computes next position.
     * - Checks if player will exit world boundaries, if so returns early.
     * - Check for directional block collision.
     * - Updates position if no collision is detected.
     * 
     * @param direction - The normalized direction vector.
     * @param multiplier - The movement intensity (negative to move backwards).
     */
    public moveDirection(direction: Vector3, multiplier: number): void {
        const nextPosition = this.object.position.clone().addScaledVector(direction, this.speed * multiplier);
        const isExitingWorld = this.handleBoundariesCollision(nextPosition);
        if (isExitingWorld) return;
        const isColliding = this.handleDirectionalCollision(nextPosition);
        if (!isColliding) {
            this.position = nextPosition;
        }
    }

    /**
     * Checks if the player's next position will collide with the world boundaries.
     *
     * - Computes the next bounding box based on next position.
     * - Compares bounding box limits to detect out of boundaries movement.
     * - Returns `true` if the player would exit world boundaries.
     *
     * @param nextPosition - The `THREE.Vector3` representing the player's next position. 
     * @returns `true` if the next position collides with boundaries, `false` otherwise.
     */
    private handleBoundariesCollision(nextPosition: Vector3): boolean {
        const nextBoundingBox = this.getNextPositionBoundingBox(nextPosition);
        const worldSize = WORLD_SIZE.size * CHUNK_SIZE;
        const minX = -worldSize / 2 - BLOCK_SIZE / 2;
        const maxX = worldSize / 2 - BLOCK_SIZE / 2;
        const minZ = -worldSize / 2 - BLOCK_SIZE / 2;
        const maxZ = worldSize / 2 - BLOCK_SIZE / 2;

        return (
            nextBoundingBox.min.x < minX ||
            nextBoundingBox.max.x > maxX ||
            nextBoundingBox.min.z < minZ ||
            nextBoundingBox.max.z > maxZ
        );
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
     * Updates the `isGrounded` state by checking if there is a block below player.
     * 
     * - If no block is found below, check if player hit bedrock otherwise gravity will be applied.
     */
    private updateGroundedState(): void {
        const nextBoundingBox = this.getNextPositionBoundingBox(this.position.clone())
        const allCollidingBlocks = this.getAllCollidingBlocks(nextBoundingBox);
        const blocksBelow = allCollidingBlocks.filter(block =>
            block.position.y == Math.floor(nextBoundingBox.min.y)
        );
        this.isGrounded = !!blocksBelow.length || this.isBelowBedrock(this.position);
    }

    /**
     * Retrieves all blocks colliding with a player's bounding box.
     *
     * - Rounds the bounding box's corners coordinates.
     * - Iterates over all `(x, y, z)` positions to retrieve blocks and add them to a array.
     *
     * @param box - The `THREE.Box3` bounding box representing a player position.
     * @returns An array of blocks colliding with the given bounding box.
     */
    private getAllCollidingBlocks(box: Box3): Array<Block> {
        const collidingBlocks: Array<Block> = [];
        const minX = Math.round(box.min.x);
        const maxX = Math.round(box.max.x);
        const minY = Math.floor(box.min.y);
        const maxY = Math.ceil(box.max.y);
        const minZ = Math.round(box.min.z);
        const maxZ = Math.round(box.max.z);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const blockPosition = new Vector3(x, y, z);
                    const block = this.getBlockAt(blockPosition);
                    if (block) collidingBlocks.push(block);
                }
            }
        }

        return collidingBlocks;
    }

    /**
     * Handles collision with the ground.
     * 
     * - If the player is jumping (positive `velocityY`), ignores ground collision check.
     * - Clones the player's current bounding box and adds a delta-Y corresponding to nextPosition.
     * - If the player is below bedock, resets position to `PLAYER_OFFSET`.
     * - If no blocks are found, let him freefall.
     * - Otherwise adjust his position to stand on top block below.
     */
    private handleGroundCollision(): void {
        if (this.velocityY > 0) {
            this.handleFall();
            return;
        }

        const nextPosition = this.object.position.clone();
        nextPosition.y += this.velocityY;

        if (this.isBelowBedrock(nextPosition)) {
            this.handleHitBedrock()
            return;
        }

        const nextBoundingBox = this.getNextPositionBoundingBox(nextPosition);

        const allCollidingBlocks = this.getAllCollidingBlocks(nextBoundingBox);
        const belowCollidingBlocks = allCollidingBlocks.filter(block =>
            block.position.y < nextBoundingBox.min.y
        );
        
        if (!belowCollidingBlocks.length) {
            this.handleFall();
            return;
        }
        this.handleHitBlockBelow(belowCollidingBlocks[0]);
    }

    /**
     * Handles the player's fall (negative or positive) when no ground is detected.
     * 
     * - Sets `isGrounded` to false as bedrock is solid ground.
     * - Moves the player downwards or upwards bsed on `velocityY`.
     */
    private handleFall(): void {
        this.isGrounded = false;
        this.position.y += this.velocityY;
    }

    /**
     * Handles player colliding with bedrock.
     * - Sets `isGrounded`, `velocityY` and `isJumping`.
     * - Adjusts player's position to `PLAYER_VERTICAL_OFFSET`.
     */
    private handleHitBedrock(): void {
        this.isGrounded = true;
        this.velocityY = 0;
        this.isJumping = false;
        this.position.y = PLAYER_VERTICAL_OFFSET;
    }

    /**
     * Handles player colliding with a block below.
     * 
     * - Sets `isGrounded`, `velocityY` and `isJumping`.
     * - Adjusts player's position based on given block's position and `PLAYER_VERTICAL_OFFSET`.
     * 
     * @param block - The block that the player lands on.
     */
    private handleHitBlockBelow(block: Block): void {
        console.log('hit block')
        this.isGrounded = true;
        this.velocityY = 0;
        this.isJumping = false;
        this.position.y = block.position.y + 1 + PLAYER_VERTICAL_OFFSET;
    }

    /**
     * Handles directional collision detection and adjust `position` accordingly.
     *
     * - Computes the player's next bounding box based on movement.
     * - Retrieves blocks colliding with next bounding box.
     * - If a collision occurs:
     *      - Adjusts the player's position along x-axis and z-axis accordingly.
     *      - Prevents clipping by positioning player slightly away from block.
     * - If no collision is detected, movement proceeds.
     * 
     * @param nextPosition - The expected position of the player to check collisions for.
     * @returns `true` if a collision is handled, `false` otherwise.
     */
    private handleDirectionalCollision(nextPosition: Vector3): boolean {
        const nextBoundingBox = this.getNextPositionBoundingBox(nextPosition);

        const allCollidingBlocks = this.getAllCollidingBlocks(nextBoundingBox);
        const sideCollidingBlocks = allCollidingBlocks.filter(block =>
            block.position.y > nextBoundingBox.min.y
        );

        if (sideCollidingBlocks.length) {
            return true;
        }

        return false;
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
        const nextBoundingBox = this.getBoundingBox();
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
     * Checks wether or not the given player position is below floor.
     *
     * - It leverages `PLAYER_OFFSET` to adjust to player's lowest point.
     * 
     * @param position - The position to check.
     * @returns `true` if player's position is lower than world floor, `false` otherwise.
     */
    private isBelowBedrock(position: Vector3): boolean {
        return position.y <= PLAYER_VERTICAL_OFFSET;
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
     * Handles mouse down events.
     *
     * - Toggles `isMouseDown`.
     * - Removes cursor.
     */
    private onMouseDown(event: MouseEvent): void {
        this.isMouseDown = true;
        document.body.style.cursor = 'none';
    }

    /**
     * Handles mouse up events.
     *
     * - Toggles `isMouseDown`.
     * - Displays cursor.
     */
    private onMouseUp(event: MouseEvent): void {
        this.isMouseDown = false;
        document.body.style.cursor = 'default';
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
     * Handles touch start events.
     *
     * - If more than one touch is detected, ignores the event (prevents multi-touch).
     * - Sets `isMouseDown` to true.
     * - Stores the initial touch coordinates for movement calculations.
     * 
     * @param event - The `TouchEvent` containing input.
     */
    private onTouchStart(event: TouchEvent): void {
        if (event.touches.length > 1) return;
        this.isMouseDown = true;
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    /**
     * Handles touch end events.
     *
     * - Resets `isMOuseDown` when input stops.
     * 
     * @param event - The `TouchEvent` containing input.
     */
    private onTouchEnd(event: TouchEvent): void {
        this.isMouseDown = false;
    }

    /**
     * Handles touch move events.
     *
     * - Prevents default behavior.
     * - If the user is not touching, exits.
     * - If more than one touch is detected, ignores the event (prevents multi-touch).
     * - Computes delta movement between previous touch and current one.
     * - Adjust camera rotation and limits vertical rotation to prevent flipping.
     * - Updates `touchStartX` and `touchStartY` for next movement.
     * 
     * @param event - The `TouchEvent` containing input.
     */
    private onTouchMove(event: TouchEvent): void {
        if (!this.isMouseDown || event.touches.length > 1) return;
        event.preventDefault();

        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;

        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;

        this.object.rotation.y -= deltaX * CAMERA_ROTATION_SENSITIVITY;
        this.camera.rotation.x -= deltaY * CAMERA_ROTATION_SENSITIVITY;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

        this.touchStartX = touchX;
        this.touchStartY = touchY;
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
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('contextmenu', (event) => event.preventDefault());

        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
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

    /**
     * @override
     * Computes and returns an **axis-aligned bounding box** for the player.
     * 
     * - Overrides `getBoundingBox()` from `Collidable`.
     * - Ignores player's rotation to prevent weird collision behavior.
     * 
     * @returns The current axis-aligned bounding box of the object.
     */
    public getBoundingBox(): Box3 {
        const currentPosition = this.position.clone();
        return new Box3().setFromCenterAndSize(
            currentPosition,
            new Vector3(PLAYER_DIMENSIONS.width, PLAYER_DIMENSIONS.height, PLAYER_DIMENSIONS.length)
        );
    }
}

export default Player;
