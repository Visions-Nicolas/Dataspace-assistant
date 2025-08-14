import { Router } from "express";
import {mongodbChat} from "../../chatbot/v1/mongodb.chatbot";

const r: Router = Router();

r.post("/chat", mongodbChat);

export default r;
