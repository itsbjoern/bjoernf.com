import * as THREE from "three";

export const createRectangleWithRoundedEdges = (
  width,
  height,
  depth,
  radius,
) => {
  width = width - radius * 2;
  height = height - radius * 2;

  const shape = new THREE.Shape();
  shape.moveTo(-width / 2 + radius, -height / 2);
  shape.lineTo(width / 2 - radius, -height / 2);
  shape.quadraticCurveTo(
    width / 2,
    -height / 2,
    width / 2,
    -height / 2 + radius,
  );
  shape.lineTo(width / 2, height / 2 - radius);
  shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  shape.lineTo(-width / 2 + radius, height / 2);
  shape.quadraticCurveTo(
    -width / 2,
    height / 2,
    -width / 2,
    height / 2 - radius,
  );
  shape.lineTo(-width / 2, -height / 2 + radius);
  shape.quadraticCurveTo(
    -width / 2,
    -height / 2,
    -width / 2 + radius,
    -height / 2,
  );

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 32,
    steps: 32,
    bevelSize: radius,
    bevelThickness: radius,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  return geometry;
};
