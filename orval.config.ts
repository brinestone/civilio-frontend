import { defineConfig } from 'orval';
export default defineConfig({
	civilio: {
		input: {
			target: 'http://localhost:3000/_docs/openapi.json',
			filters: {
				mode: 'exclude',
				tags: ['Internal', 'General', 'Miscellaneous'],

			}
		},
		output: {
			target: './projects/civilio/src/app/services/sdk',
			mode: 'tags-split',
			operationSchemas: './projects/civilio/src/dto',

			indexFiles: false,
			namingConvention: 'kebab-case',
			override: {
				angular: {
					runtimeValidation: true
				}
			},
			client: 'angular',
			tsconfig: './tsconfig.json',
			packageJson: './package.json',
			httpClient: 'angular',
		}
	}
})
