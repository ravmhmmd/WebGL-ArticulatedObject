function getRadian(value) {
  return (value * Math.PI) / 180;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

// Return the normalize value of the vector v
function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

// Cross product between vector a and vector b
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// Get the all vector normals of the edge beam object
function getVectorNormals(vPosition) {
  const n = vPosition.length;
  var vNormals = [];
  var vTangent = [];
  var vBitangent = [];
  for (let i = 0; i < n; i += 12) {
    const p1 = [vPosition[i], vPosition[i + 1], vPosition[i + 2]];
    const p2 = [vPosition[i + 3], vPosition[i + 4], vPosition[i + 5]];
    const p3 = [vPosition[i + 6], vPosition[i + 7], vPosition[i + 8]];
    const vec1 = subtractVectors(p2, p1);
    const vec2 = subtractVectors(p3, p1);
    const normalDirection = cross(vec1, vec2);
    const vecNormal = normalize(normalDirection);
    const vecTangent = normalize(vec1);
    const vecBitangent = normalize(vec2);
    for (let j = 0; j < 4; j++) {
      vNormals = vNormals.concat(vecNormal);
      vTangent = vTangent.concat(vecTangent);
      vBitangent = vBitangent.concat(vecBitangent);
    }
  }
  return [vNormals, vTangent, vBitangent];
}
