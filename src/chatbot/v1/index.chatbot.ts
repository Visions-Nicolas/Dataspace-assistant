import { NextFunction, Request, Response } from 'express';
import {Logger} from "../../libs/loggers";
import {StoreFactory} from "../../factory/store.factory";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {systemPrompt, userPrompt} from "../../helpers/prompt.helpers";
import {ModelFactory} from "../../factory/model.factory";

/**
 *
 */
export const chat = async (req: Request, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {result} = req.query;

    let system = Number(req.query.system);
    let user = Number(req.query.user);

    if (isNaN(system)) system = 0;
    if (isNaN(user)) user = 0;

    if (!message || typeof message !== "string") {
        return res.status(400).json({error: "message is required"});
    }


    try {
        const store = StoreFactory.get();
        const model = ModelFactory.get();

        const contextTexts = await store.retriever(message);

        const response = await model.invoke([
            new SystemMessage(systemPrompt(system)),
            new HumanMessage(userPrompt(contextTexts, message, user))
        ]);

        res.setHeader('x-assistant-identifier', process.env.ASSISTANT_IDENTIFIER ?? '').json({
            response,
            ...(result ? { retrieved_count: store.topDocs.length } : ''),
            ...(result ? { retrieved_docs: store.topDocs } : ''),
        });
    } catch (err) {
        console.error(err)
        Logger.error({ message: `Error /chat`, error: (err as ErrorConstructor | undefined) });
        res.status(500).json({error: err});
    }
}