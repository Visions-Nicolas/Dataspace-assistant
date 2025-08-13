import {OllamaEmbeddings} from "@langchain/ollama";

export class OllamaEmbeddingsLoaders{
    public embeddings;

    constructor() {
        this.embeddings = new OllamaEmbeddings({
            baseUrl: process.env.EMBEDDING_URL,
            model: process.env.EMBEDDING_MODEL,
        })
    }

    public async embedQuery(message: string): Promise<number[]>{
        return this.embeddings?.embedQuery(message);
    }

    public async embedDocuments(message: string[]): Promise<number[][]>{
        return this.embeddings?.embedDocuments(message);
    }

    public getEmbeddingsInterface(){
        return this.embeddings;
    }
}
