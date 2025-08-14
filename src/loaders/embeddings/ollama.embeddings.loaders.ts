import {OllamaEmbeddings} from "@langchain/ollama";
import {EmbeddingLoaders} from "../embedding.loaders";

export class OllamaEmbeddingsLoaders extends EmbeddingLoaders{
    constructor() {
        super(new OllamaEmbeddings({
            baseUrl: process.env.EMBEDDING_URL,
            model: process.env.EMBEDDING_MODEL,
        }));
    }

    public async embedQuery(message: string): Promise<number[]>{
        return this.model?.embedQuery(message);
    }

    public async embedDocuments(message: string[]): Promise<number[][]>{
        return this.model?.embedDocuments(message);
    }

    public getEmbeddingsInterface(){
        return this.model;
    }
}
