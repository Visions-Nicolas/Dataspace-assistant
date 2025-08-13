import { Application, Request, Response } from "express";

// Routes
import {globalErrorHandler} from "../../middleware/globalErrorHandler";
import qdrantRouter from "./qdrant.router";
import mongodbRouter from "./mongodb.router";
import mongoatlasRouter from "./mongoatlas.router";

const API_PREFIX = "/v1";

export const loadRoutes = (app: Application) => {
    // app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use(`${API_PREFIX}/qdrant`, qdrantRouter);
    app.use(`${API_PREFIX}/mongodb`, mongodbRouter);
    app.use(`${API_PREFIX}/mongoatlas`, mongoatlasRouter);
    app.use(globalErrorHandler);
};
