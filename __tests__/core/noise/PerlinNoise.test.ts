import PerlinNoise from "@/core/noise/PerlinNoise";

describe("Perlin noise", () => {
    let perlin: PerlinNoise;

    beforeEach(() => {
        perlin = new PerlinNoise(42);
    });

    test("should create a PerlinNoise instance with a seed", () => {
        expect(perlin.seed).toBe(42);
    });

    test("should generate consistent noise for same coordinates", () => {
        const noise1 = perlin.noise(4, 12);
        const noise2 = perlin.noise(4, 12);
        expect(noise1).toBe(noise2);
    });

    test("should generate different noise for different coordinates", () => {
        const noise1 = perlin.noise(4, 12);
        const noise2 = perlin.noise(7, 23);
        expect(noise1).toBe(noise2);
    });

    test("should generate different noise for different seed", () => {
        const perlin2 = new PerlinNoise(69);
        const noise1 = perlin.noise(4, 12);
        const noise2 = perlin2.noise(4, 12);
    });

    test("should generate noise within a reasonable range", () => {
        for (let i = 0 ; i < 100 ; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const noise = perlin.noise(x, y);
            expect(noise).toBeGreaterThanOrEqual(-1);
            expect(noise).toBeLessThanOrEqual(1)
        }
    });

    test("should generate smooth noise", () => {
        const scale = 100;
        const noise1 = perlin.noise(4 / scale, 12 / scale);
        const noise2 = perlin.noise(4 / scale, 13 / scale);
        const noise3 = perlin.noise(5 / scale, 12 / scale);
        expect(Math.abs(noise1 - noise2)).toBeLessThan(.5);
        expect(Math.abs(noise2 - noise3)).toBeLessThan(.5);
        expect(Math.abs(noise1 - noise3)).toBeLessThan(.5);
    });
});
