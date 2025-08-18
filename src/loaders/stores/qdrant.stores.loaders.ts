import {ProgressBarHelpers} from "../../helpers/progress-bar.helpers";
import {Logger} from "../../libs/loggers";
import {QdrantVectorStore} from "@langchain/qdrant";
import {Collection, Document} from "mongodb";
import {StoreLoaders} from "../strore.loaders";
import {EmbeddingFactory} from "../../factory/embedding.factory";
import {truncate} from "../../helpers/truncate.helpers";
import {tool} from "@langchain/core/tools";

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
                metadata: {
                    ...doc
                }
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
                    batch.map(async (doc: { pageContent: any; metadata: any; }) => {
                        const vector = await embeddings.embedQuery(doc.pageContent);
                        return {
                            pageContent: doc.pageContent,
                            metadata: doc.metadata,
                            embedding: vector
                        };
                    })
                );

                // Envoyer vers Qdrant
                await QdrantVectorStore.fromDocuments(
                    embeddedDocs,
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

    public async rag(message: string): Promise<any> {
        Logger.debug({ message: "Connecting to Qdrant..." });

        const embeddings = EmbeddingFactory.get();

        const vectorStore = new QdrantVectorStore(embeddings.getEmbeddingsInterface(), {
            url: process.env.QDRANT_URI,
            collectionName: process.env.QDRANT_COLLECTION
        });

        Logger.debug({ message: "Qdrant vector search..." });
        // Recherche des k documents les plus proches
        const k = 4;

        const topDocs = await vectorStore.similaritySearch(message, k);

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
    }

    public async agent(): Promise<any> {
        Logger.debug({ message: "Connecting to Qdrant..." });

        const embeddings = EmbeddingFactory.get();

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings.getEmbeddingsInterface(),
            {
                url: process.env.QDRANT_URI,
                collectionName: process.env.QDRANT_COLLECTION,
            }
        );

        const retriever = vectorStore.asRetriever();

        return tool(
            async (query: string) => {
                console.log("query", query)
                const topDocs = await retriever.invoke('quel l\'url de laBigAddress ?');

                console.log("TOPDOCS", topDocs)

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
            },
            {
                name: "search_qdrant",
                description: "Recherche des offres pertinentes dans Qdrant à partir d'une requête utilisateur"
            });
    }
}
