import { Application, Request, Response } from "express";

// Routes
import {globalErrorHandler} from "../../middleware/globalErrorHandler";
import mongodbRouter from "./mongodb.router";
import {embedding} from "../../embedding/v1/index.embedding";
import swaggerJSDoc from "swagger-jsdoc";
import {OpenAPIOption} from "../../config/openapi-options";
import {serve, setup} from "swagger-ui-express";
import {chat} from "../../chatbot/v1/index.chatbot";
import {adminRequired} from "../../middleware/adminMiddleware";

const API_PREFIX = "/v1";

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
    app.use(`${API_PREFIX}/chat`, chat);

    /**
     * @swagger
     * /v1/embedding:
     *   post:
     *     summary: embed
     *     tags: [Embedding]
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: Successful response
     */
    app.use(`${API_PREFIX}/embedding`, adminRequired, embedding);
    app.use(`${API_PREFIX}/mongodb`, mongodbRouter);
    app.use(globalErrorHandler);
};
