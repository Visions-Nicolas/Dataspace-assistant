export abstract class ModelLoaders {
    protected model: any;
    public _contextLength: number | undefined;

    protected constructor(model: any) {
        this.model = model;
    }

    get contextLength(): number{
        return this._contextLength ?? 0;
    }

    set contextLength(value: number){
        this._contextLength = value;
    }

    abstract invoke(message: unknown): Promise<string>;
    abstract getModelContextLength(model: string): number;
}