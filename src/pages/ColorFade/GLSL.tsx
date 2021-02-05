import React, { useState, useEffect } from 'react';
import textureIMG from './texture.jpg';

//顶点着色器源码
var vertexShaderSource = '' +
  // 顶点位置坐标
  'attribute vec4 a_Position;' +
  //  纹理坐标
  'attribute vec2 a_TexCoord;' +
  //  插值后纹理坐标
  'varying vec2 v_TexCoord;' +
  /**uniform声明旋转矩阵变量mx、my**/
  //绕x轴旋转矩阵
  'uniform mat4 mx;' +
  //绕y轴旋转矩阵
  'uniform mat4 my;' +

  'void main() {' +
    //顶点坐标apos赋值给内置变量gl_Position
    'gl_Position = mx*my*a_Position;' +
    //纹理坐标插值计算
    'v_TexCoord = a_TexCoord;' +
  '}';

//片元着色器源码
var fragShaderSource = '' +
  // 所有float类型数据的精度是lowp
  'precision highp float;' +
  // 接收插值后的纹理坐标
  'varying vec2 v_TexCoord;' +
  // 纹理图片像素数据
  'uniform sampler2D u_Sampler;' +

  'void main(){' +
    //采集纹素
    'vec4 texture = texture2D(u_Sampler,v_TexCoord);' +
    //计算RGB三个分量光能量之和，也就是亮度
    'float luminance = 0.299*texture.r+0.587*texture.g+0.114*texture.b;' +
    //逐片元赋值，RGB相同均为亮度值，用黑白两色表达图片的明暗变化
    'gl_FragColor = vec4(luminance,luminance,luminance,0.5);' +
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
   * 四个顶点坐标数据data，z轴为零
   * 定义纹理贴图在WebGL坐标系中位置
   **/
  var data=new Float32Array([
    -0.5, 0.5,//左上角——v0
    -0.5,-0.5,//左下角——v1
    0.5,  0.5,//右上角——v2
    0.5, -0.5, //右下角——v3
    
  ]);
  /**
  * 创建UV纹理坐标数据textureData
  **/
  var textureData = new Float32Array([
    0,1,//左上角——uv0
    0,0,//左下角——uv1
    1,1,//右上角——uv2
    1,0, //右下角——uv3
    
  ]);
  /**
 * 从program对象获取相关的变量
 * attribute变量声明的方法使用getAttribLocation()方法
 * uniform变量声明的方法使用getAttribLocation()方法
 **/
  var a_Position = gl.getAttribLocation(program,'a_Position');
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_TexCoord = gl.getAttribLocation(program,'a_TexCoord');
  var textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textureData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);

  /**
   * 传入旋转矩阵数据
   ***/
  var mx = gl.getUniformLocation(program,'mx');
  var my = gl.getUniformLocation(program,'my');
  var angle = Math.PI/6;//旋转角度
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  //旋转矩阵数据
  var mxArr = new Float32Array([1,0,0,0,  0,cos,-sin,0,  0,sin,cos,0,  0,0,0,1]);
  var myArr = new Float32Array([cos,0,-sin,0,  0,1,0,0,  sin,0,cos,0,  0,0,0,1]);
  //类型数组传入矩阵
  gl.uniformMatrix4fv(mx, false, mxArr);
  gl.uniformMatrix4fv(my, false, myArr);
}

function GLSL(props: { gl: any }) {
  const { gl } = props;
  //初始化着色器
  var program = initShader(gl, vertexShaderSource, fragShaderSource);
  // var image = new Image();
  // image.src = 'texture.jpg';//设置图片路径

  // image.onload = texture;

  /**
  * 加载纹理图像像素数据
  **/
  function texture() {
    /**
     * 从program对象获取相关的变量
     * attribute变量声明的方法使用getAttribLocation()方法
     * uniform变量声明的方法使用getAttribLocation()方法
     **/
    var image = document.getElementsByClassName('image')[0];
    var u_Sampler = gl.getUniformLocation(program,'u_Sampler');
    var texture = gl.createTexture();//创建纹理图像缓冲区
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //纹理图片上下反转
    gl.activeTexture(gl.TEXTURE0);//激活0号纹理单元TEXTURE0
    gl.bindTexture(gl.TEXTURE_2D, texture);//绑定纹理缓冲区
    //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //设置纹理贴图填充方式(纹理贴图像素尺寸小于顶点绘制区域像素尺寸)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //设置纹素格式，jpg格式对应gl.RGB
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, 0);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
    // 进行绘制
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  useEffect(() => {
    
    initBuffers(gl, program);
    // 第2个参数代表从第几个点开始绘制
    // 第3个参数代表一共绘制几个点
    // gl.drawArrays(gl.LINES, 0, 4);
    // gl.drawArrays(gl.LINE_LOOP, 0, 4);
    // gl.drawArrays(gl.TRIANGLES, 0, 36);
    // LINES 两两相连
    // LINE_LOOP 顺序相连并收尾相连成环
    // LINE_STRIP  顺序相连，不成环
  }, []);
  //www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png
  
  return (
    <img
      className="image"
      style={{ verticalAlign: 'top' }}
      src={textureIMG}
      alt="图片未加载"
      onLoad={texture}
    />
  );
}

export default GLSL;
