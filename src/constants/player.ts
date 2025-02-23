import { BLOCK_SIZE } from "./block";
import { CHUNK_SIZE, WORLD_SIZE } from "./world";

/**
 * Represents the dimensions of the player model (hitbox).
 * 
 * - `width`: The player's width in world units.
 * - `height`: The player's height in world units.
 * - `length`: The player's length in world units.
 */
export const PLAYER_DIMENSIONS = { width: .8, height: 2, length: .8 };

/** Defines the player's base spawn position in the world. */
export const PLAYER_SPAWN_POSITION = { x: -.2, y: 5, z: -.2 };

export const PLAYER_OFFSET = PLAYER_DIMENSIONS.height / 2 - BLOCK_SIZE / 2;

/**
 * Defines the base movement speed of the player.
 *
 * - Measured in world units per update.
 * - May be modified through movement actions.
 */
export const PLAYER_BASE_SPEED = .1;

/** Defines the upward velocity for jumping. */
export const JUMP_VELOCITY = .2;
