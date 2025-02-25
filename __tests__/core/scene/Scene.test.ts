import Scene from '@/core/scene/Scene';
import { Scene as ThreeScene } from 'three';

describe("Scene singleton", () => {
    test("should return the same instance of Scene", () => {
        const scene1 = Scene.getInstance();
        const scene2 = Scene.getInstance();
        expect(scene1).toBe(scene2);
    });

    test("should return a valid `THREE.Scene`", () => {
        const scene = Scene.getScene();
        expect(scene).toBeInstanceOf(ThreeScene);
    })

    test("should reset the scene correctly", () => {
        const sceneBeforeReset = Scene.getScene();
        Scene.reset();
        const sceneAfterReset = Scene.getScene();
        expect(sceneBeforeReset).not.toBe(sceneAfterReset);
    })
});
