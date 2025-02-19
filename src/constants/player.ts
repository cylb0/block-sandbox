/**
 * Represents the dimensions of the player model (hitbox).
 * 
 * - `width`: The player's width in world units.
 * - `height`: The player's height in world units.
 * - `length`: The player's length in world units.
 */
export const PLAYER_DIMENSIONS = { width: 1, height: 2, length: 1 };

/** Defines the player's base spawn position in the world. */
export const PLAYER_SPAWN_POSITION = { x: 0, y: 2, z: 5 };

/**
 * Defines the base movement speed of the player.
 *
 * - Measured in world units per update.
 * - May be modified through movement actions.
 */
export const PLAYER_BASE_SPEED = .1;