import { Logger } from "../../libs/loggers";
import { ProgressBarHelpers } from "../../helpers/progress-bar.helpers";
import { truncate } from "../../helpers/truncate.helpers";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Collection, Document } from "mongodb";
import { StoreLoaders } from "../strore.loaders";
import { EmbeddingFactory } from "../../factory/embedding.factory";

export class MongoatlasStoresLoaders extends StoreLoaders {
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

    public async retriever(message: string): Promise<any> {
        try {
            Logger.log({ message: "Connecting to MongoDB Atlas Vector Search..." });

            const embeddings = EmbeddingFactory.get();

            const vectorStore = new MongoDBAtlasVectorSearch(
                embeddings.getEmbeddingsInterface(),
                {
                    collection: this.collection,
                    indexName: "embedding",
                    textKey: "pageContent",
                    embeddingKey: "embedding",
                }
            );

            const retriever = vectorStore.asRetriever();
            const k = 3;
            const topDocs = await retriever.invoke(message);

            this.topDocs = topDocs;

            if (topDocs.length === 0) return '';

            return topDocs
                .map(doc => [
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
                    `termsOfUse: ${doc.metadata.termsOfUse}`,
                    `type: ${doc.metadata.type}`
                ].join(" - "))
                .join("\n\n---\n\n");
        } catch (err) {
            Logger.error({ message: "⛔ Retrieving failed" });
            console.error(err);
        }
    }
}
