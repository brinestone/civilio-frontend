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
			mode: 'tags-split',
			target: 'projects/civilio/src/sdk/services',
			namingConvention: 'kebab-case',
			client: 'angular',
			override: {
				angular: {
					provideIn: false,
					runtimeValidation: true
				},
			},
			schemas: {
				type: 'zod',
				path: './libs/sdk/models'
			},
			operationSchemas: './libs/sdk/dto'
		},
	}
});
