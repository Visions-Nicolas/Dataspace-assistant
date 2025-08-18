import { Logger } from "../libs/loggers";
import {OllamaModelsLoaders} from "../loaders/models/ollama.models.loaders";
import {OpenaiModelsLoaders} from "../loaders/models/openai.models.loaders";
import {ModelLoaders} from "../loaders/model.loaders";
import {MistralModelsLoaders} from "../loaders/models/mistral.models.loaders";

export class ModelFactory {
    public static instance: ModelLoaders;

    static init(): ModelLoaders {
        if (!this.instance) {
            switch(process.env.MODEL){
                case 'llama3.1': case 'llama3.2': case 'gpt-oss': case 'deepseek-r1': case 'gemma3': {
                    Logger.debug({ message: `Using OllamaModelsLoaders with model ${process.env.MODEL}👾` })
                    this.instance = new OllamaModelsLoaders();
                    break;
                }
                case 'gpt-4o-mini': case 'gpt-4o': case 'gpt-4-turbo': case 'gpt-3.5-turbo': {
                    Logger.debug({ message: `Using OpenaiModelsLoaders with model ${process.env.MODEL}👾` })
                    this.instance = new OpenaiModelsLoaders();
                    break;
                }
                case 'magistral-medium-2507': case 'mistral-medium-2508': {
                    Logger.debug({ message: `Using MistralModelsLoaders with model ${process.env.MODEL}👾` })
                    this.instance = new MistralModelsLoaders();
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