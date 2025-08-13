import { Router } from "express";
import {qdrantEmbedding} from "../../embedding/v1/qdrant.embedding";
import {qdrantChat} from "../../chatbot/v1/qdrant.chatbot";

const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Qdrant
 *   description: Qdrant Routes
 */

/**
 * @swagger
 * /v1/qdrant/embedding:
 *   post:
 *     summary: embed
 *     tags: [Qdrant]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post("/embedding", qdrantEmbedding);

/**
 * @swagger
 * /v1/qdrant/chat:
 *   post:
 *     summary: chat
 *     tags: [Qdrant]
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
r.post("/chat", qdrantChat);

export default r;
