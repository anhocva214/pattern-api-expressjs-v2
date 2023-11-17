import { AppError } from "@models/error";
import { TokenModel } from "@models/token.model";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default async function captchaMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let captchaToken = req.headers["captcha-token"] || "";
    let result = await TokenModel.findOne({
      payload: captchaToken,
      type: "captcha",
    });
    if (!result) {
      throw new AppError({
        message: "Bạn cần xác thực captcha",
        statusCode: StatusCodes.FORBIDDEN,
        detail: "",
        where: "captchaMiddleware",
      });
    }

    await TokenModel.deleteOne({_id: result._id})
    next();
  } catch (err) {
    next(err);
  }
}
