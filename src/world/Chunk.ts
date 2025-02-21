import { Vector3 } from "three";
import { CHUNK_SIZE, WORLD_SIZE } from "../constants/world";
import TestBlock from "../blocks/TestBlock";
import Block from "../blocks/Block";
import { block } from "sharp";

/**
 * Represents a chunk in the game world containing a 3D grid of blocks.
 * 
 * - Each chunk has a fixed size (`CHUNK_SIZE x CHUNK_SIZE x WORLD_SIZE.DEPTH`).
 * - The chunk's position is adjusted using `CHUNK_OFFSET` to align with the world coordinates.
 */
class Chunk {
    /**
     * 3D array representing blocks within the chunk on `(x, z, y)` axes.
     *
     * - `(x, z)` axis represent coordinates on the floor while `y` axis is used for depth.
    */
    private blocks: (Block | null) [][][];
    /** Position of the chunk in world coordinates. */
    public position: Vector3;

    /**
     * Creates a new chunk at the given world position.
     *
     * @param position - The chunk's position in world frame coordinates. 
     */
    constructor(position: Vector3) {
        this.position = position;
        this.blocks = this.initTestChunk(); // Test
        console.log('chunk created at world coordinates: ', this.position.x, this.position.z)
        this.blocks.forEach((col, x) =>
            col.forEach((row, y) =>
                row.forEach((block, z) => {
                    if (block) console.log(block.position)
                })
            )
        )
    }

    /**
     * Initializes the chunk with randomly generated test blocks.
     * 
     * - Uses `RedTestBlock` to populate the chunk.
     * - Generates a stack fo blocks for each `(x, z)` coordinate.
     * 
     * @returns A 3D array of blocks.
     */
    private initTestChunk(): (Block | null) [][][] {
        return Array.from({ length: CHUNK_SIZE }, (_,x) =>
            Array.from({ length: WORLD_SIZE.depth }, (_, y) => {
                return Array.from({ length: CHUNK_SIZE }, (_, z) => {
                    return this.generateTestBlock(x, y, z);
                })
            })
        );
    }

    /**
     * Generates a block at the given `(x, y, z)` position inside the chunk.
     *
     * - Uses the chunk's position as a base.
     * - Offsets the block to align with the world grid.
     * 
     * @param x - x-coordinate inside the chunk.
     * @param y - y-coordinate inside the chunk.
     * @param z - z-coordinate inside the chunK.
     * @returns A `Block` or `null` if no block should be positioned.
     */
    private generateTestBlock(x: number, y: number, z: number): Block | null {
        const worldX = this.position.x + x;
        const worldZ = this.position.z + z;
        const worldY = y;
        const maxY = Math.floor(Math.random() * WORLD_SIZE.depth / 2);
        if (y < maxY) return new TestBlock(new Vector3(worldX, worldY, worldZ));

        return null;
    }

    /**
     * Sets the chunk's position in world coordinates.
     *
     * @param x - The new x-coordinate of the chunk.
     * @param z - The new z-coordinate of the chunk.
     */
    public setPosition(x: number, z: number): void {
        this.position.set(x, 0, z);
    }

    /**
     * Sets a block for a specific location within the chunk.
     *
     * @param x - The x-coordinate in the chunk grid.
     * @param y - The y-coordinate in the chunk grid.
     * @param z - The z-coordinate in the chunk grid.
     * @param block - The block to place at given coordinates.
     */
    public setBlock(x: number, y: number, z: number, block: Block): void {
        this.blocks[x][y][z] = block;
    }

    /**
     * Returns a block at a specific location within the chunk.
     * 
     * @param x - The x-coordinate in the chunk grid.
     * @param y - The y-coordinate in the chunk grid.
     * @param z - The z-coordinate in the chunk grid.
     * @returns The block at the specified location or `null` if empty.
     */
    public getBlock(x: number, y: number, z: number): Block | null {
        return this.blocks[x][y][z];
    }

    /**
     * Renders all blocks within this chunk.
     *
     * - Iterates over the 3D `blocks` array.
     * - Calls `render()` on each existing block.
     */
    public render(): void {
        this.blocks.forEach(x =>
            x.forEach(y =>
                y.forEach(block => block?.render())
            )
        );
    }

}

export default Chunk;
