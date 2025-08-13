import {Logger} from "../../libs/loggers";
import {ProgressBarHelpers} from "../../helpers/progress-bar.helpers";
import {EmbeddingLoaders} from "../embedding.loaders";
import {truncate} from "../../helpers/truncate.helpers";

export class MongoatlasStoresLoaders{
    private collection: any;

    constructor() {
    }

    public async store(docs: { _id: any; pageContent: string }[]){
        try{
            const embeddings = await EmbeddingLoaders.getInstance();

            const BATCH_SIZE = 100;
            const totalBatches = Math.ceil(docs.length / BATCH_SIZE);

            Logger.debug({ message: "▶️ Import starting..." });

            // Progress bar
            const updateDocProgressBar = new ProgressBarHelpers("Update MongoAtlas Embedding", totalBatches);

            //BackgrounfProcess split in batch
            //update each doc's embedding field with the vector result of the text
            for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                const batch = docs.slice(i, i + BATCH_SIZE);

                // Générer les embeddings pour ce batch
                const vectors = await embeddings.embedDocuments(batch.map(doc => truncate(doc.pageContent || "", 1024)));
                // Mettre à jour MongoDB Atlas avec les embeddings
                const bulkOps = batch.map((doc, idx) => ({
                    updateOne: {
                        filter: {_id: doc._id},
                        update: {
                            $set: {
                                embedding: vectors[idx],
                            }
                        }
                    }
                }));

                await this.collection.bulkWrite(bulkOps);

                updateDocProgressBar.update();
            }

            updateDocProgressBar.stop();

            Logger.info({ message: "✅ Import finished !" });
        } catch(err){
            Logger.error({ message: "⛔ Import failed" });
            console.error(err)
        }
    }

    public setCollection(collection: any): void{
        return this.collection = collection;
    }
}
