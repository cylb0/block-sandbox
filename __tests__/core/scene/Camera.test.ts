import Camera from "@/core/scene/Camera"
import { PerspectiveCamera } from "three";

describe("Camera singleton", () => {
    test("should return the same instance of Camera", () => {
        const camera1 = Camera.getInstance();
        const camera2 = Camera.getInstance();
        expect(camera1).toBe(camera2);
    });

    test("should return a valid `THREE.PerspectiveCamera`", () => {
        const camera = Camera.getCamera();
        expect(camera).toBeInstanceOf(PerspectiveCamera);
    });
});
