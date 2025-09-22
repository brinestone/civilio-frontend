import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";

export default {
  mode: "production",
  target: "electron-main",
  entry: path.resolve(import.meta.dirname, "projects/electron/src/index.ts"),
  output: {
    path: path.resolve(import.meta.dirname, "dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@civilio/shared": path.resolve(
        import.meta.dirname,
        "libs/shared/index.ts",
      ),
      "@civilio/schema": path.resolve(
        import.meta.dirname,
        "projects/electron/src/db/schema.ts",
      ),
      "@civilio/handlers": path.resolve(
        import.meta.dirname,
        "projects/electron/src/handlers/index.ts",
      ),
      "@civilio/helpers": path.resolve(
        import.meta.dirname,
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
          from: path.resolve(import.meta.dirname, "projects/electron/src"),
          to: path.resolve(import.meta.dirname, "dist/projects/electron/src"),
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
