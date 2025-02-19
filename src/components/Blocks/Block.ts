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
    public object!: Object3D;

    /** The position of the block in world coordinates. */
    protected _position: Vector3;

    /** The default color of the block. */
    protected _color: ColorRepresentation;

    /** The block's opacity (if defined) */
    protected _opacity?: number;

    /**
     * Creates a new block instance.
     *
     * @param position - The world position of the block.
     * @param color - The block's color.
     * @param opacity - Optional opacity value (0 to 1).
     */
    constructor(position: Vector3, color: ColorRepresentation, opacity?: number) {
        this._position = position;
        this._color = color;
        this._opacity = opacity;
        this.render();
    }

    /**
     * Renders the block by creating a mesh and adding it to the scene.
     * 
     * - Creates a `THREE.BoxGeometry` with the block's size.
     * - Applies the block's color and opacity using a `THREE.MeshBasicMaterial`.
     * - Adds a `THREE.EdgeGeometry` to outline the block.
     * - Positions the block 
     */
    public render(): void {
        const blockGeometry = new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const blockMaterial = new MeshStandardMaterial({ color: this._color });

        if (this._opacity !== undefined) {
            blockMaterial.transparent = true;
            blockMaterial.opacity = this._opacity;
        }

        const blockMesh = new Mesh(blockGeometry, blockMaterial);
        blockMesh.position.set(
            Math.floor(this._position.x) + BLOCK_SIZE / 2,
            Math.floor(this._position.y) + BLOCK_SIZE / 2,
            Math.floor(this._position.z) + BLOCK_SIZE / 2,
        );

        this.object = blockMesh;
        Scene.getScene().add(this.object);
    }

    /**
     * Gets the position of the block.
     * 
     * @returns A cloned `THREE.Vector3` representing the block's position.
     */
    get position(): Vector3 {
        return this._position.clone();
    }
}

export default Block;
