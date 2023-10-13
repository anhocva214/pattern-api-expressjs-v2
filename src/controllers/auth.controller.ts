import { ITokenPayloadCaptcha, Token, TokenModel } from "@models/token.model";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "@models/error";
import moment from "moment";
import { v1 as uuidV1 } from "uuid";
import OtpService from "@services/otp.service";
import normalizeEmail from "normalize-email";
import AuthService from "@services/app/auth.service";

// @ts-ignore
const SliderCaptcha = require("@slider-captcha/core");

export default class AuthController {
  private CAPTCHA_EXPIRES_IN: number;
  private otpService: OtpService;
  private authService: AuthService;

  constructor() {
    this.CAPTCHA_EXPIRES_IN = 60 * 60 * 15;
    this.otpService = new OtpService();
    this.authService = new AuthService();
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    res.json({});
  }

  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      let { password } = req.body;
      let phoneNumber = req.otpTo || "";
      let {userId} = await this.authService.register(phoneNumber, password);
      res.json({userId});
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      let { password, phoneNumber, role } = req.body;
      let data = await this.authService.login(phoneNumber, password, role);
      return res.json(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  // Pre-login
  async preLogin(req: Request, res: Response, next: NextFunction) {
    try {
      let phoneNumber = req.body.phoneNumber;
      console.log("🚀 ~ file: auth.controller.ts:58 ~ AuthController ~ preLogin ~ phoneNumber:", phoneNumber)
      let { userId } = await this.authService.preLogin(phoneNumber);
      return res.json({ userId });
    } catch (err) {
      next(err);
    }
  }

  // logout
  async logout(req: Request, res: Response) {
    await TokenModel.deleteOne({
      payload: req.token,
    });
    return res.json({});
  }

  async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, method, service } = req.body;
      const { otpId, expiredAt } = await this.otpService.sendOTP({
        to: normalizeEmail(to),
        method,
        service
      });
      return res.json({ otpId, expiredAt });
    } catch (err) {
      next(err);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      let { otpId, otpCode } = req.body;
      let data = await this.otpService.verifyOTP({ otpId, otpCode });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getCaptcha(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, solution } = await SliderCaptcha.create();
      let token = new Token<ITokenPayloadCaptcha>();
      token.preCreate();
      token.data = {
        id: uuidV1(),
        solution,
      };
      token.type = "captcha";
      token.expiredAt = moment(token.createdAt)
        .add(this.CAPTCHA_EXPIRES_IN, "seconds")
        .toDate();

      await TokenModel.create(token);
      return res.json({ data, captchaId: token.data.id });
    } catch (err) {
      next(err);
    }
  }

  async verifyCaptcha(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, captchaId } = req.body;
      let tokenCaptcha = await TokenModel.findOne({
        "data.id": captchaId,
        type: "captcha",
      });

      if (!tokenCaptcha) {
        throw new AppError({
          message: "Captcha not found",
          statusCode: StatusCodes.BAD_REQUEST,
          detail: "",
          where: "verifyCaptcha",
        });
      }

      const verification = await SliderCaptcha.verify(
        tokenCaptcha.data.solution,
        data
      );

      if (verification.result !== "success") {
        return res.json({ result: "failure" });
      }
      await TokenModel.updateOne(
        { _id: tokenCaptcha._id },
        { payload: verification.token }
      );
      return res.json({
        token: verification.token,
        result: verification.result,
      });
    } catch (err) {
      next(err);
    }
  }
}
