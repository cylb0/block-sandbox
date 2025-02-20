import { AmbientLight, ColorRepresentation, DirectionalLight, Scene, Vector3 } from 'three';
import { CHUNK_SIZE, WORLD_SIZE } from '../../constants/world';
import Chunk from './Chunk';

/**
 * Represents the game world, manages chunks, terrain, lighting and scene elements.
 */
class World {
    /** The `THREE.Scene` scene where the world is rendered. */
    private scene: Scene;

    /**
     * 2D array of chunks representing the terrain.
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
     * 
     * @returns A 2D array of chunks.
     */
    private generateChunks(): Chunk [][] {
        return Array.from({ length: WORLD_SIZE.size }, (_, x) =>
            Array.from({ length: WORLD_SIZE.size }, (_, z) => new Chunk(new Vector3(x * CHUNK_SIZE, 0, z * CHUNK_SIZE)))
        );
    }

    /**
     * Retrieves a chunk at given coordinates.
     *
     * @param x - The x-coordinate of the chunk.
     * @param z - The z-coordinate of the chunk.
     * @returns A `Chunk` object if found, `null` otherwise.
     */
    public getChunk(x: number, z: number): Chunk | null {
        if (x < 0 || x >= this.chunks.length || z < 0 || z >= this.chunks.length) return null;
        return this.chunks[x][z];
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
