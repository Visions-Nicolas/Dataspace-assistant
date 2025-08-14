import { Logger } from "../libs/loggers";
import {OllamaModelsLoaders} from "../loaders/models/ollama.models.loaders";
import {OpenaiModelsLoaders} from "../loaders/models/openai.models.loaders";
import {ModelLoaders} from "../loaders/model.loaders";

export class ModelFactory {
    private static instance: ModelLoaders;

    static init(): ModelLoaders {
        if (!this.instance) {
            switch(process.env.MODEL){
                case 'llama3.1': case 'llama3.2': {
                    Logger.debug({ message: `Using OllamaLoaders with model ${process.env.MODEL}👾` })
                    this.instance = new OllamaModelsLoaders();
                    break;
                }
                case 'gpt-4o-mini': case 'gpt-4o': case 'gpt-4-turbo': case 'gpt-3.5-turbo': {
                    Logger.debug({ message: `Using OpenaiLoaders with model ${process.env.MODEL}👾` })
                    this.instance = new OpenaiModelsLoaders();
                    break;
                }
                default: {
                    throw new Error(`Unknown model type: ${process.env.MODEL}`);
                }
            }

        }
        return this.instance;
    }

    static get(): ModelLoaders {
        if (!this.instance) {
            throw new Error("ModelFactory not initialized. Call init() first.");
        }
        return this.instance;
    }
}