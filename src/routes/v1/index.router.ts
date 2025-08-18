import { Application, Request, Response } from "express";

// Routes
import {globalErrorHandler} from "../../middleware/globalErrorHandler";
import {embedding} from "../../embedding/v1/index.embedding";
import swaggerJSDoc from "swagger-jsdoc";
import {OpenAPIOption} from "../../config/openapi-options";
import {serve, setup} from "swagger-ui-express";
import {chat, thread} from "../../chatbot/v1/index.chatbot";
import {adminRequired} from "../../middleware/adminMiddleware";

const API_PREFIX = "/v1";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     adminKey:
 *       type: apiKey
 *       in: header
 *       name: x-assistant-admin-key
 */

/**
 * @swagger
 * tags:
 *   name: Embedding
 *   description: Embedding Routes
 */

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat Routes
 */

// Setup Swagger JSDoc
const specs = swaggerJSDoc(OpenAPIOption);

export const loadRoutes = (app: Application) => {
    app.use("/docs", serve, setup(specs));

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Successful response
     */
    app.get("/health", (req: Request, res: Response) => {
        res.json({ status: "OK" });
    });

    /**
     * @swagger
     * /v1/chat:
     *   post:
     *     summary: chat
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: result
     *         description: optional query params to retrieve the bests result in the response
     *         in: query
     *         required: false
     *         type: boolean
     *       - name: type
     *         description: Mandatory query params to select the type of chatbot used
     *         in: query
     *         required: true
     *         type: string
     *         example: rag or agent
     *       - name: user
     *         description: optional query params to select the user prompt used by the chatbot
     *         in: query
     *         required: false
     *         type: number
     *         example: 0
     *       - name: system
     *         description: optional query params to select the system prompt used by the chatbot
     *         in: query
     *         required: false
     *         type: number
     *         example: 0
     *     requestBody:
     *      content:
     *       application/json:
     *         schema:
     *           type: object
     *           properties:
     *             message:
     *               description: message for LLM
     *               type: string
     *     responses:
     *       '200':
     *         description: Successful response
     */
    app.post(`${API_PREFIX}/chat`, chat);


    /**
     * @swagger
     * /v1/chat/{threadId}:
     *   post:
     *     summary: chat
     *     tags: [Chat]
     *     produces:
     *       - application/json
     *     parameters:
     *        - name: threadId
     *          description: use thread.
     *          in: path
     *          required: true
     *          type: string
     *     requestBody:
     *      content:
     *       application/json:
     *         schema:
     *           type: object
     *           properties:
     *             message:
     *               description: message for LLM
     *               type: string
     *     responses:
     *       '200':
     *         description: Successful response
     */
    app.post(`${API_PREFIX}/chat/:threadId`, thread);

    /**
     * @swagger
     * /v1/embedding:
     *   post:
     *     summary: embed
     *     tags: [Embedding]
     *     security:
     *       - adminKey: []
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Successful response
     */
    app.post(`${API_PREFIX}/embedding`, adminRequired, embedding);
    app.use(globalErrorHandler);
};
