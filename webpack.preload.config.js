const path = require("path");

module.exports = {
  mode: "production",
  target: "electron-preload",
  entry: path.resolve(__dirname, "projects/electron/src/preload.ts"),
  output: {
    path: path.resolve(__dirname, "dist/electron"),
    filename: "preload.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@civilio/shared": path.resolve(__dirname, "libs/shared/index.ts"),
      "@civilio/schema": path.resolve(
        __dirname,
        "projects/electron/src/db/schema.ts",
      ),
      "@civilio/handlers": path.resolve(
        __dirname,
        "projects/electron/src/handlers/index.ts",
      ),
      "@civilio/helpers": path.resolve(
        __dirname,
        "projects/electron/src/helpers",
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
