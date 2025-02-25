import { BLOCK_SIZE } from "@/constants/block";

/**
 * Represents the dimensions of the player model (hitbox).
 * 
 * - `width`: The player's width in world units.
 * - `height`: The player's height in world units.
 * - `length`: The player's length in world units.
 */
export const PLAYER_DIMENSIONS = { width: .5, height: 2, length: .5 };

/** Defines the player's base spawn position in the world. */
export const PLAYER_SPAWN_POSITION = { x: 0, y: 5, z: 0 };

/** Represents the player's vertical offset relative on ground. */
export const PLAYER_VERTICAL_OFFSET = PLAYER_DIMENSIONS.height / 2 - BLOCK_SIZE / 2;

/** Represents the player's x-axis offset. */
export const PLAYER_X_OFFSET = PLAYER_DIMENSIONS.width / 2 + BLOCK_SIZE / 2;

/** Represents the player's z-axis offset. */
export const PLAYER_Z_OFFSET = PLAYER_DIMENSIONS.length / 2 + BLOCK_SIZE / 2;

/** Safe distance to keep between player and blocks to prevent clipping. */
export const PLAYER_BLOCK_DISTANCE = .01;

/**
 * Defines the base movement speed of the player.
 *
 * - Measured in world units per update.
 * - May be modified through movement actions.
 */
export const PLAYER_BASE_SPEED = .1;

/** Defines the upward velocity for jumping. */
export const JUMP_VELOCITY = .2;
