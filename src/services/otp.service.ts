import {
  ITokenPayloadOTP,
  TOtpMethod,
  TOtpService,
  Token,
  TokenModel,
} from "@models/token.model";
import moment from "moment";
import OtpGenerator from "otp-generator";
import MailService from "./mail.service";
import { v1 as uuidV1 } from "uuid";
import { AppError } from "@models/error";
import { StatusCodes } from "http-status-codes";

export default class OtpService {
  private otpCodeExpiresIn: number;
  private otpTokenExpiresIn: number;
  private mailService: MailService;

  constructor() {
    this.otpCodeExpiresIn = 90; // 90 seconds
    this.otpTokenExpiresIn = 5 * 60; // 5 minutes
    this.mailService = new MailService();
  }

  async sendOTP(data: {
    to: string;
    method: TOtpMethod;
    service: TOtpService;
  }) {
    let otpCode = OtpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    if (data.method == "email") {
      await this.mailService.sendOTP({
        to: data.to,
        otpCode,
      });
    } else if (data.method == "sms") {
      otpCode = "1234";
    }

    let expiredAt = moment(new Date()).add(this.otpCodeExpiresIn, "seconds").toDate();
    let tokenObj = new Token<ITokenPayloadOTP>({
      data: {
        ...data,
        otpCode,
        id: uuidV1(),
      },
      expiredAt,
      type: "otp",
      payload: "",
    });
    tokenObj.preCreate();
    await TokenModel.create(tokenObj);

    return { otpId: tokenObj?.data?.id, expiredAt };
  }

  async verifyOTP(data: { otpId: string; otpCode: string }) {
    let result = await TokenModel.findOne({
      "data.id": data.otpId,
      "data.otpCode": data.otpCode,
    });
    if (result) {
      if (
        moment(new Date(result.expiredAt || new Date())).isBefore(
          moment(new Date())
        )
      ) {
        throw new AppError({
          where: "verifyOTP",
          message: "Mã xác thực đã hết hạn",
          detail: "",
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      } else {
        let otpToken = uuidV1();
        await TokenModel.updateOne(
          { "data.id": data.otpId },
          { payload: otpToken, expiredAt: this.otpTokenExpiresIn }
        );
        return { otpToken };
      }
    } else {
      throw new AppError({
        where: "verifyOTP",
        message: "Mã xác thực không hợp lệ",
        detail: "",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  }
}
