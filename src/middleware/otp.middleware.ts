import { AppError } from "@models/error";
import { ITokenPayloadOTP, Token, TokenModel } from "@models/token.model";
import { User } from "@models/user.model";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import normalizeEmail from 'normalize-email'

export default async function otpMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let otpToken = req.headers["otp-token"] || "";
    let otpTo = req.headers["otp-to"]?.toString() || "";
    let result = await TokenModel.findOne<Token<ITokenPayloadOTP>>({
      payload: otpToken,
      type: "otp",
      "data.to": normalizeEmail(otpTo).toLowerCase()
    });

    if (!result || !otpToken) {
      throw new AppError({
        message: "Bạn cần xác thực OTP",
        statusCode: StatusCodes.FORBIDDEN,
        detail: "",
        where: "otpMiddleware",
      });
    }

    result = new Token(result)
    await TokenModel.deleteOne({_id: result?.id})
    req.otpTo = result.data?.to
    next();
  } catch (err) {
    next(err);
  }
}
