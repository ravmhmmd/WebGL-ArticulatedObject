// https://apoorvaj.io/exploring-bump-mapping-with-webgl/
const vertexScript = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute vec3 aVertexTangent;
attribute vec3 aVertexBitangent;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
uniform int textureType1;

varying vec3 ts_light_pos; // Tangent space values
varying vec3 ts_view_pos;
varying vec3 ts_frag_pos;

mat3 transpose(in mat3 inMatrix)
{
    vec3 i0 = inMatrix[0];
    vec3 i1 = inMatrix[1];
    vec3 i2 = inMatrix[2];

    mat3 outMatrix = mat3(
        vec3(i0.x, i1.x, i2.x),
        vec3(i0.y, i1.y, i2.y),
        vec3(i0.z, i1.z, i2.z)
    );

    return outMatrix;
}

void main(void) {
  if (textureType1 == 0){
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    // Apply lighting effect
    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  } else if (textureType1 == 1){
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    
    // Send the view position to the fragment shader
    vWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
    
    // Orient the normals and pass to the fragment shader
    vWorldNormal = mat3(uModelViewMatrix) * aVertexNormal;
  } else {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    ts_frag_pos = vec3(uModelViewMatrix * aVertexPosition);
    
    vec3 t = normalize(mat3(uNormalMatrix) * aVertexTangent);
    vec3 b = normalize(mat3(uNormalMatrix) * aVertexBitangent);
    vec3 n = normalize(mat3(uNormalMatrix) * aVertexNormal);
    mat3 tbn = transpose(mat3(t, b, n));

    vec3 light_pos = vec3(1, 2, 0);
    ts_light_pos = tbn * light_pos;
    ts_view_pos = tbn * vec3(0, 0, 0);
    ts_frag_pos = tbn * ts_frag_pos;

    vTextureCoord = aTextureCoord;
  }
}
`;

const fragmentScript = `
precision highp float;
// All variables for Environment Mapping
// Passed in from the vertex shader.
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

// The texture
uniform samplerCube uTexture;

// The position of the camera
uniform vec3 uWorldCameraPosition;
uniform int textureType2;

// All variables for Texture Mapping
varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;
uniform sampler2D uSampler;
uniform bool uShading;

// All variables for Bump Mapping
varying vec3 ts_light_pos;
varying vec3 ts_view_pos;
varying vec3 ts_frag_pos;


vec2 parallax_uv(vec2 uv, vec3 view_dir)
{

        // Parallax mapping
        float depth_scale = 1.0;
        float depth = texture2D(uSampler, uv).r;    
        vec2 p = view_dir.xy * (depth * depth_scale) / view_dir.z;
        return uv - p;  
}

void main(void) {
  if (textureType2 == 0){
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    if (uShading) {
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    } else {
      gl_FragColor = texelColor;
    }

  } else if (textureType2 == 1) {
    vec3 worldNormal = normalize(vWorldNormal);
    vec3 eyeToSurfaceDir = normalize(vWorldPosition - uWorldCameraPosition);
    vec3 direction = reflect(eyeToSurfaceDir, worldNormal);
    gl_FragColor = textureCube(uTexture, direction);

  } else {
    // bump using parallax mapping

    vec3 light_dir = normalize(ts_light_pos - ts_frag_pos);
    vec3 view_dir = normalize(ts_view_pos - ts_frag_pos);

    // Only perturb the texture coordinates if a parallax technique is selected
    // vec2 uv = parallax_uv(vTextureCoord, view_dir);

    vec3 albedo = texture2D(uSampler, vTextureCoord).rgb;
    vec3 ambient = 0.3 * albedo;
    vec3 norm = normalize(texture2D(uSampler, vTextureCoord).rgb * 2.0 - 1.0);
    float diffuse = max(dot(light_dir, norm), 0.0);
    gl_FragColor = vec4(diffuse * albedo + ambient, 1.0);
  }
}
`;

const coordTextures = [
  // Front
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

  // Back
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

  // Top
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

  // Bottom
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

  // Right
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

  // Left
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
];

const idxBuff = [
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
  15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
];
