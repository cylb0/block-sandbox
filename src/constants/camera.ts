export const CAMERA_FOV = 75;
export const CAMERA_NEAR = .1;
export const CAMERA_FAR = 1000;
export const CAMERA_ROTATION_SENSITIVITY = .002;
export const CAMERA_PLAYER_DISTANCE = 5;

/**
 * Retrieves the current camera aspect ratio.
 * - Uses `window.innerWidth / window.innerHeight` to compute ratio.
 * - Returns a value for when window is not available.
 * @returns 
 */
export function getCameraAspect(): number {
    if (typeof window !== "undefined") {
        return window.innerWidth / window.innerHeight;
    }
    return 16 / 9;
}