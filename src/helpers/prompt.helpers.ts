export const systemPrompt = `You are an assistant that answers user questions using ONLY the provided context documents.`;

export const userPrompt = (contextTexts: string, message: string) =>  `Context:\n${contextTexts}\n\nQuestion: ${message}\n\n:`;