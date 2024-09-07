import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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