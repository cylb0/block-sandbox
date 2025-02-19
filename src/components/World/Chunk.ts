import { Vector3 } from "three";
import { CHUNK_OFFSET, CHUNK_SIZE, WORLD_SIZE } from "../../constants/world";
import Block from "../Blocks/Block";

/**
 * Represents a chunk in the game world containing a 3D grid of blocks.
 * 
 * - Each chunk has a fixed size (`CHUNK_SIZE x CHUNK_SIZE x WORLD_SIZE.DEPTH`).
 * - The chunk's position is adjusted using `CHUNK_OFFSET` to align with the world coordinates.
 */
class Chunk {
    /**
     * 3D array representing blocks within the chunk on `(x, y, z)` axes.
     *
     * - `(x, z)` axis represent coordinates on the floor while `y` axis is used for depth.
    */
    private blocks: (Block | null) [][][];
    /** Position of the chunk in world coordinates. */
    private position: Vector3;

    /**
     * Creates a new chunk at the given world position.
     *
     * @param position - The chunk's position in world frame coordinates. 
     */
    constructor(position: Vector3) {
        this.position = position.add(CHUNK_OFFSET);
        this.blocks = this.initTestChunk(); // Test
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
        class RedTestBlock extends Block {
            constructor(position: Vector3) {
                super(position, 0xff817e);
            }
        }

        return Array.from({ length: CHUNK_SIZE }, (_, x) =>
            Array.from({ length: CHUNK_SIZE }, (_, z) => {
                const maxHeight = Math.floor(WORLD_SIZE.depth / 4) * 3;
                const stackHeight = Math.floor(Math.random() * (maxHeight )) + 1;
                return Array.from({ length: WORLD_SIZE.depth }, (_, y) => {
                    return (y < stackHeight) ? new RedTestBlock(new Vector3(x, y, z).add(this.position)) : null;
                })
            })
        );
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
}

export default Chunk;
