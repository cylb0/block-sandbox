import Block from '@/blocks/Block';
import { Vector3 } from 'three';

class SnowBlock extends Block {
    constructor(position: Vector3) {
        super(position, 0xffffff);
    }
}

export default SnowBlock;
