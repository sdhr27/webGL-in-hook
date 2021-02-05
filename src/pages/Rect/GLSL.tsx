import React, { useState, useEffect } from 'react';
import { mat4 } from 'gl-matrix';

//顶点着色器源码
var vertexShaderSource = '' +
  //attribute声明vec4类型变量apos
  'attribute vec4 apos;' +
  'void main(){' +
  //顶点坐标apos赋值给内置变量gl_Position
  //逐顶点处理数据
  '   gl_Position = apos;' +
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
  //类型数组构造函数Float32Array创建顶点数组
  // 矩形四个顶点坐标的数据
  var data = new Float32Array([0.5,0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.5]);
  //创建缓冲区对象
  var buffer = gl.createBuffer();
  //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
  var aposLocation = gl.getAttribLocation(program,'apos');
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  //缓冲区中的数据按照一定的规律传递给位置变量apos
  gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0);
  //允许数据传递
  gl.enableVertexAttribArray(aposLocation);
}

function GLSL(props: { gl: any }) {
  const { gl } = props;

  useEffect(() => {
    //初始化着色器
    var program = initShader(gl, vertexShaderSource, fragShaderSource);
    initBuffers(gl, program);
    // 第2个参数代表从第几个点开始绘制
    // 第3个参数代表一共绘制几个点
    gl.drawArrays(gl.LINE_LOOP, 0, 4);
  }, []);
  return (
    <div />
  );
}

export default GLSL;
