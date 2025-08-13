import {Logger} from "../libs/loggers";
import {OllamaEmbeddingsLoaders} from "./embeddings/ollama.embeddings.loaders";

export class EmbeddingLoaders{
    public static instance: EmbeddingLoaders;
    private model;

    private constructor(model?: any) {
        this.model = model;
    }

    public static async getInstance(): Promise<EmbeddingLoaders> {
        if (!EmbeddingLoaders.instance) {
            switch(process.env.EMBEDDING_MODEL){
                case 'mxbai-embed-large': {
                    Logger.debug({ message: `Using Ollama Embeddings with model ${process.env.EMBEDDING_MODEL}👨🏻‍💻` })
                    EmbeddingLoaders.instance = new EmbeddingLoaders(new OllamaEmbeddingsLoaders());
                    break;
                }
                default: {
                    Logger.debug({ message: `Using empty EmbeddingLoaders` })
                    EmbeddingLoaders.instance = new EmbeddingLoaders();
                }
            }

        }
        return EmbeddingLoaders.instance;
    }

    public getEmbeddingsInterface(){
        return this.model.getEmbeddingsInterface();
    }

    public async embedQuery(message: unknown): Promise<number[]>{
        return await this.model?.embedQuery(message);
    }

    public async embedDocuments(message: unknown): Promise<number[][]>{
        return await this.model?.embedDocuments(message);
    }
}