import { Logger } from "../libs/loggers";
import {OllamaEmbeddingsLoaders} from "../loaders/embeddings/ollama.embeddings.loaders";
import {EmbeddingLoaders} from "../loaders/embedding.loaders";

export class EmbeddingFactory {
    private static instance: EmbeddingLoaders;

    static init(): EmbeddingLoaders {
        if (!this.instance) {
            switch(process.env.EMBEDDING_MODEL){
                case 'mxbai-embed-large': {
                    Logger.debug({ message: `Using Ollama Embeddings with model ${process.env.EMBEDDING_MODEL}👨🏻‍💻` })
                    this.instance = new OllamaEmbeddingsLoaders();
                    break;
                }
                default: {
                    Logger.debug({ message: `Using empty EmbeddingLoaders` })
                    this.instance = new OllamaEmbeddingsLoaders();
                }
            }

        }
        return this.instance;
    }

    static get(): EmbeddingLoaders {
        if (!this.instance) {
            throw new Error("EmbeddingFactory not initialized. Call init() first.");
        }
        return this.instance;
    }
}