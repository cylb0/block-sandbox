import Block from '@/blocks/Block';
import { Vector3 } from 'three';

class WaterBlock extends Block {
    constructor(position: Vector3) {
        super(position, 0x1e90ff, .5);
    }
}

export default WaterBlock;
