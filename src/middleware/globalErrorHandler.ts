import { Request, Response, NextFunction } from "express";
import { ReferenceTypeError } from "../errors/ReferenceTypeError";
import { BadRequestError } from "../errors/BadRequestError";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ReferenceTypeError) {
    return res.status(400).json({
      error: "Unknown Reference Type",
      message: err.message,
    });
  } else if (err instanceof BadRequestError) {
    return res.status(400).json(err);
  } else {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong",
    });
  }

  next(err);
};
