export abstract class EmbeddingLoaders {
    protected model: any;

    protected constructor(model: any) {
        this.model = model;
    }

    public abstract getEmbeddingsInterface(): any;
    public abstract embedQuery(message: unknown): Promise<number[]>;

    public abstract embedDocuments(message: unknown): Promise<number[][]>;
}