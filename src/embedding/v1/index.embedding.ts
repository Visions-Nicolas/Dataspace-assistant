import { NextFunction, Request, Response } from 'express';
import {Logger} from "../../libs/loggers";
import {StoreFactory} from "../../factory/store.factory";

export const embedding = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const store = StoreFactory.get();
        const docs = await store.prepare();

        res.status(200).json({total_docs: docs});

        await store.store();

    } catch(err){
        Logger.error({ message: "⛔ Embedding failed" });
        console.error(err)
    }
}