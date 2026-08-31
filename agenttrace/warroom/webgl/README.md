# War-Room WebGL renderer

The WebGL renderer is a read-only presentation layer over `WarRoomViewModel` / `worm_visualization` output.

It does not mutate simulation state and does not generate simulation randomness.

`WebGLRenderer3D.projectRenderEntity()` maps existing 2D worm visualization values into a stable 3D render coordinate. The z-coordinate is derived from aggression for visual separation only.

The renderer uses WebGL2 VAO + dynamic buffers for position, color, size and opacity attributes.
