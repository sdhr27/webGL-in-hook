import React, { useState } from 'react';
import { Radio } from 'antd';
import First from './firstApp';
import Point from './Point';
import Rect from './Rect';
import BaseTran from './BaseTran';
import CubeRo from './CubeRo';
import CubeIndex from './CubeIndex';
import Colors from './Colors';
import CubeColor from './CubeColor';
import CubeLight from './CubeLight';
import CubeLightDot from './CubeLightDot';
import CubeSpin from './MulCube';
import MulCubeSpin from './CubeSpin';
import TextureBase from './Texture';
import ColorFade from './ColorFade';
import Switch from './Switch';
import './index.less';


var options: any = [
  { label: 'First', value: '1', component: <First /> },
  { label: '点', value: '2', component: <Point /> },
  { label: '矩形', value: '3', component: <Rect /> },
  { label: '投影+平移', value: '4', component: <BaseTran /> },
  { label: '立方体框图', value: '5', component: <CubeRo /> },
  { label: '顶点索引', value: '6', component: <CubeIndex /> },
  { label: '颜色插值', value: '7', component: <Colors /> },
  { label: '颜色立方体', value: '8', component: <CubeColor /> },
  { label: '立方体光照', value: '9', component: <CubeLight /> },
  { label: '立方体点光照', value: '10', component: <CubeLightDot /> },
  { label: '立方体旋转', value: '11', component: <MulCubeSpin /> },
  { label: '多立方体', value: '12', component: <CubeSpin /> },
  { label: '材质基础', value: '13', component: <TextureBase /> },
  { label: '彩图去色', value: '14', component: <ColorFade /> },
  { label: '切换着色器', value: '15', component: <Switch /> },
];
options.reverse();

function App() {
  const [target, setTarget] = useState(String(options.length));

  function onChange(e: any) {
    setTarget(e.target.value);
  }

  function renderGL() {
    return options.find((item) => item.value === target)?.component ||
    <div>openGL渲染错误</div>;
  }


  return (
    <div className="App">
        <header>
          webGL test
        </header>
        <Radio.Group
          options={options}
          onChange={onChange}
          value={target}
          optionType="button"
          buttonStyle="solid"
        />
        {renderGL()}
    </div>
  );
}

export default App;
