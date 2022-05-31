// define gl unit class that help to draw 
// must include GLUtils script
class GLUnit {
    constructor(canvas) {
        // setup atribute
        this.gl = canvas.getContext('webgl');
        if (!this.gl) {
            alert("WebGL is not supported by your browser.");
            return;
        }

        // init program
        this.program = createProgramShader(this.gl);
        this.programInfo = initProgramInfo(this.gl, this.program)
        
        // init attribute controller
        this.buffers = null;
        this.mappingMode = 0;
        this.imageSource = "../../img/wall.jpg"
        this.bumpSource = "../../img/bump_normal.png"
        this.setTexture(this.mappingMode)

        this.rotateAxis = 1;
        this.flag = true;
        this.animationFlag = true;
        this.shadingState = false;

        this.thetaObject = [];
        this.clockwiseObject = [];
        this.theta = [0, 0, 0];
        this.translation = [0, 0, 0];
        this.scaling = [1, 1, 1];

        this.eye = [0, 0, 45];
    }

    setPartAngle(newAngle, id) {
        if (this.tree[id]) {
            let maxDeg = this.tree[id].max_degree;
            let minDeg = this.tree[id].min_degree;
            let interval = maxDeg - minDeg;
            let deltaDeg = minDeg + (newAngle * interval);
            this.thetaObject[id] = getRadian(deltaDeg);
        }
    }

    setTranslation(value, axis) {
        this.translation[axis] = value
    }

    setCameraRadian(value, axis){
        this.theta[axis] = getRadian(value)
    }

    setScale(value) {
        this.scaling = [value, value, value]
    }

    setEye(value, axis) {
        this.eye[axis] = value
    }

    setImageSource(value) {
        this.imageSource = value
        this.setTexture(this.mappingMode)
    }

    setBumpSource(value) {
        this.bumpSource = value
        this.setTexture(this.mappingMode)
    }

    setTexture(val) {
        this.mappingMode = val;
        switch (val) {
            case 0 :
                // image
                this.loadTexture(this.imageSource);
                break;
            case 1 :
                // environment
                // this.gl.uniform1i(this.programInfo.uniformLocations.textureType2, 1);
                this.loadEnvironmentTexture();
                break;
            case 2:
                // bump
                this.loadTexture(this.bumpSource);
                break;
        }
    }

    setShading() {
        this.shadingState = !this.shadingState;
    }

    // init node
    initNodes(id, mode){
        var matriks = m4.identity();

        let xTree = this.tree[id].joint_point[0];
        let yTree = this.tree[id].joint_point[1];
        let zTree = this.tree[id].joint_point[2];
        let sibling = this.tree[id].sibling;
        let child = this.tree[id].child;
        let maxDeg = this.tree[id].max_degree;
        let minDeg = this.tree[id].min_degree;
        let rotate = this.tree[id].rotation_axis;

        if (mode){
            this.thetaObject[id] = getRadian(this.tree[id].start_degree);
            this.clockwiseObject[id] = this.tree[id].clockwise;
        }

        if (!this.animationFlag){
            let clockwise = this.clockwiseObject[id];
            let delta = 0;
            switch(clockwise) {
                case 0:
                    delta = 0.03;
                    break;
                case 1:
                    delta = -0.03;
                    break;
            }

            let newDeg = this.thetaObject[id] + delta;

            if (newDeg >= getRadian(maxDeg)){
                this.clockwiseObject[id] = 1;
                newDeg = this.thetaObject[id] - 0.03
            }

            else if (newDeg <= getRadian(minDeg)){
                this.clockwiseObject[id] = 0;
                newDeg = this.thetaObject[id] + 0.03
            }
            this.thetaObject[id] = newDeg;
        }

        matriks = m4.translate(matriks, xTree, yTree, zTree);
        matriks = m4.rotate(matriks, this.thetaObject[id], rotate);
        matriks = m4.translate(matriks, -xTree, -yTree, -zTree);
        this.figure[id] = this.createNode(matriks, sibling, child);
    }

    //
    // Initialize a texture and load an image.
    // When the image finished loading copy it into the texture.
    //
    loadTexture(url) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = this.gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                    width, height, border, srcFormat, srcType,
                    pixel);
    
        const image = new Image();
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                            srcFormat, srcType, image);
        
            // WebGL1 has different requirements for power of 2 images
            // vs non power of 2 images so check if the image is a
            // power of 2 in both dimensions.
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            }
        };
        image.src = url;
    
        return texture;
    }


    loadEnvironmentTexture(){
        // Create a texture.
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
        const faceInfos = [
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: '../../img/pos-x.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: '../../img/neg-x.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: '../../img/pos-y.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: '../../img/neg-y.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: '../../img/pos-z.jpg',
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: '../../img/neg-z.jpg',
            },
        ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 512;
            const height = 512;
            const format = this.gl.RGBA;
            const type = this.gl.UNSIGNED_BYTE;

            // setup each face so it's immediately renderable
            this.gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

            // Asynchronously load an image
            const image = new Image();
            image.onload = () => {
                // Now that the image has loaded make copy it to the texture.
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
                this.gl.texImage2D(target, level, internalFormat, format, type, image);
                this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
            };
            image.src = url;
        });
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }

    // create node
    createNode(m, sib, chi){
        var node = {
            transform: m,
            sibling: sib,
            child: chi
        }
        return node;
    }

    startTraverse(deltaTime) {
        var cameraMatrix = m4.identity();
        cameraMatrix = m4.lookAt(this.eye, [0, 0, 0], [0, 2, 0]);

        if (!this.flag) {
            this.theta[this.rotateAxis] += deltaTime;
        }

        let viewMatrix = m4.inverse(cameraMatrix);
        viewMatrix = m4.xRotate(viewMatrix, this.theta[0]);
        viewMatrix = m4.yRotate(viewMatrix, this.theta[1]);
        viewMatrix = m4.zRotate(viewMatrix, this.theta[2]);
        
        var modelMatrix = m4.identity();
        modelMatrix = m4.translate(modelMatrix, this.translation[0], this.translation[1], this.translation[2]);
        modelMatrix = m4.scale(modelMatrix, this.scaling[0], this.scaling[1], this.scaling[2]);

        this.modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);
        this.deltaTime = deltaTime;
        this.stack = [];
        this.traverse(0);
    }

    traverse(id) {
        if (id == null) {
            return;
        }

        this.stack.push(this.modelViewMatrix);
        this.modelViewMatrix = m4.multiply(this.modelViewMatrix, this.figure[id].transform);
        this.drawScene(this.buffers[id], this.deltaTime);
        if (this.figure[id].child != null) {
            this.traverse(this.figure[id].child);
        }

        this.modelViewMatrix = this.stack.pop();
        if (this.figure[id].sibling != null) {
            this.traverse(this.figure[id].sibling);
        }
    }

    drawModel(objectData) {
        let listOfVertices = objectData.points;
        let vertexPositions = [];
        let facesColor = [];
        let tree = objectData.nodes;
        for (let i = 0; i < objectData.num_rusuk; i++) {
          let vertices = objectData.rusuk[i];
          let position = [];
          let topologi = vertices.topologi;
          let tmpColor = [];
          for (let j = 0; j < vertices.num_face; j++) {
            position = position.concat(listOfVertices[topologi[j][0]]);
            position = position.concat(listOfVertices[topologi[j][1]]);
            position = position.concat(listOfVertices[topologi[j][2]]);
            position = position.concat(listOfVertices[topologi[j][3]]);
            tmpColor.push(vertices.color[j]);
          }
          facesColor.push(tmpColor);
          vertexPositions.push(position);
        }
      
        this.vertexPositions = vertexPositions;
        this.facesColor = facesColor;
        this.buffers = [];
        this.figure = [];
        this.tree = tree;
        this.num_objects = objectData.num_rusuk;
      
        for (let i = 0; i < this.num_objects; i++) {
          this.initNodes(i, true);
        }
      
        for (let i = 0; i < vertexPositions.length; i++) {
          const buffer = setupBuffer(this.gl, vertexPositions[i]);
          this.buffers.push(buffer);
        }
      }

      clearScreen() {
          this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
          this.gl.clearDepth(1.0);
          this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);          
      }

      drawScene(buffers) {
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
      
        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = m4.perspective(fieldOfView, aspect, zNear, zFar);	

        var normalMatrix = m4.inverse(this.modelViewMatrix);
        normalMatrix = m4.transpose(normalMatrix);


        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
            this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
            this.gl.enableVertexAttribArray(
            this.programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the texture coordinates from
        // the texture coordinate buffer into the textureCoord attribute.
        {
            const numComponents = 2;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.textureCoord);
            this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
            this.gl.enableVertexAttribArray(
            this.programInfo.attribLocations.textureCoord);
        }

        // Tell WebGL how to pull out the normals from
        // the normal buffer into the vertexNormal attribute.
        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexNormal);
          }

        // Tell WebGL how to pull out the tangents from
        // the tangent buffer into the vertexTangent attribute.
        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.tangent);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexTangent,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexTangent);
        }

        // Tell WebGL how to pull out the bitangents from
        // the bitangent buffer into the vertexBitangent attribute.
        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.bitangent);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexBitangent,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexBitangent);
        }

          // Tell WebGL which indices to use to index the vertices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
          // Tell WebGL to use our program when drawing
        this.gl.useProgram(this.programInfo.program);

        // Set the shader uniforms
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            this.modelViewMatrix);
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix);
        this.gl.uniform1i(
            this.programInfo.uniformLocations.shadingBool,
            this.shadingState);
        this.gl.uniform3fv(
            this.programInfo.uniformLocations.worldCameraPosition, this.eye
            );
    

        // Specify the texture to map onto the faces.
        // If the texture mapping mode is Image Mapping
        if (this.mappingMode == 0){
            this.gl.uniform1i(this.programInfo.uniformLocations.uTexture, 1);
            this.gl.uniform1i(this.programInfo.uniformLocations.textureType1, 0);
            this.gl.uniform1i(this.programInfo.uniformLocations.textureType2, 0);
            this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
        } 

        // If the texture mapping mode is Environment Mapping
        else if (this.mappingMode == 1) {
            this.gl.uniform1i(this.programInfo.uniformLocations.uTexture, 0);
            this.gl.uniform1i(this.programInfo.uniformLocations.textureType1, 1);
            this.gl.uniform1i(this.programInfo.uniformLocations.textureType2, 1);
            this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 1);
        }

        // If the texture mapping mode is Bump Mapping
        else {
            this.gl.uniform1i(this.programInfo.uniformLocations.uTexture, 1);
            this.gl.uniform1i(this.programInfo.uniformLocations.textureType1, 2);
            this.gl.uniform1i(this.programInfo.uniformLocations.textureType2, 2);
            this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
        }
    
        for (let i =0; i < 6; i++) {
            this.gl.drawArrays(this.gl.TRIANGLE_FAN, 4*i, 4);
        }
      }
}