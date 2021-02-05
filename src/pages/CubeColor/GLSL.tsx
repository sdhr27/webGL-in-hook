import React, { useState, useEffect } from 'react';

//顶点着色器源码
var vertexShaderSource = '' +
  //attribute声明vec4类型变量apos
  'attribute vec4 apos;' +
  // attribute声明顶点颜色变量
  'attribute vec4 a_color;' +
  //varying声明顶点颜色插值后变量
  'varying vec4 v_color;' +


  'void main() {' +
  '   float radian = radians(30.0);' +
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
    // 顶点坐标apos赋值给内置变量gl_Position
  // '  gl_Position = apos;' +
    //顶点颜色插值计算
  '  v_color = a_color;' +
  '}';

//片元着色器源码
var fragShaderSource = '' +
  // 所有float类型数据的精度是lowp
  'precision lowp float;' +
  // 接收顶点着色器中v_color数据
  'varying vec4 v_color;' +
  'void main(){' +
    // 插值后颜色数据赋值给对应的片元
    'gl_FragColor = v_color;' +
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
  /**
    创建顶点位置数据数组data,Javascript中小数点前面的0可以省略
  **/
  var data=new Float32Array([
    .5,.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,-.5,.5,      //面1
    .5,.5,.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,-.5,      //面2
    .5,.5,.5,.5,.5,-.5,-.5,.5,-.5,.5,.5,.5,-.5,.5,-.5,-.5,.5,.5,      //面3
    -.5,.5,.5,-.5,.5,-.5,-.5,-.5,-.5,-.5,.5,.5,-.5,-.5,-.5,-.5,-.5,.5,//面4
    -.5,-.5,-.5,.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,.5,//面5
    .5,-.5,-.5,-.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,.5,-.5 //面6
  ]);
  /**
  创建顶点颜色数组colorData
  **/
  var colorData = new Float32Array([
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //红色——面1
    .9,0,0, .9,0,0, .9,0,0, .9,0,0, .9,0,0, .9,0,0,//R=0.9——面2
    .8,0,0, .8,0,0, .8,0,0, .8,0,0, .8,0,0, .8,0,0,//R=0.8——面3
    1,1,0, 1,1,0, 1,1,0, 1,1,0, 1,1,0, 1,1,0,      //黄色——面4
    .8,0,0, .8,0,0, .8,0,0, .8,0,0, .8,0,0, .8,0,0,//R=0.8——面3
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //R=1——面6
  ]);
  /**
    创建缓冲区buffer，传入顶点位置数据data
  **/
  var buffer = gl.createBuffer();
  var aposLocation = gl.getAttribLocation(program,'apos');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aposLocation);
  /**
    创建缓冲区colorBuffer，传入顶点颜色数据colorData
  **/
  var colorBuffer=gl.createBuffer();
  var a_color = gl.getAttribLocation(program,'a_color');
  gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,colorData,gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_color,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(a_color);
}

function GLSL(props: { gl: any }) {
  const { gl } = props;

  useEffect(() => {
    //初始化着色器
    var program = initShader(gl, vertexShaderSource, fragShaderSource);
    initBuffers(gl, program);
    // 打开GPU深度测试，避免色块覆盖
    gl.enable(gl.DEPTH_TEST);
    // 第2个参数代表从第几个点开始绘制
    // 第3个参数代表一共绘制几个点
    // gl.drawArrays(gl.LINES, 0, 2);
    // gl.drawArrays(gl.LINE_LOOP, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.TRIANGLES, 6, 6);
    gl.drawArrays(gl.TRIANGLES, 12, 6);
    gl.drawArrays(gl.TRIANGLES, 18, 6);
    gl.drawArrays(gl.TRIANGLES, 24, 6);
    gl.drawArrays(gl.TRIANGLES, 30, 6);
    // LINES 两两相连
    // LINE_LOOP 顺序相连并收尾相连成环
    // LINE_STRIP  顺序相连，不成环
  }, []);
  return (
    <div />
  );
}

export default GLSL;
