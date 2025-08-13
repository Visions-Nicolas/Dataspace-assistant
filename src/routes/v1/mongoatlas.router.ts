import { Router } from "express";
import {mongoAtlasChat} from "../../chatbot/v1/mongoatlas.chatbot";
import {mongoAtlasEmbedding} from "../../embedding/v1/mongoatlas.embedding";

const r: Router = Router();


/**
 * @swagger
 * tags:
 *   name: Mongodb Atlas
 *   description: MongoDB Atlas Routes
 */

/**
 * @swagger
 * /v1/mongoatlas/embedding:
 *   post:
 *     summary: embed
 *     tags: [Mongodb Atlas]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post("/embedding", mongoAtlasEmbedding);

/**
 * @swagger
 * /v1/mongoatlas/chat:
 *   post:
 *     summary: chat
 *     tags: [Mongodb Atlas]
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
r.post("/chat", mongoAtlasChat);

export default r;
