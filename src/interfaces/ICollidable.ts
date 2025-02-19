import { Vector3 } from "three";

/**
 * Interface for objects that can collide with other entities.
 */
interface ICollidable {
    /**
     * Checks if a given position collides with this object.
     *
     * @param position - The position to check for collision.
     * @return `true` if there is a collision, `false` otherwise.
     */
    checkCollision(position: Vector3): boolean;
}

export default ICollidable;
