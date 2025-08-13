import { NextFunction, Request, Response } from 'express';
import {EmbeddingLoaders} from "../../loaders/embedding.loaders";
import {getMongooseConnection} from "../../loaders/connections/mongoose.connections.loaders";
import {truncate} from "../../helpers/truncate.helpers";
/**
 *
 */
export const mongodbEmbedding = async (req: Request, res: Response, next: NextFunction) => {
    const conn = await getMongooseConnection()
    const col = conn.collection(process.env.COLLECTION ?? 'offers');
    const docs = await col.find().toArray();
    const embeddings = await EmbeddingLoaders.getInstance();

    for (const doc of docs) {
        const text = [
            doc.name,
            truncate(doc.description || "", 500),
            doc.category,
            doc.domain,
            doc.pricing,
            doc.provider,
            doc.type
        ].join(" : ");

        console.log("Computing query embedding...");
        const queryEmbedding = await embeddings.embedQuery(text);
        await col.findOneAndUpdate(
            {_id: doc._id},
            {$set: {embedding: queryEmbedding}}
        );
    }

    return res.status(200).json({docs: docs.length})
}