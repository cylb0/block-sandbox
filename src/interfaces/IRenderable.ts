import { Object3D } from 'three';

/**
 * Interface for objects that can be rendered in a THREE.Scene.
 */
interface IRenderable {
    /**
     * `THREE.Object3D` representing the entity in the scene.
     * 
     * - Can be a `Mesh`, `Group` or any other `Object3D`.
     * - Used for transformations like position or rotation.
     */
    object: Object3D;

    /**
     * Renders the object.
     * 
     * - Should be called to make the object visible.
     */
    render(): void;
}

export default IRenderable;
