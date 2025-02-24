import { Box3, Object3D, Vector3 } from "three";

/**
 * Base class for all collidable objects.
 *
 * - Provides `getBoundingBox` for collision detection.
 * - Implements `checkCollision()`.
 * - Used by static and moving objects.
 */
abstract class Collidable {
    /**
     * The `THREE.Object3D` representing the entity.
     */
    public object: Object3D;

    /**
     * Creates a new collidable object.
     * 
     * @param position - The wworld position.
     * @param object - The 3D object representing the entity.
     */
    constructor(position: Vector3, object: Object3D) {
        this.object = object;
        this.object.position.copy(position);
    }

    /**
     * Gets the position of the object.
     *
     * - Returns the position reference from `object.position`.
     *
     * @returns A reference to the `THREE.Vector3` position.
     */
    get position(): Vector3 {
        return this.object.position;
    }

    /**
     * Sets the position of the object and updates its bounding box.
     *
     * - Assigns a new position to `object.position`.
     * - Calls `updateBoundingBox()` to reflect position changes.
     */
    set position(newPosition: Vector3) {
        this.object.position.copy(newPosition);
    }

    /**
     * Computes and returns the bounding box of the object at its current position.
     *
     * - Uses `THREE.Box3.setFromObject()` to get an up to date bounding box.
     *
     * @returns The current bounding box of the object.
     */
    public getBoundingBox(): Box3 {
        return new Box3().setFromObject(this.object);
    }

    /**
     * Checks if this object collides with a given position.
     * 
     * @param position - The position to check.
     * @returns `true` if there is a collision, `false` otherwise.
     */
    public checkPointCollision(position: Vector3): boolean {
        return this.getBoundingBox().containsPoint(position);
    }

    /**
     * Checks if this object's collides with another `Collidable` object.
     *
     * - Uses `THREE.Box3.intersectsBox()` to check for intersection.
     * @param collidable - The other collidable object to check collision with.
     * @returns `true` if there is a collision, `false` otherwise.
     */
    public checkObjectCollision(collidable: Collidable): boolean {
        return this.getBoundingBox().intersectsBox(collidable.getBoundingBox());
    }
}

export default Collidable;
