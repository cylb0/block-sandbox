import { AmbientLight, ColorRepresentation, DirectionalLight, Scene, Vector3 } from 'three';
import { CHUNK_SIZE, WORLD_OFFSET, WORLD_SIZE } from '../constants/world';
import Chunk from './Chunk';
import Block from '../blocks/Block';

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

    /**
     * Creates a new world instance.
     *
     * @param scene - The `THREE.Scene` where world object will be added.
     */
    constructor(scene: Scene) {
        this.scene = scene;
        this.chunks = this.generateChunks();
    }

    /**
     * Generates and initializes chunks
     * 
     * - Places each chunk on it's `(x, z)` coordinates.
     * - The world is centered around `(0, 0, 0)` so chunk can have negative positions.
     * - Leverages `halfworld` to offset chunks.
     * 
     * @returns A 2D array of chunks.
     */
    private generateChunks(): Chunk [][] {
        const halfworld = Math.floor(WORLD_SIZE.size / 2);

        return Array.from({ length: WORLD_SIZE.size }, (_, x) =>
            Array.from({ length: WORLD_SIZE.size }, (_, z) => {
                const worldX = (x - halfworld) * CHUNK_SIZE;
                const worldZ = (z - halfworld) * CHUNK_SIZE;
                const chunkPosition = new Vector3(worldX, 0, worldZ);
                return new Chunk(chunkPosition);
            })
        );
    }

    /**
     * Retrieves the chunk at a given world position.
     *
     * - Converts world coordinates to `chunks` array indexes.
     * - Returns `null` if no chunk is found.
     * 
     * @param position - The world position to check.
     * @returns The chunk at the given position or `null` if not found.
     */
    public getChunkAt(position: Vector3): Chunk | null {
        const halfWorldSize = Math.floor(WORLD_SIZE.size / 2);
        const chunkX = Math.floor(position.x / CHUNK_SIZE) + halfWorldSize
        const chunkZ = Math.floor(position.z / CHUNK_SIZE) + halfWorldSize

        return this.chunks[chunkX]?.[chunkZ] || null;
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
    public getBlockAt(position: Vector3): Block | null {
        const chunk = this.getChunkAt(position);
        if (!chunk) return null;

        const blockX = Math.floor((position.x % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE);
        const blockY = Math.floor(position.y);
        const blockZ = Math.floor((position.z % CHUNK_SIZE + CHUNK_SIZE) % CHUNK_SIZE);

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
     * Renders all chunks in the world.
     *
     * - Iterates through the 2D `chunks` array.
     * - Calls `render()` on each chunk to render its blocks.
     */
    public render(): void {
        this.chunks.forEach(x =>
            x.forEach(chunk => 
                chunk.render()
            )
        );
    }
}

export default World;
