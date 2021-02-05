import React, { useState, useEffect } from 'react';
import GLSL from './GLSL';
import '../index.less';

function App() {

  const [GL, setGL] = useState();

  useEffect(() => {
    if(GL) {
      return;
    }
    const canvas = document.querySelector("#glcanvas");
    // 初始化WebGL上下文
    if(canvas) {
      const gl = canvas.getContext("webgl");
  
      // 确认WebGL支持性
      if (!gl) {
        alert("无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。");
      } else {
        // 使用完全不透明的黑色清除所有图像
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 用上面指定的颜色清除缓冲区
        gl.clear(gl.COLOR_BUFFER_BIT);
        setGL(gl);
      }
    }
  }, []);

  return (
		<>
			{GL && (<GLSL GL={GL} />)}
			<canvas id="glcanvas" width="1040" height="680">
				你的浏览器似乎不支持或者禁用了HTML5 <code>&lt;canvas&gt;</code> 元素.
			</canvas>
		</>
  );
}

export default App;
