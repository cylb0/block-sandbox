import { PERLIN_NOISE_AMPLITUDE } from "@/constants/world";

type Gradient = [number, number];

const gradients: Gradient[] = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1,-1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
];

/**
 * Represents a 2D Perlin Noise generator.
 *
 * - Uses gradients stored in a hash map for efficient lookup.
 * - Implements interpolation and smoothing functions.
 * - Supports multi-octave noise generation.
 */
class PerlinNoise {
    /** The seed used for generating gradient vectors. */
    #seed: number;
    /** Caches computed gardients vectors. */
    #gradients: { [key: string]: Gradient } = {};
    
    /**
     * Creates a new PerlinNoise generator.
     *
     * @param seed - The seed used for generating gradient vectors.
     */
    constructor(seed: number) {
        this.#seed = seed;
    }

    get seed(): number {
        return this.#seed;
    }

    /**
     * Generates Perlin noise at given coordinates.
     *
     * - Uses multiple octaves to produce more detailed noise.
     * 
     * @param x - x-coordinate.
     * @param y - y-coordinate.
     * @returns The computed noise value between -1 and 1;
     */
    public noise(x: number, y: number): number {
        let total = 0;
        let frequency = 1;
        let amplitude = PERLIN_NOISE_AMPLITUDE;
        let maxValue = 0;

        for (let i = 0 ; i < 5 ; i++) {
            total += this.rawNoise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= .5;
            frequency *= 2;
        }

        return total / maxValue;
    }

    /**
     * Smoothing function.
     * 
     * - Uses the `6t⁵ - 15t⁴ + 10t³` function for smooth transitions.
     *
     * @param t - The interpolation value (0 to 1).
     * @returns The smoothed value.
     */
    private smooth(t: number){
        return t * t * t * (t * (t * 6 - 15) + 10);
    };

    /**
     * Performs linear interpolation between two values.
     *
     * @param a - The starting value.
     * @param b - The ending value.
     * @param x - The interpolation factor (0 to 1).
     * @returns The interpolated value.
     */
    private interpolate(a: number, b: number, x: number): number {
        return a + x * (b - a);
    }

    /**
     * Computes the dot product of the gradient vector with the distance vector.
     * 
     * - Determines the influence of the gradient to the noise at a `x,y` point.
     * 
     * @param ix - (Integer) x-coordinate of the gradient vector.
     * @param iy - (Integer) y-coordinate of the gradient vector.
     * @param x - (Float) x-coordinate of the point.
     * @param y - (Float) y-coordinate of the point.
     * @returns The dot product value.
     */
    private dotProduct(ix: number, iy: number, x: number, y: number): number {
        const gradient = this.getGradient(ix, iy);
        const dx = x - ix;
        const dy = y - iy;
        return gradient[0] * dx + gradient[1] * dy;
    }

    /**
     * Retrieves or generates a gradient vector for a given grid cell.
     *
     * - Uses deterministic hash function to ensure same coordinates and seed always return same value.
     * - Caches gradients for futher use.
     * 
     * @param ix - (Integer) x-coordinate.
     * @param iy - (Integer) y-coordinate.
     * @returns A 2D gradient vector.
     */
    private getGradient(ix: number, iy: number): Gradient {
        const key = `${ix},${iy}`;
        if (!(key in this.#gradients)) {
            const index = Math.abs((ix * 1836311903) ^ (iy * 2971215073) ^ this.seed) % gradients.length;
            this.#gradients[key] = gradients[index];
        }
        return this.#gradients[key];
    }

    /**
     * Computes the Perlin noise value at given coordinates.
     *
     * - Finds the surrounding grid points.
     * - Interpolates based on dot products.
     * 
     * @param x - x coordinate.
     * @param y - y-coordinate.
     * @returns The raw Perline noise value.
     */
    private rawNoise(x: number, y: number): number {
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        const sx = this.smooth(x - x0);
        const sy = this.smooth(y - y0);

        const n0 = this.dotProduct(x0, y0, x, y);
        const n1 = this.dotProduct(x1, y0, x, y);
        const ix0 = this.interpolate(n0, n1, sx);

        const n2 = this.dotProduct(x0, y1, x, y);
        const n3 = this.dotProduct(x1, y1, x, y);
        const ix1 = this.interpolate(n2, n3, sx);

        return this.interpolate(ix0, ix1, sy);
    }
}

export default PerlinNoise;
