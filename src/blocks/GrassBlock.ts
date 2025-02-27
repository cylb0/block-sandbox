import { Vector3 } from "three";
import Block from "@/blocks/Block";

class GrassBlock extends Block {
    constructor(position: Vector3) {
        super(position, 0x228b22);
    }
}

export default GrassBlock;
