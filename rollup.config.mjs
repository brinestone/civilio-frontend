import path from "path";
import { fileURLToPath } from "url";
import typescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const commonPlugins = [
	json(),
	resolve({
		extensions: [".ts", ".js"],
		preferBuiltins: true,
	}),
	typescript({
		tsconfig: "./projects/electron/tsconfig.json",
		include: ["projects/electron/src/**/*.ts", "libs/**/*.ts"],
		rootDir: path.resolve("."),
	}),
	commonjs({
		esmExternals: true,
		requireReturnsDefault: "auto",
		ignore: ["electron", "electron-log", "electron-store"],
	}),
];

export default [
	{
		input: "projects/electron/src/preload.ts",
		output: {
			file: "dist/electron/preload.js",
			format: "cjs",
			sourcemap: false,
		},
		external: ["electron"],
		plugins: commonPlugins,
	},
	{
		input: "projects/electron/src/index.ts",
		output: {
			file: "dist/electron/index.js",
			format: "cjs",
			sourcemap: true,
		},
		external: [
			"pg-native",
			"electron",
			/^electron-log($\/)/,
			"better-sqlite3",
			/^electron-store($\/)/,
			"fs",
			"path",
			"node:sqlite",
			"os",
			"url",
		], // Add node built-ins
		plugins: [
			alias({
				entries: [
					{
						find: "@civilio/shared",
						replacement: path.resolve(__dirname, "libs/shared/index.ts"),
					},
					{
						find: "@civilio/schema",
						replacement: path.resolve(
							__dirname,
							"projects/electron/src/db/schema.ts",
						),
					},
					{
						find: "@civilio/handlers",
						replacement: path.resolve(
							__dirname,
							"projects/electron/src/handlers/index.ts",
						),
					},
					{
						find: "@civilio/helpers",
						replacement: path.resolve(
							__dirname,
							"projects/electron/src/helpers",
						),
					},
				],
			}),
			...commonPlugins,
			copy({
				targets: [
					{
						src: ["projects/electron/src/**/*", "!**/*.ts"],
						dest: "dist/projects/electron/src",
					},
				],
			}),
		],
	},
];
