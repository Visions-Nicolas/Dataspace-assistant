import {ProgressBarHelpers} from "../../helpers/progress-bar.helpers";
import {Logger} from "../../libs/loggers";
import {QdrantVectorStore} from "@langchain/qdrant";
import {EmbeddingLoaders} from "../embedding.loaders";

export class QdrantStoresLoaders{
    constructor() {
    }

    public async store(docs: { metadata: any; pageContent: string }[]){
        try{
            const embeddings = await EmbeddingLoaders.getInstance();

            const BATCH_SIZE = 100;
            const totalBatches = Math.ceil(docs.length / BATCH_SIZE);

            Logger.debug({message: "▶️ Import starting..."});

            // Barre de progression
            const updateDocProgressBar = new ProgressBarHelpers("Update Qdrant Embedding", totalBatches);

            for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                const batch = docs.slice(i, i + BATCH_SIZE);

                // Générer les embeddings en parallèle
                const embeddedDocs = await Promise.all(
                    batch.map(async (doc) => {
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
}
