import Block from '@/blocks/Block';
import { Vector3 } from 'three';

class StoneBlock extends Block {
    constructor(position: Vector3) {
        super(position, 0x808080);
    }
}

export default StoneBlock;
