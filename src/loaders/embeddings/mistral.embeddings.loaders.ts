import {EmbeddingLoaders} from "../embedding.loaders";
import {MistralAIEmbeddings} from "@langchain/mistralai";

export class MistralEmbeddingsLoaders extends EmbeddingLoaders{
    constructor() {
        super(new MistralAIEmbeddings({
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
