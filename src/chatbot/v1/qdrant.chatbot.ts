import { NextFunction, Request, Response } from 'express';
import {QdrantVectorStore} from "@langchain/qdrant";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {Logger} from "../../libs/loggers";
import {truncate} from "../../helpers/truncate.helpers";
import {systemPrompt, userPrompt} from "../../helpers/prompt.helpers";
import {EmbeddingFactory} from "../../factory/embedding.factory";
import {ModelFactory} from "../../factory/model.factory";

/**
 *
 */
export const qdrantChat = async (req: Request, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {result} = req.query;
    if (!message || typeof message !== "string") {
        return res.status(400).json({error: "message is required"});
    }

    try {
        const embeddings = EmbeddingFactory.get();
        Logger.debug({ message: "Connecting to Qdrant..." });
        const vectorStore = new QdrantVectorStore(embeddings.getEmbeddingsInterface(), {
            url: "http://localhost:6333", // URL de ton Qdrant
            collectionName: "offers_vectors" // nom de la collection Qdrant
        });

        Logger.debug({ message: "Recherche vectorielle dans Qdrant..." });
        // Recherche des k documents les plus proches
        const k = 4;
        const topDocs = await vectorStore.similaritySearch(message, k);

        const contextTexts = topDocs
            .map((doc, i) => {
                return [
                    `Offer:`,
                    `name: ${doc.metadata.name}`,
                    `description: ${truncate(doc.metadata.description || "", 500)}`,
                    `category: ${doc.metadata.category}`,
                    `domain: ${doc.metadata.domain}`,
                    `marketplace: ${doc.metadata.marketplace}`,
                    `marketplaceUrl: ${doc.metadata.marketplaceUrl}`,
                    `url: ${doc.metadata.url}`,
                    `provider: ${doc.metadata.provider}`,
                    `pricing: ${doc.metadata.pricing}`,
                    `termsOfUse: ${doc.metadata.termsOfUse}`,
                    `type: ${doc.metadata.type}`
                ].join(" - ")
            })
            .join("\n\n---\n\n");

        //invoke model
        const model = ModelFactory.get();

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt(contextTexts, message))
        ]);

        res.json({
            response,
            ...(result ? {retrieved_count: topDocs.length,} : ''),
            ...(result ? {
                retrieved_docs: topDocs.map((doc, idx) => ({
                    _id: doc.metadata._id,
                    name: doc.metadata.name,
                    description: doc.metadata.description,
                    category: doc.metadata.category,
                    domain: doc.metadata.domain,
                    marketplace: doc.metadata.marketplace,
                    marketplaceUrl: doc.metadata.marketplaceUrl,
                    url: doc.metadata.url,
                    provider: doc.metadata.provider,
                    pricing: doc.metadata.pricing,
                    termsOfUse: doc.metadata.termsOfUse,
                    type: doc.metadata.type
                }))
            } : ''),
        });
    } catch (err) {
        console.error("Error /chat:", err);
        res.status(500).json({error: "internal"});
    }
}