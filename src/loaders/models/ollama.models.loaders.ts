import {ChatOllama} from "@langchain/ollama";

export class OllamaModelsLoaders {
    public ollama;

    constructor() {
        this.ollama = new ChatOllama({
            baseUrl: process.env.MODEL_URL,
            model: process.env.MODEL
        });
    }

    public async invoke(message: any): Promise<string> {
        const response = await this.ollama.invoke(message)
        return response.text
    }
}