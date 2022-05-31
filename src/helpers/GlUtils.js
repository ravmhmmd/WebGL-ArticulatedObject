const compileShader = (gl, shaderType, shader) => {
  // Create, load, and compile the shader
  let glShader = gl.createShader(shaderType);
  gl.shaderSource(glShader, shader);
  gl.compileShader(glShader);

  if (!gl.getShaderParameter(glShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(glShader));
    gl.deleteShader(glShader);
    return null;
  }

  return glShader;
};

const createProgramShader = (gl) => {
  // Create program and attach shaders to the program
  const program = gl.createProgram();
  const vShader = compileShader(gl, gl.VERTEX_SHADER, vertexScript);
  const fShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentScript);

  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);

  gl.linkProgram(program);
  gl.useProgram(program);

  return program;
};

const createBuffer = (gl, bufferType, bufferData) => {
  // Creata and bind buffer
  const buffer = gl.createBuffer();
  gl.bindBuffer(bufferType, buffer);
  gl.bufferData(bufferType, bufferData, gl.STATIC_DRAW);

  return buffer;
};

// function to create each buffer needed for each vPosition
const setupBuffer = (gl, vPosition) => {

    const posBuffer =  createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vPosition))

    // get normals for each direction
    const normals = getVectorNormals(vPosition)
    const vNormal = normals[0]
    const normalTangent = normals[1]
    const normalBitangent = normals[2]

    // setup each buffer needed
    const normalBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vNormal) )
    const tanBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normalTangent))
    const bitTangentBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normalBitangent))
    const coordTextureBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(coordTextures)) // from konstan.js
    const idxBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idxBuff))

    return {
        position: posBuffer,
        normal: normalBuffer,
        tangent: tanBuffer,
        bitangent: bitTangentBuffer,
        textureCoord: coordTextureBuffer,
        indices: idxBuffer,
    };
}

const sendDataToShader = (gl, program, attributeName, buffer, bufferSize) => {
  // Find attribute location and enable the attribute array
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const location = gl.getAttribLocation(program, attributeName);
  gl.vertexAttribPointer(location, bufferSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(location);
};


const initProgramInfo = (gl, shaderProgram) => {
  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
      vertexTangent: gl.getAttribLocation(shaderProgram, "aVertexTangent"),
      vertexBitangent: gl.getAttribLocation(shaderProgram, "aVertexBitangent"),
    },
    uniformLocations: {
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      shadingBool: gl.getUniformLocation(shaderProgram, "uShading"),
      uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
      uTexture: gl.getUniformLocation(shaderProgram, "uTexture"),
      worldCameraposition: gl.getUniformLocation(
        shaderProgram,
        "uWorldCameraPosition"
      ),
      textureType1: gl.getUniformLocation(shaderProgram, "textureType1"),
      textureType2: gl.getUniformLocation(shaderProgram, "textureType2"),
    },
  };
};