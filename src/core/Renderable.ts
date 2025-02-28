import { Object3D } from "three";
import Scene from "@/core/scene/Scene";

/**
 * Abstract class for objects that can be rendered in a THREE.Scene.
 */
abstract class Renderable {
    /**
     * `THREE.Object3D` representing the entity in the scene.
     * 
     * - Can be a `Mesh`, `Group` or any other `Object3D`.
     * - Used for transformations like position or rotation.
     */
    protected _object: Object3D;

    constructor(object: Object3D) {
        this._object = object;
    }

    public get object(): Object3D {
        return this._object;
    }

    /**
     * 
     */
    addToScene(): void {
        if (!Scene.getScene().children.includes(this.object)) {
            Scene.getScene().add(this.object);
        }
    }

    /**
     * Removes the block from the scene.
     */
    removeFromScene(): void {
        if (Scene.getScene().children.includes(this.object)) {
            Scene.getScene().remove(this.object);
        }
    }
}

export default Renderable;
