import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'js/main.js',
	output: {
		file: 'dist/bundle.js',
		format: 'es', // iife
    name: 'interactiveAudio',
    globals: {
			jquery: '$'
		}
	},
  plugins: [
    nodeResolve(), // can't figure out how to ignore jquery....
    commonjs()
  ]
};