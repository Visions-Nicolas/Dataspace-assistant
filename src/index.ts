import express, {Request, Response} from "express";
import {loadRoutes} from "./routes/v1/index.router";
import './config';
import {ModelLoaders} from "./loaders/model.loaders";
import {EmbeddingLoaders} from "./loaders/embedding.loaders";
import {StoreLoaders} from "./loaders/strore.loaders";
import swaggerJSDoc from 'swagger-jsdoc';
import {OpenAPIOption} from "./config/openapi-options";
import {serve, setup} from "swagger-ui-express";


async function start() {
    const app = express();
    app.use(express.json());

    app.get("/health", (req: Request, res: Response) => {
        res.json({ status: "OK" });
    });

    // Setup Swagger JSDoc
    const specs = swaggerJSDoc(OpenAPIOption);

    app.use('/docs', serve, setup(specs));

    await ModelLoaders.getInstance();
    await EmbeddingLoaders.getInstance();
    await StoreLoaders.getInstance();

    loadRoutes(app);

    app.listen(process.env.PORT || 3501, () => console.log(`Server running on http://localhost:${process.env.PORT || 3501}`));
}

start().catch(console.error);
