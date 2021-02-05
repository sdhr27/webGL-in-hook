import React, { useState, useEffect } from 'react';
import { mat4 } from 'gl-matrix';

// 矩阵计算是一个很复杂的运算。 
// 没人会想去自己写完所有代码来处理这些运算。通常人们使用一个矩阵运算库，而不会自己实现矩阵运算。
// 在这个例子中我们使用的是glMatrix library.

//  初始化着色器程序，让WebGL知道如何绘制我们的数据
function initShaderProgram(gl: any, vsSource: string, fsSource: string) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  


	// 创建着色器程序
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);


	// 创建失败， alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}


// 创建指定类型的着色器，上传source源码并编译
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	// Send the source to the shader object
	gl.shaderSource(shader, source);
	// Compile the shader program
	gl.compileShader(shader);
	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

//* 顶点着色器vsSource
// 顶点着色器接vsSource收一个我们定义的属性（aVertexPosition）的顶点位置值
// 之后这个值与两个4x4的矩阵（uProjectionMatrix和uModelMatrix）相乘; 乘积赋值给gl_Position。
const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying highp vec2 vTextureCoord;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
  }
`;

//* 片段着色器
// 职责是确定像素的颜色
// 颜色存储在特殊变量gl_FragColor中，返回到WebGL层。
const fsSource = `
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;
// const fsSource = `
//   varying lowp vec4 vColor;
//   void main(void) {
//     gl_FragColor = vColor;
//   }
// `;



var then = 0;
// 创建一个缓冲器来存储它的顶点
function initBuffers(gl: any) {
  const positionBuffer = gl.createBuffer();
  const vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    
    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
    
    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
    
    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
    
    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];
  // const positions = [
  //   1.0,  1.0,
  //   -1.0,  1.0,
  //   1.0, -1.0,
  //   -1.0, -1.0,
  // ];
  // const positions = [
  //   1.0,  1.0, 0.0,
  //   -1.0,  1.0, 0.0,
  //   1.0, -1.0, 0.0,
  //   -1.0, -1.0, 0.0,
  // ];
  gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER,
    new Float32Array(vertices),
    WebGLRenderingContext.STATIC_DRAW
  );

  // const faceColors = [
  //   [1.0,  1.0,  1.0,  1.0],    // Front face: white
  //   [1.0,  0.0,  0.0,  1.0],    // Back face: red
  //   [0.0,  1.0,  0.0,  1.0],    // Top face: green
  //   [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
  //   [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
  //   [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  // ];
  // let colors: number[] = [];

  // for (let j = 0; j < faceColors.length; ++j) {
  //   const c = faceColors[j];

  //   // Repeat each color four times for the four vertices of the face
  //   colors = colors.concat(c, c, c, c);
  // }
  // console.log(colors, new Float32Array(colors))
  // var cubeVerticesColorBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  var cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  var cubeVertexIndices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

  const cubeVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    
  var textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0
  ];
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    // color: cubeVerticesColorBuffer,
    indices: cubeVerticesIndexBuffer,
    textureCoord: cubeVerticesTextureCoordBuffer,
  };
}

let cubeRotation = 0.0;
let squareRotation = 0.0;
function drawScene(gl: any, programInfo: any, buffers: any, texture: any, deltaTime: number) {
  //* 用背景色擦除画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  //* 建立摄像机透视矩阵。
  // 设置45度的视图角度，并且设置一个适合实际图像的宽高比。 
  // 指定在摄像机距离0.1到100单位长度的范围内的物体可见。
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                    fieldOfView,
                    aspect,
                    zNear,
                    zFar);

  // Set the drawing position to the "identity" point, which is the center of the scene.
  // *加载特定位置，并把正方形放在距离摄像机6个单位的的位置
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  
  cubeRotation += deltaTime;
  mat4.rotate(modelViewMatrix,  // destination matrix
                  modelViewMatrix,  // matrix to rotate
                  cubeRotation,     // amount to rotate in radians
                  [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
                  modelViewMatrix,  // matrix to rotate
                  cubeRotation * .7,// amount to rotate in radians
                  [0, 1, 0]);       // axis to rotate around (X)
  // squareRotation += deltaTime;
  // mat4.rotate(modelViewMatrix,  // destination matrix
  //             modelViewMatrix,  // matrix to rotate
  //             squareRotation,   // amount to rotate in radians
  //             [0, 0, 1]);       // axis to rotate around

  // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
  // *绑定正方形的顶点缓冲到上下文
  {
    const numComponents = 3;  // pull out 3 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }
  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // 颜色配置
  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  // {
  //   const numComponents = 4;
  //   const type = gl.FLOAT;
  //   const normalize = false;
  //   const stride = 0;
  //   const offset = 0;
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //   gl.vertexAttribPointer(
  //       programInfo.attribLocations.vertexColor,
  //       numComponents,
  //       type,
  //       normalize,
  //       stride,
  //       offset);
  //   gl.enableVertexAttribArray(
  //       programInfo.attribLocations.vertexColor);
  // }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // *各种配置？：program、shader uniform
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  // 调用 drawArrays() 方法来画出对象
  {
    // const offset = 0;
    // const vertexCount = 4;
    // gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

function loadTexture(gl: any, url: string) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function GLSL(props: any) {
	const { GL } = props;

	// 创建着色器程序
	const shaderProgram = initShaderProgram(GL, vsSource, fsSource);

	// 查找WebGL返回分配的输入位置
	const programInfo = {
		program: shaderProgram,
		// 顶点着色器的每次迭代都从分配给该属性attribLocations的缓冲区接收下一个值。
    attribLocations: {
      vertexPosition: GL.getAttribLocation(shaderProgram, 'aVertexPosition'),
      // vertexColor: GL.getAttribLocation(shaderProgram, 'aVertexColor'),
      aTextureCoord: GL.getAttribLocation(shaderProgram, 'aTextureCoord'),
		},
		// uniforms类似于JavaScript全局变量，它们在着色器的所有迭代中保持相同的值。
		// 统一的位置
    uniformLocations: {
      projectionMatrix: GL.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: GL.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: GL.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };
  
  const buffers = initBuffers(GL);


  
  // Draw the scene repeatedly
  function render(now: number) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(GL, programInfo, buffers, loadTexture(GL, '../../assets/envelop.png'), deltaTime);

    requestAnimationFrame(render);
  }
	
	useEffect(() => {
    requestAnimationFrame(render);
		// drawScene(GL, programInfo, buffers)
	}, []);
	
  return (
    <div className="GLSL" />
  );
}

export default GLSL;
