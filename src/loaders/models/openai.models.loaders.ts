import { ChatOpenAI } from "@langchain/openai";

export class OpenaiModelsLoaders {
    public openai;
    public contextLength: number;

    constructor() {
        this.contextLength = this.getModelContextLength(process.env.MODEL || "gpt-4o-mini");

        this.openai = new ChatOpenAI({
            modelName: process.env.MODEL,      // Ex: "gpt-4o-mini"
            temperature: 0.2,
            openAIApiKey: process.env.OPENAI_API_KEY
        });
    }

    private getModelContextLength(model: string): number {
        // Tableau des context lengths connus
        const limits: Record<string, number> = {
            "gpt-4o-mini": 128000,
            "gpt-4o": 128000,
            "gpt-4-turbo": 128000,
            "gpt-3.5-turbo": 16000
        };
        return limits[model] || 4096;
    }

    public async invoke(message: any): Promise<string> {
        const maxChars = Math.floor(this.contextLength * 4 * 0.8);

        if (typeof message === "string" && message.length > maxChars) {
            message = message.slice(0, maxChars);
        }

        const response = await this.openai.invoke(message);
        return response.content?.toString() || "";
    }
}
