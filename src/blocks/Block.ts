import { BoxGeometry, ColorRepresentation, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial, Vector3 } from "three";
import Collidable from "@/core/Collidable";
import { BLOCK_SIZE } from "@/constants/block";

/**
 * Abstract base class representing a block in the game.
 *
 * - Each block has a position, color and opacity.
 * - Implements `IRenderable` to ensure all blocks can be rendered in the scene.
 */
abstract class Block extends Collidable {
    /**
     * Creates a new block instance.
     * 
     * - Calls `createObject()` to initialize `object` property.
     *
     * @param position - The world position of the block.
     * @param color - The block's color.
     * @param opacity - Optional opacity value (0 to 1).
     */
    constructor(position: Vector3, color: ColorRepresentation, opacity?: number) {
        const mesh = Block.createStandardBlockMesh(color, opacity);
        super(position, mesh);
    }

    /**
     * Creates and return a `THREE.Mesh` representing a block.
     *
     * - Generates a cube with color and opacity.
     *
     * @returns A `THREE.Mesh` representing the block.
     */
    private static createStandardBlockMesh(color: ColorRepresentation, opacity?: number): Mesh {
        const blockGeometry = new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const blockMaterial = new MeshStandardMaterial({ color });
        if (opacity !== undefined) {
            blockMaterial.transparent = true;
            blockMaterial.opacity = opacity;
        }
        const blockMesh = new Mesh(blockGeometry, blockMaterial);

        const edgesGeometry = new EdgesGeometry(blockGeometry);
        const edgesMaterial = new LineBasicMaterial({ color: 0x000000 });
        const edges = new LineSegments(edgesGeometry, edgesMaterial);
        blockMesh.add(edges);

        return blockMesh;
    }
}

export default Block;
