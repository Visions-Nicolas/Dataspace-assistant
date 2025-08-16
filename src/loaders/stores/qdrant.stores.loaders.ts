import {ProgressBarHelpers} from "../../helpers/progress-bar.helpers";
import {Logger} from "../../libs/loggers";
import {QdrantVectorStore} from "@langchain/qdrant";
import {Collection, Document} from "mongodb";
import {StoreLoaders} from "../strore.loaders";
import {EmbeddingFactory} from "../../factory/embedding.factory";
import {truncate} from "../../helpers/truncate.helpers";

export class QdrantStoresLoaders extends StoreLoaders {
    constructor(collection: Collection<Document>) {
        super(collection);
    }

    public async prepare(): Promise<number> {
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

    public async store(){
        try{
            const embeddings = EmbeddingFactory.get();

            const BATCH_SIZE = 100;
            const totalBatches = Math.ceil(this.docs.length / BATCH_SIZE);

            Logger.debug({message: "▶️ Import starting..."});

            // Barre de progression
            const updateDocProgressBar = new ProgressBarHelpers("Update Qdrant Embedding", totalBatches);

            for (let i = 0; i < this.docs.length; i += BATCH_SIZE) {
                const batch = this.docs.slice(i, i + BATCH_SIZE);

                // Générer les embeddings en parallèle
                const embeddedDocs = await Promise.all(
                    batch.map(async (doc: { pageContent: any; }) => {
                        const vector = await embeddings.embedQuery(doc.pageContent);
                        return {
                            ...doc,
                            embedding: vector
                        };
                    })
                );

                // Envoyer vers Qdrant
                await QdrantVectorStore.fromDocuments(
                    embeddedDocs.map(doc => ({
                        pageContent: truncate(doc.pageContent || "", 1024),
                        metadata: doc.metadata
                    })),
                    embeddings.getEmbeddingsInterface(),
                    {
                        url: process.env.QDRANT_URI,
                        collectionName: process.env.QDRANT_COLLECTION,
                    }
                );

                updateDocProgressBar.update();
            }

            updateDocProgressBar.stop();

            Logger.info({message: "✅ Import finished !"});
        } catch (err) {
            Logger.error({message: "⛔ Import failed"});
            console.error(err)
        }
    }

    public async retriever(message: string): Promise<any> {
    }
}
