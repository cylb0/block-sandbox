import { BoxGeometry, ColorRepresentation, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import Scene from "../Scene/Scene";
import { BLOCK_SIZE } from "../../constants/block";
import IRenderable from "../../interfaces/IRenderable";

/**
 * Abstract base class representing a block in the game.
 *
 * - Each block has a position, color and opacity.
 * - Implements `IRenderable` to ensure all blocks can be rendered in the scene.
 */
abstract class Block implements IRenderable {
    /** `THREE.Object3D` representation of the block. */
    public object: Object3D;

    /** The position of the block in world coordinates. */
    protected position: Vector3;

    /** The default color of the block. */
    protected color: ColorRepresentation;

    /** The block's opacity (if defined) */
    protected opacity?: number;

    /**
     * Creates a new block instance.
     *
     * @param position - The world position of the block.
     * @param color - The block's color.
     * @param opacity - Optional opacity value (0 to 1).
     */
    constructor(position: Vector3, color: ColorRepresentation, opacity?: number) {
        this.position = position;
        this.color = color;
        this.opacity = opacity;
        this.object = this.createObject();
    }

    /**
     * Creates and return a `THREE.Mesh` representing the current block.
     *
     * - Generates a cube applying its color and opacity.
     *
     * @returns A `THREE.Mesh` representing the block.
     */
    protected createObject(): Mesh {
        const blockGeometry = new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const blockMaterial = new MeshStandardMaterial({ color: this.color });

        if (this.opacity !== undefined) {
            blockMaterial.transparent = true;
            blockMaterial.opacity = this.opacity;
        }

        const blockMesh = new Mesh(blockGeometry, blockMaterial);
        blockMesh.position.set(
            Math.floor(this.position.x) + BLOCK_SIZE / 2,
            Math.floor(this.position.y) + BLOCK_SIZE / 2,
            Math.floor(this.position.z) + BLOCK_SIZE / 2,
        );

        return blockMesh;
    }

    /**
     * Renders the block in the scene.
     */
    public render(): void {
        Scene.getScene().add(this.object);
    }

    /**
     * Gets the position of the block.
     * 
     * @returns A cloned `THREE.Vector3` representing the block's position.
     */
    get getPosition(): Vector3 {
        return this.position.clone();
    }
}

export default Block;
