import React, { useState, useEffect } from 'react';
// import html1 from './test.html';
import { mat4 } from 'gl-matrix';

//顶点着色器源码
var vertexShaderSource = '' +
  'void main(){' +
  //给内置变量gl_PointSize赋值像素大小
  '   gl_PointSize=10.0;' +
  //顶点位置，位于坐标原点
  '   gl_Position =vec4(0.5,0.5,0.0,1.0);' +
  '}';

//片元着色器源码
var fragShaderSource = '' +
  'void main(){' +
  //定义片元颜色
  '   gl_FragColor = vec4(0.0,0.0,1.0,1.0);' +
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

function GLSL(props: { gl: any }) {
  const { gl } = props;

  useEffect(() => {
    //初始化着色器
    initShader(gl, vertexShaderSource, fragShaderSource);
    gl.drawArrays(gl.POINTS,0,1);
  }, []);
  return (
    <div />
  );
}

export default GLSL;
