import {NextFunction, Request, Response} from 'express';
import {Logger} from "../../libs/loggers";
import {getMongodbConnection} from "../../loaders/connections/mongodb.connections.loaders";
import {StoreLoaders} from "../../loaders/strore.loaders";
import {truncate} from "../../helpers/truncate.helpers";

/**
 *
 */
export const qdrantEmbedding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const client = await getMongodbConnection()
        const collection = client.db(process.env.DB).collection(process.env.COLLECTION!);
        const rawDocs = await collection.find().toArray();

        // Créer les documents un par un avec suivi de progression
        const docs: { metadata: any; pageContent: string }[] = [];
        for (let i = 0; i < rawDocs.length; i++) {
            const doc = rawDocs[i];
            const text = [
                `Offer:`,
                `name: ${doc.name}`,
                `description: ${truncate(doc.description || "", 500)}`,
                `category: ${doc.category}`,
                `domain: ${doc.domain}`,
                `pricing: ${doc.pricing}`,
                `marketplace: ${doc.marketplace}`,
                `marketplaceUrl: ${doc.marketplaceUrl}`,
                `url: ${doc.url}`,
                `provider: ${doc.provider}`,
                `termsOfUse: ${doc.termsOfUse}`,
                `type: ${doc.type}`
            ].join(" - ");

            docs.push({
                pageContent: truncate(text || "", 1024),
                metadata: {...doc},
            });
        }

        res.status(200).json({total_docs: docs.length});

        //store embedding in Qdrant instance
        const store = await StoreLoaders.getInstance();
        await store.store(docs);

    } catch (err) {
        Logger.error({message: "⛔ Embedding failed"});
        console.error(err)
    }
}