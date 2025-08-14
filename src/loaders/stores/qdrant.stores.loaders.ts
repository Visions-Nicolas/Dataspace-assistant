import {ProgressBarHelpers} from "../../helpers/progress-bar.helpers";
import {Logger} from "../../libs/loggers";
import {QdrantVectorStore} from "@langchain/qdrant";
import {Collection, Document} from "mongodb";
import {StoreLoaders} from "../strore.loaders";
import {EmbeddingFactory} from "../../factory/embedding.factory";

export class QdrantStoresLoaders extends StoreLoaders {
    constructor(collection: Collection<Document>) {
        super(collection);
    }

    public async prepare(): Promise<number> {
        return 0;
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
                    batch.map(async (doc: { pageContent: unknown; }) => {
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
                        pageContent: doc.pageContent,
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
