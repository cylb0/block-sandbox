import * as THREE from 'three';

export interface IRenderable {
    object: THREE.Object3D;
    updatePosition(): void;
    render(): void;
}
