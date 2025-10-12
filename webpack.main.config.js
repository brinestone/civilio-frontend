const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  target: "electron-main",
  entry: path.resolve(__dirname, "projects/electron/src/index.ts"),
  output: {
    path: path.resolve(__dirname, "dist/electron"),
    filename: "index.js",
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "projects/electron/src"),
          to: path.resolve(__dirname, "dist/projects/electron/src"),
          globOptions: {
            ignore: ["**/*.ts"],
          },
        },
      ],
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
};
