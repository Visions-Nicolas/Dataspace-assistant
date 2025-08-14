import {version, name, description} from '../../package.json';

export const OpenAPIOption = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: name,
			version,
			description,
		},
	},
	apis: ['./src/routes/v1/*.ts'],
};
