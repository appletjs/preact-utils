import buble from 'rollup-plugin-buble';
import {uglify} from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/index.js',
    plugins: [
      buble()
    ],
    output: {
      sourcemap: true,
      format: 'umd',
      file: 'index.js',
      name: 'preactUtils'
    }
  },
  {
    input: 'src/index.js',
    plugins: [
      buble(),
      uglify()
    ],
    output: {
      sourcemap: true,
      format: 'umd',
      file: 'index.min.js',
      name: 'preactUtils'
    }
  }
];
