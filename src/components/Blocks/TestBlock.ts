import { Vector3 } from "three";
import Block from "./Block";

class TestBlock extends Block {
    constructor(position: Vector3) {
        super(position, 0xff817e);
    }
}

export default TestBlock;
