import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  chainWebpack(config) {
    config.module
      .rule('glslfile')
      .test(/.glsl$/)
      .use('glsl-loader')
      .loader('./GLSLloader.js');
  },
});
