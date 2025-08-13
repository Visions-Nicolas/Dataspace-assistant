import { NextFunction, Request, Response } from 'express';
import {Logger} from "../../libs/loggers";
import {getMongodbConnection} from "../../loaders/connections/mongodb.connections.loaders";
import {StoreLoaders} from "../../loaders/strore.loaders";
import {truncate} from "../../helpers/truncate.helpers";

/**
 *
 */
export const mongoAtlasEmbedding = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const client = await getMongodbConnection()
        const collection = client.db(process.env.DB).collection(process.env.COLLECTION!);
        const rawDocs = await collection.find().toArray();

        // Add text to embbed for each doc
        const docs: { _id: any; pageContent: string }[] = [];
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
                `pricing: ${doc.pricing}`,
                `termsOfUse: ${doc.termsOfUse}`,
                `type: ${doc.type}`
            ].join(" - ");

            docs.push({
                _id: doc._id,
                pageContent: text,
            });
        }

        //response
        res.status(200).json({total_docs: docs.length});

        //store embedding in mongodb atlas instance
        const store = await StoreLoaders.getInstance();
        store.setCollection(collection);
        await store.store(docs);

    } catch(err){
        Logger.error({ message: "⛔ Embedding failed" });
        console.error(err)
    }
}