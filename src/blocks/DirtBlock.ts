import Block from '@/blocks/Block';
import { Vector3 } from 'three';

class DirtBlock extends Block {
    constructor(position: Vector3) {
        super(position, 0x8b4513);
    }
}

export default DirtBlock;
