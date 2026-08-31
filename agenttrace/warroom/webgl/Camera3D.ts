export type Vec3 = [number, number, number];
export type Mat4 = Float32Array;

export interface Camera3DOptions {
  position?: Vec3;
  target?: Vec3;
  up?: Vec3;
  fovYRadians?: number;
  near?: number;
  far?: number;
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  if (length === 0) return [0, 0, 0];
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function perspective(
  fovYRadians: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError("aspect must be positive");
  }
  if (!(near > 0) || !(far > near)) {
    throw new RangeError("camera clipping planes are invalid");
  }

  const f = 1 / Math.tan(fovYRadians / 2);
  const nf = 1 / (near - far);

  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0,
  ]);
}

export function lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
    -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
    -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
    1,
  ]);
}

export class Camera3D {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fovYRadians: number;
  near: number;
  far: number;

  constructor(options: Camera3DOptions = {}) {
    this.position = options.position ?? [0, 0, 12];
    this.target = options.target ?? [0, 0, 0];
    this.up = options.up ?? [0, 1, 0];
    this.fovYRadians = options.fovYRadians ?? Math.PI / 3;
    this.near = options.near ?? 0.1;
    this.far = options.far ?? 1000;
  }

  getViewMatrix(): Mat4 {
    return lookAt(this.position, this.target, this.up);
  }

  getProjectionMatrix(aspect: number): Mat4 {
    return perspective(this.fovYRadians, aspect, this.near, this.far);
  }

  setTarget(target: Vec3): void {
    this.target = [...target];
  }

  setPosition(position: Vec3): void {
    this.position = [...position];
  }

  orbit(yawRadians: number, pitchRadians: number, distance?: number): void {
    const radius = distance ?? Math.hypot(
      this.position[0] - this.target[0],
      this.position[1] - this.target[1],
      this.position[2] - this.target[2],
    );
    const safePitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitchRadians));
    const cosPitch = Math.cos(safePitch);

    this.position = [
      this.target[0] + Math.sin(yawRadians) * cosPitch * radius,
      this.target[1] + Math.sin(safePitch) * radius,
      this.target[2] + Math.cos(yawRadians) * cosPitch * radius,
    ];
  }
}
