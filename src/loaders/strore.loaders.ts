import {OllamaModelsLoaders} from "./models/ollama.models.loaders";
import {Logger} from "../libs/loggers";
import {MongoatlasStoresLoaders} from "./stores/mongoatlas.stores.loaders";
import {QdrantStoresLoaders} from "./stores/qdrant.stores.loaders";

export class StoreLoaders{
    private static instance: StoreLoaders;
    private storage;

    private constructor(storage?: any) {
        this.storage = storage;
    }

    public static async getInstance(collection?: any): Promise<StoreLoaders> {
        if (!StoreLoaders.instance) {
            switch(process.env.STORE){
                case 'mongoatlas': {
                    Logger.debug({ message: `Using MongoDBAtlas Store🛢` })
                    StoreLoaders.instance = new StoreLoaders(new MongoatlasStoresLoaders());
                    break;
                }
                case 'qdrant': {
                    Logger.debug({ message: `Using Qdrant Store🛢` })
                    StoreLoaders.instance = new StoreLoaders(new QdrantStoresLoaders());
                    break;
                }
                default: {
                    Logger.debug({ message: `Using empty StoreLoaders` })
                    StoreLoaders.instance = new StoreLoaders();
                }
            }

        }

        return StoreLoaders.instance;
    }

    public async store(docs: any[]): Promise<void>{

        return await this.storage?.store(docs);
    }

    public setCollection(collection: any): void{
        return this.storage?.setCollection(collection);
    }
}