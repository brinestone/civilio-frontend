const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");

function getExternals() {
	// const packageJsonPath = path.resolve(__dirname, 'package.json');
	// if (fs.existsSync(packageJsonPath)) {
	// 	const packageJson = require(packageJsonPath);
	// 	// Treat all production dependencies as external
	// 	return Object.keys(packageJson.dependencies || {});
	// }
	return ["pg-native"];
}

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
				use: [
					{
						loader: "ts-loader",
						options: { transpileOnly: true },
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	externals: getExternals(),
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "projects/electron/src/**/*",
					to: path.resolve(__dirname, "dist/projects/electron/src"),
					globOptions: {
						ignore: ["**/*.ts"],
					},
					noErrorOnMissing: true,
				},
			],
		}),
	],
	node: {
		__dirname: false,
		__filename: false,
	},
};
