import express from "express";
import {loadRoutes} from "./routes/v1/index.router";
import './config';
import {getMongodbConnection} from "./loaders/connections/mongodb.connections.loaders";
import {StoreFactory} from "./factory/store.factory";
import {EmbeddingFactory} from "./factory/embedding.factory";
import {ModelFactory} from "./factory/model.factory";

async function start() {
    const app = express();
    app.use(express.json());

    //Get offers collection
    const client = await getMongodbConnection()
    const collection = client.db(process.env.DB).collection(process.env.COLLECTION!);

    ModelFactory.init();
    EmbeddingFactory.init();
    StoreFactory.init(collection);

    loadRoutes(app);

    app.listen(process.env.PORT || 3000, () => console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`));
}

start().catch(console.error);
