import {ChatOllama} from "@langchain/ollama";
import {ModelLoaders} from "../model.loaders";
import {Logger} from "../../libs/loggers";

export class OllamaModelsLoaders extends ModelLoaders{

    constructor() {
        const chat = new ChatOllama({
            baseUrl: process.env.MODEL_URL,
            model: process.env.MODEL
        });
        super(chat);
        this._model = chat;
    }

    public async invoke(message: any): Promise<string> {
        const response = await this.model.invoke(message)
        Logger.info({ message: `💬 Message Answered.` });
        return response.text
    }

    getModelContextLength(model: string): number {
        return 0;
    }
}