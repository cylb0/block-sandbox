import { AxesHelper, GridHelper, ColorRepresentation, PlaneGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three";
import { WORLD_SIZE, CHUNK_SIZE } from "../constants/world";
import TestBlock from "../blocks/TestBlock";
import Scene from "../scene/Scene";
import { BLOCK_OFFSET_VECTOR, BLOCK_SIZE } from "../constants/block";

/**
 * A utility service for rendering game related visual helpers
 */
class GameHelper {
    /**
     * Adds an example cube to the `THREE.Scene` for testing purpose.
     *
     * - The cube is red with a black wireframe and is positioned at the center (0, 0, 0) of the scene.
     */
    public static displayExampleCube(): void {
        const cube = new TestBlock(new Vector3(0, 0, 0));
        cube.render();
    }

    /**
     * Displays a `THREE.AxesHelper` in the scene.
     * 
     * - Helper indicates the X (red), Y (green) and Z (blue) axes.
     * - Size is determined by the largest world dimension.
     */
    public static displayAxesHelper(): void {
        const axesHelper = new AxesHelper(Math.max(WORLD_SIZE.size * CHUNK_SIZE, WORLD_SIZE.depth));
        Scene.getScene().add(axesHelper);
    }

    /**
     * Display a grid helper to the `THREE.scene`.
     */
    public static displayGrid(): void {
        let gridHelper = new GridHelper();
        gridHelper.position.add(BLOCK_OFFSET_VECTOR)
        Scene.getScene().add(gridHelper);
    }

    /**
     * Display a plane that represents the lower boundary of the world.
     * 
     * - Uses a `THREE.PlaneGeometry` to represent the lower limit.
     * 
     * @param color - The color of the floor.
     */
    public static displayFloor(color: ColorRepresentation = 0x228b00): void {
        const groundSize = WORLD_SIZE.size * CHUNK_SIZE * 2;
        const groundGeometry = new PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new MeshBasicMaterial({ color });
        groundMaterial.transparent = true;
        groundMaterial.opacity = .5;
        const ground = new Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y -= BLOCK_SIZE / 2;
        Scene.getScene().add(ground);
    }
    
    /**
     * Display world boundaries.
     * 
     * - Creates four walls to enclose the world using `THREE.PlaneGeometry`.
     * 
     * @param color - The color of the walls.
     */
    public static displayBoundaries(color: ColorRepresentation = 0x228b00)
    {
        const worldSize = WORLD_SIZE.size * CHUNK_SIZE;
        const wallHeight = WORLD_SIZE.depth;
        const wallMaterial = new MeshBasicMaterial({ color });
        wallMaterial.transparent = true;
        wallMaterial.opacity = .5;

        const createWall = (width: number, height: number, x: number, z: number, rotationY: number = 0) => {
            const wallGeometry = new PlaneGeometry(width, height);
            const wall = new Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, 0, z);
            wall.rotation.y = rotationY;
            Scene.getScene().add(wall);
        }

        createWall(worldSize, wallHeight, -worldSize / 2, 0, Math.PI / 2);
        createWall(worldSize, wallHeight, worldSize / 2, 0, - Math.PI / 2);
        createWall(worldSize, wallHeight, 0, worldSize / 2, 0);
        createWall(worldSize, wallHeight, 0, - worldSize / 2, Math.PI);
    }
}

export default GameHelper;
