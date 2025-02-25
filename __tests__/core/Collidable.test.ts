import Collidable from "@/core/Collidable";
import { BoxGeometry, Mesh, Object3D, Vector3 } from "three";

describe("Collidable", () => {
    let object1: Object3D;
    let object2: Object3D;
    let collidable1: Collidable
    let collidable2: Collidable;

    beforeEach(() => {
        const geometry1 = new BoxGeometry(1, 1, 1);
        object1 = new Mesh(geometry1);
        collidable1 = new (class extends Collidable {})(new Vector3(0, 0, 0), object1);

        const geometry2 = new BoxGeometry(1, 1, 1);
        object2 = new Mesh(geometry2);
        collidable2 = new (class extends Collidable {})(new Vector3(.5, .5, .5), object2);
    });

    test("position should be initialized correctly", () => {
        expect(collidable1.position.x).toBe(0);
        expect(collidable1.position.x).toBe(0);
        expect(collidable1.position.x).toBe(0);
    });

    test("position should update correctly", () => {
        collidable1.position = new Vector3(1, 2, 3);
        expect(collidable1.position.x).toBe(1);
        expect(collidable1.position.y).toBe(2);
        expect(collidable1.position.z).toBe(3);
    });

    test("should return a valid bounding box", () => {
        const boundingBox = collidable1.getBoundingBox();
        expect(boundingBox.min.x).toBe(-.5);
        expect(boundingBox.min.y).toBe(-.5);
        expect(boundingBox.min.z).toBe(-.5);
        expect(boundingBox.max.x).toBe(.5);
        expect(boundingBox.max.y).toBe(.5);
        expect(boundingBox.max.z).toBe(.5);
    });

    test("should detect point collision correctly", () => {
        expect(collidable1.checkPointCollision(new Vector3(.2, .2, .2))).toBe(true);
        expect(collidable1.checkPointCollision(new Vector3(2, 2, 2))).toBe(false);
    });

    test("should detect object collision correctly", () => {
        expect(collidable1.checkObjectCollision(collidable2)).toBe(true);
    });

    test("should detect no object collision correctly", () => {
        collidable2.position = new Vector3(10, 10, 10);
        expect(collidable1.checkObjectCollision(collidable2)).toBe(false);
    });
});