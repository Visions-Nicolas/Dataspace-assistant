import { Router } from "express";
import {mongodbEmbedding} from "../../embedding/v1/mongodb.embedding";
import {mongodbChat} from "../../chatbot/v1/mongodb.chatbot";

const r: Router = Router();


/**
 * @swagger
 * tags:
 *   name: Mongodb
 *   description: Mongodb Routes
 */

/**
 * @swagger
 * /v1/mongodb/embedding:
 *   post:
 *     summary: embed
 *     tags: [Mongodb]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post("/embedding", mongodbEmbedding);

/**
 * @swagger
 * /v1/mongodb/chat:
 *   post:
 *     summary: chat
 *     tags: [Mongodb]
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
r.post("/chat", mongodbChat);

export default r;
