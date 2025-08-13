import {NextFunction, Request, Response} from 'express';
import {MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {Logger} from "../../libs/loggers";
import {ModelLoaders} from "../../loaders/model.loaders";
import {EmbeddingLoaders} from "../../loaders/embedding.loaders";
import {getMongodbConnection} from "../../loaders/connections/mongodb.connections.loaders";
import {truncate} from "../../helpers/truncate.helpers";
import {systemPrompt, userPrompt} from "../../helpers/prompt.helpers";

export const mongoAtlasChat = async (req: Request, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {result} = req.query;
    if (!message || typeof message !== "string") {
        return res.status(400).json({error: "message is required"});
    }

    try {
        Logger.log({ message: "Connecting to MongoDB Atlas Vector Search..." });

        const client = await getMongodbConnection()
        const collection = client.db(process.env.DB).collection(process.env.COLLECTION!);

        const embeddings = await EmbeddingLoaders.getInstance();

        const vectorStore = new MongoDBAtlasVectorSearch(
            embeddings.getEmbeddingsInterface(),
            {
                collection,
                indexName: "embedding",
                textKey: "pageContent",
                embeddingKey: "embedding",
            }
        );

        const retriever = vectorStore.asRetriever();

        Logger.log({ message: "Retrieving relevant documents with retriever..." });

        const k = 3;
        const topDocs = await retriever.invoke(message);

        if (topDocs.length === 0) {
            return res.json({
                answer: "",
                retrieved_count: 0,
                retrieved_docs: []
            });
        }

        // Prepare context for Model
        const contextTexts = topDocs
            .map((doc, i) => {
                return [
                    `Offer:`,
                    `name: ${doc.metadata.name}`,
                    `description: ${truncate(doc.metadata.description || "", 500)}`,
                    `category: ${doc.metadata.category}`,
                    `domain: ${doc.metadata.domain}`,
                    `pricing: ${doc.metadata.pricing}`,
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
        const model = await ModelLoaders.getInstance();

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt(contextTexts, message))
        ]);

        res.json({
            response,
            ...(result ? { retrieved_count: topDocs.length } : ''),
            ...(result ? { retrieved_docs: topDocs } : ''),
        });
    } catch (err) {
        console.error(err)
        Logger.error({ message: `Error /mongoatlas/chat`, error: (err as ErrorConstructor | undefined) });
        res.status(500).json({error: err});
    }
}