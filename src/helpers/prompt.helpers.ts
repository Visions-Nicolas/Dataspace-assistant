export const systemPrompt = (index: number ) => {
    const prompts = [
    `You are an assistant that answers user questions using ONLY the provided context documents.`,
    `You are an assistant expert in Dataspace, that answers user questions using ONLY the provided context documents.`,
    ];

    return index <= prompts.length - 1 ? prompts[index] : prompts[0];
}

export const userPrompt = (contextTexts: string, message: string, index: number) => {
    const prompts = [
        `Context:\n${contextTexts}\n\nQuestion: ${message}\n\n:`,
        `Context:\n${contextTexts}\n\nQuestion: ${message}\n\nRespond in French:`
    ]

    return index <= prompts.length - 1 ? prompts[index] : prompts[0];
};