import { Collection, Document } from "mongodb";
import { Logger } from "../libs/loggers";
import {StoreLoaders} from "../loaders/strore.loaders";
import {MongoatlasStoresLoaders} from "../loaders/stores/mongoatlas.stores.loaders";
import {QdrantStoresLoaders} from "../loaders/stores/qdrant.stores.loaders";

export class StoreFactory {
    private static instance: StoreLoaders;

    static init(collection: Collection<Document>): StoreLoaders {
        if (!this.instance) {
            switch (process.env.STORE) {
                case "mongoatlas":
                    Logger.debug({ message: `Using MongoDBAtlas Store🛢` });
                    this.instance = new MongoatlasStoresLoaders(collection);
                    break;
                case "qdrant":
                    Logger.debug({ message: `Using Qdrant Store🛢` });
                    this.instance = new QdrantStoresLoaders(collection);
                    break;
                default:
                    throw new Error(`Unknown store type: ${process.env.STORE}`);
            }
        }
        return this.instance;
    }

    static get(): StoreLoaders {
        if (!this.instance) {
            throw new Error("StoreFactory not initialized. Call init() first.");
        }
        return this.instance;
    }
}