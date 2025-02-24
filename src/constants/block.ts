import { Vector3 } from "three";

/** Represents the size of a block in world units. */
export const BLOCK_SIZE = 1;

/** `THREE.Vector3` representing the offset needed to align `GameHelper` elements to blocks. */
export const BLOCK_OFFSET_VECTOR = new Vector3(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2, -BLOCK_SIZE / 2);