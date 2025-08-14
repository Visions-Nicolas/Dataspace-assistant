import type { Collection, Document as MongoDocument } from "mongodb";
import {EmbeddingLoaders} from "./embedding.loaders";
import {EmbeddingFactory} from "../factory/embedding.factory";


export abstract class StoreLoaders {
    protected _collection: Collection<MongoDocument>;
    private _topDocs: any;
    private _embeddings: EmbeddingLoaders;
    private _docs: { _id: any; pageContent: string }[] = [];

    protected constructor(collection: Collection<MongoDocument>) {
        this._collection = collection;
        this._embeddings = EmbeddingFactory.get();
    }

    get collection(): Collection<MongoDocument> {
        return this._collection;
    }

    get topDocs(): any {
        return this._topDocs;
    }

    set topDocs(value: any){
        this._topDocs = value;
    }

    get docs(): any {
        return this._docs;
    }

    set docs(value: { _id: any; pageContent: string }[]){
        this._docs = value;
    }

    get embeddings(): any {
        return this._embeddings;
    }

    set embeddings(value: EmbeddingLoaders){
        this._embeddings = value;
    }

    abstract prepare(): Promise<number>;
    abstract store(): Promise<void>;
    abstract retriever(message: string): Promise<any>;
}