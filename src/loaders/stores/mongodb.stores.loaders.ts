import { Logger } from "../../libs/loggers";
import { ProgressBarHelpers } from "../../helpers/progress-bar.helpers";
import { truncate } from "../../helpers/truncate.helpers";
import { Collection, Document } from "mongodb";
import { StoreLoaders } from "../strore.loaders";
import { EmbeddingFactory } from "../../factory/embedding.factory";
import {cosineSimilarity} from "../../helpers/consine.helpers";

export class MongodbStoresLoaders extends StoreLoaders {
    constructor(collection: Collection<Document>) {
        super(collection);
    }

    public async prepare(): Promise<number>{
        const rawDocs = await this.collection.find().toArray();
        this.embeddings = EmbeddingFactory.get();

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

            this.docs.push({
                _id: doc._id,
                pageContent: text,
            });
        }

        return rawDocs.length
    }

    public async store() {
        try {
            const totalBatches = Math.ceil(this.docs.length / 100);

            Logger.debug({ message: "▶️ Import starting..." });

            const updateDocProgressBar = new ProgressBarHelpers(
                "Update MongoAtlas Embedding",
                totalBatches
            );

            for (let i = 0; i < this.docs.length; i += 100) {
                const batch = this.docs.slice(i, i + 100);

                const vectors = await this.embeddings.embedDocuments(
                    batch.map((doc: { pageContent: any; }) => truncate(doc.pageContent || "", 1024))
                );

                const bulkOps = batch.map((doc: { _id: any; }, idx: string | number) => ({
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $set: { embedding: vectors[idx] } }
                    }
                }));

                await this.collection.bulkWrite(bulkOps);
                updateDocProgressBar.update();
            }

            updateDocProgressBar.stop();
            Logger.info({ message: "✅ Import finished !" });
        } catch (err) {
            Logger.error({ message: "⛔ Import failed" });
            console.error(err);
        }
    }

    public async rag(message: string): Promise<any> {
        try {
            const embeddings = EmbeddingFactory.get();

            console.log("Computing query embedding...");
            const queryEmbedding = await embeddings.embedQuery(message);

            console.log("Fetching all embeddings from MongoDB...");
            // Charge les documents avec leurs embeddings (attention si dataset énorme)
            const docs = await this.collection.find({}, {
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

            return topDocs
                .map((doc: any) => [
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
                ].join(" - "))
                .join("\n\n---\n\n");
        } catch (err) {
            Logger.error({ message: "⛔ Retrieving failed" });
            console.error(err);
        }
    }

    public async agent(message: string): Promise<any> {
        try {
            return '';
        } catch (err) {
            Logger.error({ message: "⛔ Retrieving failed" });
            console.error(err);
        }
    }
}
