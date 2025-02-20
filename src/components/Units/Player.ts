import { CAMERA_ROTATION_SENSITIVITY } from '../../constants/camera';
import IRenderable from '../../interfaces/IRenderable';
import { PLAYER_DIMENSIONS, PLAYER_SPAWN_POSITION, PLAYER_BASE_SPEED } from '../../constants/player';
import IMovable from '../../interfaces/IMovable';
import World from '../World/World';
import { ArrowHelper, BoxGeometry, Camera, Group, Mesh, MeshStandardMaterial, Scene, Vector3 } from 'three';

/**
 * Represents the player entity in the scene.
 *
 * Implements:
 * - `IRenderable` → Allows the player to be rendered in the scene.
 * - `IMovable` → Handles player movement.
 */
class Player implements IRenderable, IMovable {
    /**
     * The `THREE.Group` object representing the player's entity.
     *
     * - Contains the player model and camera.
     * - Used for rendering and transformations.
     */
    public object: Group;
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

    /**
     * Creates a new `Player` instance.
     * 
     * - Initializes movement, camera and event listeners.
     * - Calls `render()` to create the player model.
     *
     * @param scene - The `THREE.Scene` where the player is exists.
     * @param camera - The `THREE.Camera` attached to the player.
     * @param world - The `World` instance managing chunks and blocks.
     */
    constructor(scene: Scene, camera: Camera, world: World) {
        this.scene = scene;
        this.camera = camera;
        this.world = world;
        this.speed = PLAYER_BASE_SPEED;
        this.isMouseDown = false;
        this.object = this.createObject();

        this.initEventListeners();
        this.render();
    }

    /**
     * Creates and returns the player's `Object3D` instance.
     * 
     * - Creates a new `THREE.Group`.
     * - Configure the object's position using predefined parameters.
     * - Adds the player's camera to the group.
     * - Creates and add the player's `THREE.Mesh` to the object.
     */
    private createObject(): Group {
        const object = new Group();
        object.position.set(PLAYER_SPAWN_POSITION.x, PLAYER_SPAWN_POSITION.y, PLAYER_SPAWN_POSITION.z);
        object.add(this.camera);

        const playerGeometry = new BoxGeometry(PLAYER_DIMENSIONS.width, PLAYER_DIMENSIONS.height, PLAYER_DIMENSIONS.length);
        const playerMaterial = new MeshStandardMaterial({ color: 0x0000ff });
        const playerModel = new Mesh(playerGeometry, playerMaterial);
        object.add(playerModel);

        return object;
    }

    /**
     * Renders the player in the scene.
     * 
     * - Creates a `THREE.Mesh` model for the player.
     * - Adds the model to the instance's `object` property.
     * - Adds the `object` to the `THREE.Scene`.
     */
    public render(): void {
        if (this.scene.children.includes(this.object)) return;
        this.scene.add(this.object);
    }

    /**
     * Moves the player depending on user inputs.
     */
    public move(): void {
        const direction = this.getForwardDirection();
        const right = this.getRightDirection();

        if (this.keys['KeyA']) this.moveDirection(right, 1);
        if (this.keys['KeyD']) this.moveDirection(right, -1);
        if (this.keys['KeyW']) this.moveDirection(direction, 1)
        if (this.keys['KeyS']) this.moveDirection(direction, -1);

        this.updateDebugArrow();
    }

    /**
     * Moves the player in a given direction.
     *
     * @param direction - The normalized direction vector.
     * @param multiplier - The movement intensity (negative to move backwards).
     */
    public moveDirection(direction: Vector3, multiplier: number): void {
        this.object.position.addScaledVector(direction, this.speed * multiplier);
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
     * Adds a debug arrow to the scene.
     * 
     * - Debug arrow always points to the player's direction.
     * - The arrow starts below the player to not obstruct view.
     */
    private initDebugArrow(): void {
        const direction = new Vector3(0, 0, 1);
        const startPosition = this.object.position.clone().add(new Vector3(0, -1, 0));
        this.arrowHelper = new ArrowHelper(direction, startPosition, -5, 0xffc0cb);
        this.scene.add(this.arrowHelper);
    }

    /**
     * Updates the debug arrow's direction to match player's.
     * 
     * - Ensures the arrow always is pointing the same direction as player.
     * - Ensure the arrow stays below the player for visibility.
     */
    private updateDebugArrow(): void {
        if (!this.arrowHelper) return;
        const direction = new Vector3();
        this.object.getWorldDirection(direction);
        this.arrowHelper.setDirection(direction);
        const updatedPosition = this.object.position.clone().add(new Vector3(0, -1, 0));
        this.arrowHelper.position.copy(updatedPosition);
    }
}

export default Player;
