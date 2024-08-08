import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'js/worklet/main.js',
  output: {
    file: 'dist/worklet.js',
    format: 'iife'
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};