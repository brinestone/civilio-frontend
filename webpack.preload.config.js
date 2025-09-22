import path from 'path';

export default {
  mode: 'production',
  target: 'electron-preload',
  entry: path.resolve(import.meta.dirname, 'projects/electron/src/preload.ts'),
  output: {
    path: path.resolve(import.meta.dirname, 'dist'),
    filename: 'preload.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@civilio/shared': path.resolve(import.meta.dirname, 'libs/shared/index.ts'),
      '@civilio/schema': path.resolve(import.meta.dirname, 'projects/electron/src/db/schema.ts'),
      '@civilio/handlers': path.resolve(import.meta.dirname, 'projects/electron/src/handlers/index.ts'),
      '@civilio/helpers': path.resolve(import.meta.dirname, 'projects/electron/src/helpers'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
