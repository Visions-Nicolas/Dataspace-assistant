import {OllamaModelsLoaders} from "./models/ollama.models.loaders";
import {Logger} from "../libs/loggers";
import {OpenaiModelsLoaders} from "./models/openai.models.loaders";

export class ModelLoaders{
    private static instance: ModelLoaders;
    private model;

    private constructor(model?: any) {
        this.model = model;
    }

    public static async getInstance(): Promise<ModelLoaders> {
        if (!ModelLoaders.instance) {
            switch(process.env.MODEL){
                case 'llama3.1': case 'llama3.2': {
                    Logger.debug({ message: `Using OllamaLoaders with model ${process.env.MODEL}👾` })
                    ModelLoaders.instance = new ModelLoaders(new OllamaModelsLoaders());
                    break;
                }
                case 'gpt-4o-mini': case 'gpt-4o': case 'gpt-4-turbo': case 'gpt-3.5-turbo': {
                    Logger.debug({ message: `Using OpenaiLoaders with model ${process.env.MODEL}👾` })
                    ModelLoaders.instance = new ModelLoaders(new OpenaiModelsLoaders());
                    break;
                }
                default: {
                    Logger.debug({ message: `Using empty ModelLoaders` })
                    ModelLoaders.instance = new ModelLoaders();
                }
            }

        }
        return ModelLoaders.instance;
    }

    public async invoke(message: unknown): Promise<string>{
        Logger.info({ message: `💬 Message Answered.` });
        return await this.model?.invoke(message);
    }
}