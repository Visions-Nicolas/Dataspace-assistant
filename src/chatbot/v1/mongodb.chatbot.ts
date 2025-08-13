import { NextFunction, Request, Response } from 'express';
import {ChatOllama} from "@langchain/ollama";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {EmbeddingLoaders} from "../../loaders/embedding.loaders";
import {getMongooseConnection} from "../../loaders/connections/mongoose.connections.loaders";
import {cosineSimilarity} from "../../helpers/consine.helpers";

/**
 *
 */
export const mongodbChat = async (req: Request, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {result} = req.query
    if (!message || typeof message !== "string") {
        return res.status(400).json({error: "message is required"});
    }

    try {
        const db = await getMongooseConnection();
        const col = db.collection(process.env.COLLECTION ?? 'offers');

        const embeddings = await EmbeddingLoaders.getInstance();

        console.log("Computing query embedding...");
        const queryEmbedding = await embeddings.embedQuery(message);

        console.log("Fetching all embeddings from MongoDB...");
        // Charge les documents avec leurs embeddings (attention si dataset énorme)
        const docs = await col.find({}, {
            projection: {
                _id: 1,
                embedding: 1,
                name: 1,
                description: 1,
                url: 1,
                category: 1,
                domain: 1,
                marketplace: 1,
                pricing: 1,
                provider: 1,
                type: 1
            }
        }).toArray();

        // Calculer la similarité cosinus avec le queryEmbedding
        const scoredDocs = docs
            .map(doc => ({
                doc,
                score: cosineSimilarity(queryEmbedding, doc.embedding)
            }))
            // Tri décroissant par score (plus proche en premier)
            .sort((a, b) => b.score - a.score);

        const k = 5;
        const topDocs = scoredDocs.slice(0, k);

        console.log(`Top ${k} docs retrieved`);

        const contextTexts = topDocs
            .map(({doc, score}, i) =>
                `Document ${doc.name} with url ${doc.url} and category ${doc.category} and price ${doc.price} (score: ${score.toFixed(3)})\n${doc.text || doc.description || ""}`
            )
            .join("\n\n---\n\n");

        const systemPrompt = `You are an assistant that answers user questions using ONLY the provided context documents. If the answer is not in the documents, say "I don't know." Be concise.`;
        const userPrompt = `Context:\n${contextTexts}\n\nQuestion: ${message}\n\nAnswer in French.`;

        const ollama = new ChatOllama({
            baseUrl: "http://localhost:11434",
            model: "llama3.1"
        });

        const re = await ollama.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt)
        ]);

        type Generation = { text: string };
        type OllamaResponse = { generations: Generation[][] } | string | { text?: string };

        const resp = re as OllamaResponse;

        let response = "No answer";

        if (typeof resp === "object" && resp !== null && "generations" in resp) {
            if (
                Array.isArray(resp.generations) &&
                resp.generations.length > 0 &&
                Array.isArray(resp.generations[0]) &&
                resp.generations[0].length > 0 &&
                typeof resp.generations[0][0].text === "string"
            ) {
                response = resp.generations[0][0].text;
            }
        } else if (typeof resp === "object" && resp !== null && "text" in resp && typeof resp.text === "string") {
            response = resp.text;
        } else if (typeof resp === "string") {
            response = resp;
        }

        res.json({
            response,
            ...(result ? {retrieved_count: topDocs.length,} : ''),
            ...(result ? { retrieved_docs: topDocs.map(({score}, i, doc) => ({
                    idx: i + 1,
                    score,
                    _id: doc[0].doc._id,
                    url: doc[0].doc.url,
                    pricing: doc[0].doc.pricing
                }))} : ''),
        });
    } catch (err) {
        console.error("Error /chat:", err);
        res.status(500).json({error: "internal"});
    }
}