import { NextFunction, Request, Response } from 'express';
import {Logger} from "../../libs/loggers";
import {StoreFactory} from "../../factory/store.factory";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {systemPrompt, userPrompt} from "../../helpers/prompt.helpers";
import {ModelFactory} from "../../factory/model.factory";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import "dotenv/config";
import {getMongodbConnection} from "../../loaders/connections/mongodb.connections.loaders";



/**
 *
 */
export const chat = async (req: Request, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {result, type} = req.query;

    const store = StoreFactory.get();
    const model = ModelFactory.get();

    const threadId = Date.now().toString();

    let system = Number(req.query.system);
    let user = Number(req.query.user);

    if (isNaN(system)) system = 0;
    if (isNaN(user)) user = 0;

    if (!message || typeof message !== "string") {
        return res.status(400).json({error: "message is required"});
    }

    try {
        if(type === 'rag'){
            const contextTexts = await store.rag(message);

            const response = await model.invoke([
                new SystemMessage(systemPrompt(system)),
                new HumanMessage(userPrompt(contextTexts, message, user))
            ]);

            res.setHeader('x-assistant-identifier', process.env.ASSISTANT_IDENTIFIER ?? '').json({
                response,
                ...(result ? { retrieved_count: store.topDocs.length } : ''),
                ...(result ? { retrieved_docs: store.topDocs } : ''),
            });
        } else if(type === 'agent') {
            const response = await callAgent(message, threadId);
            return res
                .setHeader('x-assistant-identifier', process.env.ASSISTANT_IDENTIFIER ?? '')
                .setHeader('x-thread-id', threadId ?? '')
                .json({
                    response,
                });
        }

    } catch (err) {
        console.error(err)
        Logger.error({ message: `Error /chat`, error: (err as ErrorConstructor | undefined) });
        res.status(500).json({error: err});
    }
}

/**
 *
 */
export const thread = async (req: Request, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {result, type} = req.query;

    let system = Number(req.query.system);
    let user = Number(req.query.user);

    if (isNaN(system)) system = 0;
    if (isNaN(user)) user = 0;

    console.log("ok")

    if (!message || typeof message !== "string") {
        return res.status(400).json({error: "message is required"});
    }

    try {
        const { threadId } = req.params;
        const { message } = req.body;
        try {
            const response = await callAgent(message, threadId);
            res.json({ response });
        } catch (error) {
            console.error('Error in chat:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (err) {
        console.error(err)
        Logger.error({ message: `Error /chat`, error: (err as ErrorConstructor | undefined) });
        res.status(500).json({error: err});
    }
}

const callAgent = async (message: string, threadId: string) => {
    const GraphState = Annotation.Root({
        messages: Annotation<BaseMessage[]>({
            reducer: (x, y) => x.concat(y),
        }),
    });

    const store = StoreFactory.get();
    const model = ModelFactory.get();

    const qdrantTool = await store.agent();

    const tools = [qdrantTool];

    // We can extract the state typing via `GraphState.State`
    const toolNode = new ToolNode<typeof GraphState.State>(tools);

    const m = model.model.bindTools(tools);

    async function callModel(state: typeof GraphState.State) {
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful AI assistant, collaborating with other assistants. Use the provided tools to progress towards answering the question. If you are unable to fully answer, that's OK, another assistant with different tools will help where you left off. Execute what you can to make progress. If you or any of the other assistants have the final answer or deliverable, prefix your response with FINAL ANSWER so the team knows to stop. You have access to the following tools: {tool_names}.\n{system_message}\nCurrent time: {time}.`,
            ],
            new MessagesPlaceholder("messages"),
        ]);
        const formattedPrompt = await prompt.formatMessages({
            system_message: "You can only search in the collection named offers, on the field pageContent. You will always include in you response, the name of the offer, the _id and the URL",
            time: new Date().toISOString(),
            tool_names: tools.map((tool: { name: any; }) => tool.name).join(", "),
            messages: state.messages,
        });
        const result = await m.invoke(formattedPrompt);
        return {messages: [result]};
    }

    function shouldContinue(state: typeof GraphState.State) {
        const messages = state.messages;
        const lastMessage = messages[messages.length - 1] as AIMessage;
        // If the LLM makes a tool call, then we route to the "tools" node
        if (lastMessage.tool_calls?.length) {
            return "tools";
        }
        // Otherwise, we stop (reply to the user)
        return "__end__";
    }

    const workflow = new StateGraph(GraphState)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent");

    const client = await getMongodbConnection()

    const checkpointer = new MongoDBSaver({client, dbName: process.env.DB});

    const app = workflow.compile({checkpointer});

    const finalState = await app.invoke(
        {
            messages: [new HumanMessage(message)],
        },
        {recursionLimit: 15, configurable: {thread_id: threadId}}
    );

    return finalState.messages[finalState.messages.length - 1].content ?? finalState.messages[finalState.messages.length - 1];
}