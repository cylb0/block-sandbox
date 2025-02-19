import { Vector3 } from "three";

/**
 * Represents the size of the game world.
 *
 * - `size`: The number of chunks along the x and z axes.
 * - `depth`: The maximum height (y axis) of the world.
 */
export const WORLD_SIZE = { size: 4, depth: 4 };

/**
 * Represents the size of a chunk in blocks.
 * 
 * - A chunk is a square with a fixed number of blocks on x and z axes.
 */
export const CHUNK_SIZE = 2;

/**
 * Offset applied to each chunk's position to align with world origin.
 * 
 * - World is centered at `(0, 0, 0)`
 */
export const CHUNK_OFFSET = new Vector3(
    -(WORLD_SIZE.size * CHUNK_SIZE) / 2,
    0,
    -(WORLD_SIZE.size * CHUNK_SIZE) / 2
);