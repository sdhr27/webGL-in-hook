import React, { useState, useEffect } from 'react';
import textureIMG from './texture.jpg';

//顶点着色器源码
var vertexShaderSource1 = '' +
  'attribute vec4 a_Position;' +
  //attribute声明vec4类型变量apos
  'attribute vec4 a_color;' +
  // attribute声明顶点颜色变量
  'attribute vec4 a_normal;' +
  //顶点法向量变量
  'uniform vec3 u_lightColor;' +
  // uniform声明点光源位置
  'uniform vec3 u_lightPosition;' +
  // uniform声明光颜色变量
  'varying vec4 v_color;' +
//varying声明顶点颜色插值后变量


  'void main() {' +
  '   float radian = radians(30.0);' +
  //求解旋转角度余弦值
  '   float cos = cos(radian);' +
  //求解旋转角度正弦值
  '   float sin = sin(radian);' +

  '   mat4 mx = mat4(1,0,0,0,  0,cos,-sin,0,  0,sin,cos,0,  0,0,0,1);' +
  '   mat4 my = mat4(cos,0,-sin,0,  0,1,0,0,  sin,0,cos,0,  0,0,0,1);' +



  // 顶点坐标apos赋值给内置变量gl_Position  
  '   gl_Position = mx*my*a_Position;' +
  // 顶点法向量进行矩阵变换，然后归一化
  '   vec3 normal = normalize((mx*my*a_normal).xyz);' +
  // 计算点光源照射顶点的方向并归一化
  '   vec3 lightDirection = normalize(vec3(gl_Position) - u_lightPosition);' +
  // 计算平行光方向向量和顶点法向量的点积
  '   float dot = max(dot(lightDirection, normal), 0.0);' +
  // 计算反射后的颜色
  '   vec3 reflectedLight = u_lightColor * a_color.rgb * dot;' +
  //  颜色插值计算
  '   v_color = vec4(reflectedLight, a_color.a);' +
  '}';

//片元着色器源码
var fragShaderSource1 = '' +
  // 所有float类型数据的精度是lowp
  'precision lowp float;' +
  // 接收顶点着色器中v_color数据
  'varying vec4 v_color;' +
  'void main(){' +
    // 插值后颜色数据赋值给对应的片元
    'gl_FragColor = v_color;' +
  '}';


//顶点着色器源码
var vertexShaderSource2 = '' +
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
var fragShaderSource2 = '' +
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
    // 'gl_FragColor = vec4(texture.r,texture.g,texture.b,0.5);' +
    'gl_FragColor = vec4(luminance,luminance,luminance,0.5);' +
  '}';

// 创建一个缓冲器来存储它的顶点
function initBuffersCube(gl: any, program: any) {
  /**
    创建顶点位置数据数组data,Javascript中小数点前面的0可以省略
  **/
  const data=new Float32Array([
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
  const colorData = new Float32Array([
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //红色——面1
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //R=1——面6
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //R=1——面6
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //R=1——面6
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //R=1——面6
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,      //R=1——面6
  ]);
  /**
   *顶点法向量数组normalData
  **/
  const normalData = new Float32Array([
    0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,//z轴正方向——面1
    1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,//x轴正方向——面2
    0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,//y轴正方向——面3
    -1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,//x轴负方向——面4
    0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,//y轴负方向——面5
    0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1//z轴负方向——面6
  ]);
  /**
    创建缓冲区buffer，传入顶点位置数据data
  **/
  gl.useProgram(program);
  const aposLocation = gl.getAttribLocation(program,'a_Position');
  const a_color = gl.getAttribLocation(program,'a_color');
  const a_normal = gl.getAttribLocation(program,'a_normal');
  vertexBuffer(gl, data, aposLocation, 3);
  vertexBuffer(gl, colorData, a_color, 3);
  vertexBuffer(gl, normalData, a_normal, 3);

    /**
   * 传入旋转矩阵数据
   ***/
  rotate(gl, program);

  var u_lightColor = gl.getUniformLocation(program,'u_lightColor');
  var u_lightPosition = gl.getUniformLocation(program,'u_lightPosition');
  gl.uniform3f(u_lightColor, 1.0, 1.0, 1.0);
  gl.uniform3f(u_lightPosition, 2.0, 3.0, 4.0);
}

// 创建一个缓冲器来存储它的顶点
function initBuffersTexture(gl: any, program: any) {
  /**纹理映射顶点数据**/
  const data=new Float32Array([
    -0.4, 0.2,-0.51,//左上角——v0
    -0.4,-0.2,-0.51,//左下角——v1
    0.4,  0.2,-0.51,//右上角——v2
    0.4, -0.2,-0.51//右下角——v3
  ]);
  /**
  * 创建UV纹理坐标数据textureData
  **/
  const textureData = new Float32Array([
    0,1,//左上角——uv0
    0,0,//左下角——uv1
    1,1,//右上角——uv2
    1,0, //右下角——uv3
    
  ]);
  gl.useProgram(program);
  const a_Position = gl.getAttribLocation(program,'a_Position');
  const a_TexCoord = gl.getAttribLocation(program,'a_TexCoord');
  vertexBuffer(gl, data, a_Position, 3);
  vertexBuffer(gl, textureData, a_TexCoord, 2);
  rotate(gl, program);
}

function GLSL(props: { gl: any }) {
  const { gl } = props;
  //初始化着色器
  var program1 = initShader(gl, vertexShaderSource1, fragShaderSource1);
  var program2 = initShader(gl, vertexShaderSource2, fragShaderSource2);

  /**
  * 加载纹理图像像素数据
  **/
  function texture() {
    /**
     * 从program对象获取相关的变量
     * attribute变量声明的方法使用getAttribLocation()方法
     * uniform变量声明的方法使用getAttribLocation()方法
     **/
    // 加载立方体
    initBuffersCube(gl, program1);
    // 打开GPU深度测试，避免色块覆盖
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // 加载材质
    initBuffersTexture(gl, program2);
    var image = document.getElementsByClassName('image')[0];
    var u_Sampler = gl.getUniformLocation(program2,'u_Sampler');
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }



  // useEffect(() => {

  //   initBuffersTexture(gl, program2);

  //   initBuffersCube(gl, program1);
  //   // 打开GPU深度测试，避免色块覆盖
  //   gl.enable(gl.DEPTH_TEST);
  //   gl.drawArrays(gl.TRIANGLES, 0, 36);
  // }, []);
  
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

  /**
 * 顶点数据配置函数vertexBuffer()
 * 顶点数据data
 * 顶点位置position
 * 间隔数量n
 **/
function vertexBuffer(gl: any, data: Float32Array, position: any, n: number){
  var buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  gl.vertexAttribPointer(position,n,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(position);
}

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
  // gl.useProgram(program);
  //返回程序program对象
  return program;
}

function rotate(gl:any, program: any) {
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
