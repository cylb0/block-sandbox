import { Frustum, Matrix4, Vector3 } from "three";
import { CHUNK_SIZE, RENDER_BLOCK_DISTANCE, SEA_LEVEL, WORLD_SIZE } from "@/constants/world";
import Block from "@/blocks/Block";
import PerlinNoise from "@/core/noise/PerlinNoise";
import BlockType from "@/enums/BlockType";
import BlockFactory from "@/blocks/BlockFactory";
import { PERLIN_NOISE_AMPLITUDE, PERLIN_NOISE_SCALE } from "@/constants/perlin";
import Camera from "@/core/scene/Camera";

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
    
    /** Handles Perlin Noise terrain height pseudo generation. */
    private perlin: PerlinNoise;
    
    /** Used to determine what is inside the camera's FOV. */
    frustum: Frustum = new Frustum();

    /**
     * Creates a new chunk at the given world position.
     *
     * @param position - The chunk's position in world frame coordinates. 
     */
    constructor(position: Vector3, perlin: PerlinNoise) {
        this.position = position;
        this.perlin = perlin;
        this.blocks = this.generateTerrain();
    }

    
    private generateTerrain(): (Block | null) [][][] {
         const chunkData: (Block | null) [][][] = Array.from({ length: CHUNK_SIZE }, () =>
            Array.from({ length: WORLD_SIZE.depth }, () =>
                Array.from({ length: CHUNK_SIZE }, () => null)
            )
        );

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = x + this.position.x;
                const worldZ = z + this.position.z;
                const noiseValue = this.perlin.noise(worldX / PERLIN_NOISE_SCALE, worldZ / PERLIN_NOISE_SCALE, PERLIN_NOISE_AMPLITUDE);
                const normalizedNoiseValue = ((noiseValue + 1) * .5);
                const height = normalizedNoiseValue * WORLD_SIZE.depth;

                for (let y = 0; y < height; y++) {
                    chunkData[x][y][z] = BlockFactory.createBlock(BlockType.Stone, new Vector3(worldX, y, worldZ));
                }
            }
        }

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = x + this.position.x;
                const worldZ = z + this.position.z;
                let highestBlockY = 0;

                for (let y = WORLD_SIZE.depth - 1; y >= 0; y--) {
                    if (chunkData[x][y][z] !== null) {
                        highestBlockY = y;
                        break;
                    }
                }

                if (highestBlockY < SEA_LEVEL) {
                    for (let y = highestBlockY; y <= SEA_LEVEL; y++) {
                        chunkData[x][y][z] = BlockFactory.createBlock(BlockType.Water, new Vector3(worldX, y, worldZ));
                    }
                }

                const isNextToWater = true;

                if (highestBlockY >= SEA_LEVEL) {

                    chunkData[x][highestBlockY][z] = BlockFactory.createBlock(BlockType.Grass, new Vector3(worldX, highestBlockY, worldZ));
                    if (highestBlockY - 1 >= 0) {
                        chunkData[x][highestBlockY - 1][z] = BlockFactory.createBlock(BlockType.Dirt, new Vector3(worldX, highestBlockY - 1, worldZ));
                    }
                }
            }
        }

        return chunkData;
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
        return this.blocks[x]?.[y]?.[z];
    }

    /**
     * Updates the render state of this chunk's blocks depending on the player position.
     * 
     * - Calls `updateFrustum()` to make sure it up to date.
     * - Loops over `this.blocks` array.
     * - Checks if a block is exposed.
     * - Checks if a block is within the cameras's frustum.
     * - Checks if a block is within the player's render distance.
     * - Adds visible blocks to the scene and removes out of view blocks.
     * 
     * @param playerPosition - The current `THREE.Vector3` player's position.
     */
    public updateRenderedBlocks(playerPosition: Vector3): void {
        this.updateFrustum();

        this.blocks.forEach((row, x) => 
            row.forEach((col, y) =>
                col.forEach((block, z) => {
                    if (block
                        && this.isBlockExposed(x, y, z)
                        && this.isBlockInRenderDistance(block, playerPosition)
                        && this.isBlockInFrustrum(block)
                    ) {
                        block.addToScene();
                    } else {
                        block?.removeFromScene();
                    }
                })
            )
        )
    }

    /**
     * Determines if the block at given position is exposed.
     * 
     * - Retrieves all 6 potential blocks surrounding the given block.
     * 
     * @param x - The x-coordinate of the block.
     * @param y - The y-coordinate of the block.
     * @param z - The z-coordinate of the block.
     * 
     * @returns `true` if at least one face of the block is not in contact with another block, `false` otherwise.
     */
    isBlockExposed(x: number, y: number, z: number): boolean {
        const neighbors = [
            this.getBlock(x - 1, y, z),
            this.getBlock(x + 1, y, z),
            this.getBlock(x, y - 1, + z),
            this.getBlock(x, y + 1, z),
            this.getBlock(x, y, z - 1),
            this.getBlock(x, y, z + 1)
        ];

        return neighbors.some(block => !block);
    }

    /**
     * Updates the frustrum based on the current camera view.
     *
     * - Computes the updated frustum from the camera's projection matrix and the camera's view matrix.
     *
     * Used to determine which objects are within the current camera's FOV,
     * for frustum culling optimization. (It removes objects outside the frustum.)
     */
    private updateFrustum(): void {
        const camera = Camera.getCamera();
        this.frustum.setFromProjectionMatrix(camera.projectionMatrix.multiply(camera.matrixWorldInverse));
    }

    /**
     * Checks wether a block is in the frustrum (visible by the camera) or not.
     * 
     * @param block - The block to check visibility of.
     * @returns `true` when block is visible, `false` otherwise.
     */
    private isBlockInFrustrum(block: Block): boolean {
        return this.frustum.intersectsObject(block.object)
    }

    /**
     * Verify that a block is within a given distance from player's position.
     * 
     * @param block - The block to check.
     * @param playerPosition - The current player's position.
     * @returns `true` if player block is within `RENDER_BLOCK_DISTANCE`, `false` otherwise.
     */
    private isBlockInRenderDistance(block: Block, playerPosition: Vector3): boolean {
        return block.position.distanceTo(playerPosition) < RENDER_BLOCK_DISTANCE + 1;
    }
}

export default Chunk;
