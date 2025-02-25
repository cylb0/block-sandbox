import Renderer from "@/core/scene/Renderer"
import { WebGLRenderer } from "three";

jest.mock("three", () => ({
    WebGLRenderer: jest.fn(() => ({
        setSize: jest.fn(),
        domElement: document.createElement("canvas"),
    }))
}));

describe("Renderer singleton", () => {
    beforeEach(() => {
        (Renderer as any).instance = null;
    });

    test("should return the same instance of Renderer", () => {
        const renderer1 = Renderer.getInstance();
        const renderer2 = Renderer.getInstance();
        expect(renderer1).toBe(renderer2);
    });

    test("should return a valid object and `WebGLRenderer`", () => {
        const renderer = Renderer.getRenderer();
        expect(renderer).toBeInstanceOf(Object);
    });

    test("WebGLRenderer constructor called", () => {
        Renderer.getInstance();
        expect(WebGLRenderer).toHaveBeenCalled();
    });
});