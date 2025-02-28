import { AmbientLight, ColorRepresentation, DirectionalLight, Scene, Vector3 } from 'three';
import { CHUNK_SIZE, RENDER_BLOCK_DISTANCE, WORLD_SIZE } from '@/constants/world';
import Chunk from '@/world/Chunk';
import Block from '@/blocks/Block';
import PerlinNoise from '@/core/noise/PerlinNoise';

/**
 * Represents the game world, manages chunks, terrain, lighting and scene elements.
 */
class World {
    /** The `THREE.Scene` scene where the world is rendered. */
    private scene: Scene;

    /**
     * 2D array of chunks representing the terrain on [x][z] axes.
    */
    private chunks: Chunk [][];

    /** Unique seed used for terrain procedural generation. */
    private seed;

    /** PerlinNoise object used to generate pseudo-random terrain height. */
    private perlin: PerlinNoise;

    /**
     * Creates a new world instance.
     *
     * @param scene - The `THREE.Scene` where world object will be added.
     */
    constructor(scene: Scene, seed: number) {
        this.scene = scene;
        this.seed = seed;
        this.perlin = new PerlinNoise(this.seed);
        this.chunks = [];
    }

    /**
     * Loops through nearby chunks and trigger a block visibility update on those chunks.
     * 
     * @param playerPosition - The current position to update blocks visibility around.
     */
    updateRenderedBlocks(playerPosition: Vector3): void {
        const nearbyChunks = this.getNearbyChunks(playerPosition);
        nearbyChunks.forEach(chunk => chunk?.updateRenderedBlocks(playerPosition));
    }

    /**
     * Retrieves the chunk at a given world position.
     *
     * - Converts world coordinates to `chunks` array indexes.
     * - Returns `null` if out of bounds.
     * - Retrieves the corresponding chunk.
     * 
     * @param position - The world position to check.
     * @returns The chunk at the given position or `null` if out of bounds.
     */
    public getChunkAtPosition(position: Vector3): Chunk | null {
        const { x, z } = this.getChunkIndexes(position);

        if (!this.isChunkInBoundaries(x, z)) return null;

        return this.getChunk(x, z);
    }

    /**
     * Returns `this.chunk[x][z]`.
     *
     * - Initializes arrays if necessary.
     * - Creates chunk if necessary.
     * 
     * @param x - x-index in `this.chunks`.
     * @param z - z-index in `this.chunks`.
     * @returns `this.chunks[x][z]`.
     */
    private getChunk(x: number, z: number): Chunk {
        if (!this.chunks[x]) {
            this.chunks[x] = [];
        }

        if (!this.chunks[x][z]) {
            this.chunks[x][z] = this.createChunk(x, z);
        }
        return this.chunks[x][z];
    }

    /**
     * Generates a new chunk.
     *
     * - World is centered around `0, 0, 0` origin so chunk can have negative coordinates.
     * - Leverages `halfworld` to offset chunks.
     * - Creates a new chunk using computed position and `this.perlin` object.
     * 
     * @param x - x-index in `this.chunks`.
     * @param z - z-index in `this.chunks`.
     * @returns a new chunk with its own position and perlin noise generator.
     */
    private createChunk(x: number, z: number): Chunk {
        const halfworld = Math.floor(WORLD_SIZE.size / 2);
        const worldX = (x - halfworld) * CHUNK_SIZE;
        const worldZ = (z - halfworld) * CHUNK_SIZE;
        const chunkPosition = new Vector3(worldX, 0, worldZ);
        return new Chunk(chunkPosition, this.perlin);
    }

    /**
     * Retrieves the block at a given world position.
     *
     * - Finds the chunk searched block belongs to.
     * - Convers world coordinates to local chunk coordinates.
     * - Returns `null` if no block is found.
     * 
     * @param position - The world position to check.
     * @returns The block at the given position or `null` if not found.
     */
    public getBlockAtPosition(position: Vector3): Block | null {
        const chunk = this.getChunkAtPosition(position);
        if (!chunk) return null;

        const blockX = ((Math.floor(position.x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const blockY = Math.floor(position.y);
        const blockZ = ((Math.floor(position.z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        return chunk.getBlock(blockX, blockY, blockZ);
    }
    
    /**
     * Adds ambient lighting to the scene.
     *
     * - Creates indirect lighting, making everything uniformly lit.
     *
     * @param options - Configuration object for the ambient light.
     * @param options.color - The ambient light color (default: `0xffffff`). 
     * @param options.intensity - The light intensity, expects a float (default: `1`).
     */
    public addAmbientLight({
        color = 0xffffff,
        intensity = 1
    }: {
        color?: ColorRepresentation;
        intensity?: number;
    } = {}): void {
        const ambientLight  = new AmbientLight(color, intensity);
        this.scene.add(ambientLight);
    }

    /**
     * Adds a directional sunlight source.
     *
     * - Creates sunlight coming from a specific direction.
     * - Enables shadows to add realism.
     *
     * @param options - Configuration object for the sunlight.
     * @param options.position - The light's position in `THREE.Scene` (default: `(10, 20, 10)`).
     * @param options.color - The light's color (default: `0xffffff`).
     * @param options.intensity - Tthe light's intensity (default: `1`).
     * @param options.shadow - Wether or not shadows should be enabled (default: `false`).
     */
    public addSunLight({
        position = new Vector3(WORLD_SIZE.size * 2, WORLD_SIZE.depth * 2, WORLD_SIZE.size * 2),
        color = 0xffffff,
        intensity = 1,
        shadow = false,
    }: {
        position?: Vector3;
        color?: ColorRepresentation;
        intensity?: number;
        shadow?: boolean;
    } = {}): void {
        const sunLight = new DirectionalLight(color, intensity);
        sunLight.position.copy(position);
        sunLight.castShadow = shadow;
        this.scene.add(sunLight);
    }

    /**
     * Computes a real world position into corresponding chunk indexes in `this.chunks`.
     * 
     * @param position - The `THREE.Vector3` real world position to compute.
     * 
     * @returns an object containing a pair {x, z} representing `this.chunks` indexes.
     */
    private getChunkIndexes(position: Vector3): {
        x: number,
        z: number
    } {
        const halfWorldSize = Math.floor(WORLD_SIZE.size / 2);
        return {
            x: Math.floor(position.x / CHUNK_SIZE) + halfWorldSize,
            z: Math.floor(position.z / CHUNK_SIZE) + halfWorldSize
        }
    }

    /**
     * Retrieves all chunks that may contain blocks in a radius around player's position.
     *
     * - Retrieves the chunk coordinates in world grid corresponding to given position.
     * - Computes the max radius in chunks corresponding to `RENDER_BLOCK_DISTANCE`.
     * - Retrieves all chunks that overlap this radius.
     * 
     * @param position - The `THREE.Vector3` position to retrieve chunks around.
     * @returns an array of Chunks around the position.
     */
    private getNearbyChunks(position: Vector3): Array<Chunk> {
        let nearbyChunks: Array<Chunk> = [];

        const { x, z } = this.getChunkIndexes(position);
        const chunkRenderRadius = Math.ceil(RENDER_BLOCK_DISTANCE / CHUNK_SIZE)

        for (let dx = -chunkRenderRadius; dx <= chunkRenderRadius; dx++) {
            for (let dz = -chunkRenderRadius; dz <= chunkRenderRadius; dz++) {
                const newChunkX = x + dx;
                const newChunkZ = z + dz;

                if (this.isChunkInBoundaries(newChunkX, newChunkZ)) {
                    nearbyChunks.push(this.getChunk(newChunkX, newChunkZ));
                }
            }
        }

        return nearbyChunks;
    }

    /**
     * Checks if given chunk coordinates in world grid correspond to existing chunk.
     * 
     * @param chunkX - The x-coordinate.
     * @param chunkZ - The z-coordinate.
     * @returns `true` if chunk is within world boundaries, `false` otherwise.
     */
    private isChunkInBoundaries(chunkX: number, chunkZ: number): boolean {
        return chunkX >= 0 && chunkX < WORLD_SIZE.size && chunkZ >= 0 && chunkZ < WORLD_SIZE.size;
    }
}

export default World;
