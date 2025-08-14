import {writeFile} from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import {OpenAPIOption} from '../config/openapi-options';
import {Logger} from '../libs/loggers';

const specs = swaggerJSDoc(OpenAPIOption);

writeFile(
	path.join(__dirname, '../../docs/swagger.json'),
	JSON.stringify(specs, null, 2),
	err => {
		if (err) {
			Logger.error({message: err.message, location: err.stack});
		}
	},
);
