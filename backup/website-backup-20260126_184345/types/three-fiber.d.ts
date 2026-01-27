import { Object3DNode, extend } from '@react-three/fiber';
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
    directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
    spotLight: Object3DNode<THREE.SpotLight, typeof THREE.SpotLight>;
    hemisphereLight: Object3DNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: JSX.IntrinsicElements['mesh'] & {
        intensity?: number;
        color?: string | THREE.Color;
      };
    }
  }
}

export {};
