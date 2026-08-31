export interface Material {
  roughness: number;
  metalness: number;
  emissive: number;
}

export interface MaterialSample {
  color: [number, number, number];
  material: Material;
}

export class MaterialSystem {
  static defaultMaterial: Material = {
    roughness: 0.65,
    metalness: 0.15,
    emissive: 0.2,
  };

  sample(color: [number, number, number], material?: Partial<Material>): MaterialSample {
    const merged: Material = {
      ...MaterialSystem.defaultMaterial,
      ...material,
      roughness: Math.max(0, Math.min(1, material?.roughness ?? MaterialSystem.defaultMaterial.roughness)),
      metalness: Math.max(0, Math.min(1, material?.metalness ?? MaterialSystem.defaultMaterial.metalness)),
      emissive: Math.max(0, Math.min(1, material?.emissive ?? MaterialSystem.defaultMaterial.emissive)),
    };

    return { color, material: merged };
  }
}
