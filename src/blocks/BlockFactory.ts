import BlockType from "@/enums/BlockType";
import { Vector3 } from "three";
import Block from "@/blocks/Block";
import DirtBlock from "@/blocks/DirtBlock";
import GrassBlock from "@/blocks/GrassBlock";
import StoneBlock from "@/blocks/StoneBlock";
import WaterBlock from "@/blocks/WaterBlock";
import SnowBlock from "@/blocks/SnowBlock";

class BlockFactory {
    public static createBlock(type: BlockType, position: Vector3): Block {
        switch (type) {
            case BlockType.Dirt:
                return new DirtBlock(position);
            case BlockType.Grass:
                return new GrassBlock(position);
            case BlockType.Snow:
                return new SnowBlock(position);
            case BlockType.Stone:
                return new StoneBlock(position);
            case BlockType.Water:
                return new WaterBlock(position);
            default:
                throw new Error('Invalid type.');
        }
    }
}

export default BlockFactory;
