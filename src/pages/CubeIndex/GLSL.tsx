import React, { useState, useEffect } from 'react';
// import { mat4 } from 'gl-matrix';

//顶点着色器源码
var vertexShaderSource = '' +
  //attribute声明vec4类型变量apos
  'attribute vec4 apos;' +
  'void main(){' +
  '   float radian = radians(15.0);' +
  //求解旋转角度余弦值
  '   float cos = cos(radian);' +
  //求解旋转角度正弦值
  '   float sin = sin(radian);' +
  //顶点坐标apos赋值给内置变量gl_Position
  //逐顶点处理数据
  //创建旋转矩阵x y z
  //cos -sin   0  0
  //sin  cos   0  0
  //0     0    1  0
  //0     0    0  1
  '   mat4 m1 = mat4(cos,sin,0,0,  -sin,cos,0,0,  0,0,1,0,  0,0,0,1);' +
  '   mat4 m2 = mat4(1,0,0,0,  0,cos,sin,0,  0,-sin,cos,0,  0,0,0,1);' +
  '   mat4 m3 = mat4(cos,0,-sin,0,  0,1,0,0,  sin,0,cos,0,  0,0,0,1);' +
  // '   gl_Position = apos;' +
  '   gl_Position = m1*m2*m3*apos;' +
  // '   gl_Position = vec4(apos.x - 0.4, apos.y, apos.z, 1);' +
  // '   gl_Position = apos;' +
  '}';

//片元着色器源码
var fragShaderSource = '' +
  'void main(){' +
  // 逐片元处理数据，所有片元(像素)设置为红色
  '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);' +
  '}';


//声明初始化着色器函数
function initShader(gl: any,vertexShaderSource: string,fragmentShaderSource: string){
  //创建顶点着色器对象
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  //创建片元着色器对象
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  
  //引入顶点、片元着色器源代码
  gl.shaderSource(vertexShader,vertexShaderSource);
  gl.shaderSource(fragmentShader,fragmentShaderSource);
  //编译顶点、片元着色器
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  //创建程序对象program
  var program = gl.createProgram();
  //附着顶点着色器和片元着色器到program
  gl.attachShader(program,vertexShader);
  gl.attachShader(program,fragmentShader);
  //链接program
  gl.linkProgram(program);
  //使用program
  gl.useProgram(program);
  //返回程序program对象
  return program;
}

// 创建一个缓冲器来存储它的顶点
function initBuffers(gl: any, program: any) {
  var data=new Float32Array([
    0.5,  0.5,  0.5,//顶点0
    -0.5,  0.5,  0.5,//顶点1
    -0.5, -0.5,  0.5,//顶点2
    0.5, -0.5,  0.5,//顶点3
    0.5,  0.5, -0.5,//顶点4
    -0.5,  0.5, -0.5,//顶点5
    -0.5, -0.5, -0.5,//顶点6
    0.5, -0.5, -0.5,//顶点7
  ]);
  // 顶点索引数组
  var indexes = new Uint8Array([
    //前四个点对应索引值
    0, 1, 2, 3,//gl.LINE_LOOP模式四个点绘制一个矩形框
    //后四个顶点对应索引值
    4, 5, 6, 7,//gl.LINE_LOOP模式四个点绘制一个矩形框
    //前后对应点对应索引值  
    0, 4,//两个点绘制一条直线
    1, 5,//两个点绘制一条直线
    2, 6,//两个点绘制一条直线
    3, 7//两个点绘制一条直线
  ]);
  //创建缓冲区对象
  var buffer = gl.createBuffer();
  //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
  var aposLocation = gl.getAttribLocation(program,'apos');
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  //创建缓冲区索引对象
  var indexesBuffer=gl.createBuffer();
  //绑定缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexesBuffer);
  //索引数组indexes数据传入缓冲区
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STATIC_DRAW);
  //  缓冲区中的数据按照一定的规律传递给位置变量apos
  //* 第2个参数代表data几个一组来解析！
  //* 类型数组就像一个仓库，存储了大量数据，如何按照一定的规律从库中取出数据
  //* WebGL定义了一个API就是gl.vertexAttribPointer()方法，该方法的第2、5、6参数描述的就是如何取出
  //* 比如从哪个数据开始取出 每几个数据为一组，间隔几个数据
  gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0);
  // 允许数据传递
  gl.enableVertexAttribArray(aposLocation);
}

function GLSL(props: { gl: any }) {
  const { gl } = props;

  useEffect(() => {
    //初始化着色器
    var program = initShader(gl, vertexShaderSource, fragShaderSource);
    initBuffers(gl, program);
    //LINE_LOOP模式绘制前四个点
    gl.drawElements(gl.LINE_LOOP,4,gl.UNSIGNED_BYTE,0);
    //LINE_LOOP模式从第五个点开始绘制四个点
    gl.drawElements(gl.LINE_LOOP,4,gl.UNSIGNED_BYTE,4);
    //LINES模式绘制后8个点
    gl.drawElements(gl.LINES, 8, gl.UNSIGNED_BYTE, 8);
    // LINES 两两相连
    // LINE_LOOP 顺序相连并收尾相连成环
    // LINE_STRIP  顺序相连，不成环
  }, []);
  return (
    <div />
  );
}

export default GLSL;
