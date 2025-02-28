/**
 * Represents the size of the game world.
 *
 * - `size`: The number of chunks along the x and z axes.
 * - `depth`: The maximum height (y axis) of the world.
 */
export const WORLD_SIZE = { size: 50, depth: 32 };

/**
 * Represents the size of a chunk in blocks.
 * 
 * - A chunk is a square with a fixed number of blocks on x and z axes.
 */
export const CHUNK_SIZE = 16;

/**
 * Offset applied to each chunk's position to align with world origin.
 * 
 * - World is centered at `(0, 0, 0)`
 */
export const WORLD_OFFSET = (WORLD_SIZE.size * CHUNK_SIZE) / 2;

/** Y-axis acceleration. */
export const GRAVITY = -.01;

/** Maximum falling speed to prevent infinite acceleration. */
export const MAX_VELOCITY = 1;

/** World sea level. */
export const SEA_LEVEL = WORLD_SIZE.depth * .5;

/** Max distance in blocks to be rendered around the player's position. */
export const RENDER_BLOCK_DISTANCE = CHUNK_SIZE;

