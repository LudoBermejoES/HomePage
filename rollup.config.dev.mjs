import serve from 'rollup-plugin-serve';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import execute from 'rollup-plugin-execute';
import pluginJson from '@rollup/plugin-json';

export default {
  //  Our game entry point (edit as required)
  input: ['./src/game.ts'],

  //  Where the build file is to be generated.
  //  Most games being built for distribution can use iife as the module type.
  //  You can also use 'umd' if you need to ingest your game into another system.
  //  If using Phaser 3.21 or **below**, add: `intro: 'var global = window;'` to the output object.
  output: {
    file: './dist/game.js',
    name: 'MyGame',
    format: 'iife',
    sourcemap: true
  },

  plugins: [
    //  Toggle the booleans here to enable / disable Phaser 3 features:
    replace({
      preventAssignment: true,
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
      'typeof WEBGL_DEBUG': JSON.stringify(true),
      'typeof EXPERIMENTAL': JSON.stringify(true),
      'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
      'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
      'typeof FEATURE_SOUND': JSON.stringify(true)
    }),

    //  Parse our .ts source files
    nodeResolve({
      extensions: ['.ts', '.tsx']
    }),

    copy({
      assets: [
        // You can include directories
        'src/assets'
      ]
    }),

    //  We need to convert the Phaser 3 CJS modules into a format Rollup can use:
    commonjs({
      include: [
        'node_modules/eventemitter3/**',
        'node_modules/phaser/**',
        'node_modules/navmesh/**',
        'node_modules/lodash/**',
        'node_modules/@raresail/phaser-pathfinding/**',
        'node_modules/astar-typescript/**',
        'node_modules/phaser3-nineslice/**'
      ],
      exclude: [
        'node_modules/phaser/src/polyfills/requestAnimationFrame.js',
        'node_modules/phaser/src/phaser-esm.js'
      ],
      sourceMap: true,
      ignoreGlobal: true,
      requireReturnsDefault: 'auto'
    }),

    //  See https://github.com/rollup/plugins/tree/master/packages/typescript for config options
    typescript(),

    //  See https://www.npmjs.com/package/rollup-plugin-serve for config options
    serve({
      open: true,
      contentBase: 'dist',
      host: 'localhost',
      port: 10001,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }),

    pluginJson(),
    copy({
      targets: [
        {
          src: 'src/assets',
          dest: 'dist'
        },
        {
          src: 'map/*.json',
          dest: 'utils'
        },
        {
          src: 'map/*.webp',
          dest: 'utils'
        },
        {
          src: 'map/*.png',
          dest: 'utils'
        }
      ],
      verbose: true
    }),

    execute(
      'cd utils && node mapReducer.js && cp created/*.webp ../src/assets/map && cp created/*.json ../src/assets/map && cp created/*.json ../dist/assets/map && cp created/*.webp ../dist/assets/map'
    )
  ]
};
