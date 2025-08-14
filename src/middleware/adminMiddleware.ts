import {NextFunction, Request, Response} from "express";

export const adminRequired = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.headers['x-assistant-admin-key'] !== process.env.ADMIN_KEY) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    next();
};
