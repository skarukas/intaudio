import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { dts } from "rollup-plugin-dts";

export default [{
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
    nodeResolve(),
    commonjs()
  ]
},
{
  input: "js/main.d.ts",
  output: [{
    file: "dist/bundle.d.ts",
    format: "es"
  }],
  plugins: [
    dts(),
    nodeResolve(),
    commonjs()
  ],
}];