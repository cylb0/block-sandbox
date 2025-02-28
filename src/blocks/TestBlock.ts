import { ColorRepresentation, Vector3 } from "three";
import Block from "@/blocks/Block";

class TestBlock extends Block {
    constructor(position: Vector3, color: ColorRepresentation = 0x6c3baa, opacity = .8) {
        super(position, color, opacity);
    }
}

export default TestBlock;
